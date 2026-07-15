import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const publicRoutes = new Set(["/login", "/signup", "/forgot-password", "/reset-password", "/auth/callback"]);
const protectedPrefixes = ["/dashboard", "/new-message", "/projects", "/message-workspace", "/settings"];

function hasProtectedPrefix(pathname: string) {
  return protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));
}

function isSafeRelativePath(path: string | null) {
  return Boolean(path && path.startsWith("/") && !path.startsWith("//") && !path.startsWith("/auth/callback"));
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const { pathname, search } = request.nextUrl;

  if (!user && hasProtectedPrefix(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    const nextPath = `${pathname}${search}`;
    if (isSafeRelativePath(nextPath)) {
      loginUrl.searchParams.set("next", nextPath);
    }
    return NextResponse.redirect(loginUrl);
  }

  if (user && publicRoutes.has(pathname)) {
    const next = request.nextUrl.searchParams.get("next");
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = isSafeRelativePath(next) ? next! : "/dashboard";
    redirectUrl.search = "";
    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
