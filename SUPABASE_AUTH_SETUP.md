# Supabase Authentication Setup

This branch adds the code foundation for Supabase email/password authentication. The values below must be configured in the Supabase dashboard after the code is deployed through the normal GitHub/Vercel branch flow.

## Environment variables

Vercel already has these public browser-safe variables configured for Production, Preview, and Development:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

When editing these values in Vercel, paste only the raw value into the value field:

- For `NEXT_PUBLIC_SUPABASE_URL`, paste only the raw Supabase Project URL, such as `https://example-project-ref.supabase.co`.
- For `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, paste only the raw publishable key string.

Do not paste the environment-variable name, an equals sign, quotation marks, backticks, surrounding code block fences, or a full `.env` line into the Vercel value field. For example, do not paste `NEXT_PUBLIC_SUPABASE_URL=https://...`; paste only `https://...`.

Never expose or commit private Supabase secrets. Do not add a service-role key to the frontend, Vercel public variables, or this repository.

## Supabase dashboard settings

In Supabase, open **Authentication > URL Configuration**.

### Site URL

Set the Site URL to the production app origin, for example:

- `https://your-production-domain.example`

Use the real production domain assigned to My Pulpit Pro. Do not include a path.

### Redirect URLs

Add the production authentication redirects:

- `https://your-production-domain.example/auth/callback`
- `https://your-production-domain.example/reset-password`

For local development, add:

- `http://localhost:3000/auth/callback`
- `http://localhost:3000/reset-password`

For Vercel Preview deployments, add redirect URL patterns that match the preview deployment domains used by the repository, such as:

- `https://my-pulpit-pro-*.vercel.app/auth/callback`
- `https://my-pulpit-pro-*.vercel.app/reset-password`

If the Supabase project does not accept wildcard preview URLs for your plan or configuration, add the exact Vercel preview URL shown for the branch deployment before testing auth emails from that preview.

## Email confirmation behavior

Keep email confirmation enabled unless the team intentionally changes the account policy. The signup page tells users to check email and does not claim an account is active before confirmation.

The confirmation email should return users to:

- `/auth/callback`

That callback exchanges the Supabase code for a session and sends the user to `/dashboard`.

## Password reset behavior

Password reset emails should redirect users to:

- `/reset-password`

The reset page uses the Supabase recovery session from the email link to update the password, then sends the user back to `/login`.

## Deployment note

Do not manually redeploy through Vercel for this setup. GitHub branch deployments will pick up the existing Vercel environment variables for Production, Preview, and Development.

After changing a Vercel environment-variable value, create a new GitHub branch deployment so the updated value is included in the new Preview build.

## Profile table and owner role setup

After applying the profile migration, Supabase will automatically create a `public.profiles` row for each new Auth user and backfill profile rows for Auth users who already existed before the migration.

To promote the existing founder account to owner, use the Supabase SQL Editor after applying the migration. Replace the placeholder email below with the founder account email before running it:

```sql
update public.profiles
set role = 'owner'
where email = 'founder@example.com';
```

Only run this in the Supabase dashboard with an authorized project administrator. Do not commit private email addresses, user UUIDs, passwords, API keys, service-role keys, or other secrets to the repository.

After the founder account is promoted to `owner`, role changes should be made intentionally and sparingly. Ordinary members can update their own profile name, but they cannot assign themselves elevated roles.
