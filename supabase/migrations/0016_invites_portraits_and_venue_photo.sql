-- Consumer `invites`: adds `groom_photo`/`bride_photo` — the public URL of
-- each person's portrait, uploaded through CreateInvitePage.jsx's "Family
-- Details" section on templates that show one (see `hasPortraits` in
-- src/data/builderTemplates.js) — and `venue_photo`, the main event's venue
-- picture (`hasVenuePhotos`; additional events keep theirs inside the existing
-- `events` jsonb). The files themselves live in the same invite-photos Storage
-- bucket as the gallery's.
--
-- Nullable, no default — optional, same as groom_name/bride_name.
--
-- Safe to run against production: `add column if not exists` is a no-op if
-- already applied.

alter table public.invites
  add column if not exists groom_photo text,
  add column if not exists bride_photo text,
  add column if not exists venue_photo text;
