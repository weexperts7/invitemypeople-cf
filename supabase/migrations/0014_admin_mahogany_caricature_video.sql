-- Admin-only: lets a Super Admin attach a real caricature video to a
-- Mahogany Seal invite minted from the Admin Panel (see
-- src/pages/admin/AdminCreateInvitePage.jsx, api/_lib/adminCreateInvite.js)
-- — that template's own bespoke intro is otherwise always the curated demo
-- clip (mockData.ts), since no invite-creation form collects one. Left
-- null, MahoganySealAdapter.jsx still falls back to that same default
-- video, exactly as it always has — see this migration's own comment on
-- why both columns are nullable.
--
-- Safe, additive-only, matches every prior migration's own conventions:
-- - NOT NULL is never added to `invites`/`partner_invites` — both new
--   columns are plain nullable `text`, so every existing row (and every
--   future insert that doesn't set them, i.e. every B2C/B2B template that
--   isn't Mahogany Seal) is completely unaffected.
-- - No existing column, constraint, index, or RLS policy on either table
--   is touched.
-- - A brand-new, isolated Storage bucket (mahogany-seal-videos) — never
--   the existing invite-photos/partner-invite-photos buckets those tables'
--   photo uploads already use.
--
-- Run this against the same Supabase project 0001-0013 already ran
-- against (Supabase Dashboard -> SQL Editor).

alter table public.invites add column if not exists caricature_video_url text;
alter table public.partner_invites add column if not exists caricature_video_url text;

-- ---------------------------------------------------------------------------
-- Storage: mahogany-seal-videos bucket.
-- Public read (so a live /i/:slug or /p/:slug page, viewed by anyone, can
-- play the video directly); only the service-role key can write (the new
-- admin-only upload endpoint) — same trust model as invite-photos in
-- 0006_consumer_invites.sql.
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('mahogany-seal-videos', 'mahogany-seal-videos', true, 31457280, array['video/mp4', 'video/webm', 'video/quicktime'])
on conflict (id) do nothing;
