import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Crown, CreditCard, LogIn } from "lucide-react";

export function UpgradeModal({
  open,
  onOpenChange,
  isGuest = false,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isGuest?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/40 bg-card/95">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">You've used your 10 free prompts</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {isGuest
              ? "Free prompts don't reset. Create a free account, then grab a pack or go unlimited to keep generating."
              : "Free prompts don't reset. Grab a pack or go unlimited monthly to keep generating."}
          </DialogDescription>
        </DialogHeader>
        {isGuest && (
          <Link to="/auth" onClick={() => onOpenChange(false)} className="mt-2 block">
            <Button variant="outline" className="w-full border-primary/60 hover:bg-primary/10">
              <LogIn className="h-4 w-4" />
              Create free account
            </Button>
          </Link>
        )}
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <Link to="/pricing" onClick={() => onOpenChange(false)}>
            <Button className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
              <CreditCard className="h-4 w-4" />
              Buy 20 prompts — $5
            </Button>
          </Link>
          <Link to="/pricing" onClick={() => onOpenChange(false)}>
            <Button variant="outline" className="w-full border-primary/60 hover:bg-primary/10">
              <Crown className="h-4 w-4" />
              Go unlimited — $19.99/mo
            </Button>
          </Link>
        </div>
        <Link
          to="/pricing"
          onClick={() => onOpenChange(false)}
          className="mt-1 text-center text-sm text-muted-foreground hover:text-foreground underline"
        >
          See all plans
        </Link>
      </DialogContent>
    </Dialog>
  );
}
