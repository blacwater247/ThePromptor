import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/checkout/return")({
  head: () => ({
    meta: [
      { title: "Payment complete — The Promptor by Blacure" },
      { name: "description", content: "Your The Promptor purchase is complete." },
      { property: "og:title", content: "Payment complete — The Promptor by Blacure" },
      { property: "og:description", content: "Your purchase is being added to your account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  validateSearch: (search: Record<string, unknown>): { session_id?: string } => ({
    session_id: typeof search.session_id === "string" ? search.session_id : undefined,
  }),
  component: CheckoutReturn,
});

function CheckoutReturn() {
  const { session_id } = Route.useSearch();
  const queryClient = useQueryClient();

  useEffect(() => {
    // Give the webhook a moment then refresh credits + subscription
    const t = setTimeout(() => {
      queryClient.invalidateQueries({ queryKey: ["credits", "balance"] });
      queryClient.invalidateQueries({ queryKey: ["subscription"] });
    }, 1500);
    return () => clearTimeout(t);
  }, [queryClient]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Card className="max-w-md w-full p-8 text-center border-border/60 bg-card/70">
        <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
        <h1 className="mt-4 font-display text-2xl font-bold">Payment received</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {session_id
            ? "Your credits and access will appear in your account within a few seconds."
            : "Thanks for your purchase."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link to="/app">
            <Button className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
              Open The Promptor
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="ghost" className="w-full">
              Back to pricing
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
