import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, CreditCard, LogOut, ExternalLink, Crown, Zap, Download } from "lucide-react";
import { Toaster, toast } from "sonner";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import packCover from "@/assets/blacure-pack-vol1.png.asset.json";
import packCoverV2 from "@/assets/blacure-pack-vol2.png.asset.json";
import packCoverV3 from "@/assets/blacure-pack-vol3.png.asset.json";

const PACK_META: Record<string, { title: string; cover: string; blurb: string }> = {
  prompt_pack_vol1: { title: "Blacure Prompt Pack — Volume 1", cover: packCover.url, blurb: "12 prompts, PDF" },
  prompt_pack_vol2: { title: "Blacure Prompt Pack — Volume 2 (Producer Edition)", cover: packCoverV2.url, blurb: "20 producer prompts, PDF" },
  prompt_pack_vol3: { title: "Blacure Prompt Pack — Volume 3 (R&B Edition)", cover: packCoverV3.url, blurb: "17 R&B prompts, PDF" },
};
import { supabase } from "@/integrations/supabase/client";
import { getMyCredits, getMySubscription, getMyTransactions } from "@/lib/credits.functions";
import { createPortalSession } from "@/lib/payments.functions";
import { getStripeEnvironment } from "@/lib/stripe";
import { isSubscriptionActive } from "@/lib/subscription";
import { listMyPacks, getPackDownloadUrl } from "@/lib/packs.functions";

export const Route = createFileRoute("/_authenticated/account")({
  head: () => ({
    meta: [
      { title: "Account & Billing — Blacure" },
      { name: "description", content: "Manage your Blacure subscription, credits, and billing." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AccountPage,
});

const REASON_LABEL: Record<string, string> = {
  signup_bonus: "Signup bonus",
  purchase_pack: "Credit pack purchase",
  subscription_grant: "Subscription grant",
  prompt_spend: "Prompt generation",
  refund: "Refund",
  admin_adjust: "Adjustment",
};

function AccountPage() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const env = (() => { try { return getStripeEnvironment(); } catch { return null; } })();

  const creditsQ = useQuery({ queryKey: ["credits", "balance"], queryFn: () => getMyCredits() });
  const txQ = useQuery({ queryKey: ["credits", "transactions"], queryFn: () => getMyTransactions() });
  const subQ = useQuery({
    queryKey: ["subscription"],
    queryFn: () => (env ? getMySubscription({ data: { environment: env } }) : Promise.resolve({ subscription: null })),
    enabled: !!env,
  });
  const packsQ = useQuery({ queryKey: ["packs"], queryFn: () => listMyPacks() });

  const handleDownloadPack = async (packSlug: string) => {
    try {
      const res = await getPackDownloadUrl({ data: { packSlug } });
      if ("error" in res) throw new Error(res.error);
      window.open(res.url, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not start download");
    }
  };

  const sub = subQ.data?.subscription ?? null;
  const isPro = isSubscriptionActive(sub);
  const balance = creditsQ.data?.balance ?? 0;

  const handleManageBilling = async () => {
    if (!env) return toast.error("Payments not configured");
    setBusy(true);
    try {
      const res = await createPortalSession({
        data: { returnUrl: `${window.location.origin}/account`, environment: env },
      });
      if ("error" in res) throw new Error(res.error);
      window.open(res.url, "_blank", "noopener");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Could not open billing portal");
    } finally {
      setBusy(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  };

  const periodEnd = sub?.current_period_end ? new Date(sub.current_period_end) : null;

  return (
    <div className="min-h-screen text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <nav className="mx-auto max-w-4xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure" className="h-9 w-9 rounded-full" />
          <span className="font-display text-xl font-bold brand-text">Blacure</span>
        </Link>
        <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Back to app
        </Link>
      </nav>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 py-8 space-y-6">
        <header>
          <h1 className="font-display text-3xl font-bold">Account &amp; Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">Manage your plan, view credits, and see your history.</p>
        </header>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="p-6 border-border/60 bg-card/70">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-display text-lg font-semibold flex items-center gap-2">
                {isPro ? <Crown className="h-4 w-4 brand-text" /> : <Zap className="h-4 w-4 brand-text" />}
                Subscription
              </h2>
              {isPro && (
                <span className="text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 border border-primary/50 brand-text">Active</span>
              )}
            </div>
            {subQ.isLoading ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : isPro ? (
              <>
                <p className="text-sm">Blacure Monthly — unlimited Standard &amp; Pro Studio prompts.</p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Status: <span className="font-mono">{sub?.status}</span>
                  {sub?.cancel_at_period_end && " · cancels at period end"}
                </p>
                {periodEnd && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    {sub?.cancel_at_period_end ? "Access until " : "Renews "}
                    {periodEnd.toLocaleDateString()}
                  </p>
                )}
                <Button onClick={handleManageBilling} disabled={busy} className="mt-4 w-full">
                  <ExternalLink className="h-4 w-4" /> Manage billing
                </Button>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">No active subscription. You're on the pay-as-you-go plan.</p>
                <Link to="/pricing" className="block mt-4">
                  <Button className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
                    <Crown className="h-4 w-4" /> Go Monthly · Unlimited
                  </Button>
                </Link>
              </>
            )}
          </Card>

          <Card className="p-6 border-border/60 bg-card/70">
            <h2 className="font-display text-lg font-semibold mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4 brand-text" /> Credits
            </h2>
            <p className="font-display text-3xl font-bold">{creditsQ.isLoading ? "…" : balance}</p>
            <p className="text-xs text-muted-foreground mt-1">
              ≈ {Math.floor(balance / 2)} Standard prompts · 1 prompt = 2 credits
            </p>
            <Link to="/pricing" className="block mt-4">
              <Button variant="outline" className="w-full border-primary/40 hover:bg-primary/10">
                <CreditCard className="h-4 w-4" /> Buy more credits
              </Button>
            </Link>
          </Card>
        </div>

        <Card className="p-6 border-border/60 bg-card/70">
          <h2 className="font-display text-lg font-semibold mb-3 flex items-center gap-2">
            <Download className="h-4 w-4 brand-text" /> Downloads
          </h2>
          {packsQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (packsQ.data?.packs ?? []).length === 0 ? (
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <p className="text-sm text-muted-foreground">
                You don't own any prompt packs yet. Grab Volume 1 for $2 — 12 studio-ready prompts, instant PDF.
              </p>
              <Link to="/pricing">
                <Button variant="outline" className="border-primary/40 hover:bg-primary/10">
                  View pack
                </Button>
              </Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {packsQ.data!.packs.map((p) => (
                <li
                  key={p.pack_slug}
                  className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/40 p-3"
                >
                  <img
                    src={(PACK_META[p.pack_slug]?.cover) ?? packCover.url}
                    alt={PACK_META[p.pack_slug]?.title ?? p.pack_slug}
                    className="h-16 w-16 rounded-md object-cover border border-primary/30 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{PACK_META[p.pack_slug]?.title ?? p.pack_slug}</p>
                    <p className="text-xs text-muted-foreground">
                      Purchased {new Date(p.created_at).toLocaleDateString()} · {PACK_META[p.pack_slug]?.blurb ?? "PDF"}
                    </p>
                  </div>
                  <Button
                    onClick={() => handleDownloadPack(p.pack_slug)}
                    className="brand-gradient text-black font-semibold border-0 hover:opacity-90"
                  >
                    <Download className="h-4 w-4" /> Download
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6 border-border/60 bg-card/70">
          <h2 className="font-display text-lg font-semibold mb-3">Recent activity</h2>
          {txQ.isLoading ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : (txQ.data?.transactions ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No activity yet.</p>
          ) : (
            <ul className="divide-y divide-border/40">
              {txQ.data!.transactions.map((t) => (
                <li key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div>
                    <p className="font-medium">{REASON_LABEL[t.reason] ?? t.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(t.created_at).toLocaleString()}</p>
                  </div>
                  <span className={`font-mono font-semibold ${t.delta >= 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {t.delta > 0 ? "+" : ""}{t.delta}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={handleSignOut}>
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </main>
    </div>
  );
}
