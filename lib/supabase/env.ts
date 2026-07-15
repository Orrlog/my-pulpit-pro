type SupabasePublicConfig = {
  url: string;
  publishableKey: string;
};

type SupabaseConfigIssue =
  | "missing-url"
  | "invalid-url"
  | "missing-publishable-key"
  | "invalid-publishable-key";

function normalizeEnvValue(rawValue: string | undefined, variableName: string) {
  const raw = rawValue?.trim() ?? "";
  if (!raw) return "";

  const assignmentPrefix = `${variableName}=`;
  const matchingLine = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.startsWith(assignmentPrefix));

  let value = matchingLine ? matchingLine.slice(assignmentPrefix.length).trim() : raw;

  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    value = value.slice(1, -1).trim();
  }

  return value;
}

function parseHttpUrl(value: string) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:" ? parsed.toString() : null;
  } catch {
    return null;
  }
}

function readSupabasePublicConfig(): {
  config: SupabasePublicConfig | null;
  issue: SupabaseConfigIssue | null;
} {
  const url = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    "NEXT_PUBLIC_SUPABASE_URL",
  );
  const publishableKey = normalizeEnvValue(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  );

  if (!url) return { config: null, issue: "missing-url" };

  const validUrl = parseHttpUrl(url);
  if (!validUrl) return { config: null, issue: "invalid-url" };

  if (!publishableKey) return { config: null, issue: "missing-publishable-key" };
  if (!publishableKey.startsWith("sb_publishable_")) {
    return { config: null, issue: "invalid-publishable-key" };
  }

  return {
    config: { url: validUrl, publishableKey },
    issue: null,
  };
}

export function getSupabasePublicConfig(): SupabasePublicConfig | null {
  return readSupabasePublicConfig().config;
}

export function getSupabaseBrowserConfig() {
  const { config, issue } = readSupabasePublicConfig();

  if (config) return config;

  const messages: Record<SupabaseConfigIssue, string> = {
    "missing-url": "The Supabase Project URL is missing from this deployment.",
    "invalid-url": "The Supabase Project URL saved in Vercel is not a valid http or https URL.",
    "missing-publishable-key": "The Supabase publishable key is missing from this deployment.",
    "invalid-publishable-key": "The Supabase publishable key saved in Vercel does not begin with sb_publishable_.",
  };

  throw new Error(messages[issue ?? "missing-url"]);
}
