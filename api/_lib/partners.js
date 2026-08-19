// Shared helpers for the partner-portal Serverless Functions
// (api/partners/*, api/admin/*) — mirrors api/_lib/invites.js's
// clean()/rowToInvite() split for the new `partners` / `partner_invites` /
// `partner_credit_transactions` tables (see
// supabase/migrations/0001_b2b_partner_portal.sql). None of these touch
// the existing `invites`/`rsvps` tables in any way.
import { randomBytes, timingSafeEqual } from 'node:crypto'
import { getSupabase } from './supabase.js'

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

export function randomSlugSuffix() {
  return randomBytes(4).toString('hex')
}

// A private, unguessable per-invite token — the only thing standing between
// "anyone with the shareable /p/:slug link" and "the partner's client, who
// can see every guest's email and RSVP details on
// /p/:slug/host/:hostToken". Deliberately a duplicate of
// api/_lib/invites.js's identical generateHostToken(), not an import from
// it — see this file's own header and partnerHandlers.js's "CRITICAL, by
// design" isolation note for why the partner code path never imports from
// the consumer one.
export function generateHostToken() {
  return randomBytes(24).toString('base64url')
}

// Constant-time comparison for the host-token check
// (getPartnerInviteHostDashboard() in partnerHandlers.js) — a plain `===`
// would let response timing leak how many leading characters of a guessed
// token were correct. Mismatched lengths are handled explicitly since
// timingSafeEqual throws instead of returning false for those. Same
// duplication rationale as generateHostToken() above.
export function tokensMatch(a, b) {
  const bufA = Buffer.from(String(a ?? ''))
  const bufB = Buffer.from(String(b ?? ''))
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

// `partners` uses snake_case columns like every other table in this app;
// everything client-side speaks camelCase (see PartnerAuthContext.jsx).
export function rowToPartner(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    address: row.address,
    phone: row.phone,
    email: row.email,
    logoUrl: row.logo_url,
    status: row.status,
    rejectedReason: row.rejected_reason,
    approvedAt: row.approved_at,
    reviewedBy: row.reviewed_by,
    creditsRemaining: row.credits_remaining,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export function rowToTransaction(row) {
  return {
    id: row.id,
    type: row.type,
    credits: row.credits,
    balanceAfter: row.balance_after,
    packageId: row.package_id,
    amountPaise: row.amount_paise,
    razorpayOrderId: row.razorpay_order_id,
    razorpayPaymentId: row.razorpay_payment_id,
    inviteSlug: row.invite_slug,
    note: row.note,
    createdAt: row.created_at,
  }
}

export function rowToPartnerInvite(row) {
  return {
    id: row.id,
    slug: row.slug,
    templateId: row.template_id,
    coupleNames: row.couple_names,
    eventTitle: row.event_title,
    weddingDate: row.wedding_date,
    weddingTime: row.wedding_time,
    venue: row.venue,
    locationUrl: row.location_url,
    message: row.message,
    photos: row.photos ?? [],
    events: row.events ?? [],
    bgSongTitle: row.bg_song_title,
    bgSongArtist: row.bg_song_artist,
    bgSongAlbumArt: row.bg_song_album_art,
    bgSongPreviewUrl: row.bg_song_preview_url,
    clientEmail: row.client_email,
    clientPhone: row.client_phone,
    // "Family Details" (see PartnerCreateInvitePage.jsx) — same optional
    // groom's/bride's name+parents fields as the consumer `invites` table
    // (see api/_lib/invites.js's rowToInvite()).
    groomName: row.groom_name,
    groomParents: row.groom_parents,
    brideName: row.bride_name,
    brideParents: row.bride_parents,
    createdAt: row.created_at,
  }
}

/** Looks up a partner by their (shared) Supabase Auth user id. */
export async function getPartnerById(id) {
  const { data, error } = await getSupabase()
    .from('partners')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data
}

/**
 * The only way credits_remaining ever changes for a purchase/refund/manual
 * adjustment — wraps the apply_partner_credit_transaction() Postgres
 * function (see the migration's own comment for why this is an RPC and not
 * a read-then-write from here). `credits` is signed: positive for a
 * purchase/refund/adjustment-add, negative for an adjustment-deduction.
 * Throws if the partner doesn't exist or the resulting balance would go
 * negative. (Spending a credit to create an invite goes through
 * spendCreditForInvite() below instead, not this function, since that also
 * has to insert the partner_invites row atomically.)
 */
export async function recordCreditTransaction(partnerId, {
  type,
  credits,
  packageId = null,
  amountPaise = null,
  razorpayOrderId = null,
  razorpayPaymentId = null,
  inviteSlug = null,
  note = null,
}) {
  const { data, error } = await getSupabase().rpc('apply_partner_credit_transaction', {
    p_partner_id: partnerId,
    p_type: type,
    p_credits: credits,
    p_package_id: packageId,
    p_amount_paise: amountPaise,
    p_razorpay_order_id: razorpayOrderId,
    p_razorpay_payment_id: razorpayPaymentId,
    p_invite_slug: inviteSlug,
    p_note: note,
  })
  if (error) throw error
  return rowToTransaction(Array.isArray(data) ? data[0] : data)
}

/**
 * Spends 1 credit and creates a partner_invites row atomically — wraps
 * spend_partner_credit_for_invite() (see the migration's own comment).
 * Throws (with a message the caller pattern-matches on — see
 * createClientInvite() in partnerHandlers.js) if the partner isn't active
 * or has no credits left.
 */
export async function spendCreditForInvite(partnerId, {
  slug,
  templateId,
  coupleNames,
  weddingDate,
  weddingTime,
  venue,
  locationUrl,
  message,
  eventTitle,
  photos,
  events,
  bgSongTitle,
  bgSongArtist,
  bgSongAlbumArt,
  bgSongPreviewUrl,
  clientEmail,
  clientPhone,
  groomName,
  groomParents,
  brideName,
  brideParents,
  hostToken,
}) {
  const { data, error } = await getSupabase().rpc('spend_partner_credit_for_invite', {
    p_partner_id: partnerId,
    p_slug: slug,
    p_template_id: templateId,
    p_couple_names: coupleNames,
    p_wedding_date: weddingDate,
    p_wedding_time: weddingTime,
    p_venue: venue,
    p_location_url: locationUrl,
    p_message: message,
    p_event_title: eventTitle || null,
    p_photos: photos ?? [],
    p_events: events ?? [],
    p_bg_song_title: bgSongTitle || null,
    p_bg_song_artist: bgSongArtist || null,
    p_bg_song_album_art: bgSongAlbumArt || null,
    p_bg_song_preview_url: bgSongPreviewUrl || null,
    p_client_email: clientEmail || null,
    p_client_phone: clientPhone || null,
    p_groom_name: groomName || null,
    p_groom_parents: groomParents || null,
    p_bride_name: brideName || null,
    p_bride_parents: brideParents || null,
    p_host_token: hostToken,
  })
  if (error) throw error
  const row = Array.isArray(data) ? data[0] : data
  // host_token is deliberately spread in ONLY here, once, at creation —
  // rowToPartnerInvite() is an explicit allowlist that never includes it,
  // so every other read (listMyInvites, getPartnerInviteBySlug) can never
  // leak it back out. Mirrors api/invites/index.js's identical
  // `{ ...rowToInvite(data), hostToken: data.host_token }` pattern.
  return { ...rowToPartnerInvite(row), hostToken: row.host_token }
}
