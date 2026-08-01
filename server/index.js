import express from 'express'
import writeXlsxFile from 'write-excel-file/node'
import fs from 'node:fs'
import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')
const DATA_DIR = path.join(ROOT, 'data')
const JSON_FILE = path.join(DATA_DIR, 'rsvps.json')
const XLSX_FILE = path.join(DATA_DIR, 'rsvps.xlsx')
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

const app = express()
app.use(express.json({ limit: '64kb' }))
// Plain-text bodies keep the browser request "simple" (no CORS preflight).
app.use(express.text({ type: ['text/plain', 'text/*'], limit: '64kb' }))

app.use((req, res, next) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Headers', 'Content-Type')
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
  if (req.method === 'OPTIONS') return res.sendStatus(204)
  next()
})

app.post('/api/rsvp', async (req, res) => {
  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body || {}

    // Honeypot: real guests never see this field. Pretend success so bots
    // don't retry, but store nothing.
    if (body.website) return res.json({ ok: true })

    const name = clean(body.guestName, 120)
    if (!name) return res.status(400).json({ ok: false, error: 'guestName is required' })

    const isAttending = body.attendanceStatus === 'joyfully'
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      submittedAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      invitationSlug: clean(body.invitationSlug, 80),
      name,
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

    console.log(`[rsvp] ${entry.name} — ${entry.attending} (${total} total)`)
    res.json({ ok: true })
  } catch (err) {
    console.error('[rsvp] failed to save:', err)
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

// When a production build exists, serve the site from this same server.
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR))
  // Client-side routes like /satsang/:slug (see src/App.jsx) only exist in
  // the SPA's own router, so a direct load or refresh needs index.html
  // served back for any non-API path — the app then reads the URL itself.
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(DIST_DIR, 'index.html'))
  })
}

app.listen(PORT, () => {
  console.log(`[rsvp] API listening on http://localhost:${PORT}`)
  console.log(`[rsvp] saving to ${XLSX_FILE}`)
})
