/*
  # Add Email Notification System for Paid Members

  1. New Tables
    - `email_notifications`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `type` (text)
      - `content` (text)
      - `sent_at` (timestamptz)
      - `status` (text)
      - `created_at` (timestamptz)

  2. Functions
    - Add function to check subscription status
    - Add function to send email notifications
*/

-- Create email_notifications table
CREATE TABLE IF NOT EXISTS email_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('match', 'message', 'like', 'comment', 'system')),
  content text NOT NULL,
  sent_at timestamptz,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own notifications"
  ON email_notifications FOR SELECT
  USING (auth.uid() = user_id);

-- Function to check if user has active paid subscription
CREATE OR REPLACE FUNCTION has_paid_subscription(user_uuid uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM subscriptions s
    JOIN subscription_plans p ON s.plan_id = p.id
    WHERE s.user_id = user_uuid
    AND s.status = 'active'
    AND p.price > 0
    AND s.current_period_end > now()
  );
END;
$$ LANGUAGE plpgsql;

-- Function to create email notification for paid users
CREATE OR REPLACE FUNCTION create_email_notification(
  p_user_id uuid,
  p_type text,
  p_content text
)
RETURNS void AS $$
BEGIN
  -- Only create notification if user has paid subscription
  IF has_paid_subscription(p_user_id) THEN
    INSERT INTO email_notifications (user_id, type, content)
    VALUES (p_user_id, p_type, p_content);
  END IF;
END;
$$ LANGUAGE plpgsql;