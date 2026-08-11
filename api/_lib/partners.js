// Shared helpers for the partner-portal Serverless Functions
// (api/partners/*, api/admin/*) — mirrors api/_lib/invites.js's
// clean()/rowToInvite() split for the new `partners` / `partner_invites` /
// `partner_credit_transactions` tables (see
// supabase/migrations/0001_b2b_partner_portal.sql). None of these touch
// the existing `invites`/`rsvps` tables in any way.
import { randomBytes } from 'node:crypto'
import { getSupabase } from './supabase.js'

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

export function randomSlugSuffix() {
  return randomBytes(4).toString('hex')
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
    weddingDate: row.wedding_date,
    weddingTime: row.wedding_time,
    venue: row.venue,
    locationUrl: row.location_url,
    message: row.message,
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
  })
  if (error) throw error
  return rowToPartnerInvite(Array.isArray(data) ? data[0] : data)
}
