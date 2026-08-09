import express from 'express'
import formidable from 'formidable'
import writeXlsxFile from 'write-excel-file/node'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ROUTES_SEO, SITE_URL, SITE_NAV_LINKS, satsangSeo, ganeshSeo } from '../src/data/routesSeo.js'
import { getSatsangTemplateBySlug } from '../src/data/satsangTemplatesData.js'
import { getGaneshTemplateBySlug } from '../src/data/ganeshTemplatesData.js'
import { getBlogPostBySlug, blogPostSeo, blogListSeo } from '../src/data/blogPosts.js'
import { slugify } from '../src/utils/slugify.js'
import { createOrder, verifySignature, MIN_AMOUNT_PAISE } from '../src/utils/razorpay.js'
import {
  MAX_PHOTO_BYTES,
  MAX_PHOTOS,
  ALLOWED_MIME_TYPES,
  randomPhotoFilename,
} from '../src/utils/photoUpload.js'
import { cleanEvents } from '../src/utils/cleanEvents.js'
import { sendTransactionalEmail, buildOrderConfirmationEmail } from '../src/utils/email.js'
import { searchSpotifyTracks } from '../src/utils/spotify.js'
import { randomBytes } from 'node:crypto'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const JSON_FILE = path.join(DATA_DIR, 'rsvps.json')
const XLSX_FILE = path.join(DATA_DIR, 'rsvps.xlsx')
// Invitation Builder saves — see POST /api/invites below. A flat JSON file
// standing in for "a database table" (this project's explicit local-
// persistence option instead of standing up Supabase): same shape a real
// table would have, same read-modify-write-via-queue discipline as the RSVP
// store above, easy to swap for a real DB later without touching callers —
// only createInvite()/getInviteBySlug() in src/utils/inviteApi.js would change.
const INVITES_FILE = path.join(DATA_DIR, 'invites.json')
// Invitation Builder photo uploads — see POST /api/photos below. Local-dev
// counterpart to api/photos.js's Supabase Storage upload: files saved
// straight to disk here and served back statically, same "flat file instead
// of a real bucket" tradeoff INVITES_FILE makes for the invites table.
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads')
const DIST_DIR = path.join(ROOT, 'dist')

// `--port N` wins so `npm run dev` can pin the API and never fight the Vite
// dev server for a port. Hosting platforms inject PORT, which is used in prod.
const portArgIndex = process.argv.indexOf('--port')
const PORT =
  (portArgIndex !== -1 && Number(process.argv[portArgIndex + 1])) ||
  Number(process.env.RSVP_API_PORT) ||
  Number(process.env.PORT) ||
  3001

const COLUMNS = [
  { key: 'submittedAt', header: 'Timestamp', width: 22 },
  { key: 'invitationSlug', header: 'Invitation', width: 20 },
  { key: 'name', header: 'Name', width: 24 },
  { key: 'email', header: 'Email', width: 26 },
  { key: 'attending', header: 'Attending', width: 15 },
  { key: 'guests', header: 'Guests', width: 9 },
  { key: 'song', header: 'Song Request', width: 34 },
  { key: 'advice', header: 'Marriage Advice', width: 48 },
  { key: 'message', header: 'Blessings & Wishes', width: 48 },
]

/**
 * Writes are serialised through this promise chain. Two guests submitting at
 * the same moment would otherwise interleave read-modify-write and lose a row.
 */
let writeQueue = Promise.resolve()
function enqueue(task) {
  const run = writeQueue.then(task, task)
  // keep the chain alive even if one write rejects
  writeQueue = run.catch(() => {})
  return run
}

async function readAll() {
  try {
    return JSON.parse(await fsp.readFile(JSON_FILE, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

/** JSON is the source of truth; the spreadsheet is regenerated from it. */
async function persist(entries) {
  await fsp.mkdir(DATA_DIR, { recursive: true })

  // Write to a temp file then rename, so an interrupted write can't corrupt
  // the file that already holds every previous RSVP.
  const tmp = `${JSON_FILE}.tmp`
  await fsp.writeFile(tmp, JSON.stringify(entries, null, 2), 'utf8')
  await fsp.rename(tmp, JSON_FILE)

  const header = COLUMNS.map((c) => ({
    value: c.header,
    fontWeight: 'bold',
    backgroundColor: '#F0E2C8',
  }))
  const rows = entries.map((entry) =>
    COLUMNS.map((c) => {
      const value = entry[c.key]
      if (c.key === 'guests') return { type: Number, value: Number(value) || 0 }
      return { type: String, value: value == null ? '' : String(value) }
    }),
  )

  // write-excel-file v4 returns a builder — it does NOT write on its own.
  const workbook = await writeXlsxFile([header, ...rows], {
    columns: COLUMNS.map((c) => ({ width: c.width })),
    stickyRowsCount: 1,
  })
  await workbook.toFile(XLSX_FILE)
}

function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

/** Same read-modify-write-via-queue discipline as the RSVP store, kept as
 * its own queue/file so a burst of invite saves can never interleave with
 * (or wait behind) a burst of RSVP saves. */
let invitesWriteQueue = Promise.resolve()
function enqueueInvites(task) {
  const run = invitesWriteQueue.then(task, task)
  invitesWriteQueue = run.catch(() => {})
  return run
}

async function readAllInvites() {
  try {
    return JSON.parse(await fsp.readFile(INVITES_FILE, 'utf8'))
  } catch (err) {
    if (err.code === 'ENOENT') return []
    throw err
  }
}

async function persistInvites(entries) {
  await fsp.mkdir(DATA_DIR, { recursive: true })
  const tmp = `${INVITES_FILE}.tmp`
  await fsp.writeFile(tmp, JSON.stringify(entries, null, 2), 'utf8')
  await fsp.rename(tmp, INVITES_FILE)
}

function randomSlugSuffix() {
  return Math.random().toString(36).slice(2, 8)
}

const app = express()
app.use(express.json({ limit: '64kb' }))

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/api/rsvps', async (req, res) => {
  try {
    const body = req.body || {}

    // Honeypot: real guests never see this field. Pretend success so bots
    // don't retry, but store nothing.
    if (body.website) return res.json({ ok: true })

    const name = clean(body.guestName, 120)
    if (!name) return res.status(400).json({ ok: false, error: 'guestName is required' })

    const slug = clean(body.invitationSlug, 80)
    const invites = await readAllInvites()
    // Parity with the production (Supabase) route, which can only insert an
    // rsvps row against a real invite_id foreign key — reject unknown slugs
    // here too instead of silently accepting orphaned RSVPs.
    if (!invites.some((i) => i.slug === slug)) {
      return res.status(404).json({ ok: false, error: 'invitation not found' })
    }

    const isAttending = body.attendanceStatus === 'joyfully'
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      invitationSlug: slug,
      name,
      email: clean(body.guestEmail, 200),
      attending: isAttending ? 'Attending' : 'Not attending',
      guests: isAttending ? Number(body.guests) || 1 : 0,
      song: clean(body.song, 300),
      advice: clean(body.advice, 2000),
      message: clean(body.message, 2000),
    }

    const total = await enqueue(async () => {
      const entries = await readAll()
      entries.push(entry)
      await persist(entries)
      return entries.length
    })

    console.log(`[rsvps] ${entry.name} — ${entry.attending} (${total} total)`)
    res.json({ ok: true })
  } catch (err) {
    console.error('[rsvps] failed to save:', err)
    res.status(500).json({ ok: false, error: 'could not save RSVP' })
  }
})

/** Admin: read the list as JSON. */
app.get('/api/rsvps', async (_req, res) => {
  try {
    res.json({ ok: true, entries: await readAll() })
  } catch {
    res.status(500).json({ ok: false, error: 'could not read RSVPs' })
  }
})

/** Admin: download the spreadsheet. */
app.get('/api/rsvps.xlsx', (_req, res) => {
  if (!fs.existsSync(XLSX_FILE)) {
    return res.status(404).json({ ok: false, error: 'no RSVPs yet' })
  }
  res.download(XLSX_FILE, 'rsvps.xlsx')
})

// Wishes Wall, local-persistence path — reads back the same rsvps.json every
// RsvpForm submission writes to, filtered to one invitation's slug and to
// entries that actually left a message. Mirrors the shape
// google-apps-script/Code.gs's doGet returns, so WishesWall.jsx (see its
// REMOTE_ENDPOINT fallback) doesn't need to know which source it's reading.
app.get('/api/wishes', async (req, res) => {
  try {
    const slug = clean(req.query.slug, 80)
    const entries = await readAll()
    const wishes = entries
      .filter((e) => e.invitationSlug === slug && String(e.message || '').trim())
      .map((e) => ({ name: e.name, message: e.message, timestamp: e.submittedAt }))
    res.json({ ok: true, wishes })
  } catch (err) {
    console.error('[wishes] failed to read:', err)
    res.status(500).json({ ok: false, error: 'could not load wishes' })
  }
})

// Background Music Selection search — see
// src/components/builder/SongSearchPicker.jsx. Local-dev mirror of
// api/spotify/search.js; both wrap the shared src/utils/spotify.js helper,
// which does the actual Client Credentials auth + Spotify API call.
app.get('/api/spotify/search', async (req, res) => {
  try {
    const q = clean(req.query.q, 200)
    if (!q) return res.json({ ok: true, tracks: [] })

    const tracks = await searchSpotifyTracks(q, 8)
    res.json({ ok: true, tracks })
  } catch (err) {
    // Surfaced as its own status (not the generic 502 below) so
    // SongSearchPicker.jsx can show "Too many searches, please wait a
    // second…" instead of a generic error — see spotifyApi.js.
    if (err.code === 'RATE_LIMITED') {
      res.set('Retry-After', String(err.retryAfterSeconds))
      return res.status(429).json({
        ok: false,
        error: 'Too many searches — please wait a second and try again.',
        retryAfterSeconds: err.retryAfterSeconds,
      })
    }
    console.error('[spotify] search failed:', err)
    res.status(502).json({ ok: false, error: 'could not search Spotify right now' })
  }
})

// Invitation Builder — see src/pages/CreateInvitePage.jsx. Called once the
// (currently simulated) Razorpay Test Mode payment succeeds, so every saved
// entry here represents a "paid" invite. Generates the unique shareable slug
// (see src/App.jsx's /i/:slug route) from the submitted names plus a random
// suffix — readable, but not guessable or collision-prone the way a bare
// name-derived slug would be for two "Rohan & Priya"s.
app.post('/api/invites', async (req, res) => {
  try {
    const body = req.body || {}

    const names = clean(body.names, 120)
    const date = clean(body.date, 20)
    const venue = clean(body.venue, 200)
    const hostName = clean(body.hostName, 120)
    const hostEmail = clean(body.hostEmail, 200)
    if (!names) return res.status(400).json({ ok: false, error: 'names is required' })
    if (!date) return res.status(400).json({ ok: false, error: 'date is required' })
    if (!venue) return res.status(400).json({ ok: false, error: 'venue is required' })
    if (!hostName) return res.status(400).json({ ok: false, error: 'hostName is required' })
    if (!hostEmail) return res.status(400).json({ ok: false, error: 'hostEmail is required' })

    const invite = await enqueueInvites(async () => {
      const entries = await readAllInvites()
      const existingSlugs = new Set(entries.map((e) => e.slug))
      const base = slugify(names) || 'invite'
      let slug = `${base}-${randomSlugSuffix()}`
      while (existingSlugs.has(slug)) slug = `${base}-${randomSlugSuffix()}`

      const entry = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        slug,
        occasion: clean(body.occasion, 40),
        templateId: clean(body.templateId, 80),
        templateName: clean(body.templateName, 120),
        names,
        date,
        time: clean(body.time, 10),
        venue,
        locationUrl: clean(body.locationUrl, 500),
        message: clean(body.message, 2000),
        amount: Number(body.amount) || 0,
        paymentId: clean(body.paymentId, 80),
        paymentStatus: body.paymentId ? 'paid' : 'pending',
        photos: Array.isArray(body.photos)
          ? body.photos.filter((p) => typeof p === 'string').slice(0, MAX_PHOTOS).map((p) => clean(p, 500))
          : [],
        eventTitle: clean(body.eventTitle, 80),
        events: cleanEvents(body.events, clean),
        // Background Music Selection (see builder/SongSearchPicker.jsx) —
        // all four travel together and are only ever set once a host
        // clicks "Confirm & Apply Song" there; bgSongPreviewUrl is what
        // InvitationExperience.jsx actually plays, the rest are display-only.
        bgSongTitle: clean(body.bgSongTitle, 200),
        bgSongArtist: clean(body.bgSongArtist, 200),
        bgSongAlbumArt: clean(body.bgSongAlbumArt, 500),
        bgSongPreviewUrl: clean(body.bgSongPreviewUrl, 500),
        hostName,
        hostEmail,
        hostToken: randomBytes(24).toString('base64url'),
        reminderSentAt: null,
        createdAt: new Date().toISOString(),
      }
      entries.push(entry)
      await persistInvites(entries)
      return entry
    })

    console.log(`[invites] saved "${invite.slug}" (${invite.templateName || invite.templateId})`)
    // hostToken is returned only here, once, at creation — see the strip in
    // GET /api/invites/:slug below, which mirrors rowToInvite()'s allowlist
    // in api/_lib/invites.js (the production/Supabase equivalent).

    // Order-confirmation email — same non-blocking, awaited-try/catch
    // contract as the Vercel counterpart (api/invites/index.js), kept
    // symmetric so both runtimes behave identically.
    try {
      await sendTransactionalEmail({
        to: invite.hostEmail,
        toName: invite.hostName,
        ...buildOrderConfirmationEmail(invite),
      })
    } catch (emailErr) {
      console.error('[invites] confirmation email failed:', emailErr)
    }

    res.json({ ok: true, invite })
  } catch (err) {
    console.error('[invites] failed to save:', err)
    res.status(500).json({ ok: false, error: 'could not save invitation' })
  }
})

/** Powers the live /i/:slug page — loads back exactly what was saved above,
 * minus the host-only fields (hostToken/hostEmail/hostName never leave this
 * route — same PII boundary rowToInvite() enforces in production). */
app.get('/api/invites/:slug', async (req, res) => {
  try {
    const entries = await readAllInvites()
    const invite = entries.find((e) => e.slug === req.params.slug)
    if (!invite) return res.status(404).json({ ok: false, error: 'invitation not found' })
    const { hostToken: _hostToken, hostEmail: _hostEmail, hostName: _hostName, reminderSentAt: _reminderSentAt, ...publicInvite } = invite
    res.json({ ok: true, invite: publicInvite })
  } catch (err) {
    console.error('[invites] failed to read:', err)
    res.status(500).json({ ok: false, error: 'could not load invitation' })
  }
})

/** Dev mirror of api/invites/[slug]/host.js — the token-gated Host
 * Dashboard's data source. */
app.get('/api/invites/:slug/host', async (req, res) => {
  try {
    const entries = await readAllInvites()
    const invite = entries.find((e) => e.slug === req.params.slug)
    const token = clean(req.query.token, 200)
    if (!invite || !invite.hostToken || invite.hostToken !== token) {
      return res.status(403).json({ ok: false, error: 'invalid host link' })
    }

    const rsvpEntries = await readAll()
    const rsvps = rsvpEntries
      .filter((e) => e.invitationSlug === invite.slug)
      .map((e) => ({
        id: e.id,
        guestName: e.name,
        guestEmail: e.email || null,
        attendance: e.attending === 'Attending' ? 'joyfully' : 'regretfully',
        guestCount: e.guests,
        song: e.song,
        advice: e.advice,
        message: e.message,
        createdAt: e.submittedAt,
      }))
      .reverse()

    const attending = rsvps.filter((r) => r.attendance === 'joyfully')
    const declining = rsvps.filter((r) => r.attendance !== 'joyfully')

    res.json({
      ok: true,
      invite: {
        slug: invite.slug,
        names: invite.names,
        eventTitle: invite.eventTitle,
        date: invite.date,
        time: invite.time,
        venue: invite.venue,
        hostName: invite.hostName,
        hostEmail: invite.hostEmail,
        createdAt: invite.createdAt,
      },
      rsvps,
      summary: {
        totalResponses: rsvps.length,
        attendingCount: attending.length,
        decliningCount: declining.length,
        totalGuests: attending.reduce((sum, r) => sum + (Number(r.guestCount) || 0), 0),
      },
    })
  } catch (err) {
    console.error('[invites] failed to load host dashboard:', err)
    res.status(500).json({ ok: false, error: 'could not load dashboard' })
  }
})

// Serves back whatever POST /api/photos below just saved — same-origin, no
// separate proxy rule needed since it's already under /api (see vite.config.js).
app.use('/api/uploads', express.static(UPLOADS_DIR))

// Invitation Builder photo uploads — see src/pages/CreateInvitePage.jsx.
// One file per request; local-dev counterpart to api/photos.js's Supabase
// Storage upload. Doesn't collide with the express.json()/express.text()
// middlewares above — neither matches multipart/form-data, so formidable
// still gets the untouched raw stream.
app.post('/api/photos', async (req, res) => {
  try {
    const form = formidable({ maxFileSize: MAX_PHOTO_BYTES, maxFiles: 1 })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
    if (!file) return res.status(400).json({ ok: false, error: 'no file uploaded' })
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res
        .status(400)
        .json({ ok: false, error: 'only JPEG, PNG, or WebP images are allowed' })
    }

    await fsp.mkdir(UPLOADS_DIR, { recursive: true })
    const filename = randomPhotoFilename(file.mimetype)
    await fsp.copyFile(file.filepath, path.join(UPLOADS_DIR, filename))
    await fsp.unlink(file.filepath).catch(() => {})

    res.json({ ok: true, url: `/api/uploads/${filename}` })
  } catch (err) {
    console.error('[photos] upload failed:', err)
    if (/maxFileSize/i.test(err.message || '')) {
      return res.status(400).json({ ok: false, error: 'file is too large (max 4MB)' })
    }
    res.status(500).json({ ok: false, error: 'could not upload photo' })
  }
})

// Razorpay Standard Checkout — see src/components/builder/PaymentModal.jsx
// for the Checkout.js widget these two routes support, and
// src/utils/razorpay.js for the order-creation/signature logic they share
// with their Vercel Serverless counterparts (api/create-order.js,
// api/verify-payment.js).
app.post('/api/create-order', async (req, res) => {
  try {
    const body = req.body || {}
    const amount = Math.round(Number(body.amount))
    if (!Number.isFinite(amount) || amount < MIN_AMOUNT_PAISE) {
      return res
        .status(400)
        .json({ ok: false, error: `amount must be at least ${MIN_AMOUNT_PAISE} paise` })
    }

    const receipt = clean(body.receipt, 60) || `receipt_${Date.now()}`
    const order = await createOrder({
      amount,
      currency: clean(body.currency, 3) || 'INR',
      receipt,
    })
    res.json({ ok: true, ...order })
  } catch (err) {
    console.error('[razorpay] failed to create order:', err)
    if (err.statusCode === 401) {
      return res.status(401).json({ ok: false, error: 'Razorpay authentication failed' })
    }
    res.status(500).json({ ok: false, error: 'could not create payment order' })
  }
})

// Called once Checkout.js's handler fires with the razorpay_* fields —
// nothing downstream (see CreateInvitePage.jsx's handlePaymentSuccess)
// should treat an invite as paid until this returns ok:true.
app.post('/api/verify-payment', (req, res) => {
  try {
    const body = req.body || {}
    const orderId = clean(body.razorpay_order_id, 100)
    const paymentId = clean(body.razorpay_payment_id, 100)
    const signature = clean(body.razorpay_signature, 200)
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ ok: false, error: 'missing payment fields' })
    }

    if (!verifySignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ ok: false, error: 'signature mismatch' })
    }

    res.json({ ok: true, paymentId })
  } catch (err) {
    console.error('[razorpay] failed to verify payment:', err)
    res.status(500).json({ ok: false, error: 'could not verify payment' })
  }
})

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

// Finds a <meta ...> tag by an attribute match (e.g. `name="description"` or
// `property="og:title"`) and swaps its content="..." value — tolerant of the
// multi-line attribute formatting index.html uses (`[^>]` matches newlines
// via its negated character class, no need for a dotall flag).
function setMetaContent(html, attrMatch, value) {
  const re = new RegExp(`(<meta\\b[^>]*?${attrMatch}[^>]*?content=")[^"]*("[^>]*>)`, 'i')
  return html.replace(re, `$1${escapeHtml(value)}$2`)
}

function setCanonical(html, href) {
  return html.replace(
    /(<link\b[^>]*?rel="canonical"[^>]*?href=")[^"]*("[^>]*>)/i,
    `$1${escapeHtml(href)}$2`,
  )
}

function setTitle(html, title) {
  return html.replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(title)}</title>`)
}

// Mirrors api/render.js's setRootContent/renderBodyBlock exactly — see its
// comment for why this is safe (createRoot, not hydrateRoot) and why it
// exists (a non-JS-executing crawler otherwise only ever sees an empty
// `<div id="root"></div>`). Each `body` entry is a plain string (<p>), a
// `{ h2 }` object (<h2>), a `{ h3 }` object (<h3> — used by blog posts, see
// blogPosts.js), or an array of segments — plain text or a `{ text, href }`
// internal link, rendered as a real <a href> inside the <p> — see
// routesSeo.js's homepage `body` for why.
function renderBodyBlock(block) {
  if (typeof block === 'string') return `<p>${escapeHtml(block)}</p>`
  if (Array.isArray(block)) {
    const inner = block
      .map((seg) =>
        typeof seg === 'string'
          ? escapeHtml(seg)
          : `<a href="${escapeHtml(seg.href)}">${escapeHtml(seg.text)}</a>`,
      )
      .join('')
    return `<p>${inner}</p>`
  }
  if (block.h3) return `<h3>${escapeHtml(block.h3)}</h3>`
  return `<h2>${escapeHtml(block.h2)}</h2>`
}

// Visually hidden (not display:none — screen readers and non-JS text
// crawlers, e.g. Seobility, still read it fine) so real visitors never see
// this markup flash before React's own render() replaces #root's children.
// The style is inline, part of the very first HTML the browser parses, so
// there's no visible flash even on a slow connection/device — unlike
// hiding it via an external stylesheet class or JS, either of which would
// still paint it visible for at least one frame first.
const SR_ONLY_STYLE =
  'position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;'

function setRootContent(html, { h1, body, links }) {
  const content = (body || []).map(renderBodyBlock).join('')
  const nav = links && links.length
    ? `<nav>${links.map((l) => `<a href="${escapeHtml(l.href)}">${escapeHtml(l.label)}</a>`).join(' ')}</nav>`
    : ''
  return html.replace(
    '<div id="root"></div>',
    `<div id="root"><div style="${SR_ONLY_STYLE}"><h1>${escapeHtml(h1)}</h1>${content}${nav}</div></div>`,
  )
}

// Mirrors api/render.js's normalizePathname exactly — see its comment for
// why trailing-slash requests need collapsing before both route lookup and
// the canonical URL it produces.
function normalizePathname(pathname) {
  if (pathname.length > 1 && pathname.endsWith('/')) return pathname.slice(0, -1)
  return pathname
}

// Resolves per-route SEO copy for any URL the SPA router recognizes —
// static routes come straight from routesSeo.js; /satsang/:slug is dynamic,
// so its title/description come from the matched template itself.
function resolveSeoForPath(pathname) {
  if (ROUTES_SEO[pathname]) return ROUTES_SEO[pathname]
  // Computed from BLOG_POSTS rather than a ROUTES_SEO entry — see
  // blogListSeo()'s own comment for why.
  if (pathname === '/blog') return blogListSeo()

  const satsangMatch = pathname.match(/^\/satsang\/([^/]+)\/?$/)
  if (satsangMatch) {
    const template = getSatsangTemplateBySlug(decodeURIComponent(satsangMatch[1]))
    if (template) return satsangSeo(template)
  }

  const ganeshMatch = pathname.match(/^\/templates\/ganesh-chaturthi\/([^/]+)\/?$/)
  if (ganeshMatch) {
    const template = getGaneshTemplateBySlug(decodeURIComponent(ganeshMatch[1]))
    if (template) return ganeshSeo(template)
  }

  const blogMatch = pathname.match(/^\/blog\/([^/]+)\/?$/)
  if (blogMatch) {
    const post = getBlogPostBySlug(decodeURIComponent(blogMatch[1]))
    if (post) return blogPostSeo(post)
  }

  return null
}

let indexHtmlTemplate = null
function getIndexHtmlTemplate() {
  // Cached after the first read — the file on disk doesn't change while the
  // server is running (a fresh deploy restarts the process anyway).
  // Reads dist/app-shell.html, not dist/index.html: scripts/postbuild.js
  // renames Vite's build output specifically so no literal "index.html"
  // exists in DIST_DIR. Without that, express.static's own directory-index
  // default (below) would serve that file for "/" directly — same file,
  // but never passed through renderSeoHtml — bypassing this route's
  // <h1>/meta injection entirely while every other route (having no
  // matching static file) already correctly reached it.
  if (indexHtmlTemplate === null) {
    indexHtmlTemplate = fs.readFileSync(path.join(DIST_DIR, 'app-shell.html'), 'utf8')
  }
  return indexHtmlTemplate
}

// The SPA is client-rendered, so the *initial* HTML response is all a
// non-JS crawler — like WhatsApp's link-preview scraper — ever sees. This
// swaps in the right title/description/canonical/OG tags per route before
// sending index.html, so link previews and search snippets are correct for
// every page, not just "/".
function renderSeoHtml(rawPathname) {
  const html = getIndexHtmlTemplate()
  const pathname = normalizePathname(rawPathname)
  const seo = resolveSeoForPath(pathname)
  const url = `${SITE_URL}${pathname}`

  if (!seo) {
    // Unknown route — the SPA renders its 404 page client-side; keep
    // crawlers from indexing this URL as a duplicate of the homepage. Still
    // self-canonicalize (see api/render.js's identical comment) rather than
    // leaving the shell's baked-in homepage canonical in place.
    return setCanonical(setMetaContent(html, 'name="robots"', 'noindex, follow'), url)
  }

  const steps = [
    [setTitle, seo.title],
    [setMetaContent, 'name="description"', seo.description],
    [setCanonical, url],
    [setMetaContent, 'property="og:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'property="og:description"', seo.ogDescription || seo.description],
    [setMetaContent, 'property="og:url"', url],
    [setMetaContent, 'name="twitter:title"', seo.ogTitle || seo.title],
    [setMetaContent, 'name="twitter:description"', seo.ogDescription || seo.description],
  ]
  // Only static routes carry an `h1` — see api/render.js's identical comment.
  if (seo.h1) steps.push([setRootContent, { h1: seo.h1, body: seo.body, links: SITE_NAV_LINKS }])
  return steps.reduce((acc, [fn, ...args]) => fn(acc, ...args), html)
}

// When a production build exists, serve the site from this same server.
if (fs.existsSync(DIST_DIR)) {
  // `index: false` is belt-and-suspenders: DIST_DIR has no literal
  // index.html to begin with (see getIndexHtmlTemplate()'s comment above),
  // but express.static defaults to serving one for "/" if it ever finds
  // one — this makes explicit that "/" must always reach the catch-all
  // route below instead.
  app.use(express.static(DIST_DIR, { index: false }))
  // Client-side routes (see src/App.jsx) only exist in the SPA's own
  // router, so a direct load or refresh needs index.html served back for
  // any non-API path — the app then reads the URL itself. The HTML is
  // rewritten per-route first (see renderSeoHtml) for crawlers that don't
  // execute JS.
  app.get(/^\/(?!api).*/, (req, res) => {
    res.set('Content-Type', 'text/html')
    res.send(renderSeoHtml(req.path))
  })
}

app.listen(PORT, () => {
  console.log(`[rsvp] API listening on http://localhost:${PORT}`)
  console.log(`[rsvp] saving to ${XLSX_FILE}`)
})
