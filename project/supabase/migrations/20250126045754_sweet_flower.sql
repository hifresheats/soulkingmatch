/*
  # Fix Stripe Price IDs

  1. Changes
    - Update subscription plans with correct Stripe price IDs
    - Ensure all plans have valid price IDs that match Stripe configuration

  2. Notes
    - Uses full price IDs from Stripe
    - Maintains existing plan prices and features
*/

-- First clear any existing price IDs to avoid conflicts
UPDATE subscription_plans 
SET stripe_price_id = NULL 
WHERE name IN ('Basic', 'Premium', 'VIP');

-- Then update with correct price IDs
UPDATE subscription_plans
SET stripe_price_id = 'price_1OvDmSJs3W8ZXzLXEDWtB3oQX'
WHERE name = 'Basic' AND price = 9.99;

UPDATE subscription_plans
SET stripe_price_id = 'price_1OvDmSJs3W8ZXzLXrCp4ayD8'
WHERE name = 'Premium' AND price = 19.99;

UPDATE subscription_plans
SET stripe_price_id = 'price_1OvDmSJs3W8ZXzLXgYf7zWlx'
WHERE name = 'VIP' AND price = 39.99;