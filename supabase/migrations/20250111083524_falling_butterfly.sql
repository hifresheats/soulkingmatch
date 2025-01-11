/*
  # Update subscription prices to GBP

  1. Changes
    - Update all subscription plan prices to GBP
    - Free plan remains at £0
    - Premium plan set to £9.99
    - Elite plan set to £19.99
    - VIP plan set to £39.99

  2. Notes
    - All prices are in British Pounds (GBP)
    - Maintains existing plan features and structure
*/

-- Add currency column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'subscription_plans' 
    AND column_name = 'currency'
  ) THEN
    ALTER TABLE subscription_plans ADD COLUMN currency text DEFAULT 'GBP';
  END IF;
END $$;

-- Update all plans with new prices and ensure currency is GBP
UPDATE subscription_plans
SET 
  price = CASE 
    WHEN name = 'Free' THEN 0
    WHEN name = 'Premium' THEN 9.99
    WHEN name = 'Elite' THEN 19.99
    WHEN name = 'VIP' THEN 39.99
  END,
  currency = 'GBP',
  updated_at = now()
WHERE name IN ('Free', 'Premium', 'Elite', 'VIP');