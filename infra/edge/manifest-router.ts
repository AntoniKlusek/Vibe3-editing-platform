/**
 * infra/edge/manifest-router.ts
 * Cloudflare Worker — Edge manifest routing for ultra-low latency HLS playback.
 *
 * Deploy: wrangler deploy infra/edge/manifest-router.ts
 *
 * Routes:
 *   GET /manifest/:videoId → resolves manifest_url from cache or Supabase
 */

interface Env {
  VIDEO_METADATA: KVNamespace;       // Cloudflare KV — edge cache for video metadata
  SUPABASE_URL: string;              // Wrangler secret
  SUPABASE_ANON_KEY: string;         // Wrangler secret
}

interface VideoMeta {
  status: string;
  manifestUrl: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Only handle /manifest/:videoId
    const match = url.pathname.match(/^\/manifest\/([0-9a-f-]{36})$/i);
    if (!match) return new Response("Not Found", { status: 404 });

    const videoId = match[1]!;

    // ── 1. Check Cloudflare KV edge cache (TTL: 60s) ─────────────────────
    const cached = await env.VIDEO_METADATA.get<VideoMeta>(videoId, "json");
    if (cached?.status === "READY" && cached.manifestUrl) {
      return Response.redirect(cached.manifestUrl, 302);
    }

    // ── 2. KV miss → fetch from Supabase ─────────────────────────────────
    const apiUrl = `${env.SUPABASE_URL}/rest/v1/videos?id=eq.${videoId}&select=status,manifest_url&limit=1`;
    const supabaseRes = await fetch(apiUrl, {
      headers: {
        apikey: env.SUPABASE_ANON_KEY,
        Authorization: `Bearer ${env.SUPABASE_ANON_KEY}`,
      },
    });

    if (!supabaseRes.ok) {
      return new Response("Upstream error", { status: 502 });
    }

    const rows = await supabaseRes.json() as Array<{ status: string; manifest_url: string | null }>;
    const row = rows[0];

    if (!row) return new Response("Video not found", { status: 404 });

    // ── 3. Cache result in KV, then redirect ─────────────────────────────
    if (row.status === "READY" && row.manifest_url) {
      await env.VIDEO_METADATA.put(
        videoId,
        JSON.stringify({ status: row.status, manifestUrl: row.manifest_url }),
        { expirationTtl: 60 } // 60 second TTL
      );
      return Response.redirect(row.manifest_url, 302);
    }

    // Video still processing
    return Response.json({ status: row.status }, { status: 202 });
  },
};
