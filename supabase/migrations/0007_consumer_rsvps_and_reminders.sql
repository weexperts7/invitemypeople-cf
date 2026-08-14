-- Consumer: the `rsvps` table + the 4-hour reminder-window function.
--
-- THIS TABLE/FUNCTION ALREADY EXIST IN PRODUCTION but, like `invites`
-- (see 0006_consumer_invites.sql), were never checked in as a migration
-- file — only documented as copy-pasteable SQL in
-- RSVPS-AND-REMINDERS-SETUP.md ("2. Create the rsvps table", "3. Create
-- the reminder-window function"). This file captures that same state as a
-- proper, trackable migration. Safe to run against production too —
-- `create table if not exists` / `create or replace function` are both
-- no-ops there.
--
-- Requires 0006_consumer_invites.sql to have run first (rsvps.invite_id
-- references invites.id).
--
-- Powers: guest RSVPs on `/i/:slug` (api/rsvps/index.js), the private Host
-- Dashboard (`/i/:slug/host/:hostToken`, api/invites/[slug]/host.js), the
-- Wishes Wall (api/wishes.js — reads guest_name/message/created_at from
-- this same table where message <> '', there is no separate "wishes"
-- table), and the send-event-reminders Edge Function (deployed/scheduled
-- separately — see RSVPS-AND-REMINDERS-SETUP.md's "4. Deploy the Edge
-- Function" / "5. Schedule it with pg_cron"; that step needs this
-- project's own project-ref and service-role key, so it's a manual,
-- per-project step rather than something this migration can do for you).

create table if not exists public.rsvps (
  id bigint generated always as identity primary key,
  -- invites.id is bigint, not uuid — matching that type here (rather than a
  -- uuid) is a compatibility necessity: a uuid FK can't reference a bigint PK.
  invite_id bigint not null references public.invites (id) on delete cascade,
  guest_name text not null,
  guest_email text,
  attendance text not null,       -- 'joyfully' | 'regretfully' (RsvpForm.jsx's own copy, stored verbatim)
  guest_count integer not null default 0,
  song text,
  advice text,
  message text,
  created_at timestamptz not null default now()
);

create index if not exists rsvps_invite_id_idx on public.rsvps (invite_id);

alter table public.rsvps enable row level security;
-- No policies, same trust model as `invites` — only the service_role key
-- (Vercel Serverless Functions + the reminder Edge Function) can touch it.

-- ---------------------------------------------------------------------------
-- invites_due_for_reminder — every invite whose primary event starts within
-- the next 4 hours, has a host_email, is paid, and hasn't had its reminder
-- sent yet. Called by the send-event-reminders Edge Function.
--
-- Design notes (see RSVPS-AND-REMINDERS-SETUP.md for the full writeup):
--  - Invites with no `time` set are permanently skipped.
--  - The window is intentionally wide; the Edge Function *claims* each
--    invite (reminder_sent_at = now() where ... is null) before sending —
--    that's what guarantees no double-send, not the window's tightness.
--  - v1 only covers the invite's primary event (date/time columns), not
--    each entry in the `events` jsonb array (Haldi/Sangeet/etc).
-- ---------------------------------------------------------------------------
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
