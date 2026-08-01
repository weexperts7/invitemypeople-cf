/**
 * Wedding RSVP + Wishes Wall collector — Google Apps Script Web App.
 *
 * One master Spreadsheet holds every invitation. Each invitation gets its
 * own tab, named after its slug (e.g. "meenal-avinash"), created on first
 * submission. Paste this into Extensions ▸ Apps Script on the sheet that
 * should hold every invitation's responses, then deploy it as a Web App
 * (Execute as: Me, Who has access: Anyone) — see RSVP-SETUP.md.
 */

const HEADERS = [
  'Timestamp',
  'Name',
  'Attending',
  'Guests',
  'Song Request',
  'Marriage Advice',
  'Blessings & Wishes',
]

// Sheet tab names can't contain : \ / ? * [ ] and top out at 100 chars.
// Slugs are already URL-safe, so only the length cap realistically applies.
const MAX_SHEET_NAME_LENGTH = 100

function doPost(e) {
  const lock = LockService.getScriptLock()

  try {
    // Serialise writes so two guests submitting at once can't clobber a row.
    lock.waitLock(20000)

    if (!e || !e.postData || !e.postData.contents) {
      return jsonOut({ ok: false, error: 'empty request' })
    }

    const data = JSON.parse(e.postData.contents)

    // Honeypot: real guests never see this field, bots fill it in.
    // Pretend everything is fine so the bot doesn't retry.
    if (data.website) {
      return jsonOut({ ok: true })
    }

    const slug = sanitizeSlug(data.invitationSlug)
    if (!slug) {
      return jsonOut({ ok: false, error: 'invitationSlug is required' })
    }

    const name = String(data.guestName || '').trim().slice(0, 120)
    if (!name) {
      return jsonOut({ ok: false, error: 'guestName is required' })
    }

    const isAttending = data.attendanceStatus === 'joyfully'

    getSheet(slug).appendRow([
      new Date(),
      name,
      isAttending ? 'Attending' : 'Not attending',
      isAttending ? Number(data.guests) || 1 : 0,
      String(data.song || '').trim().slice(0, 300),
      String(data.advice || '').trim().slice(0, 2000),
      String(data.message || '').trim().slice(0, 2000),
    ])

    return jsonOut({ ok: true })
  } catch (err) {
    return jsonOut({ ok: false, error: String(err) })
  } finally {
    lock.releaseLock()
  }
}

/**
 * ?slug=<invitationSlug> returns that invitation's rows as JSON for the
 * Wishes Wall. No slug (or an unknown one) just confirms the deployment is
 * live, so opening the bare Web App URL in a browser stays a useful check.
 */
function doGet(e) {
  const slug = sanitizeSlug(e && e.parameter && e.parameter.slug)

  if (!slug) {
    return jsonOut({ ok: true, message: 'RSVP endpoint is live' })
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(
    sheetNameFor(slug),
  )

  if (!sheet || sheet.getLastRow() < 2) {
    return jsonOut({ ok: true, wishes: [] })
  }

  const rows = sheet
    .getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length)
    .getValues()

  const wishes = rows
    .map((row) => ({
      timestamp: row[0] instanceof Date ? row[0].toISOString() : String(row[0]),
      name: row[1],
      attending: row[2],
      guests: row[3],
      song: row[4],
      advice: row[5],
      message: row[6],
    }))
    .reverse() // newest first

  return jsonOut({ ok: true, wishes })
}

function sanitizeSlug(rawSlug) {
  return String(rawSlug || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, MAX_SHEET_NAME_LENGTH)
}

function sheetNameFor(slug) {
  return slug.slice(0, MAX_SHEET_NAME_LENGTH)
}

function getSheet(slug) {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const name = sheetNameFor(slug)
  let sheet = ss.getSheetByName(name)

  if (!sheet) {
    sheet = ss.insertSheet(name)
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS)
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold')
    sheet.setFrozenRows(1)
    sheet.setColumnWidth(1, 170)
    sheet.setColumnWidth(2, 180)
    sheet.setColumnWidth(5, 260)
    sheet.setColumnWidth(6, 420)
    sheet.setColumnWidth(7, 420)
  }

  return sheet
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(
    ContentService.MimeType.JSON,
  )
}
