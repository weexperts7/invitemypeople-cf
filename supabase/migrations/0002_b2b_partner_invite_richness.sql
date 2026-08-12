-- B2B Partner Portal — brings a partner-created client invite up to the
-- same richness a consumer's own Invitation Builder submission has (photos,
-- additional events, background music, an optional Function Name), so
-- /p/:slug can render through the exact same InvitationExperience component
-- tree /i/:slug does instead of the old bare themed card. See
-- PartnerCreateInvitePage.jsx / PartnerInviteViewerPage.jsx.
--
-- Run this against the same Supabase project 0001_b2b_partner_portal.sql
-- already ran against (Supabase Dashboard → SQL Editor → paste and run, or
-- `supabase db push`).
--
-- Purely additive: new nullable/defaulted columns on the existing
-- `partner_invites` table only — no ALTER on `invites`/`rsvps`, no
-- consumer table touched. Still isolated, per 0001's file header.

alter table partner_invites
  add column if not exists event_title text,
  add column if not exists photos jsonb not null default '[]'::jsonb,
  add column if not exists events jsonb not null default '[]'::jsonb,
  add column if not exists bg_song_title text,
  add column if not exists bg_song_artist text,
  add column if not exists bg_song_album_art text,
  add column if not exists bg_song_preview_url text;

-- Note on `template_id`: going forward this stores a builder template id
-- from src/data/builderTemplates.js (e.g. "wedding-rajasthani-royal") —
-- what TemplateStyleSelector/getBuilderTemplateById/
-- buildWeddingExperienceTemplate all key off — rather than the old raw
-- src/data/templatesData.js id. No column change needed, just a change in
-- what the application writes into it; see PartnerCreateInvitePage.jsx.

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0001_b2b_partner_portal.sql with one that also accepts and stores the new
-- columns above. Same atomicity/locking behavior as before (see that
-- file's comment) — only the parameter list and the final insert grew.
-- ---------------------------------------------------------------------------
create or replace function spend_partner_credit_for_invite(
  p_partner_id uuid,
  p_slug text,
  p_template_id text,
  p_couple_names text,
  p_wedding_date text,
  p_wedding_time text,
  p_venue text,
  p_location_url text,
  p_message text,
  p_event_title text default null,
  p_photos jsonb default '[]'::jsonb,
  p_events jsonb default '[]'::jsonb,
  p_bg_song_title text default null,
  p_bg_song_artist text default null,
  p_bg_song_album_art text default null,
  p_bg_song_preview_url text default null
)
returns partner_invites
language plpgsql
as $$
declare
  v_status text;
  v_balance integer;
  v_tx partner_credit_transactions;
  v_invite partner_invites;
begin
  select status, credits_remaining into v_status, v_balance
    from partners where id = p_partner_id for update;

  if v_status is null then
    raise exception 'partner % not found', p_partner_id;
  end if;
  if v_status <> 'active' then
    raise exception 'partner % is not active', p_partner_id;
  end if;
  if v_balance < 1 then
    raise exception 'insufficient credits for partner %', p_partner_id;
  end if;

  v_balance := v_balance - 1;
  update partners set credits_remaining = v_balance where id = p_partner_id;

  insert into partner_credit_transactions (
    partner_id, type, credits, balance_after, invite_slug, note
  ) values (
    p_partner_id, 'consumption', -1, v_balance, p_slug,
    'Spent 1 credit creating an invite for ' || p_couple_names
  )
  returning * into v_tx;

  insert into partner_invites (
    partner_id, slug, template_id, couple_names, wedding_date, wedding_time,
    venue, location_url, message, event_title, photos, events,
    bg_song_title, bg_song_artist, bg_song_album_art, bg_song_preview_url,
    credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;
