/*
  # Add AI Dating Evaluation System

  1. New Tables
    - `match_evaluations`
      - `id` (uuid, primary key)
      - `match_id` (uuid, references matches)
      - `user1_id` (uuid, references profiles)
      - `user2_id` (uuid, references profiles)
      - `ai_score` (integer)
      - `ai_feedback` (jsonb)
      - `verification_status` (text)
      - `human_feedback` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS
    - Add policies for authenticated users
*/

-- Create match_evaluations table
CREATE TABLE match_evaluations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id uuid REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  user1_id uuid REFERENCES profiles(id) NOT NULL,
  user2_id uuid REFERENCES profiles(id) NOT NULL,
  ai_score integer CHECK (ai_score >= 0 AND ai_score <= 100),
  ai_feedback jsonb NOT NULL DEFAULT '{}'::jsonb,
  verification_status text NOT NULL DEFAULT 'pending'
    CHECK (verification_status IN ('pending', 'verified', 'rejected', 'requires_review')),
  human_feedback text,
  callback_scheduled_at timestamptz,
  callback_completed_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT different_users CHECK (user1_id != user2_id)
);

-- Enable RLS
ALTER TABLE match_evaluations ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own evaluations"
  ON match_evaluations FOR SELECT
  USING (auth.uid() IN (user1_id, user2_id));

CREATE POLICY "System can create evaluations"
  ON match_evaluations FOR INSERT
  WITH CHECK (true);

CREATE POLICY "System can update evaluations"
  ON match_evaluations FOR UPDATE
  USING (true);

-- Create function to trigger AI evaluation
CREATE OR REPLACE FUNCTION trigger_ai_evaluation()
RETURNS TRIGGER AS $$
BEGIN
  -- Create evaluation record when a match is created
  INSERT INTO match_evaluations (
    match_id,
    user1_id,
    user2_id,
    ai_feedback
  ) VALUES (
    NEW.id,
    NEW.user1_id,
    NEW.user2_id,
    json_build_object(
      'compatibility_factors', json_build_object(
        'interests_overlap', 0,
        'goals_alignment', 0,
        'location_compatibility', 0,
        'activity_compatibility', 0
      ),
      'risk_factors', json_build_object(
        'profile_authenticity', 0,
        'communication_patterns', 0,
        'reported_issues', 0
      ),
      'recommendations', jsonb_build_array()
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new matches
CREATE TRIGGER create_match_evaluation
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION trigger_ai_evaluation();

-- Create function to schedule human verification
CREATE OR REPLACE FUNCTION schedule_human_verification()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ai_score >= 75 THEN
    -- High score, schedule verification call
    NEW.verification_status := 'requires_review';
    NEW.callback_scheduled_at := now() + interval '24 hours';
  ELSIF NEW.ai_score < 40 THEN
    -- Low score, mark for review
    NEW.verification_status := 'requires_review';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for AI score updates
CREATE TRIGGER schedule_verification_on_score
BEFORE UPDATE OF ai_score ON match_evaluations
FOR EACH ROW
EXECUTE FUNCTION schedule_human_verification();