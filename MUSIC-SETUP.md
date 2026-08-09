# Background Music Selection (Spotify) setup

`/create` (the Invitation Builder) lets a host search Spotify, preview any
track's 30-second clip, and apply one as their invitation's background
music — played on `/i/:slug` the moment a guest taps the envelope open. See
`src/components/builder/SongSearchPicker.jsx` for the UI and
`src/utils/spotify.js` for the Spotify Client Credentials integration
(shared by `server/index.js`'s local-dev route and `api/spotify/search.js`'s
Vercel Serverless Function).

## One-time setup

### 1. Create a Spotify app

Client Credentials is app-only auth (no user login, no paid Spotify plan) —
just:

1. Go to the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) and log in with any Spotify account (free is fine).
2. **Create app**. Name/description can be anything (e.g. "InviteMyPeople
   Music Search"). For the redirect URI, put anything valid (e.g.
   `https://invitemypeople.com`) — Client Credentials never uses it, but
   the field is required to save the app.
3. Open the app → **Settings** → copy the **Client ID** and **Client
   Secret**.

### 2. Set the environment variables

Local dev (`.env`):

```
SPOTIFY_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
SPOTIFY_CLIENT_SECRET=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

Production — Vercel dashboard → **Project → Settings → Environment
Variables** (Production, and Preview if you want branch deploys to search
too):

| Name | Value |
| --- | --- |
| `SPOTIFY_CLIENT_ID` | from the Spotify app's Settings page |
| `SPOTIFY_CLIENT_SECRET` | from the Spotify app's Settings page |

**Do not** prefix either with `VITE_` — that would ship the secret in the
public JS bundle. They're read only by the Serverless Function
(`api/spotify/search.js` → `src/utils/spotify.js`).

Env var changes only take effect on the *next* deploy — push a commit, or
use Vercel's "Redeploy" button, after adding them.

### 3. Add the background-music columns

The `invites` table (see `INVITES-SETUP.md`) needs four more nullable
columns for the confirmed track. In Supabase → **SQL Editor**:

```sql
alter table public.invites
  add column if not exists bg_song_title text,
  add column if not exists bg_song_artist text,
  add column if not exists bg_song_album_art text,
  add column if not exists bg_song_preview_url text;
```

All four are nullable — a host who skips the Background Music Selection
step simply has no song of their own, and `/i/:slug` falls back to the
standard default track (`public/audio/soothing-romantic.wav`) instead —
see `DEFAULT_BG_MUSIC_URL` in `InvitationExperience.jsx`. Every invitation
plays something once the envelope opens; skipping the picker just means
it isn't the host's own choice.

## A real limitation to know about before launch

Spotify restricted general access to the 30-second `preview_url` in late
2024 — most search results now come back with `preview_url: null` unless
the app has been granted [Extended Quota
Mode](https://developer.spotify.com/documentation/web-api/concepts/quota-modes)
(a manual Spotify approval, not something Client Credentials alone grants).

To work around this, `searchSpotifyTracks()` (`src/utils/spotify.js`)
backfills any missing `preview_url` from the [iTunes Search
API](https://performance-partners.apple.com/search-api) — see
`src/utils/itunesPreview.js` — which still freely returns a playable
~30-second clip URL per track, no auth or quota approval needed. Spotify
stays the source of search results, metadata, and album art; iTunes only
fills in the audio clip when Spotify's own is missing, which today is
almost always. `SongSearchPicker.jsx` still only allows selecting a track
that ends up with *some* preview URL (from either source) — everything
else shows "No preview available" and can't be selected — but with the
iTunes backfill in place that's now the rare case (an obscure or
regional track absent from iTunes too), not the norm.

## Verifying it worked

1. Visit `/create`, pick a wedding template, scroll to **Background Music
   Selection**, and search for a song.
2. Click **Preview** on a result with a preview available — it should play
   right there in the form.
3. Click **Confirm & Apply Song**, finish the form, and pay in Test Mode.
4. Open your `/i/<slug>` link and tap the envelope — the chosen song should
   start playing, and the floating mute/unmute button (bottom-right) should
   appear.

If search returns an error instead of results, the env vars are either
missing or wrong — check the function's logs in Vercel → Deployments →
(latest) → Functions, or the local `npm run dev:api` terminal output.
