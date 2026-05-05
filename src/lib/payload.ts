export const PAYLOAD_URL = import.meta.env.PAYLOAD_URL || 'http://127.0.0.1:3000';

export function getMediaUrl(url: string | undefined): string {
  if (!url) return '';
  return url.startsWith('/') ? `${PAYLOAD_URL}${url}` : url;
}

export async function fetchPayload<T>(endpoint: string, query?: Record<string, any>): Promise<T> {
  const url = new URL(`${PAYLOAD_URL}/api/${endpoint}`);
  
  if (query) {
    Object.entries(query).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }

  const res = await fetch(url.href);
  
  if (!res.ok) {
    throw new Error(`Failed to fetch from Payload CMS at ${url.href}: ${res.status} ${res.statusText}`);
  }

  return res.json();
}
