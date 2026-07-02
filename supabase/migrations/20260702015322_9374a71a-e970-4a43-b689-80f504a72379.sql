CREATE TABLE public.pack_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  pack_slug TEXT NOT NULL,
  stripe_session_id TEXT NOT NULL UNIQUE,
  environment TEXT NOT NULL DEFAULT 'sandbox',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_pack_purchases_user ON public.pack_purchases(user_id, pack_slug);

GRANT SELECT ON public.pack_purchases TO authenticated;
GRANT ALL ON public.pack_purchases TO service_role;

ALTER TABLE public.pack_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pack_purchases_select_own" ON public.pack_purchases
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "pack_purchases_service_manage" ON public.pack_purchases
  FOR ALL TO service_role USING (true) WITH CHECK (true);