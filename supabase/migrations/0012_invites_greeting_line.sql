-- Consumer `invites`: adds `greeting_line` — the buyer-customizable
-- override for the short invocation shown at the top of the hero
-- (WelcomeSplash.jsx's greeting.line), e.g. "Shubh Vivah"/"Radhe Radhe"/
-- "Rab Rakha". CreateInvitePage.jsx's "Opening Greeting" field saves this;
-- falls back to the selected template's own stock greeting.line when left
-- blank (see buildWeddingExperienceTemplate.js).
--
-- Nullable, no default — required-ness enforced at the API layer (POST
-- /api/invites), not a DB constraint, same as every other optional text
-- field on this table (message, location_url, ...).
--
-- Safe to run against production: `add column if not exists` is a no-op if
-- already applied.

alter table public.invites add column if not exists greeting_line text;
