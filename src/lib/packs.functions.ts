import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import packAsset from "@/server-assets/blacure-prompt-pack-v1.pdf.asset.json";

const PACK_ASSET_URLS: Record<string, string> = {
  prompt_pack_vol1: packAsset.url,
};

type PackListResult = { packs: Array<{ pack_slug: string; created_at: string }> };
type DownloadResult = { url: string } | { error: string };

export const listMyPacks = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<PackListResult> => {
    const { data, error } = await context.supabase
      .from("pack_purchases")
      .select("pack_slug, created_at")
      .eq("user_id", context.userId)
      .order("created_at", { ascending: false });
    if (error) return { packs: [] };
    // Dedupe by pack_slug — user may buy the same pack multiple times.
    const seen = new Set<string>();
    const packs: PackListResult["packs"] = [];
    for (const row of data ?? []) {
      if (seen.has(row.pack_slug)) continue;
      seen.add(row.pack_slug);
      packs.push(row);
    }
    return { packs };
  });

export const getPackDownloadUrl = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: { packSlug: string }) => {
    if (!/^[a-z0-9_]+$/.test(data.packSlug)) throw new Error("Invalid packSlug");
    return data;
  })
  .handler(async ({ data, context }): Promise<DownloadResult> => {
    const { data: rows, error } = await context.supabase
      .from("pack_purchases")
      .select("id")
      .eq("user_id", context.userId)
      .eq("pack_slug", data.packSlug)
      .limit(1);
    if (error || !rows || rows.length === 0) {
      return { error: "You don't own this pack." };
    }
    const url = PACK_ASSET_URLS[data.packSlug];
    if (!url) return { error: "Pack not available." };
    return { url };
  });
