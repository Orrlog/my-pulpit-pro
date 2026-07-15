import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function safeNext(value: string | null) { return value?.startsWith("/") && !value.startsWith("//") ? value : "/dashboard"; }

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error_description") ?? requestUrl.searchParams.get("error");
  if (error) return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(error)}`, requestUrl.origin));
  if (!code) return NextResponse.redirect(new URL("/login?message=Authentication link is missing a valid code.", requestUrl.origin));
  const supabase = await createClient();
  const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError) return NextResponse.redirect(new URL(`/login?message=${encodeURIComponent(exchangeError.message)}`, requestUrl.origin));
  return NextResponse.redirect(new URL(safeNext(requestUrl.searchParams.get("next")), requestUrl.origin));
}
