/*
  # Update subscription plans with Stripe price IDs

  1. Changes
    - Updates subscription plans with correct Stripe price IDs
    - Ensures plan names match the pricing structure
    - Updates prices to match Stripe checkout links

  2. Price Updates
    - Basic: £9.99/month (price_id: eVa28WgUK8engtGbII)
    - Premium: £19.99/month (price_id: bIY9Bo7kabqz2CQfYZ)
    - VIP: £39.99/month (price_id: eVa28W9si2U391edQS)
*/

-- Update the plans with new prices and Stripe IDs
UPDATE subscription_plans
SET 
  name = 'Basic',
  price = 9.99,
  stripe_price_id = 'eVa28WgUK8engtGbII',
  updated_at = NOW()
WHERE name = 'Premium';

UPDATE subscription_plans
SET 
  name = 'Premium',
  price = 19.99,
  stripe_price_id = 'bIY9Bo7kabqz2CQfYZ',
  updated_at = NOW()
WHERE name = 'Elite';

UPDATE subscription_plans
SET 
  price = 39.99,
  stripe_price_id = 'eVa28W9si2U391edQS',
  updated_at = NOW()
WHERE name = 'VIP';