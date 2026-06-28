
-- =========== profiles ===========
CREATE TABLE public.profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- =========== credits_balance ===========
CREATE TABLE public.credits_balance (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance INTEGER NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT balance_non_negative CHECK (balance >= 0)
);
GRANT SELECT ON public.credits_balance TO authenticated;
GRANT ALL ON public.credits_balance TO service_role;
ALTER TABLE public.credits_balance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "balance_select_own" ON public.credits_balance FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========== credit_transactions ===========
CREATE TYPE public.credit_reason AS ENUM (
  'signup_bonus','purchase_pack','subscription_grant','prompt_spend','refund','admin_adjust'
);
CREATE TABLE public.credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  delta INTEGER NOT NULL,
  reason public.credit_reason NOT NULL,
  ref TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (reason, ref)  -- idempotency on (reason, ref) pairs
);
CREATE INDEX credit_tx_user_created_idx ON public.credit_transactions(user_id, created_at DESC);
GRANT SELECT ON public.credit_transactions TO authenticated;
GRANT ALL ON public.credit_transactions TO service_role;
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "credit_tx_select_own" ON public.credit_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========== subscriptions ===========
CREATE TYPE public.subscription_status AS ENUM ('active','past_due','canceled','paused');
CREATE TABLE public.subscriptions (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_customer_id TEXT,
  provider_subscription_id TEXT UNIQUE,
  status public.subscription_status NOT NULL DEFAULT 'active',
  plan TEXT NOT NULL DEFAULT 'monthly_200',
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "subs_select_own" ON public.subscriptions FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- =========== user_roles (admin gating) ===========
CREATE TYPE public.app_role AS ENUM ('admin','user');
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE(user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "roles_select_own" ON public.user_roles FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

-- =========== updated_at helper ===========
CREATE OR REPLACE FUNCTION public.tg_set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER profiles_updated BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();
CREATE TRIGGER subs_updated BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.tg_set_updated_at();

-- =========== signup bonus trigger ===========
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'))
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credits_balance (user_id, balance)
  VALUES (NEW.id, 20)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (NEW.id, 20, 'signup_bonus', NEW.id::text)
  ON CONFLICT (reason, ref) DO NOTHING;

  RETURN NEW;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========== spend_credits RPC ===========
-- Atomically deducts `_amount` from the caller's balance, logs a transaction.
-- Returns the new balance. Raises 'insufficient_credits' if balance < amount.
CREATE OR REPLACE FUNCTION public.spend_credits(_amount INTEGER, _ref TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  new_balance INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  -- Ensure a balance row exists (safety net)
  INSERT INTO public.credits_balance (user_id, balance) VALUES (uid, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.credits_balance
    SET balance = balance - _amount, updated_at = now()
    WHERE user_id = uid AND balance >= _amount
    RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (uid, -_amount, 'prompt_spend', _ref);

  RETURN new_balance;
END $$;
REVOKE ALL ON FUNCTION public.spend_credits(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.spend_credits(INTEGER, TEXT) TO authenticated;

-- =========== refund_credits RPC (used when AI call fails after spend) ===========
CREATE OR REPLACE FUNCTION public.refund_credits(_amount INTEGER, _ref TEXT)
RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  new_balance INTEGER;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  UPDATE public.credits_balance
    SET balance = balance + _amount, updated_at = now()
    WHERE user_id = uid
    RETURNING balance INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (uid, _amount, 'refund', _ref)
  ON CONFLICT (reason, ref) DO NOTHING;

  RETURN new_balance;
END $$;
REVOKE ALL ON FUNCTION public.refund_credits(INTEGER, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.refund_credits(INTEGER, TEXT) TO authenticated;

-- =========== grant_credits (service_role only; called from webhook) ===========
-- Idempotent on (reason, ref). Adds credits to a target user.
CREATE OR REPLACE FUNCTION public.grant_credits(
  _user_id UUID, _amount INTEGER, _reason public.credit_reason, _ref TEXT
) RETURNS INTEGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  inserted BOOLEAN := false;
  new_balance INTEGER;
BEGIN
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (_user_id, _amount, _reason, _ref)
  ON CONFLICT (reason, ref) DO NOTHING
  RETURNING true INTO inserted;

  IF inserted IS NOT TRUE THEN
    -- Already granted; return current balance
    SELECT balance INTO new_balance FROM public.credits_balance WHERE user_id = _user_id;
    RETURN COALESCE(new_balance, 0);
  END IF;

  INSERT INTO public.credits_balance (user_id, balance) VALUES (_user_id, _amount)
  ON CONFLICT (user_id) DO UPDATE
    SET balance = public.credits_balance.balance + EXCLUDED.balance, updated_at = now()
  RETURNING balance INTO new_balance;

  RETURN new_balance;
END $$;
REVOKE ALL ON FUNCTION public.grant_credits(UUID, INTEGER, public.credit_reason, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.grant_credits(UUID, INTEGER, public.credit_reason, TEXT) TO service_role;
