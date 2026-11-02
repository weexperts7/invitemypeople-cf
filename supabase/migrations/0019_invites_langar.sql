-- invites.langar — a Satsang invite's Langar Prasad details from the builder:
-- { served, time, note }. Null on every other invite, and on Satsang invites
-- saved before this, which keep taking their langar time from the programme.
--
-- Run this against the same Supabase project 0001-0018 already ran against.
-- Safe to re-run: the statement is a no-op if already applied.

alter table public.invites add column if not exists langar jsonb;
