// POST /api/rsvps — a Vercel Serverless Function. Production counterpart to
// the local-dev POST /api/rsvps route in server/index.js. Replaces the old
// Google Apps Script / VITE_RSVP_ENDPOINT dependency (see RsvpForm.jsx,
// useRsvpSubmit.js) — every RSVP now lands in Supabase's `rsvps` table,
// foreign-keyed to the `invites` row it belongs to (see
// RSVPS-AND-REMINDERS-SETUP.md for the schema).
import { getSupabase } from '../_lib/supabase.js'
import { clean } from '../_lib/invites.js'
import { cleanRsvp } from '../_lib/rsvps.js'
import { verifyTurnstileToken, getClientIp } from '../_lib/turnstile.js'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}

    // Honeypot: real guests never see this field. Pretend success so bots
    // don't retry, but store nothing — same behavior as the old Sheets path.
    if (body.website) return res.status(200).json({ ok: true })

    // Cloudflare Turnstile — every RSVP form (RsvpForm.jsx and its
    // per-template siblings, all funneling through this one route) mints a
    // token via TurnstileWidget.jsx and disables its submit button until
    // one exists. Blocks scripted spam before it ever reaches Supabase.
    const verified = await verifyTurnstileToken(body.captchaToken, {
      remoteIp: getClientIp(req),
      expectedAction: 'rsvp_submit',
    })
    if (!verified) {
      return res.status(400).json({ ok: false, error: 'verification failed — please try again' })
    }

    const row = cleanRsvp(body)
    if (!row.guest_name) {
      return res.status(400).json({ ok: false, error: 'guestName is required' })
    }

    const slug = clean(body.invitationSlug, 80)
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!invite) return res.status(404).json({ ok: false, error: 'invitation not found' })

    const { error: insertError } = await supabase
      .from('rsvps')
      .insert({ ...row, invite_id: invite.id })
    if (insertError) throw insertError

    console.log(`[rsvps] ${row.guest_name} — ${row.attendance} on "${slug}"`)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[rsvps] failed to save:', err)
    res.status(500).json({ ok: false, error: 'could not save RSVP' })
  }
}
