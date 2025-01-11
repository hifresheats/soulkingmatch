/*
  # Update subscription plans with Stripe product IDs

  1. Changes
    - Update Basic plan price to $9.99 and add Stripe product ID
    - Update Premium plan price to $19.99 and add Stripe product ID
    - Update VIP (Royal) plan price to $39.99 and add Stripe product ID
    - Rename 'Royal' plan to 'VIP'

  2. Updates
    - Prices aligned with new structure
    - Added Stripe product IDs for payment integration
    - Consistent naming convention
*/

-- Update Basic plan
UPDATE subscription_plans
SET price = 9.99,
    stripe_price_id = 'prod_RWWYMeP34jrI6g'
WHERE name = 'Free';

-- Update Premium plan
UPDATE subscription_plans
SET price = 19.99,
    stripe_price_id = 'prod_RWWcIq96Rl3z6i'
WHERE name = 'Premium';

-- Update Royal/VIP plan
UPDATE subscription_plans
SET name = 'VIP',
    price = 39.99,
    stripe_price_id = 'prod_RWWjxlrec225WY'
WHERE name = 'Royal';