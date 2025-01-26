/*
  # Update subscription plans

  1. Changes
    - Ensures unique constraint on plan names
    - Updates subscription plans with current features and pricing
    - Sets Stripe price IDs for paid plans
  
  2. Notes
    - Creates unique constraint on name for conflict handling
    - Preserves existing plan structure
    - Updates features and descriptions
*/

-- First ensure name is unique
ALTER TABLE subscription_plans
ADD CONSTRAINT subscription_plans_name_key UNIQUE (name);

-- Clear existing stripe price IDs to avoid conflicts
UPDATE subscription_plans 
SET stripe_price_id = NULL 
WHERE stripe_price_id IN ('eVa28WgUK8engtGbII', 'bIY9Bo7kabqz2CQfYZ', 'eVa28W9si2U391edQS');

-- Then update or insert the plans
INSERT INTO subscription_plans (
  name,
  description,
  price,
  interval,
  currency,
  features,
  stripe_price_id
)
VALUES 
  (
    'Free',
    'Basic features for casual users',
    0,
    'month',
    'GBP',
    '[
      "Limited swipes per day",
      "Basic matching",
      "Send messages to matches"
    ]'::jsonb,
    NULL
  ),
  (
    'Premium',
    'Enhanced features for serious daters',
    9.99,
    'month',
    'GBP',
    '[
      "50 swipes per day",
      "See who likes you",
      "Advanced filters",
      "Priority matching",
      "Read receipts",
      "Profile boost once per month"
    ]'::jsonb,
    'eVa28WgUK8engtGbII'
  ),
  (
    'Elite',
    'Ultimate dating experience',
    19.99,
    'month',
    'GBP',
    '[
      "All Premium features",
      "Profile verification badge",
      "Daily profile boost",
      "See activity status",
      "Priority support",
      "Exclusive events access"
    ]'::jsonb,
    'bIY9Bo7kabqz2CQfYZ'
  ),
  (
    'VIP',
    'Ultimate premium dating experience with exclusive perks',
    39.99,
    'month',
    'GBP',
    '[
      "All Elite features",
      "Priority matching algorithm",
      "VIP customer support",
      "Exclusive access to premium events",
      "Advanced relationship coaching",
      "Monthly professional photoshoot credits",
      "Background verification badge"
    ]'::jsonb,
    'eVa28W9si2U391edQS'
  )
ON CONFLICT (name) 
DO UPDATE SET
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  interval = EXCLUDED.interval,
  currency = EXCLUDED.currency,
  features = EXCLUDED.features,
  stripe_price_id = EXCLUDED.stripe_price_id,
  updated_at = NOW();