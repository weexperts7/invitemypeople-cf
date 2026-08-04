// GET /api/invites/:slug — a Vercel Serverless Function. Powers the live
// /i/:slug page (GeneratedInvitePage.jsx via getInviteBySlug in
// src/utils/inviteApi.js), loading back exactly what POST /api/invites
// (./index.js) saved.
import { getSupabase } from '../_lib/supabase.js'
import { rowToInvite } from '../_lib/invites.js'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const { slug } = req.query

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('invites')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()

    if (error) throw error
    if (!data) return res.status(404).json({ ok: false, error: 'invitation not found' })

    res.status(200).json({ ok: true, invite: rowToInvite(data) })
  } catch (err) {
    console.error(`[invites] failed to read "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load invitation' })
  }
}
