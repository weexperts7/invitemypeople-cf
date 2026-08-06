# RSVPs, the Host Dashboard, and 4-hour reminder emails

This is the one-time Supabase + Brevo setup for three things that ship
together:

1. RSVPs are stored in a new `rsvps` Supabase table (foreign-keyed to
   `invites`) instead of the old Google Apps Script / `VITE_RSVP_ENDPOINT`
   integration, which is fully retired.
2. Every paid invite gets a private **Host Dashboard**
   (`/i/:slug/host/:hostToken`) — a live guest list + CSV export, shown once
   right after checkout on `/create`. There's no login system in this app;
   the `hostToken` in that URL *is* the access control, so it can't be
   recovered if lost (there's no "resend my link" flow).
3. A Supabase-scheduled job emails the host a guest-list summary ~4 hours
   before their event.

Do all of this **before** merging/deploying this branch — invites created
before this setup simply won't have host contact info or a dashboard link
(the new `invites` columns are nullable, see `INVITES-SETUP.md`).

## 1. Add the new `invites` columns

See `INVITES-SETUP.md`'s "One-time setup" section — it now includes the
`host_name`/`host_email`/`host_token`/`reminder_sent_at` `alter table`
statements. Run those first if you haven't already.

## 2. Create the `rsvps` table

Supabase → **SQL Editor** → run:

```sql
create table public.rsvps (
  id bigint generated always as identity primary key,
  -- invites.id is bigint, not uuid — matching that type here (rather than a
  -- uuid) is a compatibility necessity: a uuid FK can't reference a bigint
  -- PK, and changing invites' PK type now would break every existing row.
  invite_id bigint not null references public.invites(id) on delete cascade,
  guest_name text not null,
  guest_email text,
  attendance text not null,       -- 'joyfully' | 'regretfully' (RsvpForm.jsx's own copy, stored verbatim)
  guest_count integer not null default 0,
  song text,
  advice text,
  message text,
  created_at timestamptz not null default now()
);

create index rsvps_invite_id_idx on public.rsvps(invite_id);

alter table public.rsvps enable row level security;
-- No policies, same trust model as `invites` — only the service_role key
-- (Vercel Serverless Functions + the Edge Function below) can touch it.
```

## 3. Create the reminder-window function

Same SQL Editor:

```sql
create or replace function public.invites_due_for_reminder()
returns setof public.invites
language sql
stable
as $$
  select *
  from public.invites
  where time is not null and time <> ''
    and host_email is not null and host_email <> ''
    and payment_status = 'paid'
    and reminder_sent_at is null
    and ((date || ' ' || time)::timestamp at time zone 'Asia/Kolkata')
        <= now() + interval '4 hours'
    and ((date || ' ' || time)::timestamp at time zone 'Asia/Kolkata') > now()
  order by (date || ' ' || time)::timestamp asc;
$$;

revoke execute on function public.invites_due_for_reminder() from anon, authenticated;
```

**Design notes:**
- Invites with no `time` set are **permanently skipped** — "4 hours before"
  is meaningless without one.
- The window is intentionally wide (any time between 0h and 4h before the
  event). Exact precision doesn't matter because the Edge Function *claims*
  each invite (`update ... set reminder_sent_at = now() where id = X and
  reminder_sent_at is null`) before sending — that's what actually
  guarantees no double-send, not the window's tightness.
- v1 only covers the invite's **primary** event (`date`/`time` columns), not
  each entry in the `events` jsonb array (Haldi/Sangeet/etc). A stated
  limitation, not a bug.
- If a reminder send fails (e.g. Brevo is down), that host is **not**
  automatically retried — the row is already claimed. Reset it manually if
  needed: `update invites set reminder_sent_at = null where slug = '...';`

## 4. Deploy the Edge Function

Requires the [Supabase CLI](https://supabase.com/docs/guides/cli).

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase functions deploy send-event-reminders
supabase secrets set BREVO_API_KEY=xkeysib-XXXXXXXXXXXX
# Optional — defaults to a placeholder sender. Brevo requires the sender
# address (or its domain) to be verified in the Brevo dashboard before it
# will deliver broadly; unlike Resend, there's no always-works sandbox
# address, so an unverified sender can fail/bounce silently. Verify a
# sending domain first, then set this:
supabase secrets set EMAIL_FROM="InviteMyPeople <reminders@yourdomain.com>"
```

`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` are provided automatically inside
every Edge Function — no need to set those as secrets yourself.

## 5. Schedule it with `pg_cron`

Supabase SQL Editor:

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'send-event-reminders-every-10-min',
  '*/10 * * * *',
  $$
  select net.http_post(
    url := 'https://<PROJECT_REF>.supabase.co/functions/v1/send-event-reminders',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer <SERVICE_ROLE_KEY>'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Replace `<PROJECT_REF>` and `<SERVICE_ROLE_KEY>` with your project's values
(Supabase → Project Settings → API).

**Hardening note:** the SQL above pastes the service-role key in plaintext,
which then lives in the SQL Editor's history. For anything beyond a quick
v1, use [Supabase Vault](https://supabase.com/docs/guides/database/vault)
instead:

```sql
select vault.create_secret('<SERVICE_ROLE_KEY>', 'edge_fn_service_role');
-- then reference it in the cron body instead of the literal key:
-- headers := jsonb_build_object('Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'edge_fn_service_role'))
```

## Where env vars/secrets live — three different places

This feature is the first in this repo to span more than one place to
configure secrets — and `BREVO_API_KEY`/`EMAIL_FROM` specifically are the
first variable *names* that need setting in two independent stores at once
(one copy for order-confirmation emails, a separate copy for reminder
emails — they don't share config):

| Variable | Where it's set | Used by |
| --- | --- | --- |
| `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` | Vercel → Project Settings → Environment Variables | `api/*.js` Serverless Functions |
| `BREVO_API_KEY`, `EMAIL_FROM` | Local `.env` (dev) + Vercel → Project Settings → Environment Variables (prod) | The order-confirmation email, sent from `POST /api/invites` (`api/invites/index.js` and `server/index.js`) — see `src/utils/email.js` |
| `BREVO_API_KEY`, `EMAIL_FROM` (again, separately) | `supabase secrets set ...` (Supabase CLI) | The `send-event-reminders` Edge Function only |

## Verifying it worked

**RSVPs + Host Dashboard:**
1. `/create` → fill in the form, **including your name and email** → pay in
   Test Mode.
2. You land on a success panel with two links: the shareable `/i/:slug` link
   and your private `/i/:slug/host/:hostToken` dashboard link. **Save the
   dashboard link now** — it's shown only this once.
3. Open the invite link, submit an RSVP.
4. Open the dashboard link — the RSVP should appear within ~12 seconds
   (it polls, not push-realtime). Try "Download CSV".

**Order-confirmation email**, with `BREVO_API_KEY`/`EMAIL_FROM` set in
`.env` (or the Vercel dashboard, for a deployed test):
1. Repeat the RSVP flow above, using an inbox you can check as the host
   email.
2. Confirm the confirmation email arrives within a few seconds of payment,
   with working `/i/:slug` and `/i/:slug/host/:hostToken` links matching
   what the success panel showed.
3. Temporarily unset `BREVO_API_KEY`, restart, repeat step 1 — confirm
   invite creation still succeeds (a 200 response, the invite is saved) and
   only a `[email] BREVO_API_KEY / EMAIL_FROM not set` warning appears in
   the server logs. This is the important part: email is never allowed to
   block or fail invite creation.

**Reminder email**, before relying on it for a real event:
1. `supabase functions serve send-event-reminders` locally with
   `BREVO_API_KEY` (and `EMAIL_FROM`) set.
2. In Supabase Table Editor, set an existing invite's `date`/`time` to
   ~3h55m from now, `payment_status = 'paid'`, `reminder_sent_at = null`.
3. `curl -X POST http://localhost:54321/functions/v1/send-event-reminders`
   — confirm the email arrives and `reminder_sent_at` is now set.
4. Run the same `curl` again — confirm **no** second email (idempotency).

**After a real deploy**, check:
- `select * from cron.job_run_details order by start_time desc limit 20;` in the SQL Editor
- Supabase Dashboard → Edge Functions → Logs
- The Brevo dashboard's Transactional → Logs
- Vercel function logs for `/api/rsvps`, `/api/wishes`, `/api/invites/*`
