"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  async function logout() {
    if (loading) return;
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }
  return (
    <button type="button" onClick={logout} disabled={loading} className="flex min-h-11 w-full items-center gap-3 rounded-2xl px-3 py-2 text-left text-sm font-bold text-ink transition hover:bg-cream disabled:cursor-not-allowed disabled:opacity-70 focus-visible:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold">
      <span className="grid size-8 shrink-0 place-items-center rounded-xl bg-teal/10 text-xs font-bold text-teal">L</span>
      <span>{loading ? "Logging out..." : "Log Out"}</span>
    </button>
  );
}
