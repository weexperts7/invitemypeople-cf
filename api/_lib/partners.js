// Shared helpers for the partner-portal Serverless Functions
// (api/partners/*, api/admin/*) — mirrors api/_lib/invites.js's
// clean()/rowToInvite() split for the new `partners` /
// `partner_credit_transactions` tables (see
// supabase/migrations/0001_b2b_partner_portal.sql).
import { getSupabase } from './supabase.js'

export function clean(value, max) {
  return String(value ?? '')
    .trim()
    .slice(0, max)
}

// `partners` uses snake_case columns like every other table in this app;
// everything client-side speaks camelCase (see PartnerAuthContext.jsx).
// credit_balance is deliberately never spread in here as a raw field name —
// callers get it as `creditBalance` alongside the rest, same allowlist
// shape as rowToInvite()'s host_token carve-out (nothing sensitive here,
// just consistency).
export function rowToPartner(row) {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name,
    email: row.email,
    phone: row.phone,
    status: row.status,
    rejectedReason: row.rejected_reason,
    approvedAt: row.approved_at,
    reviewedBy: row.reviewed_by,
    brandDisplayName: row.brand_display_name,
    brandLogoUrl: row.brand_logo_url,
    brandPrimaryColor: row.brand_primary_color,
    brandSecondaryColor: row.brand_secondary_color,
    creditBalance: row.credit_balance,
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
 * The only way credit_balance ever changes — wraps the
 * apply_partner_credit_transaction() Postgres function (see the migration's
 * own comment for why this is an RPC and not a read-then-write from here).
 * `credits` is signed: positive for a purchase/refund/adjustment-add,
 * negative for spending a credit or an adjustment-deduction. Throws if the
 * partner doesn't exist or the resulting balance would go negative.
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
  // supabase-js returns a single-row RPC result as a 1-element array.
  return rowToTransaction(Array.isArray(data) ? data[0] : data)
}
