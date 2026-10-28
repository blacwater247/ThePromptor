import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Sparkles, ArrowLeft } from "lucide-react";
import { Toaster, toast } from "sonner";
import logoAsset from "@/assets/blacure-logo.png.asset.json";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { oauthReturnPath } from "@/lib/oauth-return-path";

export const Route = createFileRoute("/auth")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({ next: oauthReturnPath(search.next ?? "/app") }),
  head: () => ({
    meta: [
      { title: "Sign in — The Promptor by Blacure" },
      { name: "description", content: "Sign in to The Promptor by Blacure to build and manage AI music prompts." },
      { property: "og:title", content: "Sign in — The Promptor by Blacure" },
      { property: "og:description", content: "Access your AI music prompt studio." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { next } = Route.useSearch();
  const returnToApp = () => { window.location.assign(next); };
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) window.location.assign(next);
    });
  }, [next]);

  const friendly = (error: { message?: string; status?: number }, fallback: string) => {
    const m = (error.message || "").toLowerCase();
    if (m.includes("invalid login")) return "Incorrect email or password.";
    if (m.includes("email not confirmed")) return "Please confirm your email first — check your inbox.";
    if (m.includes("already registered")) return "That email already has an account. Try signing in.";
    if (m.includes("rate limit") || error.status === 429) return "Too many attempts. Please wait a minute and try again.";
    if (m.includes("fetch") || m.includes("network") || (error.status ?? 0) >= 500)
      return "Sign-in service is unavailable right now. Please try again shortly.";
    return error.message || fallback;
  };

  const signIn = async () => {
    setBusy(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
      if (error) {
        console.error("Sign-in error:", error);
        return toast.error(friendly(error, "Could not sign in."));
      }
      toast.success("Welcome back");
      returnToApp();
    } catch (e) {
      toast.error(friendly(e as Error, "Could not sign in."));
    } finally {
      setBusy(false);
    }
  };

  const forgotPassword = async () => {
    if (!email.trim()) return toast.error("Enter your email above first.");
    setBusy(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return toast.error(friendly(error, "Could not send reset email."));
      toast.success("Password reset link sent — check your inbox.");
    } catch (e) {
      toast.error(friendly(e as Error, "Could not send reset email."));
    } finally {
      setBusy(false);
    }
  };

  const signUp = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: new URL(next, window.location.origin).href,
          data: { full_name: name },
        },
      });
      if (error) {
        console.error("Sign-up error:", error);
        return toast.error(friendly(error, "Could not create account."));
      }
      if (!data.session) {
        toast.success("Account created — check your email to confirm, then sign in.");
        return;
      }
      toast.success("Account created — you have 10 free prompts!");
      returnToApp();
    } catch (e) {
      toast.error(friendly(e as Error, "Could not create account."));
    } finally {
      setBusy(false);
    }
  };

  const social = async (provider: "google" | "apple") => {
    setBusy(true);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: new URL(`/auth?next=${encodeURIComponent(next)}`, window.location.origin).href,
      });
      if (result.error) {
        toast.error(friendly(result.error, `${provider === "google" ? "Google" : "Apple"} sign-in failed`));
        return;
      }
      if (result.redirected) return;
      returnToApp();
    } catch (e) {
      toast.error(friendly(e as Error, "Sign-in failed"));
    } finally {
      setBusy(false);
    }
  };
  const google = () => social("google");
  const apple = () => social("apple");

  return (
    <div className="min-h-screen text-foreground flex flex-col">
      <Toaster theme="dark" position="top-center" richColors />
      <nav className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-5 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={logoAsset.url} alt="Blacure logo" className="h-9 w-9 rounded-full" />
          <span className="leading-tight"><span className="block font-display text-lg font-bold">The Promptor</span><span className="block text-[10px] font-semibold uppercase text-muted-foreground">by Blacure</span></span>
        </Link>
        <Link to="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1">
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
      </nav>

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md border-border/60 bg-card/70 backdrop-blur p-6">
          <div className="text-center mb-6">
            <p className="text-[10px] font-bold uppercase tracking-[.2em] text-primary">Studio access</p>
            <h1 className="mt-2 font-display text-2xl">Sign in to <span className="brand-text">THE PROMPTOR™</span></h1>
            <p className="text-sm text-muted-foreground mt-1">Your AI Song Blueprint Studio by Blacure.</p>
          </div>

          <div className="space-y-2 mb-4">
            <Button onClick={google} disabled={busy} variant="outline" className="w-full border-primary/40 hover:bg-primary/10">
              Continue with Google
            </Button>
            <Button onClick={apple} disabled={busy} variant="outline" className="w-full bg-black text-white border-white/20 hover:bg-black/90 hover:text-white">
               Continue with Apple
            </Button>
          </div>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border/60" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-card px-2 text-muted-foreground">or with email</span></div>
          </div>

          <Tabs defaultValue="signin">
            <TabsList className="grid grid-cols-2 w-full mb-4">
              <TabsTrigger value="signin">Sign in</TabsTrigger>
              <TabsTrigger value="signup">Sign up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="si-email">Email</Label>
                <Input id="si-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="si-pass">Password</Label>
                <Input id="si-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
              </div>
              <Button onClick={signIn} disabled={busy || !email || !password} className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Sign in
              </Button>
              <button type="button" onClick={forgotPassword} disabled={busy} className="w-full text-center text-xs text-muted-foreground hover:text-foreground underline-offset-4 hover:underline">
                Forgot password?
              </button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="su-name">Name (optional)</Label>
                <Input id="su-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-email">Email</Label>
                <Input id="su-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="su-pass">Password</Label>
                <Input id="su-pass" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" minLength={6} />
              </div>
              <Button onClick={signUp} disabled={busy || !email || password.length < 6} className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
                <Sparkles className="h-4 w-4" /> Create account · 10 free prompts
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
