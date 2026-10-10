import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster, toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/reset-password")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Reset password — The Promptor by Blacure" },
      { name: "description", content: "Choose a new password for your The Promptor account." },
      { property: "og:title", content: "Reset password — The Promptor by Blacure" },
      { property: "og:description", content: "Choose a new password for your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  const save = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) return toast.error(error.message || "Could not update password. Request a new link.");
      toast.success("Password updated");
      navigate({ to: "/app" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-foreground">
      <Toaster theme="dark" position="top-center" richColors />
      <Card className="w-full max-w-md border-border/60 bg-card/70 p-6 space-y-4">
        <h1 className="font-display text-2xl text-center">Set a new password</h1>
        <div className="space-y-1.5">
          <Label htmlFor="np">New password</Label>
          <Input id="np" type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
        </div>
        <Button onClick={save} disabled={busy || password.length < 6} className="w-full brand-gradient text-black font-semibold border-0">
          Save password
        </Button>
      </Card>
    </div>
  );
}
