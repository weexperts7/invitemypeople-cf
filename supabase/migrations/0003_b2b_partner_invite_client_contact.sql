-- B2B Partner Portal — adds the client's email/phone to a partner-created
-- invite, so the person the invite is actually for (not the partner) can be
-- emailed their live link the moment it's generated, the same way a
-- consumer host gets an order-confirmation email today (see
-- buildOrderConfirmationEmail() in src/utils/email.js). See
-- PartnerCreateInvitePage.jsx / api/_lib/partnerHandlers.js.
--
-- Run this against the same Supabase project 0001/0002 already ran against
-- (Supabase Dashboard → SQL Editor → paste and run, or `supabase db push`).
--
-- Purely additive: new nullable columns on the existing `partner_invites`
-- table only, same as 0002. Required-ness (both fields must be present) is
-- enforced at the API layer (api/_lib/partnerHandlers.js's createClientInvite,
-- mirroring how host_email is required on POST /api/invites but isn't a
-- NOT NULL column on `invites` either — see INVITES-SETUP.md) rather than a
-- NOT NULL constraint here, so this migration never has to backfill any
-- invite created before this column existed.

alter table partner_invites
  add column if not exists client_email text,
  add column if not exists client_phone text;

-- ---------------------------------------------------------------------------
-- spend_partner_credit_for_invite — replaces the version in
-- 0002_b2b_partner_invite_richness.sql with one that also accepts and
-- stores client_email/client_phone. Same atomicity/locking behavior as
-- before — only the parameter list and the final insert grew.
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
  p_bg_song_preview_url text default null,
  p_client_email text default null,
  p_client_phone text default null
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
    client_email, client_phone, credit_transaction_id
  ) values (
    p_partner_id, p_slug, p_template_id, p_couple_names, p_wedding_date, p_wedding_time,
    p_venue, p_location_url, p_message, p_event_title,
    coalesce(p_photos, '[]'::jsonb), coalesce(p_events, '[]'::jsonb),
    p_bg_song_title, p_bg_song_artist, p_bg_song_album_art, p_bg_song_preview_url,
    p_client_email, p_client_phone, v_tx.id
  )
  returning * into v_invite;

  return v_invite;
end;
$$;
