declare module "@supabase/ssr" {
  type Cookie = { name: string; value: string; options?: Record<string, unknown> };
  type AuthResult = Promise<{ error: { message: string } | null }>;
  type SupabaseClient = {
    auth: {
      signInWithPassword(credentials: { email: string; password: string }): AuthResult;
      signUp(credentials: { email: string; password: string; options?: { emailRedirectTo?: string } }): AuthResult;
      resetPasswordForEmail(email: string, options?: { redirectTo?: string }): AuthResult;
      updateUser(attributes: { password: string }): AuthResult;
      signOut(): AuthResult;
      getSession(): Promise<{ data: { session: unknown | null }; error: { message: string } | null }>;
      getUser(): Promise<{ data: { user: unknown | null }; error: { message: string } | null }>;
      exchangeCodeForSession(code: string): AuthResult;
    };
  };
  export function createBrowserClient(supabaseUrl: string, supabaseKey: string): SupabaseClient;
  export function createServerClient(supabaseUrl: string, supabaseKey: string, options: { cookies: { getAll(): { name: string; value: string }[]; setAll(cookies: Cookie[]): void } }): SupabaseClient;
}
