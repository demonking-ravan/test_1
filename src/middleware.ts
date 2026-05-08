import type { MiddlewareNext } from "astro";

export async function onRequest(context: any, next: MiddlewareNext) {
  const request = context.request;

  // Only cache GET requests for HTML pages
  if (request.method !== "GET") {
    return next();
  }

  try {
    const cache = (caches as any).default as Cache;

    // Check if response is cached
    const cached = await cache.match(request);
    if (cached) {
      return new Response(cached.body, cached);
    }

    // Generate the page
    const response = await next();

    // Only cache successful responses
    if (response.status === 200) {
      const cloned = response.clone();
      try {
        context.locals.runtime?.ctx?.waitUntil?.(cache.put(request, cloned));
      } catch (e) {
        // Silently fail if waitUntil isn't available
      }
    }

    return response;
  } catch (e) {
    // If caching fails, just render the page normally
    return next();
  }
}
