/*
  # Update Stripe Price IDs

  1. Changes
    - Update Basic plan with correct Stripe Price ID from URL
    - Update Premium plan with correct Stripe Price ID from URL
    - Update VIP plan with correct Stripe Price ID from URL

  2. Notes
    - Uses price IDs from Stripe checkout URLs instead of product IDs
    - Maintains existing plan prices and features
*/

-- Update Basic plan
UPDATE subscription_plans
SET stripe_price_id = 'eVa28WgUK8engtGbII'
WHERE name = 'Basic' AND price = 9.99;

-- Update Premium plan
UPDATE subscription_plans
SET stripe_price_id = 'bIY9Bo7kabqz2CQfYZ'
WHERE name = 'Premium' AND price = 19.99;

-- Update VIP plan
UPDATE subscription_plans
SET stripe_price_id = 'eVa28W9si2U391edQS'
WHERE name = 'VIP' AND price = 39.99;