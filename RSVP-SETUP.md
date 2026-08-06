# Where RSVP responses go

**Local dev** (`npm run dev`): every RSVP is saved to a real Excel file on
your machine — same flat-file store the Invitation Builder's invites use
locally (see `INVITES-SETUP.md`):

```
data/rsvps.xlsx     ← open this in Excel
data/rsvps.json     ← source of truth the spreadsheet is rebuilt from
```

**No setup required.** `npm run dev` starts both the site and the small API
that writes those files.

> **Why an API at all?** Browser JavaScript cannot write files to disk — that's
> a hard security boundary in every browser. Something server-side has to
> receive the submission and write it. `server/index.js` is that piece.

**Production**: RSVPs are stored in Supabase (a `rsvps` table, foreign-keyed
to `invites`), with a private Host Dashboard and a 4-hour-before-event
reminder email. See **`RSVPS-AND-REMINDERS-SETUP.md`** for the one-time
Supabase/Brevo setup this requires. This replaced an earlier Google Apps
Script / `VITE_RSVP_ENDPOINT` integration, now fully retired — if you have
an old Sheet from that setup, it's left alone as a manual archive; nothing
in this app reads from it anymore.

---

## Local dev details

```bash
npm install
npm run dev
```

That runs two processes together:

| Process | Port | What it does                            |
| ------- | ---- | --------------------------------------- |
| `web`   | 5173 | The Vite site                           |
| `api`   | 3001 | Receives RSVPs, writes `data/rsvps.xlsx` |

Vite proxies `/api` to port 3001, so the browser talks to one origin.

Submit an RSVP and `data/rsvps.xlsx` appears immediately, with columns:

| A | B | C | D | E | F | G | H |
| - | - | - | - | - | - | - | - |
| Timestamp | Name | Email | Attending | Guests | Song Request | Marriage Advice | Blessings & Wishes |

### Getting the list as admin (local dev only)

- **Open the file**: `data/rsvps.xlsx` — double-click, it opens in Excel
- **Download it over HTTP**: <http://localhost:3001/api/rsvps.xlsx>
- **Read it as JSON**: <http://localhost:3001/api/rsvps>
- **Headcount in Excel**: `=SUMIF(D:D,"Attending",E:E)`
- **Playlist**: filter column F for non-empty rows

In production, use the private Host Dashboard instead
(`/i/:slug/host/:hostToken`, shown once right after checkout) — see
`RSVPS-AND-REMINDERS-SETUP.md`.

> Excel locks a file while it's open. If a submission lands while you have
> `rsvps.xlsx` open, the rewrite can fail — the API logs it and the guest sees
> a retry message. `data/rsvps.json` still has every response, and the next
> successful write rebuilds the spreadsheet from it, so nothing is lost. Close
> the file when you're not reading it.

### Notes on abuse

A hidden honeypot field silently discards bot submissions — real guests
never see it; anything that fills it in gets a fake "success" response but
is never stored.

---

## Privacy

`data/` and `.env` are both gitignored. Guest names, emails, and messages are
personal data — don't commit them.
