import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import { supabasePublicKey, supabaseUrl } from "./env";

let browserClient: SupabaseClient | null = null;

/** Browser Supabase client. Null when the public env is missing. */
export function getBrowserSupabase(): SupabaseClient | null {
  const url = supabaseUrl();
  const key = supabasePublicKey();
  if (!url || !key) return null;
  if (!browserClient) {
    browserClient = createBrowserClient(url, key);
  }
  return browserClient;
}
