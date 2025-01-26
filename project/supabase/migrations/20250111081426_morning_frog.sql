/*
  # Update subscription prices to GBP

  1. Changes
    - Update all subscription plan prices to GBP
    - Ensure correct plan names and prices:
      - Free (£0)
      - Premium (£9.99)
      - Elite (£19.99)
      - VIP (£39.99)

  2. Updates
    - Standardize plan names
    - Set correct prices in GBP
    - Maintain existing features
*/

-- Update Free plan
UPDATE subscription_plans
SET price = 0,
    name = 'Free'
WHERE price = 0;

-- Update Premium plan
UPDATE subscription_plans
SET price = 9.99,
    name = 'Premium'
WHERE name = 'Premium';

-- Update Elite plan
UPDATE subscription_plans
SET price = 19.99,
    name = 'Elite'
WHERE name = 'Elite';

-- Update VIP plan
UPDATE subscription_plans
SET price = 39.99,
    name = 'VIP'
WHERE name = 'VIP';