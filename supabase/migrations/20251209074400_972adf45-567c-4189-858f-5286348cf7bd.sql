-- Add additional profile fields for user information collection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS city TEXT,
ADD COLUMN IF NOT EXISTS state TEXT,
ADD COLUMN IF NOT EXISTS postal_code TEXT,
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS profile_completed BOOLEAN DEFAULT false;

-- Add today's P/L to balances table for admin override
ALTER TABLE public.balances
ADD COLUMN IF NOT EXISTS today_profit_loss NUMERIC DEFAULT 0;