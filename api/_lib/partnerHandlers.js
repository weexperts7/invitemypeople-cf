// Core logic for every B2B Partner Portal route — imported as-is by BOTH
// the Vercel Serverless Functions under api/partners/* and api/admin/*
// (thin req/res wrappers) AND their local-dev Express registrations in
// server/index.js. This is a deliberate departure from the split the rest
// of this app uses (api/invites/*.js vs. server/index.js's own duplicated
// route bodies): that duplication exists because dev and prod read/write
// genuinely different stores (a flat JSON file vs. Supabase). Partner
// accounts need real Supabase Auth in both environments — there's no flat-
// file equivalent for a login system — so there's no divergent local-dev
// logic to keep separate, and sharing one handler per route means a bug
// fix or a security check only has to be made once.
//
// Every exported function has the shape `(req, res) => Promise<void>`,
// which both Express route handlers and Vercel's `export default` function
// signature already satisfy — req.method/req.headers/req.query/req.body
// and res.status().json() all read the same either way.
import { getSupabase } from './supabase.js'
import { requireUser, requireAdmin } from './auth.js'
import { clean, rowToPartner, rowToTransaction, getPartnerById, recordCreditTransaction } from './partners.js'
import { getPartnerPackageById } from '../../src/data/partnerPackages.js'
import { createOrder, verifySignature, MIN_AMOUNT_PAISE } from '../../src/utils/razorpay.js'
import {
  sendTransactionalEmail,
  buildPartnerApplicationReceivedEmail,
  buildPartnerAdminNotificationEmail,
  buildPartnerApprovedEmail,
  buildPartnerRejectedEmail,
} from '../../src/utils/email.js'

const MIN_PASSWORD_LENGTH = 8

function adminNotificationRecipients() {
  return String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

// ---------------------------------------------------------------------------
// POST /api/partners/signup — public.
// ---------------------------------------------------------------------------
export async function signupPartner(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}
    const businessName = clean(body.businessName, 200)
    const contactName = clean(body.contactName, 120)
    const email = clean(body.email, 200).toLowerCase()
    const phone = clean(body.phone, 30)
    const password = String(body.password ?? '')

    if (!businessName) return res.status(400).json({ ok: false, error: 'businessName is required' })
    if (!contactName) return res.status(400).json({ ok: false, error: 'contactName is required' })
    if (!email || !email.includes('@')) return res.status(400).json({ ok: false, error: 'a valid email is required' })
    if (password.length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ ok: false, error: `password must be at least ${MIN_PASSWORD_LENGTH} characters` })
    }

    const supabase = getSupabase()

    // Skips Supabase Auth's own confirmation-email flow (email_confirm:
    // true) — this app already sends all transactional email through
    // Brevo (see src/utils/email.js), so the actual gate a new signup has
    // to clear is admin approval below, not a second "confirm your email"
    // step that would need its own SMTP setup inside the Supabase project.
    const { data: created, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { business_name: businessName },
    })
    if (createError) {
      // Supabase's own conflict signal for "this email already has an
      // account" — surfaced as 409 rather than the generic 500 below so
      // the signup form can show "you already have an account" instead of
      // a scary error.
      if (createError.status === 422 || /already registered|already exists/i.test(createError.message || '')) {
        return res.status(409).json({ ok: false, error: 'an account with this email already exists' })
      }
      throw createError
    }

    const authUser = created.user
    const { data: partnerRow, error: insertError } = await supabase
      .from('partners')
      .insert({
        id: authUser.id,
        business_name: businessName,
        contact_name: contactName,
        email,
        phone: phone || null,
      })
      .select()
      .single()

    if (insertError) {
      // Don't leave an orphaned auth user behind that permanently blocks
      // this email from ever signing up again.
      await supabase.auth.admin.deleteUser(authUser.id).catch((cleanupErr) => {
        console.error('[partners] failed to roll back auth user after insert failure:', cleanupErr)
      })
      throw insertError
    }

    const partner = rowToPartner(partnerRow)

    // Neither email is on the critical path — a partner whose application
    // was saved successfully should never see an error because Brevo (or
    // ADMIN_EMAILS) isn't configured.
    try {
      await sendTransactionalEmail({
        to: partner.email,
        toName: partner.contactName,
        ...buildPartnerApplicationReceivedEmail(partner),
      })
    } catch (err) {
      console.error('[partners] application-received email failed:', err)
    }
    const admins = adminNotificationRecipients()
    if (admins.length > 0) {
      try {
        await sendTransactionalEmail({
          to: admins[0],
          ...buildPartnerAdminNotificationEmail(partner),
        })
      } catch (err) {
        console.error('[partners] admin-notification email failed:', err)
      }
    }

    console.log(`[partners] new signup pending review: ${partner.email} (${partner.businessName})`)
    res.status(200).json({ ok: true, partner })
  } catch (err) {
    console.error('[partners] signup failed:', err)
    res.status(500).json({ ok: false, error: 'could not create your account' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/me — requires a logged-in partner.
// ---------------------------------------------------------------------------
export async function getMyProfile(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const row = await getPartnerById(user.id)
    if (!row) return res.status(404).json({ ok: false, error: 'partner profile not found' })
    res.status(200).json({ ok: true, partner: rowToPartner(row) })
  } catch (err) {
    console.error('[partners] failed to load profile:', err)
    res.status(500).json({ ok: false, error: 'could not load your profile' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/partners/branding — requires a logged-in, approved partner.
// Updates the white-label fields plus contact_name/phone. Deliberately
// can't touch business_name, email, or status — those are either the
// account's identity or the approval workflow's job, not self-service.
// ---------------------------------------------------------------------------
export async function updateBranding(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const row = await getPartnerById(user.id)
    if (!row) return res.status(404).json({ ok: false, error: 'partner profile not found' })
    if (row.status !== 'approved') {
      return res.status(403).json({ ok: false, error: 'your account must be approved before branding can be set' })
    }

    const body = req.body || {}
    const update = {
      contact_name: clean(body.contactName, 120) || row.contact_name,
      phone: clean(body.phone, 30) || row.phone,
      brand_display_name: clean(body.brandDisplayName, 120),
      brand_logo_url: clean(body.brandLogoUrl, 500),
      brand_primary_color: clean(body.brandPrimaryColor, 20),
      brand_secondary_color: clean(body.brandSecondaryColor, 20),
    }

    const { data, error } = await getSupabase()
      .from('partners')
      .update(update)
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error

    res.status(200).json({ ok: true, partner: rowToPartner(data) })
  } catch (err) {
    console.error('[partners] failed to update branding:', err)
    res.status(500).json({ ok: false, error: 'could not save your branding' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/credits — requires a logged-in partner. Balance + the
// ledger backing it (see partner_credit_transactions in the migration).
// ---------------------------------------------------------------------------
export async function getMyCredits(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const supabase = getSupabase()
    const [{ data: partnerRow, error: partnerError }, { data: txRows, error: txError }] = await Promise.all([
      supabase.from('partners').select('credit_balance').eq('id', user.id).maybeSingle(),
      supabase
        .from('partner_credit_transactions')
        .select('*')
        .eq('partner_id', user.id)
        .order('created_at', { ascending: false })
        .limit(100),
    ])
    if (partnerError) throw partnerError
    if (txError) throw txError
    if (!partnerRow) return res.status(404).json({ ok: false, error: 'partner profile not found' })

    res.status(200).json({
      ok: true,
      balance: partnerRow.credit_balance,
      transactions: (txRows || []).map(rowToTransaction),
    })
  } catch (err) {
    console.error('[partners] failed to load credits:', err)
    res.status(500).json({ ok: false, error: 'could not load your credit history' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/partners/purchase/create-order — requires a logged-in, approved
// partner. Mirrors api/create-order.js: re-derives the package price on
// the server from `packageId` rather than trusting a client-sent amount.
// ---------------------------------------------------------------------------
export async function createPurchaseOrder(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const row = await getPartnerById(user.id)
    if (!row) return res.status(404).json({ ok: false, error: 'partner profile not found' })
    if (row.status !== 'approved') {
      return res.status(403).json({ ok: false, error: 'your account must be approved before purchasing credits' })
    }

    const packageId = clean((req.body || {}).packageId, 60)
    const pkg = getPartnerPackageById(packageId)
    if (!pkg) return res.status(400).json({ ok: false, error: 'unknown package' })
    if (pkg.pricePaise < MIN_AMOUNT_PAISE) {
      return res.status(500).json({ ok: false, error: 'package is misconfigured' })
    }

    const order = await createOrder({
      amount: pkg.pricePaise,
      currency: 'INR',
      receipt: `partner_${user.id}_${Date.now()}`,
    })
    res.status(200).json({ ok: true, ...order, package: pkg })
  } catch (err) {
    console.error('[partners] failed to create purchase order:', err)
    if (err.statusCode === 401) {
      return res.status(401).json({ ok: false, error: 'Razorpay authentication failed' })
    }
    res.status(500).json({ ok: false, error: 'could not start checkout' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/partners/purchase/verify — requires a logged-in, approved
// partner. Mirrors api/verify-payment.js's signature check, then credits
// the ledger. This is the ONLY place a 'purchase' transaction is ever
// recorded.
// ---------------------------------------------------------------------------
export async function verifyPurchase(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const body = req.body || {}
    const orderId = clean(body.razorpay_order_id, 100)
    const paymentId = clean(body.razorpay_payment_id, 100)
    const signature = clean(body.razorpay_signature, 200)
    const packageId = clean(body.packageId, 60)
    if (!orderId || !paymentId || !signature) {
      return res.status(400).json({ ok: false, error: 'missing payment fields' })
    }
    const pkg = getPartnerPackageById(packageId)
    if (!pkg) return res.status(400).json({ ok: false, error: 'unknown package' })

    if (!verifySignature({ orderId, paymentId, signature })) {
      return res.status(400).json({ ok: false, error: 'signature mismatch' })
    }

    const transaction = await recordCreditTransaction(user.id, {
      type: 'purchase',
      credits: pkg.credits,
      packageId: pkg.id,
      amountPaise: pkg.pricePaise,
      razorpayOrderId: orderId,
      razorpayPaymentId: paymentId,
      note: `Purchased ${pkg.label} package (${pkg.credits} credits)`,
    })

    console.log(`[partners] ${user.email} purchased ${pkg.credits} credits (${pkg.id})`)
    res.status(200).json({ ok: true, transaction, balance: transaction.balanceAfter })
  } catch (err) {
    console.error('[partners] purchase verification failed:', err)
    res.status(500).json({ ok: false, error: 'could not confirm your purchase' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/partners?status=pending — admin only.
// ---------------------------------------------------------------------------
export async function adminListPartners(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const status = clean(req.query?.status, 20)
    let query = getSupabase().from('partners').select('*').order('created_at', { ascending: false })
    if (status) query = query.eq('status', status)

    const { data, error } = await query
    if (error) throw error
    res.status(200).json({ ok: true, partners: (data || []).map(rowToPartner) })
  } catch (err) {
    console.error('[admin] failed to list partners:', err)
    res.status(500).json({ ok: false, error: 'could not load partners' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/partners/approve — admin only. body: { partnerId }
// ---------------------------------------------------------------------------
export async function adminApprovePartner(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const partnerId = clean((req.body || {}).partnerId, 60)
    if (!partnerId) return res.status(400).json({ ok: false, error: 'partnerId is required' })

    const { data, error } = await getSupabase()
      .from('partners')
      .update({ status: 'approved', approved_at: new Date().toISOString(), reviewed_by: admin.email, rejected_reason: null })
      .eq('id', partnerId)
      .select()
      .single()
    if (error) throw error

    const partner = rowToPartner(data)
    try {
      await sendTransactionalEmail({
        to: partner.email,
        toName: partner.contactName,
        ...buildPartnerApprovedEmail(partner),
      })
    } catch (err) {
      console.error('[admin] approval email failed:', err)
    }

    console.log(`[admin] ${admin.email} approved partner ${partner.email}`)
    res.status(200).json({ ok: true, partner })
  } catch (err) {
    console.error('[admin] failed to approve partner:', err)
    res.status(500).json({ ok: false, error: 'could not approve partner' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/admin/partners/reject — admin only. body: { partnerId, reason }
// ---------------------------------------------------------------------------
export async function adminRejectPartner(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const partnerId = clean((req.body || {}).partnerId, 60)
    const reason = clean((req.body || {}).reason, 500)
    if (!partnerId) return res.status(400).json({ ok: false, error: 'partnerId is required' })

    const { data, error } = await getSupabase()
      .from('partners')
      .update({ status: 'rejected', rejected_reason: reason || null, reviewed_by: admin.email, approved_at: null })
      .eq('id', partnerId)
      .select()
      .single()
    if (error) throw error

    const partner = rowToPartner(data)
    try {
      await sendTransactionalEmail({
        to: partner.email,
        toName: partner.contactName,
        ...buildPartnerRejectedEmail(partner),
      })
    } catch (err) {
      console.error('[admin] rejection email failed:', err)
    }

    console.log(`[admin] ${admin.email} rejected partner ${partner.email}`)
    res.status(200).json({ ok: true, partner })
  } catch (err) {
    console.error('[admin] failed to reject partner:', err)
    res.status(500).json({ ok: false, error: 'could not reject partner' })
  }
}
