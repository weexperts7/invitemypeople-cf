// GET /api/admin/invites — admin only. Every invite in the system, from
// both invite sources this app has: the consumer self-serve `invites`
// table (Invitation Builder, /create) and the B2B `partner_invites` table
// (a partner spending a credit to generate a client invite,
// /partners/dashboard/create) — merged into one list so a super admin
// never has to check two separate places to find a given wedding.
//
// Deliberately its own file rather than living in api/_lib/partnerHandlers.js
// — that file's header says nothing there touches the consumer invites
// code path, and this route's whole point is reading both.
//
// Each row carries its "member link" (the shareable, public invite page —
// /i/:slug for a direct invite, /p/:slug for a partner one) and, for direct
// invites only, its "dashboard link" (the host's private RSVP dashboard,
// /i/:slug/host/:hostToken — see api/invites/[slug]/host.js). Partner
// invites have no dashboard link: partner_invites was never given a
// host_token/RSVP concept (see 0001_b2b_partner_portal.sql's file header) —
// a partner's client just gets the live /p/:slug link.
//
// Returning host_token here is a deliberate, narrow exception to the "never
// returned by any GET endpoint" rule documented in api/_lib/invites.js —
// that rule guards the *public* API surface; this route sits behind
// requireAdmin() and exists specifically so a super admin can open a
// host's dashboard on their behalf (support, disputes, etc).
import { getSupabase } from './supabase.js'
import { requireAdmin } from './auth.js'
import { SITE_URL } from '../../src/data/routesSeo.js'

export function formatDirectInvite(row) {
  return {
    id: `direct:${row.slug}`,
    source: 'direct',
    names: row.names,
    venue: row.venue,
    eventDate: row.eventDate ?? row.event_date ?? row.date,
    createdAt: row.createdAt ?? row.created_at,
    slug: row.slug,
    memberLink: `${SITE_URL}/i/${row.slug}`,
    dashboardLink: row.hostToken || row.host_token
      ? `${SITE_URL}/i/${row.slug}/host/${row.hostToken || row.host_token}`
      : null,
    hostName: row.hostName ?? row.host_name,
    hostEmail: row.hostEmail ?? row.host_email,
    hostPhone: row.hostPhone ?? row.host_phone,
    partnerId: null,
    businessName: null,
  }
}

export function formatPartnerInvite(row, businessName) {
  return {
    id: `partner:${row.slug}`,
    source: 'partner',
    names: row.coupleNames ?? row.couple_names,
    venue: row.venue,
    eventDate: row.weddingDate ?? row.wedding_date,
    createdAt: row.createdAt ?? row.created_at,
    slug: row.slug,
    memberLink: `${SITE_URL}/p/${row.slug}`,
    // No host dashboard exists for partner invites — see the file header.
    dashboardLink: null,
    hostName: null,
    hostEmail: row.clientEmail ?? row.client_email,
    hostPhone: row.clientPhone ?? row.client_phone,
    partnerId: row.partnerId ?? row.partner_id,
    businessName: businessName || 'Unknown partner',
  }
}

export function sortInvitesByCreatedAtDesc(invites) {
  return [...invites].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

export async function adminListInvites(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const supabase = getSupabase()
    const [
      { data: directRows, error: directError },
      { data: partnerRows, error: partnerError },
      { data: partnerNameRows, error: partnerNameError },
    ] = await Promise.all([
      supabase
        .from('invites')
        .select('slug, names, venue, date, event_date, host_name, host_email, host_phone, host_token, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('partner_invites')
        .select('partner_id, slug, couple_names, venue, wedding_date, client_email, client_phone, created_at')
        .order('created_at', { ascending: false }),
      supabase.from('partners').select('id, business_name'),
    ])
    if (directError) throw directError
    if (partnerError) throw partnerError
    if (partnerNameError) throw partnerNameError

    const partnerNameById = new Map((partnerNameRows || []).map((p) => [p.id, p.business_name]))

    const invites = sortInvitesByCreatedAtDesc([
      ...(directRows || []).map(formatDirectInvite),
      ...(partnerRows || []).map((row) => formatPartnerInvite(row, partnerNameById.get(row.partner_id))),
    ])

    res.status(200).json({ ok: true, invites })
  } catch (err) {
    console.error('[admin] failed to list invites:', err)
    res.status(500).json({ ok: false, error: 'could not load invites' })
  }
}
