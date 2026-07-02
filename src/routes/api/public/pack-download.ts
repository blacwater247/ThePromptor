import { createFileRoute } from "@tanstack/react-router";
import { verifyPackDownload } from "@/lib/pack-signing.server";
import packV1 from "@/server-assets/blacure-prompt-pack-v1.pdf.asset.json";
import packV2 from "@/server-assets/blacure-prompt-pack-v2.pdf.asset.json";
import packV3 from "@/server-assets/blacure-prompt-pack-v3.pdf.asset.json";

const PACK_ASSETS: Record<string, { url: string; filename: string }> = {
  prompt_pack_vol1: { url: packV1.url, filename: "blacure-prompt-pack-v1.pdf" },
  prompt_pack_vol2: { url: packV2.url, filename: "blacure-prompt-pack-v2.pdf" },
  prompt_pack_vol3: { url: packV3.url, filename: "blacure-prompt-pack-v3.pdf" },
};

export const Route = createFileRoute("/api/public/pack-download")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("slug") ?? "";
        const userId = url.searchParams.get("u") ?? "";
        const token = url.searchParams.get("t") ?? "";
        if (!slug || !userId || !token) return new Response("Bad request", { status: 400 });
        if (!/^[a-z0-9_]+$/.test(slug)) return new Response("Bad request", { status: 400 });
        const asset = PACK_ASSETS[slug];
        if (!asset) return new Response("Not found", { status: 404 });

        const ok = await verifyPackDownload(slug, userId, token);
        if (!ok) return new Response("Link expired or invalid", { status: 403 });

        const upstream = await fetch(new URL(asset.url, request.url).toString());
        if (!upstream.ok || !upstream.body) {
          return new Response("File unavailable", { status: 502 });
        }
        return new Response(upstream.body, {
          status: 200,
          headers: {
            "Content-Type": "application/pdf",
            "Content-Disposition": `attachment; filename="${asset.filename}"`,
            "Cache-Control": "private, no-store",
          },
        });
      },
    },
  },
});
