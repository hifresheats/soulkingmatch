/*
  # Add Royal subscription plan

  1. Changes
    - Add new "Royal" subscription plan priced at $39.99/month
    - Position between Elite and Premium plans
    - Includes exclusive features for premium members

  2. Features
    - All Elite features
    - Priority matching algorithm
    - VIP customer support
    - Exclusive access to premium events
    - Advanced relationship coaching
    - Monthly professional photoshoot credits
    - Background verification badge
*/

-- Insert new Royal plan
INSERT INTO subscription_plans (
  name,
  description,
  price,
  interval,
  features
)
VALUES (
  'Royal',
  'Ultimate premium dating experience with exclusive perks',
  39.99,
  'month',
  '[
    "All Elite features",
    "Priority matching algorithm",
    "VIP customer support",
    "Exclusive access to premium events",
    "Advanced relationship coaching",
    "Monthly professional photoshoot credits",
    "Background verification badge"
  ]'::jsonb
);