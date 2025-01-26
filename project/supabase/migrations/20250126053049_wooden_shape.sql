/*
  # Update Stripe price IDs

  1. Changes
    - Update Stripe price IDs for all subscription plans to match actual Stripe prices
*/

-- Update price IDs for all plans
UPDATE subscription_plans
SET stripe_price_id = CASE 
  WHEN name = 'Basic' THEN 'price_1OvDmSJs3W8ZXzLXEDWtB3oQX'
  WHEN name = 'Premium' THEN 'price_1OvDmSJs3W8ZXzLXrCp4ayD8'
  WHEN name = 'VIP' THEN 'price_1OvDmSJs3W8ZXzLXgYf7zWlx'
END
WHERE name IN ('Basic', 'Premium', 'VIP');