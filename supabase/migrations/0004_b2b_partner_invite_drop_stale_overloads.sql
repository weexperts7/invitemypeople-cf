-- Fixes PostgREST error PGRST203 ("Could not choose the best candidate
-- function") on spend_partner_credit_for_invite(), surfaced as a 500
-- "could not create the invite" from POST /api/partners/invites.
--
-- Root cause: `create or replace function` only replaces a function whose
-- parameter list is IDENTICAL to the existing one. 0002_b2b_partner_invite_
-- richness.sql and 0003_b2b_partner_invite_client_contact.sql each added
-- new trailing parameters to spend_partner_credit_for_invite() instead of
-- keeping the same signature, so Postgres kept the prior version(s) around
-- as separate overloads of the same function name rather than replacing
-- them. PostgREST can't disambiguate overloads whose REQUIRED parameters
-- are identical and only their OPTIONAL (default-valued) parameters differ
-- — exactly this shape — so every call now fails with "Could not choose
-- the best candidate function" instead of reaching the current version.
--
-- Fix: explicitly drop the stale overloads by their exact original
-- signatures, leaving only the current 18-parameter version (uuid, slug,
-- template_id, couple_names, wedding_date, wedding_time, venue,
-- location_url, message, event_title, photos, events, bg_song_title,
-- bg_song_artist, bg_song_album_art, bg_song_preview_url, client_email,
-- client_phone) that 0003 already created. No CREATE here — that version
-- is already live; this migration only removes what shouldn't still exist
-- alongside it.

-- The original 9-parameter version from 0001_b2b_partner_portal.sql.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text
);

-- The 16-parameter version from 0002_b2b_partner_invite_richness.sql.
drop function if exists spend_partner_credit_for_invite(
  uuid, text, text, text, text, text, text, text, text, text, jsonb, jsonb, text, text, text, text
);
