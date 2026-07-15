import { createClient } from "@/lib/supabase/server";

export type ProfileRole = "member" | "admin" | "owner";

export type CurrentProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  role: ProfileRole;
};

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: ProfileRole | null;
};

function normalizeRole(role: string | null | undefined): ProfileRole {
  return role === "admin" || role === "owner" ? role : "member";
}

export async function getCurrentProfile(): Promise<CurrentProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("id,email,full_name,role")
    .eq("id", user.id)
    .single();
  const profile = data as ProfileRow | null;

  return {
    id: user.id,
    email: profile?.email ?? user.email ?? null,
    fullName: profile?.full_name ?? null,
    role: normalizeRole(profile?.role),
  };
}
