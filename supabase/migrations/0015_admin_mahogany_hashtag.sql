-- Admin-only: lets a Super Admin set a real wedding hashtag for a Mahogany
-- Seal invite minted from the Admin Panel (see
-- src/pages/admin/AdminCreateInvitePage.jsx's "Wedding Hashtag" field,
-- api/_lib/adminCreateInvite.js) — mirrors MahoganySealCreatePage.jsx's own
-- "Wedding Hashtag" field for the WhatsApp-lead flow. Left null,
-- MahoganySealAdapter.jsx falls back to the template's own curated demo
-- hashtag, same as its caricature video/photo.
--
-- Same additive-only shape as 0014_admin_mahogany_caricature_video.sql:
-- one nullable `text` column on each table, no existing column/constraint/
-- index/RLS policy touched, so every existing row and every non-Mahogany
-- invite is completely unaffected.
--
-- Run this against the same Supabase project 0001-0014 already ran
-- against (Supabase Dashboard -> SQL Editor).

alter table public.invites add column if not exists hashtag text;
alter table public.partner_invites add column if not exists hashtag text;
