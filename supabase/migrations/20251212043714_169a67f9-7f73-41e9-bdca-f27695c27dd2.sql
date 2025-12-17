-- Add screenshot_url column to deposits table for transaction proof
ALTER TABLE public.deposits ADD COLUMN IF NOT EXISTS screenshot_url text;

-- Create storage bucket for deposit screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('deposit-screenshots', 'deposit-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own screenshots
CREATE POLICY "Users can upload deposit screenshots"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'deposit-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow users to view their own screenshots
CREATE POLICY "Users can view own deposit screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'deposit-screenshots' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Allow admins to view all screenshots
CREATE POLICY "Admins can view all deposit screenshots"
ON storage.objects
FOR SELECT
USING (bucket_id = 'deposit-screenshots' AND has_role(auth.uid(), 'admin'::app_role));