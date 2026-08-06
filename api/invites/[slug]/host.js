// GET /api/invites/:slug/host?token=... — a Vercel Serverless Function.
// The private Host Dashboard's only data source (see
// src/pages/HostDashboardPage.jsx via getHostDashboard() in
// src/utils/hostApi.js). This is the actual security boundary for guest
// PII in an app with no login system: `token` must match the invite's
// host_token (generated once, at creation, in api/invites/index.js) or
// nothing is returned — not even whether the slug exists.
import { getSupabase } from '../../_lib/supabase.js'
import { clean, tokensMatch } from '../../_lib/invites.js'
import { rowToRsvp, summarizeRsvps } from '../../_lib/rsvps.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const { slug } = req.query
  const token = clean(req.query.token, 200)

  try {
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    // Same 404 whether the slug doesn't exist or the token is wrong for it —
    // don't let a guessed token confirm a slug is real, or vice versa.
    if (!invite || !invite.host_token || !tokensMatch(token, invite.host_token)) {
      return res.status(403).json({ ok: false, error: 'invalid host link' })
    }

    const { data: rsvpRows, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invite_id', invite.id)
      .order('created_at', { ascending: false })
    if (rsvpError) throw rsvpError

    const rsvps = rsvpRows || []

    res.status(200).json({
      ok: true,
      invite: {
        slug: invite.slug,
        names: invite.names,
        eventTitle: invite.event_title,
        date: invite.date,
        time: invite.time,
        venue: invite.venue,
        hostName: invite.host_name,
        hostEmail: invite.host_email,
        createdAt: invite.created_at,
      },
      rsvps: rsvps.map(rowToRsvp),
      summary: summarizeRsvps(rsvps),
    })
  } catch (err) {
    console.error(`[invites] failed to load host dashboard for "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load dashboard' })
  }
}
