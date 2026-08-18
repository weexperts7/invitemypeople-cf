-- Consumer `invites`: adds `host_phone` alongside the existing `host_name`/
-- `host_email` (see 0006_consumer_invites.sql) — CreateInvitePage.jsx's
-- "Your Name"/"Your Email"/"Your Phone" host-contact fields now save all
-- three, matching the B2B Partner Portal's own client_phone column
-- (0003_b2b_partner_invite_client_contact.sql) on `partner_invites`.
--
-- Nullable, same as host_name/host_email themselves — required-ness is
-- enforced at the API layer (POST /api/invites), not a DB constraint, same
-- as every other "required" field on this table.
--
-- Safe to run against production: `add column if not exists` is a no-op if
-- already applied.

alter table public.invites add column if not exists host_phone text;
