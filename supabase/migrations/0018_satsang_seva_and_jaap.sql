-- Guruji Satsang: adds what the Shukrana Darshan template needs that a wedding
-- invite doesn't.
--
-- rsvps.seva — the seva a guest offered (comma-separated labels), shown to
-- the host on their dashboard. Nullable: every other template's RSVPs simply
-- never set it.
--
-- satsang_jaap — one running total per invite, the shared count behind the
-- Sangat Jaap mala. add_satsang_jaap() adds to it atomically, so two guests
-- finishing a round at the same moment can't overwrite each other.
--
-- invites.private_note — the host's "please do not forward" note on an
-- invite-only satsang. Null on every other invite, which keeps its share
-- buttons.
--
-- Run this against the same Supabase project 0001-0017 already ran against.
-- Safe to re-run: every statement is a no-op if already applied.

alter table public.rsvps add column if not exists seva text;

alter table public.invites add column if not exists private_note text;

create table if not exists public.satsang_jaap (
  invite_id bigint primary key references public.invites (id) on delete cascade,
  count bigint not null default 0,
  updated_at timestamptz not null default now()
);

-- Service-role only, same trust model as `invites`/`rsvps`: the browser only
-- ever reaches this through /api/jaap.
alter table public.satsang_jaap enable row level security;

create or replace function add_satsang_jaap(p_invite_id bigint, p_count integer)
returns bigint
language sql
as $$
  insert into public.satsang_jaap (invite_id, count)
  values (p_invite_id, p_count)
  on conflict (invite_id) do update
    set count = public.satsang_jaap.count + excluded.count,
        updated_at = now()
  returning count;
$$;
