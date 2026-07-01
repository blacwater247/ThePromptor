REVOKE ALL ON FUNCTION public.refund_credits(integer, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.refund_credits(integer, text) TO service_role;