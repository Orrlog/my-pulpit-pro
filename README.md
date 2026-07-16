# My Pulpit Pro

My Pulpit Pro is a text-first sermon preparation and sermon-shaping web app for pastors, preachers, youth ministers, Bible study leaders, bivocational pastors, and small-church ministry leaders.

This repository currently contains the public landing page plus Phase 2 preview routes for the
internal application shell and new-message flow.

## Phase 1 Scope

- Next.js App Router
- TypeScript
- Tailwind CSS
- Component-based public landing page
- Responsive desktop, tablet, and mobile layouts
- Accessible semantic HTML and visible focus states
- Signup placeholder route at `/signup`
- ESLint and production build scripts

The current build includes the database-backed message-project foundation and the first server-side AI-generation slice for Develop My Message. It does not include Stripe, paid billing, Bible API integrations, or AI generation for Explore Message Ideas or Speak to This Week.

## Local Development

Install dependencies:

```bash
npm install
```

Run the local preview:

```bash
npm run dev
```

Run lint:

```bash
npm run lint
```

Run focused message-generation checks:

```bash
npm run test:message-generation
```

Run the production build:

```bash
npm run build
```

## Routes

- `/` - public landing page
- `/signup` - styled placeholder for the future account creation flow
- `/dashboard` - internal app dashboard preview
- `/new-message` - guided new-message wizard preview
- `/projects` - sample saved-message library preview
- `/settings` - sample settings and plan preview

Useful preview URLs:

- `http://localhost:3000/`
- `http://localhost:3000/signup`
- `http://localhost:3000/dashboard`
- `http://localhost:3000/new-message`
- `http://localhost:3000/new-message?path=develop`
- `http://localhost:3000/new-message?path=week`
- `http://localhost:3000/projects`
- `http://localhost:3000/settings`

## Product Boundary

My Pulpit Pro is built to support sermon preparation, not replace the pastor. The pastor remains responsible for Scripture study, prayer, theological judgment, pastoral conviction, calling, personality, and voice.

## Server-side AI setup

Develop My Message can use the OpenAI Responses API from a server-only route. Add these variables to local and Vercel Preview environments; do not prefix them with `NEXT_PUBLIC_` and do not commit real secrets.

```bash
OPENAI_API_KEY=
OPENAI_MODEL=gpt-5.6-terra
```

`OPENAI_MODEL` is optional at runtime and defaults to `gpt-5.6-terra` when omitted. If OpenAI is unavailable, the app creates a valid draft with the reliable curated starter generator.
