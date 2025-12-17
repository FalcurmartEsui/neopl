-- Add government_id_url column to profiles for storing the government ID screenshot
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS government_id_url TEXT;

-- Add government_id_type column for storing the type of government ID
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS government_id_type TEXT;