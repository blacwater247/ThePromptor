import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Music, Radio, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { savePromptRailway, sunoGenerate, udioGenerate } from "@/lib/railway.functions";

interface Props {
  prompt: string;
}

type Busy = null | "suno" | "udio" | "save";

export function RailwayActions({ prompt }: Props) {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState<Busy>(null);

  const hasPrompt = prompt.trim().length > 0;

  const send = async (
    kind: Exclude<Busy, null>,
    action: () => Promise<{ data: unknown } | { error: string }>,
    successMessage: string,
    onSuccess?: () => void,
  ) => {
    if (!hasPrompt) {
      toast.error("Generate a prompt first.");
      return;
    }
    setBusy(kind);
    try {
      const res = await action();
      if ("error" in res) {
        toast.error(res.error);
        return;
      }
      toast.success(successMessage);
      onSuccess?.();
    } catch {
      toast.error("Request failed. Try again.");
    } finally {
      setBusy(null);
    }
  };

  return (
    <Card className="p-5 border-white/10 bg-black/40">
      <h3 className="text-sm font-semibold text-white/90 mb-3">Actions</h3>

      <label className="block text-xs text-white/60 mb-1" htmlFor="railway-title">
        Title <span className="text-white/30">(optional)</span>
      </label>
      <Input
        id="railway-title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="e.g. Midnight Drive"
        maxLength={120}
        className="mb-4 bg-black/40 border-white/10"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Button
          onClick={() =>
            send(
              "suno",
              () => sunoGenerate({ data: { prompt, title: title || undefined } }),
              "Sent to Suno.",
            )
          }
          disabled={!hasPrompt || busy !== null}
          className="brand-gradient text-black font-semibold border-0 hover:opacity-90"
        >
          {busy === "suno" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Music className="w-4 h-4" />}
          Send to Suno
        </Button>
        <Button
          onClick={() =>
            send(
              "udio",
              () => udioGenerate({ data: { prompt, title: title || undefined } }),
              "Sent to Udio.",
            )
          }
          disabled={!hasPrompt || busy !== null}
          variant="outline"
          className="border-white/20"
        >
          {busy === "udio" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Radio className="w-4 h-4" />}
          Send to Udio
        </Button>
        <Button
          onClick={() =>
            send(
              "save",
              () => savePromptRailway({ data: { prompt, title: title || undefined } }),
              "Prompt saved.",
              () => queryClient.invalidateQueries({ queryKey: ["railway", "saved-prompts"] }),
            )
          }
          disabled={!hasPrompt || busy !== null}
          variant="outline"
          className="border-white/20"
        >
          {busy === "save" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save prompt
        </Button>
      </div>

      {!hasPrompt && (
        <p className="mt-3 text-xs text-white/40">Generate a prompt above to enable these actions.</p>
      )}
    </Card>
  );
}
