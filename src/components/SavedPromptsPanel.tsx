import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Copy, Cloud } from "lucide-react";
import { toast } from "sonner";
import { listMyPromptsRailway } from "@/lib/railway.functions";

export function SavedPromptsPanel() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["railway", "saved-prompts"],
    queryFn: () => listMyPromptsRailway(),
    retry: false,
  });

  const prompts =
    query.data && "data" in query.data ? query.data.data.prompts ?? [] : [];
  const errorMessage =
    query.data && "error" in query.data
      ? query.data.error
      : query.isError
      ? "Could not load saved prompts."
      : null;

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Copied to clipboard");
    } catch {
      toast.error("Copy failed");
    }
  };

  return (
    <Card className="p-5 border-white/10 bg-black/40">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-white/90">
            My Saved Prompts <span className="text-white/40">· Cloud</span>
          </h3>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => queryClient.invalidateQueries({ queryKey: ["railway", "saved-prompts"] })}
          disabled={query.isFetching}
        >
          <RefreshCw className={`w-4 h-4 ${query.isFetching ? "animate-spin" : ""}`} />
        </Button>
      </div>

      {query.isLoading ? (
        <p className="text-sm text-white/50">Loading…</p>
      ) : errorMessage ? (
        <p className="text-sm text-white/50">{errorMessage}</p>
      ) : prompts.length === 0 ? (
        <p className="text-sm text-white/50">No saved prompts yet. Generate one and hit "Save prompt".</p>
      ) : (
        <ul className="space-y-2 max-h-72 overflow-auto pr-1">
          {prompts.map((p) => (
            <li
              key={p.id}
              className="p-3 rounded-md border border-white/10 bg-white/5 text-sm text-white/80"
            >
              <div className="flex items-start justify-between gap-3">
                <p className="whitespace-pre-wrap line-clamp-4 flex-1">{p.prompt}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopy(p.prompt)}
                  aria-label="Copy prompt"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
              </div>
              <p className="text-[11px] text-white/40 mt-1">
                {new Date(p.created_at).toLocaleString()}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
