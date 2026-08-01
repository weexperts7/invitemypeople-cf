# Where RSVP responses go

By default, every RSVP is saved to a real Excel file on your machine:

```
data/rsvps.xlsx     ← open this in Excel
data/rsvps.json     ← source of truth the spreadsheet is rebuilt from
```

**No setup required.** `npm run dev` starts both the site and the small API that
writes those files.

> **Why an API at all?** Browser JavaScript cannot write files to disk — that's
> a hard security boundary in every browser. Something server-side has to
> receive the submission and write it. `server/index.js` is that piece.

---

## Option A — local Excel file (default)

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

| A | B | C | D | E | F | G |
| - | - | - | - | - | - | - |
| Timestamp | Name | Attending | Guests | Song Request | Marriage Advice | Blessings & Wishes |

### Getting the list as admin

- **Open the file**: `data/rsvps.xlsx` — double-click, it opens in Excel
- **Download it over HTTP**: <http://localhost:3001/api/rsvps.xlsx>
- **Read it as JSON**: <http://localhost:3001/api/rsvps>
- **Headcount in Excel**: `=SUMIF(C:C,"Attending",D:D)`
- **Playlist**: filter column E for non-empty rows

> Excel locks a file while it's open. If a submission lands while you have
> `rsvps.xlsx` open, the rewrite can fail — the API logs it and the guest sees
> a retry message. `data/rsvps.json` still has every response, and the next
> successful write rebuilds the spreadsheet from it, so nothing is lost. Close
> the file when you're not reading it.

### Important limitation

This writes to **the machine running the API**. It works for local use and for
any host that runs Node (Render, Railway, Fly, a VPS) — but **not** on
static-only hosting (GitHub Pages, plain Netlify/Vercel static). There is no
server there to write a file.

To deploy with this setup:

```bash
npm run build     # builds dist/
npm start         # serves dist/ AND the API on one port
```

`npm start` honours the host's `PORT`. Put `data/` on a persistent disk —
container filesystems are usually wiped on redeploy.

If you're deploying to static hosting, use Option B instead.

---

## Option B — Google Sheet (works with static hosting)

Posts each RSVP to a Google Apps Script Web App that appends a row to a
master Sheet you own. No server to run, and the Sheet doubles as the admin
view — one **tab per invitation**, named after that invitation's slug (e.g.
`meenal-avinash`, derived from the couple's names in `templatesData.js`), so
every custom invitation's responses stay separate inside the same Sheet.

1. Create a spreadsheet at <https://sheets.new>. This is the one master Sheet
   for every invitation — you don't create a new Sheet per couple.
2. **Extensions ▸ Apps Script**, delete the placeholder, paste
   [`google-apps-script/Code.gs`](google-apps-script/Code.gs), save.
3. **Deploy ▸ New deployment ▸ Web app**, with:
   - **Execute as**: Me
   - **Who has access**: Anyone ← required
4. **Deploy**, authorise (accept the "unverified app" warning for your own
   script), and copy the Web app URL.
5. Open that URL — you should see `{"ok":true,"message":"RSVP endpoint is live"}`.
6. Create `.env` in the project root:

```
VITE_RSVP_ENDPOINT=https://script.google.com/macros/s/AKfyc.../exec
```

Restart the dev server. Setting this variable overrides the local API entirely
— it's also what turns on the **Wishes Wall**, which reads back the same tab
over `GET <endpoint>?slug=<invitationSlug>`. When deploying, set the same
variable in your host's environment-variable panel so it's baked into the
build.

The first RSVP for a given invitation auto-creates its tab (named after the
slug) with the same seven columns as Option A. Nothing to create by hand —
just share the invitation and the tab appears on first response.

### Satsang invitations

Satsang RSVPs use the same mechanism — each template's slug is prefixed, so
"The Divine Peacock" and "Saffron Blossom" land in tabs named
`satsang-divine-peacock` and `satsang-saffron-blossom`, auto-created on first
response exactly like the wedding tabs.

The **Divine Blessing scratch card** (on every Satsang invitation) also reads
from this same Web App, via `GET <endpoint>?blessings=1`. Add a tab named
`Blessings` to your Sheet — column A the quote, column B an optional author —
and every submission after your next **Deploy ▸ Manage deployments ▸ Edit ▸
New version** will draw from it. Until that tab exists (or if you're still on
an older deployed version of `Code.gs`), the card falls back to a small
built-in quote list, so it always works.

### Notes on abuse

With Option B the endpoint URL ships in the public JavaScript bundle —
unavoidable for a static site, and normal for form services. The script only
*appends* and never returns sheet contents, so the guest list can't be scraped
through it. A hidden honeypot field silently discards bot submissions (both
options). If you get spammed, create a new deployment (new URL) and update
`VITE_RSVP_ENDPOINT`.

---

## Privacy

`data/` and `.env` are both gitignored. Guest names and messages are personal
data — don't commit them.
