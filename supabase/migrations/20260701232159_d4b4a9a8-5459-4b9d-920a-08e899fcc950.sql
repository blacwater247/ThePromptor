
CREATE TABLE public.generations_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mode text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX generations_log_user_created_idx ON public.generations_log (user_id, created_at DESC);
GRANT SELECT ON public.generations_log TO authenticated;
GRANT ALL ON public.generations_log TO service_role;
ALTER TABLE public.generations_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY gen_log_select_own ON public.generations_log FOR SELECT TO authenticated USING (auth.uid() = user_id);
