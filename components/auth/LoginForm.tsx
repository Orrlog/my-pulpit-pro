"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/browser";
import { PasswordField } from "./PasswordField";

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard"; }

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState(searchParams.get("message") ?? "");
  const [loading, setLoading] = useState(false);
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (loading) return; setLoading(true); setError("");
    const form = new FormData(event.currentTarget);
    const { error: authError } = await createClient().auth.signInWithPassword({ email: String(form.get("email") ?? ""), password: String(form.get("password") ?? "") });
    if (authError) { setError(authError.message || "We could not log you in. Please check your email and password."); setLoading(false); return; }
    router.replace(safeNext(searchParams.get("next"))); router.refresh();
  }
  return <form onSubmit={onSubmit} className="grid gap-5">
    {error ? <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-800">{error}</p> : null}
    <div><label htmlFor="email" className="text-sm font-bold text-ink">Email</label><input id="email" name="email" type="email" autoComplete="email" required className="mt-2 min-h-12 w-full rounded-2xl border border-line bg-background px-4 outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold" /></div>
    <PasswordField id="password" name="password" label="Password" />
    <button disabled={loading} className="min-h-12 rounded-full bg-teal px-6 py-3 text-sm font-bold text-cream-strong transition hover:bg-teal-dark disabled:cursor-not-allowed disabled:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold">{loading ? "Logging in..." : "Log In"}</button>
    <div className="flex flex-col gap-2 text-sm font-bold text-teal sm:flex-row sm:justify-between"><Link href="/signup">Create Account</Link><Link href="/forgot-password">Forgot Password?</Link></div>
  </form>;
}
