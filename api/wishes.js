// GET /api/wishes?slug=... — a Vercel Serverless Function. Production
// counterpart to the local-dev GET /api/wishes route in server/index.js.
// Supabase-backed replacement for the old Sheets/local-file-only Wishes
// Wall data source — WishesWall.jsx calls this exact URL already, so no
// frontend change was needed beyond removing its VITE_RSVP_ENDPOINT branch.
import { getSupabase } from './_lib/supabase.js'
import { clean } from './_lib/invites.js'
import { rowToWish } from './_lib/rsvps.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const slug = clean(req.query.slug, 80)

  try {
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!invite) return res.status(200).json({ ok: true, wishes: [] })

    const { data, error } = await supabase
      .from('rsvps')
      .select('guest_name, message, created_at')
      .eq('invite_id', invite.id)
      .neq('message', '')
      .order('created_at', { ascending: false })
    if (error) throw error

    res.status(200).json({ ok: true, wishes: (data || []).map(rowToWish) })
  } catch (err) {
    console.error(`[wishes] failed to read "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load wishes' })
  }
}
