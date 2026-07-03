import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { type StripeEnv, createStripeClient, verifyWebhook } from "@/lib/stripe.server";


let _supabase: ReturnType<typeof createClient<Database>> | null = null;
function getSupabase() {
  if (!_supabase) {
    _supabase = createClient<Database>(
      process.env.SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    );
  }
  return _supabase;
}

// Map of price lookup_key => credits to grant (one-time credit packs)
const CREDIT_PACKS: Record<string, number> = {
  credits_pack_20_onetime: 40, // 40 credits = 20 prompts (2 credits per prompt)
};

// Map of price lookup_key => downloadable pack slug
const DOWNLOAD_PACKS: Record<string, string> = {
  prompt_pack_vol1: "prompt_pack_vol1",
  prompt_pack_vol2: "prompt_pack_vol2",
  prompt_pack_vol3: "prompt_pack_vol3",
};

async function handleSubscriptionUpsert(subscription: any, env: StripeEnv) {
  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("[webhook] subscription missing userId metadata", subscription.id);
    return;
  }
  const item = subscription.items?.data?.[0];
  const priceId =
    item?.price?.lookup_key ||
    item?.price?.metadata?.lovable_external_id ||
    item?.price?.id;
  const productId =
    typeof item?.price?.product === "string"
      ? item.price.product
      : item?.price?.product?.id;
  const periodStart = item?.current_period_start ?? subscription.current_period_start;
  const periodEnd = item?.current_period_end ?? subscription.current_period_end;

  const { error } = await getSupabase()
    .from("subscriptions")
    .upsert(
      {
        user_id: userId,
        provider: "stripe",
        plan: priceId ?? "monthly",
        stripe_subscription_id: subscription.id,
        stripe_customer_id: subscription.customer,
        provider_subscription_id: subscription.id,
        provider_customer_id: subscription.customer,
        product_id: productId,
        price_id: priceId,
        status: subscription.status,
        current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
        cancel_at_period_end: subscription.cancel_at_period_end || false,
        environment: env,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "stripe_subscription_id,environment" },
    );
  if (error) console.error("[webhook] subscription upsert error", error);
}

async function handleSubscriptionDeleted(subscription: any, env: StripeEnv) {
  const { error } = await getSupabase()
    .from("subscriptions")
    .update({ status: "canceled", updated_at: new Date().toISOString() })
    .eq("stripe_subscription_id", subscription.id)
    .eq("environment", env);
  if (error) console.error("[webhook] subscription delete error", error);
}

async function handleCheckoutCompleted(session: any, env: StripeEnv) {
  // Only for one-time pack purchases; subscriptions go through customer.subscription.*
  if (session.mode !== "payment") return;
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error("[webhook] checkout.session.completed missing userId", session.id);
    return;
  }

  // Resolve lookup key. Stripe does NOT expand line_items in webhook payloads,
  // so fetch them explicitly. Fall back to session.metadata.price_id which
  // createCheckoutSession stamps for one-time payments.
  let priceLookupKey: string | undefined;
  try {
    const stripe = createStripeClient(env);
    const lineItems = await stripe.checkout.sessions.listLineItems(session.id, {
      expand: ["data.price"],
      limit: 1,
    });
    const price = lineItems.data[0]?.price as any;
    priceLookupKey = price?.lookup_key || price?.metadata?.lovable_external_id;
  } catch (e) {
    console.error("[webhook] listLineItems error", e);
  }
  if (!priceLookupKey) {
    priceLookupKey = session.metadata?.price_id;
  }
  if (!priceLookupKey) {
    console.warn("[webhook] could not resolve price for session", session.id);
    return;
  }

  // Downloadable pack? Insert an entitlement row (idempotent on session id).
  const packSlug = DOWNLOAD_PACKS[priceLookupKey];
  if (packSlug) {
    const { error: packErr } = await getSupabase().from("pack_purchases").upsert(
      {
        user_id: userId,
        pack_slug: packSlug,
        stripe_session_id: session.id,
        environment: env,
      },
      { onConflict: "stripe_session_id" },
    );
    if (packErr) console.error("[webhook] pack_purchases upsert error", packErr);
    return;
  }

  const credits = CREDIT_PACKS[priceLookupKey];
  if (!credits) {
    console.warn("[webhook] unknown pack lookup_key", priceLookupKey);
    return;
  }
  const { error } = await getSupabase().rpc("grant_credits", {
    _user_id: userId,
    _amount: credits,
    _reason: "purchase_pack",
    _ref: `stripe:cs:${session.id}`,
  });
  if (error) console.error("[webhook] grant_credits error", error);
}



async function handleWebhook(req: Request, env: StripeEnv) {
  const event = await verifyWebhook(req, env);
  console.log("[webhook]", env, event.type);
  switch (event.type) {
    case "customer.subscription.created":
    case "customer.subscription.updated":
      await handleSubscriptionUpsert(event.data.object, env);
      break;
    case "customer.subscription.deleted":
      await handleSubscriptionDeleted(event.data.object, env);
      break;
    case "checkout.session.completed":
      await handleCheckoutCompleted(event.data.object, env);
      break;

    case "payment_intent.succeeded":
      await handlePaymentIntentSucceeded(event.data.object, env);
      break;
    default:
      break;
  }
}

export const Route = createFileRoute("/api/public/payments/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const rawEnv = new URL(request.url).searchParams.get("env");
        if (rawEnv !== "sandbox" && rawEnv !== "live") {
          console.error("[webhook] invalid env", rawEnv);
          return Response.json({ received: true, ignored: "invalid env" });
        }
        try {
          await handleWebhook(request, rawEnv);
          return Response.json({ received: true });
        } catch (e) {
          console.error("[webhook] error", e);
          return new Response("Webhook error", { status: 400 });
        }
      },
    },
  },
});
