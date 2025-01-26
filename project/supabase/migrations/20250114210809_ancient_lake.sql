/*
  # Update Stripe Product IDs

  1. Changes
    - Update Basic plan with correct Stripe Product ID
    - Update Premium plan with correct Stripe Product ID
    - Update VIP plan with correct Stripe Product ID

  2. Notes
    - Ensures plans match with Stripe dashboard configuration
    - Maintains existing plan prices and features
*/

-- Update Basic plan
UPDATE subscription_plans
SET stripe_price_id = 'prod_RWWYMeP34jrI6g'
WHERE name = 'Basic' AND price = 9.99;

-- Update Premium plan
UPDATE subscription_plans
SET stripe_price_id = 'prod_RWWcIq96Rl3z6i'
WHERE name = 'Premium' AND price = 19.99;

-- Update VIP plan
UPDATE subscription_plans
SET stripe_price_id = 'prod_RWWjxlrec225WY'
WHERE name = 'VIP' AND price = 39.99;