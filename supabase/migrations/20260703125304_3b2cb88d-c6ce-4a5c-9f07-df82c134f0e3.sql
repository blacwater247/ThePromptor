
-- Fix subscriptions: allow multiple rows per user + non-partial unique on (stripe_subscription_id, environment) so upsert onConflict works.
ALTER TABLE public.subscriptions ADD COLUMN IF NOT EXISTS id UUID NOT NULL DEFAULT gen_random_uuid();
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_pkey;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);

-- Drop old partial unique index, replace with a full unique constraint that upsert can infer.
DROP INDEX IF EXISTS public.subscriptions_stripe_subscription_id_env_idx;
-- Ensure no NULL stripe_subscription_id rows collide (there shouldn't be any real ones, but guard):
DELETE FROM public.subscriptions WHERE stripe_subscription_id IS NULL;
ALTER TABLE public.subscriptions ALTER COLUMN stripe_subscription_id SET NOT NULL;
ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_stripe_sub_env_key UNIQUE (stripe_subscription_id, environment);
