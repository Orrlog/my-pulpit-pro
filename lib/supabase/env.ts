type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

function parseHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? "";
  const validUrl = parseHttpUrl(url);

  if (!validUrl || !publishableKey) {
    return null;
  }

  return { url: validUrl, publishableKey };
}

export function getSupabaseBrowserConfig() {
  const config = getSupabasePublicConfig();

  if (!config) {
    throw new Error("Supabase public configuration is missing or invalid.");
  }

  return config;
}
