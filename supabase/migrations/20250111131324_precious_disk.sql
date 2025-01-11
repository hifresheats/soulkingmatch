/*
  # Update Stripe price IDs

  1. Changes
    - Update stripe_price_id for Basic plan
    - Update stripe_price_id for Premium plan
    - Update stripe_price_id for VIP plan

  2. Notes
    - Prices are in GBP
    - Basic: £9.99/month
    - Premium: £19.99/month
    - VIP: £39.99/month
*/

UPDATE subscription_plans
SET stripe_price_id = CASE 
  WHEN name = 'Premium' AND price = 9.99 THEN 'eVa28WgUK8engtGbII'
  WHEN name = 'Elite' AND price = 19.99 THEN 'bIY9Bo7kabqz2CQfYZ'
  WHEN name = 'VIP' AND price = 39.99 THEN 'eVa28W9si2U391edQS'
END
WHERE name IN ('Premium', 'Elite', 'VIP')
  AND currency = 'GBP';