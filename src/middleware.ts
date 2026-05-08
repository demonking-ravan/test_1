import type { MiddlewareNext } from "astro";

export async function onRequest(context: any, next: MiddlewareNext) {
    const cache = (caches as any).default as Cache;
    const request = context.request;

    // Check if response is cached
    let response = await cache.match(request);
    if (response) {
        return new Response(response.body, response);
    }

    // Generate the page
    response = await next();

    // Only cache successful HTML responses
    if (response.status === 200) {
        const cloned = response.clone();
        context.locals.runtime?.ctx?.waitUntil?.(cache.put(request, cloned));
    }

    return response;
}
