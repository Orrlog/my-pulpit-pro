import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { getSupabaseBrowserConfig } from "./env";

export async function createClient() {
  const cookieStore = await cookies();
  const { url, publishableKey } = getSupabaseBrowserConfig();

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Server Components cannot mutate cookies. Middleware refreshes sessions before render.
        }
      },
    },
  });
}
