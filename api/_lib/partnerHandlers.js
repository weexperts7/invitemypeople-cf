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
// CRITICAL, by design: nothing in this file reads, writes, or imports
// anything from the consumer invites/RSVP code path (api/invites/*,
// api/rsvps, api/_lib/invites.js, any template component, PaymentModal.jsx,
// CreateInvitePage.jsx). Partner-created invites live in their own
// `partner_invites` table and their own /p/:slug viewer — see
// B2B-PARTNER-PORTAL-SETUP.md.
//
// Every exported function has the shape `(req, res) => Promise<void>`,
// which both Express route handlers and Vercel's `export default` function
// signature already satisfy — req.method/req.headers/req.query/req.params/
// req.body and res.status().json() all read the same either way. Slug path
// params specifically are read via `req.query?.slug ?? req.params?.slug`
// since Vercel's [slug].js puts it on req.query and Express's `:slug` route
// puts it on req.params.
import formidable from 'formidable'
import fs from 'node:fs/promises'
import { getSupabase } from './supabase.js'
import { requireUser, requireAdmin } from './auth.js'
import {
  clean,
  randomSlugSuffix,
  rowToPartner,
  rowToTransaction,
  rowToPartnerInvite,
  getPartnerById,
  recordCreditTransaction,
  spendCreditForInvite,
} from './partners.js'
import { getPartnerPackageById } from '../../src/data/partnerPackages.js'
import { createOrder, verifySignature, MIN_AMOUNT_PAISE } from '../../src/utils/razorpay.js'
import { slugify } from '../../src/utils/slugify.js'
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

function pathParam(req, name) {
  return req.query?.[name] ?? req.params?.[name]
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
    const address = clean(body.address, 500)
    const phone = clean(body.phone, 30)
    const email = clean(body.email, 200).toLowerCase()
    const logoUrl = clean(body.logoUrl, 500)
    const password = String(body.password ?? '')

    if (!businessName) return res.status(400).json({ ok: false, error: 'businessName is required' })
    if (!address) return res.status(400).json({ ok: false, error: 'address is required' })
    if (!phone) return res.status(400).json({ ok: false, error: 'phone is required' })
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
        address,
        phone,
        email,
        logo_url: logoUrl || null,
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
        toName: partner.businessName,
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
// POST /api/partners/profile — requires a logged-in partner. Updates
// address/phone/logoUrl (and businessName) — not `status` or `email`,
// which only the approval workflow / the Auth account itself can change.
// ---------------------------------------------------------------------------
export async function updateProfile(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const row = await getPartnerById(user.id)
    if (!row) return res.status(404).json({ ok: false, error: 'partner profile not found' })

    const body = req.body || {}
    const update = {
      business_name: clean(body.businessName, 200) || row.business_name,
      address: clean(body.address, 500) || row.address,
      phone: clean(body.phone, 30) || row.phone,
      logo_url: body.logoUrl !== undefined ? clean(body.logoUrl, 500) || null : row.logo_url,
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
    console.error('[partners] failed to update profile:', err)
    res.status(500).json({ ok: false, error: 'could not save your profile' })
  }
}

const MAX_LOGO_BYTES = 4 * 1024 * 1024
const ALLOWED_LOGO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const LOGO_BUCKET = 'partner-logos'

function extensionForMime(mime) {
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  return 'jpg'
}

function randomLogoFilename(mime) {
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`
  return `${rand}.${extensionForMime(mime)}`
}

// ---------------------------------------------------------------------------
// POST /api/partners/logo — public, multipart/form-data (field name
// "logo"). Mirrors api/photos.js's shape (formidable + Supabase Storage)
// but uploads to its OWN `partner-logos` bucket — never the consumer
// `invite-photos` bucket — and is called unauthenticated for the same
// reason api/photos.js is: at signup time there's no partner account (and
// no session) yet to authenticate. The signup form uploads the logo first,
// gets back a URL, then sends that URL along with the rest of the
// application in POST /api/partners/signup above.
// ---------------------------------------------------------------------------
export async function uploadPartnerLogo(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const form = formidable({ maxFileSize: MAX_LOGO_BYTES, maxFiles: 1 })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.logo) ? files.logo[0] : files.logo
    if (!file) return res.status(400).json({ ok: false, error: 'no file uploaded' })
    if (!ALLOWED_LOGO_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ ok: false, error: 'only JPEG, PNG, or WebP images are allowed' })
    }

    const buffer = await fs.readFile(file.filepath)
    const filename = randomLogoFilename(file.mimetype)

    const supabase = getSupabase()
    const { error: uploadError } = await supabase.storage
      .from(LOGO_BUCKET)
      .upload(filename, buffer, { contentType: file.mimetype, upsert: false })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(LOGO_BUCKET).getPublicUrl(filename)
    res.status(200).json({ ok: true, url: data.publicUrl })
  } catch (err) {
    console.error('[partners] logo upload failed:', err)
    if (/maxFileSize/i.test(err.message || '')) {
      return res.status(400).json({ ok: false, error: 'file is too large (max 4MB)' })
    }
    res.status(500).json({ ok: false, error: 'could not upload logo' })
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
      supabase.from('partners').select('credits_remaining').eq('id', user.id).maybeSingle(),
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
      creditsRemaining: partnerRow.credits_remaining,
      transactions: (txRows || []).map(rowToTransaction),
    })
  } catch (err) {
    console.error('[partners] failed to load credits:', err)
    res.status(500).json({ ok: false, error: 'could not load your credit history' })
  }
}

// ---------------------------------------------------------------------------
// POST /api/partners/purchase/create-order — requires a logged-in, active
// partner. Mirrors api/create-order.js: re-derives the package price on
// the server from `packageId` rather than trusting a client-sent amount.
// Uses the SAME Razorpay account/keys as the consumer checkout (this is
// just "our real-time payment gateway flow" reused, not the consumer
// checkout flow itself — no consumer file or table is touched).
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
    if (row.status !== 'active') {
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
      // Razorpay caps `receipt` at 56 chars — a full UUID partner id plus a
      // millisecond timestamp blows past that (58+), which Razorpay
      // rejects as a 400 at order-creation time. Base36 timestamp + the
      // partner id's first 8 hex chars is enough to keep receipts
      // human-traceable back to a partner without hitting the limit.
      receipt: `p_${user.id.slice(0, 8)}_${Date.now().toString(36)}`,
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
// POST /api/partners/purchase/verify — requires a logged-in, active
// partner. Mirrors api/verify-payment.js's signature check, then credits
// the ledger instantly. This is the ONLY place a 'purchase' transaction is
// ever recorded.
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
    res.status(200).json({ ok: true, transaction, creditsRemaining: transaction.balanceAfter })
  } catch (err) {
    console.error('[partners] purchase verification failed:', err)
    res.status(500).json({ ok: false, error: 'could not confirm your purchase' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/invites — requires a logged-in partner. Lists this
// partner's own client invites (their credit-spend history's other half).
// POST /api/partners/invites — requires a logged-in, active partner with
// at least 1 credit. Spends 1 credit and creates a shareable /p/:slug
// invite — see spend_partner_credit_for_invite() in the migration.
// ---------------------------------------------------------------------------
export async function partnerInvitesIndex(req, res) {
  if (req.method === 'GET') return listMyInvites(req, res)
  if (req.method === 'POST') return createClientInvite(req, res)
  res.setHeader('Allow', 'GET, POST')
  return res.status(405).json({ ok: false, error: 'method not allowed' })
}

export async function listMyInvites(req, res) {
  const user = await requireUser(req, res)
  if (!user) return

  try {
    const { data, error } = await getSupabase()
      .from('partner_invites')
      .select('*')
      .eq('partner_id', user.id)
      .order('created_at', { ascending: false })
      .limit(200)
    if (error) throw error
    res.status(200).json({ ok: true, invites: (data || []).map(rowToPartnerInvite) })
  } catch (err) {
    console.error('[partners] failed to list invites:', err)
    res.status(500).json({ ok: false, error: 'could not load your invites' })
  }
}

const MAX_SLUG_ATTEMPTS = 6

export async function createClientInvite(req, res) {
  const user = await requireUser(req, res)
  if (!user) return

  try {
    const row = await getPartnerById(user.id)
    if (!row) return res.status(404).json({ ok: false, error: 'partner profile not found' })
    if (row.status !== 'active') {
      return res.status(403).json({ ok: false, error: 'your account must be approved before creating invites' })
    }
    if (row.credits_remaining < 1) {
      return res.status(402).json({ ok: false, error: 'you have no credits remaining — purchase a package first' })
    }

    const body = req.body || {}
    const coupleNames = clean(body.coupleNames, 120)
    const weddingDate = clean(body.weddingDate, 20)
    const weddingTime = clean(body.weddingTime, 10)
    const venue = clean(body.venue, 200)
    const locationUrl = clean(body.locationUrl, 500)
    const message = clean(body.message, 2000)
    const templateId = clean(body.templateId, 80)
    if (!coupleNames) return res.status(400).json({ ok: false, error: 'coupleNames is required' })
    if (!weddingDate) return res.status(400).json({ ok: false, error: 'weddingDate is required' })
    if (!venue) return res.status(400).json({ ok: false, error: 'venue is required' })

    const base = `p-${slugify(coupleNames) || 'invite'}`

    let lastError = null
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const slug = `${base}-${randomSlugSuffix()}`
      try {
        const invite = await spendCreditForInvite(user.id, {
          slug,
          templateId: templateId || null,
          coupleNames,
          weddingDate,
          weddingTime: weddingTime || null,
          venue,
          locationUrl: locationUrl || null,
          message: message || null,
        })
        console.log(`[partners] ${user.email} created invite "${slug}" for ${coupleNames}`)
        return res.status(200).json({ ok: true, invite })
      } catch (err) {
        lastError = err
        // Postgres unique_violation on partner_invites.slug — vanishingly
        // unlikely (random suffix), but retry with a fresh one instead of
        // failing (and NOT re-charging a credit, since the whole insert
        // rolled back with it) the way api/invites/index.js already does
        // for the consumer table's own slug collisions.
        if (!/duplicate key|unique constraint/i.test(err.message || '')) break
      }
    }

    if (/insufficient credits/i.test(lastError?.message || '')) {
      return res.status(402).json({ ok: false, error: 'you have no credits remaining — purchase a package first' })
    }
    if (/is not active/i.test(lastError?.message || '')) {
      return res.status(403).json({ ok: false, error: 'your account must be approved before creating invites' })
    }
    throw lastError || new Error('could not generate a unique slug')
  } catch (err) {
    console.error('[partners] failed to create client invite:', err)
    res.status(500).json({ ok: false, error: 'could not create the invite' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/invites/:slug — public, unauthenticated (the shareable
// /p/:slug link itself). Returns the invite plus enough of its owning
// partner's profile to render the white-label badge — never anything else
// from `partners` (no email/phone/status/credits).
// ---------------------------------------------------------------------------
export async function getPartnerInviteBySlug(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const slug = clean(pathParam(req, 'slug'), 200)
  if (!slug) return res.status(400).json({ ok: false, error: 'slug is required' })

  try {
    const { data: inviteRow, error: inviteError } = await getSupabase()
      .from('partner_invites')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!inviteRow) return res.status(404).json({ ok: false, error: 'invite not found' })

    const { data: partnerRow, error: partnerError } = await getSupabase()
      .from('partners')
      .select('business_name, address, logo_url')
      .eq('id', inviteRow.partner_id)
      .maybeSingle()
    if (partnerError) throw partnerError

    res.status(200).json({
      ok: true,
      invite: rowToPartnerInvite(inviteRow),
      partner: partnerRow
        ? { businessName: partnerRow.business_name, address: partnerRow.address, logoUrl: partnerRow.logo_url }
        : null,
    })
  } catch (err) {
    console.error(`[partners] failed to load invite "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load this invitation' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/partners?status=pending_approval — admin only.
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
      .update({ status: 'active', approved_at: new Date().toISOString(), reviewed_by: admin.email, rejected_reason: null })
      .eq('id', partnerId)
      .select()
      .single()
    if (error) throw error

    const partner = rowToPartner(data)
    try {
      await sendTransactionalEmail({
        to: partner.email,
        toName: partner.businessName,
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
        toName: partner.businessName,
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
