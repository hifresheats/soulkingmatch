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
CREATE TABLE email_notifications (
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

-- Trigger for new matches
CREATE OR REPLACE FUNCTION notify_match()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify both users if they have paid subscriptions
  PERFORM create_email_notification(
    NEW.user1_id,
    'match',
    'You have a new match! Check your matches to connect.'
  );
  
  PERFORM create_email_notification(
    NEW.user2_id,
    'match',
    'You have a new match! Check your matches to connect.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_match_created
AFTER INSERT ON matches
FOR EACH ROW
EXECUTE FUNCTION notify_match();

-- Trigger for new messages
CREATE OR REPLACE FUNCTION notify_message()
RETURNS TRIGGER AS $$
DECLARE
  v_match matches;
  v_recipient_id uuid;
BEGIN
  -- Get match details
  SELECT * INTO v_match FROM matches WHERE id = NEW.match_id;
  
  -- Determine recipient
  v_recipient_id := CASE 
    WHEN NEW.sender_id = v_match.user1_id THEN v_match.user2_id
    ELSE v_match.user1_id
  END;
  
  -- Create notification for recipient if they have paid subscription
  PERFORM create_email_notification(
    v_recipient_id,
    'message',
    'You have a new message! Check your inbox to respond.'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_message_created
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION notify_message();

-- Trigger for new post likes
CREATE OR REPLACE FUNCTION notify_post_like()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id uuid;
BEGIN
  -- Get post owner
  SELECT user_id INTO v_post_owner_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Create notification if post owner has paid subscription
  PERFORM create_email_notification(
    v_post_owner_id,
    'like',
    'Someone liked your post!'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_like_created
AFTER INSERT ON post_likes
FOR EACH ROW
EXECUTE FUNCTION notify_post_like();

-- Trigger for new comments
CREATE OR REPLACE FUNCTION notify_post_comment()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner_id uuid;
BEGIN
  -- Get post owner
  SELECT user_id INTO v_post_owner_id
  FROM posts
  WHERE id = NEW.post_id;
  
  -- Create notification if post owner has paid subscription
  PERFORM create_email_notification(
    v_post_owner_id,
    'comment',
    'Someone commented on your post!'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_post_comment_created
AFTER INSERT ON post_comments
FOR EACH ROW
EXECUTE FUNCTION notify_post_comment();