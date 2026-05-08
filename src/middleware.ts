import type { MiddlewareNext } from "astro";

export async function onRequest(context: any, next: MiddlewareNext) {
    const request = context.request;

    // Only cache GET requests
    if (request.method !== "GET") {
        return next();
    }

    try {
        // `caches` is only available in the Cloudflare environment
        const cachesGlobal = (globalThis as any).caches;
        if (!cachesGlobal || !cachesGlobal.default) {
            return next();
        }
        
        const cache = cachesGlobal.default as Cache;

        // Check if response is cached
        const cached = await cache.match(request);
        if (cached) {
            return new Response(cached.body, cached);
        }

        // Generate the page
        const response = await next();

        // Only cache successful HTML responses
        const contentType = response.headers.get("content-type") || "";
        if (response.status === 200 && contentType.includes("text/html")) {
            // CRITICAL: The Cloudflare Cache API requires a Cache-Control header.
            // If it's missing, cache.put() will silently ignore the response.
            response.headers.set("Cache-Control", "public, max-age=0, s-maxage=31536000, must-revalidate");

            const cloned = response.clone();
            try {
                const waitUntil = context.locals.runtime?.ctx?.waitUntil;
                if (waitUntil) {
                    waitUntil(cache.put(request, cloned));
                } else {
                    await cache.put(request, cloned);
                }
            } catch (e) {
                console.error("[Middleware] Failed to cache:", e);
            }
        }

        return response;
    } catch (e) {
        // If caching fails, just render the page normally
        console.error("[Middleware Error]", e);
        return next();
    }
}
