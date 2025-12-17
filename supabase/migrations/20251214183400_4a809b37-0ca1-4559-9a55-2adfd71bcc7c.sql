-- Drop the method check constraint that's causing the error
ALTER TABLE public.deposits DROP CONSTRAINT IF EXISTS deposits_method_check;

-- Update signal_strength column to allow values 1-10
ALTER TABLE public.balances DROP CONSTRAINT IF EXISTS balances_signal_strength_check;
ALTER TABLE public.balances ADD CONSTRAINT balances_signal_strength_check CHECK (signal_strength >= 1 AND signal_strength <= 10);