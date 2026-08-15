-- Consumer: the `invites` table + its Storage bucket.
--
-- THIS TABLE ALREADY EXISTS IN PRODUCTION but was never checked in as a
-- migration file — it was only ever documented as copy-pasteable SQL in
-- INVITES-SETUP.md ("One-time setup") and its later "Add the ... column"
-- addenda (photos, event_title/events, host_*, bg_song_*, groom_*/bride_*),
-- run by hand against production's Supabase SQL Editor over several
-- sessions. This file captures that same final column set as a proper,
-- trackable migration, for the first time, so a fresh project (like a new
-- DEV Supabase project) can be bootstrapped with one `supabase db push`
-- instead of hand-copying SQL out of markdown docs.
--
-- Safe to run against the existing production project too — every
-- statement is idempotent (`if not exists`), so it's a no-op there.
--
-- Powers: the Invitation Builder (`/create`) and the live `/i/:slug` pages
-- it generates — see api/invites/index.js (POST), api/invites/[slug].js
-- (GET), api/photos.js (photo uploads). `rsvps`/`invites_due_for_reminder()`
-- (which reference this table) are in 0007_consumer_rsvps_and_reminders.sql.
--
-- Access model, matching the B2B tables in 0001-0005: RLS on, no policies.
-- Only the service_role key (server-side, api/_lib/supabase.js) bypasses
-- RLS — the public/anon key this project never uses gets zero access either way.

create table if not exists public.invites (
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

  -- Invitation Builder photo uploads (api/photos.js) — public URLs only,
  -- the actual files live in the invite-photos Storage bucket below.
  photos text[] default '{}',

  -- Multiple event/function support (CreateInvitePage.jsx "Additional Events").
  event_title text,
  events jsonb default '[]'::jsonb,

  -- Host contact capture, private Host Dashboard, 4-hour reminder email
  -- (see 0007_consumer_rsvps_and_reminders.sql). host_token is the *only*
  -- access control for /i/:slug/host/:hostToken — there's no login system
  -- anywhere in this app.
  host_name text,
  host_email text,
  host_token text unique,
  reminder_sent_at timestamptz,

  -- Background Music Selection (MUSIC-SETUP.md) — a host's Spotify pick,
  -- played on /i/:slug when the envelope opens.
  bg_song_title text,
  bg_song_artist text,
  bg_song_album_art text,
  bg_song_preview_url text,

  -- "Family Details" (CreateInvitePage.jsx) — optional groom's/bride's
  -- name + parents, rendered as cards under the couple's names on
  -- WelcomeSplash.jsx (couple.people).
  groom_name text,
  groom_parents text,
  bride_name text,
  bride_parents text,

  created_at timestamptz not null default now()
);

-- Locked down by default: RLS on, no policies. Only the service_role key
-- (server-side only, used by the Serverless Functions) bypasses RLS.
alter table public.invites enable row level security;

-- ---------------------------------------------------------------------------
-- Storage: invite-photos bucket.
-- Source: INVITES-SETUP.md ("1b. Create the invite-photos Storage bucket").
-- Public read (so /i/:slug, viewed by anyone, can load images directly);
-- only the service-role key can write (api/photos.js) — same trust model
-- as the table above.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('invite-photos', 'invite-photos', true)
on conflict (id) do nothing;
