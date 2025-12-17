-- Allow admins to delete profiles
CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete balances
CREATE POLICY "Admins can delete balances" 
ON public.balances 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete trades
CREATE POLICY "Admins can delete trades" 
ON public.trades 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete deposits
CREATE POLICY "Admins can delete deposits" 
ON public.deposits 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete withdrawals
CREATE POLICY "Admins can delete withdrawals" 
ON public.withdrawals 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete chat_messages
CREATE POLICY "Admins can delete chat_messages" 
ON public.chat_messages 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete admin_balance_adjustments
CREATE POLICY "Admins can delete admin_balance_adjustments" 
ON public.admin_balance_adjustments 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete user_roles
CREATE POLICY "Admins can delete user_roles" 
ON public.user_roles 
FOR DELETE 
USING (has_role(auth.uid(), 'admin'::app_role));