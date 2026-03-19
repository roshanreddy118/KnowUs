# Bonded

Bonded is a Vercel-ready relationship game where friends, couples, families,
or mixed groups join a private room, answer rotating questions, and reveal how
well they know each other.

## Stack

- Next.js App Router
- Tailwind CSS v4
- Supabase for room and player storage
- Vercel for deployment

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Add environment variables to `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

3. In Supabase SQL Editor, run [supabase/schema.sql](/Users/roshan/Documents/New_project_22/supabase/schema.sql).

4. Start the app:

```bash
npm run dev
```

5. Open `http://localhost:3000` in two browsers and test the create/join flow.

## Current MVP

- Create a room with relationship type and group size
- Join the room from another browser using the room code
- Persist rooms and players in Supabase
- Show a waiting room and rotating question preview
- Explain the scoring model for the final bond percentage

## Important security note

Use `SUPABASE_SERVICE_ROLE_KEY` only on the server. Do not expose it in client
components or public repos. If this key was previously shared in an unsafe
place, rotate it in Supabase before production launch.
