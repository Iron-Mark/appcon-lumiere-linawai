/**
 * The companion asks the Linaw app, not the page it is injected into.
 * The app then tries Gemini, then the Pandev gateway, then the fixture.
 * Keys stay in the app process.
 */

export const LINAW_APP_ORIGINS = [
  "https://appcon-lumiere-linawai.vercel.app",
  "http://127.0.0.1:3000",
  "http://localhost:3000",
] as const;

export type LinawHttpResult = {
  status: number;
  json: unknown;
};

type FetchLike = (
  input: string,
  init?: {
    method?: string;
    headers?: Record<string, string>;
    body?: string;
  },
) => Promise<{
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
}>;

/**
 * Try each Linaw origin until one answers with JSON.
 * A refused connection or an HTML error page moves on to the next origin.
 */
export async function fetchLinawJson(
  path: "/api/adapt",
  init: { method: "GET" } | { method: "POST"; body: string },
  fetchImpl: FetchLike = fetch,
): Promise<LinawHttpResult | null> {
  for (const origin of LINAW_APP_ORIGINS) {
    try {
      const res = await fetchImpl(`${origin}${path}`, {
        method: init.method,
        headers:
          init.method === "POST"
            ? { "Content-Type": "application/json" }
            : undefined,
        body: init.method === "POST" ? init.body : undefined,
      });
      let json: unknown = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      if (json == null) continue;
      return { status: res.status, json };
    } catch {
      // Origin is down. Try the next one.
    }
  }
  return null;
}
