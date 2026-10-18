import { Link } from "@tanstack/react-router";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

export function UpgradeModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isGuest?: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-primary/40 bg-card/95">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Keep creating — it's free</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            You've used your 10 guest prompts. Create a free account for unlimited Standard and Pro Studio
            blueprints, lyrics, PROMPTOR AI, and saved history. No credit card needed.
          </DialogDescription>
        </DialogHeader>
        <Link to="/auth" onClick={() => onOpenChange(false)} className="mt-2 block">
          <Button className="w-full brand-gradient text-black font-semibold border-0 hover:opacity-90">
            <LogIn className="h-4 w-4" />
            Create free account
          </Button>
        </Link>
      </DialogContent>
    </Dialog>
  );
}
