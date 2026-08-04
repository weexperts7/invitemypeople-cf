# Where Invitation Builder saves go

`/create` (the Invitation Builder) and the live `/i/:slug` pages it generates
are powered by two Vercel Serverless Functions:

```
api/invites/index.js      POST /api/invites        — save a new invite
api/invites/[slug].js     GET  /api/invites/:slug   — load one back
```

They persist to a Supabase Postgres table (Vercel's own filesystem is
read-only/ephemeral, so the flat-JSON-file approach `server/index.js` uses
for local dev can't work there — see the comment at the top of that file).

This mirrors how RSVPs already have two paths: a local one for `npm run dev`,
and a hosted one for production (see `RSVP-SETUP.md`). Local dev is
unaffected by any of this — `npm run dev` still uses `server/index.js`'s
flat-JSON-file `/api/invites` routes, not Supabase.

## One-time setup (do this before merging/deploying)

### 1. Create the `invites` table

In a Supabase project (new or existing) → **SQL Editor** → run:

```sql
create table public.invites (
  id bigint generated always as identity primary key,
  slug text not null unique,
  occasion text,
  template_id text,
  template_name text,
  names text not null,
  date text not null,
  time text,
  venue text not null,
  location_url text,
  message text,
  amount integer not null default 0,
  payment_id text,
  payment_status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Locked down by default: RLS on, no policies. Only the service_role key
-- (server-side only, used by the Serverless Functions) bypasses RLS — the
-- public/anon key this project never uses gets zero access either way.
alter table public.invites enable row level security;
```

### 2. Add two environment variables in Vercel

**Project → Settings → Environment Variables** (Production — and Preview, if
you want branch deploys to save real invites too):

| Name | Value | Where to find it |
| --- | --- | --- |
| `SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase → Project Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJ...` (long token) | Supabase → Project Settings → API → `service_role` secret |

**Do not** prefix these with `VITE_` — that would bundle the service-role key
(full read/write access, bypasses every RLS policy) into the public
JavaScript. They're read only by the Serverless Functions
(`api/_lib/supabase.js`), which run server-side.

### 3. Redeploy

Env var changes only take effect on the *next* deploy — push a commit, or
use Vercel's "Redeploy" button, after adding them.

## Verifying it worked

1. Visit `/create`, pick a template, fill it in, pay in Test Mode.
2. You should land on `/i/<your-slug>` with the invite rendered.
3. In Supabase → Table Editor → `invites`, you should see the new row.

If you see *"Your payment went through, but we couldn't save your
invitation just now"* — the env vars are either missing or wrong; check the
function's logs in Vercel → Deployments → (latest) → Functions.
