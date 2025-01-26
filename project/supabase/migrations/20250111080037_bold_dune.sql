/*
  # Update Premium plan features

  1. Changes
    - Update Premium plan features to specify 50 swipes per day
    - Maintain existing price and other features
    - Clarify the swipe limit in the feature list

  2. Features
    - More specific about the swipe limit
    - Maintains consistency with other plans
*/

UPDATE subscription_plans
SET features = '[
    "50 swipes per day",
    "See who likes you",
    "Advanced filters",
    "Priority matching",
    "Read receipts",
    "Profile boost once per month"
]'::jsonb
WHERE name = 'Premium';