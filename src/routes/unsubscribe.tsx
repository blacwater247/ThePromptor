import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type State = "loading" | "valid" | "already" | "invalid" | "success" | "error";

export const Route = createFileRoute("/unsubscribe")({
  head: () => ({
    meta: [
      { title: "Unsubscribe — Blacure" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: UnsubscribePage,
});

function UnsubscribePage() {
  const [state, setState] = useState<State>("loading");
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("token");
    setToken(t);
    if (!t) {
      setState("invalid");
      return;
    }
    fetch(`/email/unsubscribe?token=${encodeURIComponent(t)}`)
      .then(async (r) => {
        if (r.status === 404) return setState("invalid");
        const json = await r.json();
        if (json.valid) setState("valid");
        else if (json.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, []);

  const confirm = async () => {
    if (!token) return;
    setState("loading");
    try {
      const r = await fetch("/email/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const json = await r.json();
      if (json.success) setState("success");
      else if (json.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center rounded-2xl border border-border/60 bg-card/70 backdrop-blur p-8">
        <h1 className="font-display text-2xl font-bold mb-4">Unsubscribe</h1>
        {state === "loading" && <p className="text-muted-foreground">Loading…</p>}
        {state === "valid" && (
          <>
            <p className="text-muted-foreground mb-6">
              Click below to unsubscribe from Blacure emails.
            </p>
            <Button onClick={confirm} className="brand-gradient text-black font-semibold border-0 hover:opacity-90">
              Confirm unsubscribe
            </Button>
          </>
        )}
        {state === "success" && (
          <p className="text-primary font-medium">You have been unsubscribed.</p>
        )}
        {state === "already" && (
          <p className="text-muted-foreground">You're already unsubscribed.</p>
        )}
        {state === "invalid" && (
          <p className="text-destructive font-medium">This unsubscribe link is invalid or expired.</p>
        )}
        {state === "error" && (
          <p className="text-destructive font-medium">Something went wrong. Please try again.</p>
        )}
      </div>
    </div>
  );
}
