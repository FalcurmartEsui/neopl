-- Create a secure admin-read view for local admin panel usage (bypasses RLS via SECURITY DEFINER)
-- NOTE: This is intentionally powerful. Restrict access to only the service role via an Edge Function.

-- 1) Admin aggregated users view
CREATE OR REPLACE FUNCTION public.admin_get_users()
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  phone text,
  country text,
  address text,
  city text,
  state text,
  postal_code text,
  date_of_birth date,
  profile_completed boolean,
  kyc_status text,
  is_active boolean,
  created_at timestamptz,
  government_id_type text,
  government_id_url text,
  balance_id uuid,
  user_id uuid,
  balance numeric,
  demo_balance numeric,
  total_deposited numeric,
  total_withdrawn numeric,
  total_profit_loss numeric,
  today_profit_loss numeric,
  signal_strength integer
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    p.id,
    p.email,
    p.full_name,
    p.phone,
    p.country,
    p.address,
    p.city,
    p.state,
    p.postal_code,
    p.date_of_birth,
    p.profile_completed,
    p.kyc_status,
    p.is_active,
    p.created_at,
    p.government_id_type,
    p.government_id_url,
    b.id as balance_id,
    b.user_id,
    b.balance,
    b.demo_balance,
    b.total_deposited,
    b.total_withdrawn,
    b.total_profit_loss,
    b.today_profit_loss,
    b.signal_strength
  FROM public.profiles p
  LEFT JOIN public.balances b ON b.user_id = p.id
  ORDER BY p.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_users() FROM PUBLIC;

-- 2) Deposits with profile info
CREATE OR REPLACE FUNCTION public.admin_get_deposits()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  currency text,
  method text,
  wallet_address text,
  tx_hash text,
  status text,
  admin_note text,
  created_at timestamptz,
  confirmed_at timestamptz,
  screenshot_url text,
  profile jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    d.id,
    d.user_id,
    d.amount,
    d.currency,
    d.method,
    d.wallet_address,
    d.tx_hash,
    d.status,
    d.admin_note,
    d.created_at,
    d.confirmed_at,
    d.screenshot_url,
    to_jsonb(p) as profile
  FROM public.deposits d
  LEFT JOIN public.profiles p ON p.id = d.user_id
  ORDER BY d.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_deposits() FROM PUBLIC;

-- 3) Withdrawals with profile info
CREATE OR REPLACE FUNCTION public.admin_get_withdrawals()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  currency text,
  method text,
  wallet_address text,
  bank_details jsonb,
  status text,
  admin_note text,
  created_at timestamptz,
  processed_at timestamptz,
  profile jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    w.id,
    w.user_id,
    w.amount,
    w.currency,
    w.method,
    w.wallet_address,
    w.bank_details,
    w.status,
    w.admin_note,
    w.created_at,
    w.processed_at,
    to_jsonb(p) as profile
  FROM public.withdrawals w
  LEFT JOIN public.profiles p ON p.id = w.user_id
  ORDER BY w.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_withdrawals() FROM PUBLIC;

-- 4) Trades with profile info
CREATE OR REPLACE FUNCTION public.admin_get_trades()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  symbol text,
  side text,
  quantity numeric,
  entry_price numeric,
  exit_price numeric,
  leverage integer,
  stop_loss numeric,
  take_profit numeric,
  profit_loss numeric,
  admin_profit_override numeric,
  is_demo boolean,
  status text,
  order_type text,
  created_at timestamptz,
  closed_at timestamptz,
  profile jsonb
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    t.id,
    t.user_id,
    t.symbol,
    t.side,
    t.quantity,
    t.entry_price,
    t.exit_price,
    t.leverage,
    t.stop_loss,
    t.take_profit,
    t.profit_loss,
    t.admin_profit_override,
    t.is_demo,
    t.status,
    t.order_type,
    t.created_at,
    t.closed_at,
    to_jsonb(p) as profile
  FROM public.trades t
  LEFT JOIN public.profiles p ON p.id = t.user_id
  ORDER BY t.created_at DESC;
$$;

REVOKE ALL ON FUNCTION public.admin_get_trades() FROM PUBLIC;