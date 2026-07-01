import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const getMyCredits = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("credits_balance")
      .select("balance")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) {
      console.error("[credits] balance query error", error);
      throw new Error("Failed to load your credits. Please try again.");
    }
    return { balance: data?.balance ?? 0 };
  });

export const getMyTransactions = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("credit_transactions")
      .select("id, delta, reason, ref, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (error) {
      console.error("[credits] transactions query error", error);
      throw new Error("Failed to load your transactions. Please try again.");
    }
    return { transactions: data ?? [] };
  });

export const getMySubscription = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (error) {
      console.error("[credits] subscription query error", error);
      throw new Error("Failed to load your subscription. Please try again.");
    }
    return { subscription: data ?? null };
  });
