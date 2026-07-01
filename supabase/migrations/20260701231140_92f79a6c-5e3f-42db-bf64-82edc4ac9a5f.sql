
-- Revoke authenticated EXECUTE on has_role (not used in any RLS policy)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO service_role;

-- Recreate spend_credits with explicit _user_id, callable only by service_role
DROP FUNCTION IF EXISTS public.spend_credits(integer, text);
CREATE OR REPLACE FUNCTION public.spend_credits(_user_id uuid, _amount integer, _ref text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  INSERT INTO public.credits_balance (user_id, balance) VALUES (_user_id, 0)
  ON CONFLICT (user_id) DO NOTHING;

  UPDATE public.credits_balance
    SET balance = balance - _amount, updated_at = now()
    WHERE user_id = _user_id AND balance >= _amount
    RETURNING balance INTO new_balance;

  IF new_balance IS NULL THEN
    RAISE EXCEPTION 'insufficient_credits';
  END IF;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (_user_id, -_amount, 'prompt_spend', _ref);

  RETURN new_balance;
END $$;
REVOKE EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.spend_credits(uuid, integer, text) TO service_role;

-- Recreate refund_credits with explicit _user_id, callable only by service_role
DROP FUNCTION IF EXISTS public.refund_credits(integer, text);
CREATE OR REPLACE FUNCTION public.refund_credits(_user_id uuid, _amount integer, _ref text)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_balance INTEGER;
BEGIN
  IF _user_id IS NULL THEN RAISE EXCEPTION 'not_authenticated'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'invalid_amount'; END IF;

  UPDATE public.credits_balance
    SET balance = balance + _amount, updated_at = now()
    WHERE user_id = _user_id
    RETURNING balance INTO new_balance;

  INSERT INTO public.credit_transactions (user_id, delta, reason, ref)
  VALUES (_user_id, _amount, 'refund', _ref)
  ON CONFLICT (reason, ref) DO NOTHING;

  RETURN new_balance;
END $$;
REVOKE EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(uuid, integer, text) TO service_role;
