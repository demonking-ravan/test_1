import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { secret, paths } = body;

    const envSecret = import.meta.env.REVALIDATION_SECRET;
    const zoneId = import.meta.env.CLOUDFLARE_ZONE_ID;
    const apiToken = import.meta.env.CLOUDFLARE_API_TOKEN;

    if (!secret || secret !== envSecret) {
      return new Response(JSON.stringify({ error: 'Invalid secret' }), { status: 401 });
    }

    if (!paths || !Array.isArray(paths)) {
      return new Response(JSON.stringify({ error: 'Paths array is required' }), { status: 400 });
    }

    if (!zoneId || !apiToken) {
      return new Response(JSON.stringify({ error: 'Cloudflare credentials not configured' }), { status: 500 });
    }

    // Build absolute URLs for Cloudflare based on the incoming request origin
    const origin = new URL(request.url).origin;
    const urlsToPurge = paths.map((p) => {
      // Ensure path starts with /
      const normalizedPath = p.startsWith('/') ? p : `/${p}`;
      return new URL(normalizedPath, origin).href;
    });

    console.log('[Revalidation] Purging Cloudflare Cache for:', urlsToPurge);

    const cfResponse = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/purge_cache`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        files: urlsToPurge,
      }),
    });

    const cfData = await cfResponse.json();

    if (!cfResponse.ok || !cfData.success) {
      console.error('[Revalidation] Cloudflare Purge Error:', cfData.errors);
      return new Response(JSON.stringify({ error: 'Failed to purge cache', details: cfData.errors }), { status: 500 });
    }

    return new Response(JSON.stringify({ success: true, purged: urlsToPurge }), { status: 200 });

  } catch (err) {
    console.error('[Revalidation] Server Error:', err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
};
