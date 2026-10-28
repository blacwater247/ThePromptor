import { createFileRoute, redirect, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({ authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "" }),
  head: () => ({ meta: [
    { title: "Connect an assistant — The Promptor" },
    { name: "description", content: "Review and approve an assistant connection to The Promptor." },
    { property: "og:title", content: "Assistant connection — The Promptor" },
    { property: "og:description", content: "Securely review access to The Promptor's music prompt tools." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("This connection request is missing or expired. Restart the connection from your assistant.");
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    if (!data.session) throw redirect({ to: "/auth", search: { next: location.pathname + location.searchStr + location.hash } });
    return { accountEmail: data.session.user.email ?? "Your account" };
  },
  loader: async ({ location }) => {
    const id = new URLSearchParams(location.searchStr).get("authorization_id");
    if (!id) throw new Error("Missing connection request.");
    const { data, error } = await supabase.auth.oauth.getAuthorizationDetails(id);
    if (error) throw new Error("This connection request could not be loaded. It may have expired. Restart the connection from your assistant.");
    if (!data) throw new Error("No connection request was returned.");
    if ("redirect_url" in data && data.redirect_url && !("client" in data)) throw redirect({ href: data.redirect_url });
    if (!("client" in data)) throw new Error("This connection request is unavailable.");
    return data;
  },
  pendingComponent: () => <main className="mx-auto max-w-lg px-6 py-16"><p role="status">Loading connection request…</p></main>,
  errorComponent: ({ error }) => <main className="mx-auto max-w-lg px-6 py-16"><h1 className="font-display text-2xl">Connection unavailable</h1><p role="alert" className="mt-4 text-muted-foreground">{error instanceof Error ? error.message : "Please restart this connection from your assistant."}</p><Button asChild variant="outline" className="mt-6"><Link to="/app">Back to The Promptor</Link></Button></main>,
  component: Consent,
});

function Consent() {
  const details = Route.useLoaderData();
  const { accountEmail } = Route.useRouteContext();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const clientName = details.client.name || "Your assistant";
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = approve
        ? await supabase.auth.oauth.approveAuthorization(authorization_id)
        : await supabase.auth.oauth.denyAuthorization(authorization_id);
      if (result.error) throw result.error;
      const target = result.data?.redirect_url;
      if (!target) throw new Error("No return address was provided. Please restart the connection.");
      window.location.assign(target);
    } catch {
      setError(approve ? "Could not approve this connection. Try again or restart it from your assistant." : "Could not cancel this connection. Please try again.");
      setBusy(false);
    }
  }
  const scopeLabels: Record<string, string> = { openid: "Share your basic profile", profile: "Share your profile details", email: "Share your email address" };
  return <main className="mx-auto max-w-lg px-6 py-16 text-foreground">
    <p className="font-display text-sm text-primary">THE PROMPTOR™</p>
    <h1 className="mt-5 font-display text-2xl">Connect {clientName} to The Promptor</h1>
    <p className="mt-4 text-muted-foreground">This lets {clientName} use this app as you.</p>
    <div className="my-6 space-y-3 border-y border-border py-5 text-sm">
      <p>Signed in as {accountEmail}</p>
      <p className="break-all">Return address: {details.redirect_uri}</p>
      <ul className="space-y-2">{details.scope.split(/\s+/).filter(Boolean).map(scope => <li key={scope}>{scopeLabels[scope] ?? `Additional permission requested: ${scope}`}</li>)}</ul>
      <p>Read music prompt choices and writing guidance.</p>
      <p className="text-muted-foreground">Saved blueprints and lyrics stay in your browser and are not shared by this connection.</p>
      <p className="text-muted-foreground">This does not bypass The Promptor’s account permissions.</p>
    </div>
    {error && <p role="alert" className="mb-4 text-destructive">{error}</p>}
    <div className="flex flex-wrap gap-3"><Button disabled={busy} onClick={() => decide(true)}>{busy ? "Please wait…" : "Approve connection"}</Button><Button variant="outline" disabled={busy} onClick={() => decide(false)}>Cancel connection</Button></div>
    <Button variant="link" disabled={busy} className="mt-4" onClick={async () => { await supabase.auth.signOut(); window.location.reload(); }}>Use a different account</Button>
  </main>;
}