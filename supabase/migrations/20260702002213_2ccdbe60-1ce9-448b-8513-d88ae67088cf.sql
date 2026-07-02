-- Convert status enum column to text so it can hold any Stripe status
ALTER TABLE public.subscriptions ALTER COLUMN status DROP DEFAULT;
ALTER TABLE public.subscriptions ALTER COLUMN status TYPE text USING status::text;
ALTER TABLE public.subscriptions ALTER COLUMN status SET DEFAULT 'active';

-- Add Stripe-specific columns
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS environment text NOT NULL DEFAULT 'sandbox',
  ADD COLUMN IF NOT EXISTS price_id text,
  ADD COLUMN IF NOT EXISTS product_id text,
  ADD COLUMN IF NOT EXISTS current_period_start timestamptz,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id text,
  ADD COLUMN IF NOT EXISTS stripe_customer_id text;

-- Backfill legacy provider_* columns into stripe_* for existing rows (should be empty)
UPDATE public.subscriptions
  SET stripe_subscription_id = COALESCE(stripe_subscription_id, provider_subscription_id),
      stripe_customer_id = COALESCE(stripe_customer_id, provider_customer_id)
  WHERE stripe_subscription_id IS NULL OR stripe_customer_id IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_stripe_subscription_id_env_idx
  ON public.subscriptions (stripe_subscription_id, environment)
  WHERE stripe_subscription_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS subscriptions_user_env_idx
  ON public.subscriptions (user_id, environment);

-- Allow the service role (webhook) to write subscriptions
GRANT ALL ON public.subscriptions TO service_role;

DROP POLICY IF EXISTS subs_service_manage ON public.subscriptions;
CREATE POLICY subs_service_manage ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);