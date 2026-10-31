// GET/POST /api/jaap — a Vercel Serverless Function. Production counterpart to
// the local-dev route of the same path in server/index.js. Backs the Sangat
// Jaap mala on a Satsang invite (see ShukranaDarshanTemplate's MalaJaap.tsx):
// GET reads an invite's shared total, POST adds one finished round to it.
import { getSupabase } from './_lib/supabase.js'
import { clean } from './_lib/invites.js'
import { MAX_JAAP_PER_REQUEST } from '../src/utils/jaap.js'

export default async function handler(req, res) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.setHeader('Allow', 'GET, POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const isPost = req.method === 'POST'
  const slug = clean(isPost ? req.body?.slug : req.query.slug, 80)

  try {
    const supabase = getSupabase()
    const { data: invite, error: inviteError } = await supabase
      .from('invites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!invite) return res.status(404).json({ ok: false, error: 'invitation not found' })

    if (isPost) {
      const added = Math.floor(Number(req.body?.count))
      if (!(added >= 1 && added <= MAX_JAAP_PER_REQUEST)) {
        return res.status(400).json({ ok: false, error: 'invalid count' })
      }
      const { data, error } = await supabase.rpc('add_satsang_jaap', { p_invite_id: invite.id, p_count: added })
      if (error) throw error
      return res.status(200).json({ ok: true, count: Number(data) })
    }

    const { data, error } = await supabase
      .from('satsang_jaap')
      .select('count')
      .eq('invite_id', invite.id)
      .maybeSingle()
    if (error) throw error
    res.status(200).json({ ok: true, count: Number(data?.count ?? 0) })
  } catch (err) {
    console.error(`[jaap] failed for "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not update jaap' })
  }
}
