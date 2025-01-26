/*
  # Add subscription system

  1. New Tables
    - `subscription_plans`: Stores available subscription tiers
    - `subscriptions`: Tracks user subscriptions
    - `payment_history`: Records payment transactions

  2. Security
    - Enable RLS on all tables
    - Add policies for secure access
*/

-- Create subscription plans table
CREATE TABLE subscription_plans (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    description text,
    price numeric NOT NULL,
    interval text NOT NULL CHECK (interval IN ('month', 'year')),
    stripe_price_id text UNIQUE,
    features jsonb NOT NULL DEFAULT '[]'::jsonb,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    plan_id uuid REFERENCES subscription_plans(id) NOT NULL,
    status text NOT NULL CHECK (status IN ('active', 'canceled', 'past_due', 'incomplete')),
    stripe_subscription_id text UNIQUE,
    current_period_start timestamptz NOT NULL,
    current_period_end timestamptz NOT NULL,
    cancel_at_period_end boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create payment history table
CREATE TABLE payment_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    subscription_id uuid REFERENCES subscriptions(id) NOT NULL,
    amount numeric NOT NULL,
    currency text NOT NULL,
    status text NOT NULL CHECK (status IN ('succeeded', 'failed', 'pending')),
    stripe_payment_intent_id text UNIQUE,
    created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;

-- Subscription plans policies
CREATE POLICY "Subscription plans are viewable by everyone"
    ON subscription_plans FOR SELECT
    USING (true);

-- Subscriptions policies
CREATE POLICY "Users can view their own subscriptions"
    ON subscriptions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own subscriptions"
    ON subscriptions FOR UPDATE
    USING (auth.uid() = user_id);

-- Payment history policies
CREATE POLICY "Users can view their own payment history"
    ON payment_history FOR SELECT
    USING (auth.uid() = user_id);

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price, interval, features)
SELECT * FROM (
    VALUES 
    ('Free', 'Basic features for casual users', 0, 'month', 
    '[
        "Limited swipes per day",
        "Basic matching",
        "Send messages to matches"
    ]'::jsonb),
    ('Premium', 'Enhanced features for serious daters', 9.99, 'month',
    '[
        "Unlimited swipes",
        "See who likes you",
        "Advanced filters",
        "Priority matching",
        "Read receipts",
        "Profile boost once per month"
    ]'::jsonb),
    ('Elite', 'Ultimate dating experience', 19.99, 'month',
    '[
        "All Premium features",
        "Profile verification badge",
        "Daily profile boost",
        "See activity status",
        "Priority support",
        "Exclusive events access"
    ]'::jsonb)
) AS v (name, description, price, interval, features)
WHERE NOT EXISTS (SELECT 1 FROM subscription_plans);