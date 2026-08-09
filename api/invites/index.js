// POST /api/invites — a Vercel Serverless Function. Production counterpart
// to the local-dev POST /api/invites route in server/index.js: same
// validation and slug scheme, but persists to Supabase (see
// api/_lib/supabase.js) instead of a flat JSON file, since Vercel's runtime
// has no writable, persistent filesystem to keep one on.
import { slugify } from '../../src/utils/slugify.js'
import { getSupabase } from '../_lib/supabase.js'
import { clean, randomSlugSuffix, rowToInvite, generateHostToken } from '../_lib/invites.js'
import { MAX_PHOTOS } from '../../src/utils/photoUpload.js'
import { cleanEvents } from '../../src/utils/cleanEvents.js'
import { sendTransactionalEmail, buildOrderConfirmationEmail } from '../../src/utils/email.js'

const MAX_SLUG_ATTEMPTS = 6

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

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

    const row = {
      occasion: clean(body.occasion, 40),
      template_id: clean(body.templateId, 80),
      template_name: clean(body.templateName, 120),
      names,
      date,
      time: clean(body.time, 10),
      venue,
      location_url: clean(body.locationUrl, 500),
      message: clean(body.message, 2000),
      amount: Number(body.amount) || 0,
      payment_id: clean(body.paymentId, 80),
      payment_status: body.paymentId ? 'paid' : 'pending',
      photos: Array.isArray(body.photos)
        ? body.photos.filter((p) => typeof p === 'string').slice(0, MAX_PHOTOS).map((p) => clean(p, 500))
        : [],
      event_title: clean(body.eventTitle, 80),
      events: cleanEvents(body.events, clean),
      // Background Music Selection (see builder/SongSearchPicker.jsx) — see
      // server/index.js's identical block for what each field is for.
      bg_song_title: clean(body.bgSongTitle, 200),
      bg_song_artist: clean(body.bgSongArtist, 200),
      bg_song_album_art: clean(body.bgSongAlbumArt, 500),
      bg_song_preview_url: clean(body.bgSongPreviewUrl, 500),
      host_name: hostName,
      host_email: hostEmail,
      host_token: generateHostToken(),
    }

    const base = slugify(names) || 'invite'
    const supabase = getSupabase()

    // The `invites` table has a unique constraint on slug — retry on
    // collision instead of reading every existing invite first (as the
    // flat-file version had to) to pick a free one.
    let lastError = null
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const slug = `${base}-${randomSlugSuffix()}`
      const { data, error } = await supabase
        .from('invites')
        .insert({ ...row, slug })
        .select()
        .single()

      if (!error) {
        console.log(`[invites] saved "${slug}" (${row.template_name || row.template_id})`)
        // hostToken is deliberately spread in ONLY here, once, at creation —
        // rowToInvite() is an explicit allowlist that never includes it, so
        // every other endpoint that returns an invite (GET /api/invites/:slug,
        // the public wishes/rsvps reads) can never leak it back out.
        const invite = { ...rowToInvite(data), hostToken: data.host_token }

        // Order-confirmation email — must never fail or delay the response;
        // sendTransactionalEmail() itself never throws, but this is awaited
        // (not fire-and-forget) since Vercel can freeze the function's
        // execution context right after the response is sent.
        try {
          await sendTransactionalEmail({
            to: row.host_email,
            toName: row.host_name,
            ...buildOrderConfirmationEmail(invite),
          })
        } catch (emailErr) {
          console.error('[invites] confirmation email failed:', emailErr)
        }

        return res.status(200).json({ ok: true, invite })
      }

      lastError = error
      if (error.code !== '23505') break // not a unique-violation — don't retry
    }

    throw lastError || new Error('could not generate a unique slug')
  } catch (err) {
    console.error('[invites] failed to save:', err)
    res.status(500).json({ ok: false, error: 'could not save invitation' })
  }
}
