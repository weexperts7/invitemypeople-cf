-- Consumer `invites`: adds a typed `event_date` column alongside the
-- existing free-text `date` column (see 0006_consumer_invites.sql).
--
-- Why: automated event-expiry (getEventStatus() in src/utils/eventStatus.js,
-- used by the public /i/:slug page to swap in the "Event Concluded" view
-- once the event plus its 24-hour post-event buffer has passed) and, going
-- forward, any admin/reporting query that wants to filter or sort on a real
-- `date`, instead of parsing the text `date` column every time.
--
-- Nullable and backfilled best-effort. `date` has only ever been a plain
-- text column (an <input type="date"> value, "YYYY-MM-DD", never DB-
-- enforced) — the vast majority of rows will parse cleanly, but a
-- hand-edited or very old row that doesn't leaves event_date = null rather
-- than failing this migration. Every reader of this column
-- (getEventStatus()) is written to treat null/unparseable as "unknown,
-- never auto-expire" — not an error — which is what "handling it
-- gracefully" means here in practice; it also still falls back to reading
-- the `date`/`time` text columns directly, so a null event_date never hides
-- an otherwise-valid invite.
--
-- Safe to run against production: `add column if not exists` is a no-op if
-- already applied, and the backfill only touches rows still missing it.

alter table public.invites add column if not exists event_date date;

update public.invites
set event_date = date::date
where event_date is null
  and date ~ '^\d{4}-\d{2}-\d{2}$';

-- Supports future "closed events" / reporting queries filtering or sorting
-- on event_date without a full table scan.
create index if not exists invites_event_date_idx on public.invites (event_date);
