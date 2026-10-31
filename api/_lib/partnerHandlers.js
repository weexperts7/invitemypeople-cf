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
  generateHostToken,
  tokensMatch,
} from './partners.js'
import { isPastDate } from './invites.js'
import {
  cleanPartnerRsvp,
  rowToPartnerWish,
  rowToPartnerRsvp,
  summarizePartnerRsvps,
} from './partnerRsvps.js'
import { getPartnerPackageById } from '../../src/data/partnerPackages.js'
import { createOrder, verifySignature, MIN_AMOUNT_PAISE } from '../../src/utils/razorpay.js'
import { slugify } from '../../src/utils/slugify.js'
import { MAX_PHOTO_BYTES, MAX_PHOTOS, ALLOWED_MIME_TYPES, randomPhotoFilename } from '../../src/utils/photoUpload.js'
import { cleanEvents } from '../../src/utils/cleanEvents.js'
import {
  sendTransactionalEmail,
  buildPartnerApplicationReceivedEmail,
  buildPartnerAdminNotificationEmail,
  buildPartnerApprovedEmail,
  buildPartnerRejectedEmail,
  buildPartnerInviteReadyEmail,
  buildPartnerPasswordResetEmail,
} from '../../src/utils/email.js'
import { SITE_URL } from '../../src/data/routesSeo.js'

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
// POST /api/partners/forgot-password — public. body: { email }
//
// Deliberately does NOT call supabase.auth.resetPasswordForEmail() (the
// client-side call PartnerForgotPasswordPage.jsx used to make) — that
// sends through Supabase Auth's own built-in mailer, which comes from
// Supabase's shared noreply@mail.app.supabase.io address instead of this
// app's own domain and skips Brevo (this app's actual transactional-email
// provider for everything else — see src/utils/email.js) entirely. Instead
// this uses the admin-only generateLink() to produce the same kind of
// Supabase recovery link without Supabase sending anything itself, then
// emails that link out through sendTransactionalEmail() like every other
// email in this app. PartnerResetPasswordPage.jsx, where the link lands,
// doesn't change at all — generateLink() produces the identical
// /auth/v1/verify → redirect flow resetPasswordForEmail()'s email used to.
//
// Always responds ok:true whether or not the email matches an account, so
// this can't be used to enumerate partner/admin emails (mirrors
// PartnerForgotPasswordPage.jsx's own "check your email" copy either way).
// ---------------------------------------------------------------------------
export async function forgotPassword(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const email = clean((req.body || {}).email, 200).toLowerCase()
    if (!email || !email.includes('@')) {
      return res.status(400).json({ ok: false, error: 'a valid email is required' })
    }

    const { data, error } = await getSupabase().auth.admin.generateLink({
      type: 'recovery',
      email,
      options: { redirectTo: `${SITE_URL}/partners/reset-password` },
    })

    // A nonexistent email is the overwhelmingly common "error" here (a
    // partner mistyping their address) — still respond ok:true for it so
    // the response can't be used to probe which emails have accounts.
    // Anything else (Supabase misconfigured, admin API down) is worth
    // logging but still shouldn't surface as a failure to the visitor.
    if (error) {
      console.error('[partners] generateLink failed:', error)
    } else {
      const link = data?.properties?.action_link
      if (link) {
        try {
          await sendTransactionalEmail({ to: email, ...buildPartnerPasswordResetEmail(link) })
        } catch (emailErr) {
          console.error('[partners] password-reset email failed:', emailErr)
        }
      }
    }

    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[partners] forgot-password failed:', err)
    // Still ok:true — see the comment above on not leaking account
    // existence, which an error response here would do just as much as a
    // success one would.
    res.status(200).json({ ok: true })
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

const INVITE_PHOTO_BUCKET = 'partner-invite-photos'

// ---------------------------------------------------------------------------
// POST /api/partners/invites/photos — requires a logged-in partner.
// multipart/form-data (field name "photo"). Mirrors api/photos.js (same
// formidable + size/mime limits from src/utils/photoUpload.js) but uploads
// to its OWN `partner-invite-photos` bucket — never the consumer
// `invite-photos` bucket — same isolation pattern as uploadPartnerLogo
// above. Unlike that one, this IS authenticated: it's only ever called
// from the logged-in dashboard's client-invite builder
// (PartnerCreateInvitePage.jsx), not at signup time.
// ---------------------------------------------------------------------------
export async function uploadPartnerInvitePhoto(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const user = await requireUser(req, res)
  if (!user) return

  try {
    const form = formidable({ maxFileSize: MAX_PHOTO_BYTES, maxFiles: 1 })
    const [, files] = await form.parse(req)
    const file = Array.isArray(files.photo) ? files.photo[0] : files.photo
    if (!file) return res.status(400).json({ ok: false, error: 'no file uploaded' })
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      return res.status(400).json({ ok: false, error: 'only JPEG, PNG, or WebP images are allowed' })
    }

    const buffer = await fs.readFile(file.filepath)
    const filename = randomPhotoFilename(file.mimetype)

    const supabase = getSupabase()
    const { error: uploadError } = await supabase.storage
      .from(INVITE_PHOTO_BUCKET)
      .upload(filename, buffer, { contentType: file.mimetype, upsert: false })
    if (uploadError) throw uploadError

    const { data } = supabase.storage.from(INVITE_PHOTO_BUCKET).getPublicUrl(filename)
    res.status(200).json({ ok: true, url: data.publicUrl })
  } catch (err) {
    console.error('[partners] invite photo upload failed:', err)
    if (/maxFileSize/i.test(err.message || '')) {
      return res.status(400).json({ ok: false, error: 'file is too large (max 4MB)' })
    }
    res.status(500).json({ ok: false, error: 'could not upload photo' })
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
    const eventTitle = clean(body.eventTitle, 80)
    const weddingDate = clean(body.weddingDate, 20)
    const weddingTime = clean(body.weddingTime, 10)
    const venue = clean(body.venue, 200)
    const locationUrl = clean(body.locationUrl, 500)
    const message = clean(body.message, 2000)
    const greetingLine = clean(body.greetingLine, 80)
    const templateId = clean(body.templateId, 80)
    const photos = Array.isArray(body.photos)
      ? body.photos.filter((p) => typeof p === 'string').slice(0, MAX_PHOTOS).map((p) => clean(p, 500))
      : []
    const events = cleanEvents(body.events, clean)
    const bgSongTitle = clean(body.bgSongTitle, 200)
    const bgSongArtist = clean(body.bgSongArtist, 200)
    const bgSongAlbumArt = clean(body.bgSongAlbumArt, 500)
    const bgSongPreviewUrl = clean(body.bgSongPreviewUrl, 500)
    // The CLIENT's own contact details — required so the invitation-ready
    // email below always has somewhere to go. Distinct from the partner's
    // own email/phone on their `partners` row.
    const clientEmail = clean(body.clientEmail, 200)
    const clientPhone = clean(body.clientPhone, 30)
    // "Family Details" (see PartnerCreateInvitePage.jsx) — optional, no
    // required-field validation, same as eventTitle/message above.
    const groomName = clean(body.groomName, 120)
    const groomParents = clean(body.groomParents, 200)
    const brideName = clean(body.brideName, 120)
    const brideParents = clean(body.brideParents, 200)
    const groomPhoto = clean(body.groomPhoto, 500)
    const bridePhoto = clean(body.bridePhoto, 500)
    const venuePhoto = clean(body.venuePhoto, 500)
    if (!coupleNames) return res.status(400).json({ ok: false, error: 'coupleNames is required' })
    if (!weddingDate) return res.status(400).json({ ok: false, error: 'weddingDate is required' })
    if (isPastDate(weddingDate)) return res.status(400).json({ ok: false, error: 'weddingDate cannot be in the past' })
    if (!venue) return res.status(400).json({ ok: false, error: 'venue is required' })
    if (!clientEmail) return res.status(400).json({ ok: false, error: 'clientEmail is required' })
    if (!clientPhone) return res.status(400).json({ ok: false, error: 'clientPhone is required' })

    const base = `p-${slugify(coupleNames) || 'invite'}`

    let lastError = null
    for (let attempt = 0; attempt < MAX_SLUG_ATTEMPTS; attempt++) {
      const slug = `${base}-${randomSlugSuffix()}`
      try {
        const invite = await spendCreditForInvite(user.id, {
          slug,
          templateId: templateId || null,
          coupleNames,
          eventTitle: eventTitle || null,
          weddingDate,
          weddingTime: weddingTime || null,
          venue,
          locationUrl: locationUrl || null,
          message: message || null,
          photos,
          events,
          bgSongTitle: bgSongTitle || null,
          bgSongArtist: bgSongArtist || null,
          bgSongAlbumArt: bgSongAlbumArt || null,
          bgSongPreviewUrl: bgSongPreviewUrl || null,
          clientEmail,
          clientPhone,
          groomName: groomName || null,
          groomParents: groomParents || null,
          brideName: brideName || null,
          brideParents: brideParents || null,
          hostToken: generateHostToken(),
          greetingLine: greetingLine || null,
          groomPhoto: groomPhoto || null,
          bridePhoto: bridePhoto || null,
          venuePhoto: venuePhoto || null,
        })
        console.log(`[partners] ${user.email} created invite "${slug}" for ${coupleNames}`)

        // Invitation-ready email to the CLIENT (couple), not the partner —
        // must never fail or delay the response, same reasoning as POST
        // /api/invites' own order-confirmation email (see that file's
        // comment on why this is awaited, not fire-and-forget).
        try {
          await sendTransactionalEmail({
            to: clientEmail,
            toName: coupleNames,
            ...buildPartnerInviteReadyEmail(invite, rowToPartner(row)),
          })
        } catch (emailErr) {
          console.error('[partners] invite-ready email failed:', emailErr)
        }

        // hostToken never goes back to the partner's own browser — the host
        // dashboard is the CLIENT's private view of their own guest list
        // (see buildPartnerInviteReadyEmail() above, its only delivery
        // path), not something the partner gets standing access to. `invite`
        // above still carries it (spendCreditForInvite() needs to, to build
        // the email); strip it here before it ever leaves the server.
        const { hostToken: _hostToken, ...partnerFacingInvite } = invite
        return res.status(200).json({ ok: true, invite: partnerFacingInvite })
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
// POST /api/partners/rsvps — public, unauthenticated (a guest submitting the
// RSVP form on /p/:slug). Partner-side twin of api/rsvps/index.js, writing
// against `partner_invites`/`partner_rsvps` instead of `invites`/`rsvps` —
// see partner_rsvps' own migration comment for why this is a separate table
// rather than a shared one.
// ---------------------------------------------------------------------------
export async function submitPartnerRsvp(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  try {
    const body = req.body || {}

    // Honeypot: real guests never see this field. Pretend success so bots
    // don't retry, but store nothing — same behavior as the consumer form.
    if (body.website) return res.status(200).json({ ok: true })

    const row = cleanPartnerRsvp(body)
    if (!row.guest_name) {
      return res.status(400).json({ ok: false, error: 'guestName is required' })
    }

    const slug = clean(body.invitationSlug, 200)
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!invite) return res.status(404).json({ ok: false, error: 'invitation not found' })

    const { error: insertError } = await supabase
      .from('partner_rsvps')
      .insert({ ...row, invite_id: invite.id })
    if (insertError) throw insertError

    console.log(`[partners] RSVP: ${row.guest_name} — ${row.attendance} on "${slug}"`)
    res.status(200).json({ ok: true })
  } catch (err) {
    console.error('[partners] failed to save RSVP:', err)
    res.status(500).json({ ok: false, error: 'could not save RSVP' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/wishes?slug=... — public, unauthenticated. Partner-side
// twin of api/wishes.js — the Wishes Wall data source for /p/:slug.
// ---------------------------------------------------------------------------
export async function getPartnerWishes(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const slug = clean(req.query?.slug, 200)

  try {
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    if (!invite) return res.status(200).json({ ok: true, wishes: [] })

    const { data, error } = await supabase
      .from('partner_rsvps')
      .select('guest_name, message, created_at')
      .eq('invite_id', invite.id)
      .neq('message', '')
      .order('created_at', { ascending: false })
    if (error) throw error

    res.status(200).json({ ok: true, wishes: (data || []).map(rowToPartnerWish) })
  } catch (err) {
    console.error(`[partners] failed to read wishes for "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load wishes' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/partners/invites/:slug/host?token=... — the private Host
// Dashboard's only data source for a partner-created invite (/p/:slug/host/
// :hostToken). Partner-side twin of api/invites/[slug]/host.js: `token`
// must match the invite's host_token (generated once, at creation, in
// createClientInvite() above) or nothing is returned — not even whether the
// slug exists. This IS the access control; there's no login system for the
// partner's client either.
// ---------------------------------------------------------------------------
export async function getPartnerInviteHostDashboard(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const slug = clean(pathParam(req, 'slug'), 200)
  const token = clean(req.query?.token, 200)

  try {
    const supabase = getSupabase()

    const { data: invite, error: inviteError } = await supabase
      .from('partner_invites')
      .select('*')
      .eq('slug', slug)
      .maybeSingle()
    if (inviteError) throw inviteError
    // Same 404-shaped 403 whether the slug doesn't exist or the token is
    // wrong for it — don't let a guessed token confirm a slug is real, or
    // vice versa.
    if (!invite || !invite.host_token || !tokensMatch(token, invite.host_token)) {
      return res.status(403).json({ ok: false, error: 'invalid host link' })
    }

    const { data: rsvpRows, error: rsvpError } = await supabase
      .from('partner_rsvps')
      .select('*')
      .eq('invite_id', invite.id)
      .order('created_at', { ascending: false })
    if (rsvpError) throw rsvpError

    const rsvps = rsvpRows || []

    res.status(200).json({
      ok: true,
      invite: {
        slug: invite.slug,
        coupleNames: invite.couple_names,
        eventTitle: invite.event_title,
        weddingDate: invite.wedding_date,
        weddingTime: invite.wedding_time,
        venue: invite.venue,
        clientEmail: invite.client_email,
        clientPhone: invite.client_phone,
        createdAt: invite.created_at,
      },
      rsvps: rsvps.map(rowToPartnerRsvp),
      summary: summarizePartnerRsvps(rsvps),
    })
  } catch (err) {
    console.error(`[partners] failed to load host dashboard for "${slug}":`, err)
    res.status(500).json({ ok: false, error: 'could not load dashboard' })
  }
}

// ---------------------------------------------------------------------------
// GET /api/admin/me — admin only. Deliberately the cheapest possible admin
// route (just the requireAdmin() check, no table reads) — its only job is
// to answer "is this login on the ADMIN_EMAILS allowlist" for
// AdminLoginPage.jsx to call right after Supabase Auth accepts a
// email/password, so a valid partner login gets rejected on the login
// screen itself instead of being let in and finding out via a 403 on
// /admin/dashboard (see that page's AdminForbidden fallback, which stays
// as a second line of defense for a session that reaches an /admin/* page
// some other way).
// ---------------------------------------------------------------------------
export async function adminGetMe(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  res.status(200).json({ ok: true, email: admin.email })
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

const STATS_STATUSES = ['pending_approval', 'active', 'rejected', 'suspended']
const STATS_WINDOW_DAYS = 30
const STATS_WINDOW_MS = STATS_WINDOW_DAYS * 24 * 60 * 60 * 1000

// ---------------------------------------------------------------------------
// GET /api/admin/stats — admin only. Everything AdminDashboardPage.jsx
// renders: partner funnel counts, revenue/credits totals (all-time and the
// trailing 30 days), a day-by-day revenue series for the chart, a
// per-partner leaderboard, and recent activity feeds. Deliberately reads
// the three tables in full and reduces in JS rather than hand-rolling
// GROUP BY RPCs — matches adminListPartners()'s "no realistic volume yet"
// assumption just above, and keeps every number on this page derived from
// the exact same three reads (no risk of a SQL aggregate and a JS one
// silently drifting apart).
// ---------------------------------------------------------------------------
export async function adminGetStats(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  try {
    const supabase = getSupabase()
    const [
      { data: partnerRows, error: partnersError },
      { data: txRows, error: txError },
      { data: inviteRows, error: invitesError },
    ] = await Promise.all([
      supabase
        .from('partners')
        .select('id, business_name, status, credits_remaining, created_at, approved_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('partner_credit_transactions')
        .select('partner_id, type, credits, amount_paise, package_id, created_at')
        .order('created_at', { ascending: false }),
      supabase
        .from('partner_invites')
        .select('id, partner_id, couple_names, venue, created_at')
        .order('created_at', { ascending: false }),
    ])
    if (partnersError) throw partnersError
    if (txError) throw txError
    if (invitesError) throw invitesError

    const partners = partnerRows || []
    const transactions = txRows || []
    const invites = inviteRows || []

    const cutoff = Date.now() - STATS_WINDOW_MS
    const isRecent = (isoDate) => new Date(isoDate).getTime() >= cutoff

    const partnersByStatus = Object.fromEntries(STATS_STATUSES.map((s) => [s, 0]))
    for (const p of partners) {
      if (partnersByStatus[p.status] !== undefined) partnersByStatus[p.status]++
    }

    const purchases = transactions.filter((t) => t.type === 'purchase')
    const totalRevenuePaise = purchases.reduce((sum, t) => sum + (t.amount_paise || 0), 0)
    const totalCreditsSold = purchases.reduce((sum, t) => sum + (t.credits || 0), 0)
    const totalCreditsRemaining = partners.reduce((sum, p) => sum + (p.credits_remaining || 0), 0)
    const recentPurchases = purchases.filter((t) => isRecent(t.created_at))
    const revenueLast30dPaise = recentPurchases.reduce((sum, t) => sum + (t.amount_paise || 0), 0)

    // Day-by-day revenue for the trailing window, zero-filled so the chart
    // never has a gap for a day with no purchases.
    const dayBuckets = new Map()
    for (let i = STATS_WINDOW_DAYS - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      dayBuckets.set(key, 0)
    }
    for (const t of recentPurchases) {
      const key = new Date(t.created_at).toISOString().slice(0, 10)
      if (dayBuckets.has(key)) dayBuckets.set(key, dayBuckets.get(key) + (t.amount_paise || 0))
    }
    const revenueByDay = Array.from(dayBuckets.entries()).map(([date, amountPaise]) => ({ date, amountPaise }))

    // Same zero-filled day-bucket approach, for new-partner signups — lets
    // the dashboard show growth momentum alongside revenue instead of just
    // a single 30-day total.
    const signupBuckets = new Map()
    for (let i = STATS_WINDOW_DAYS - 1; i >= 0; i--) {
      const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
      signupBuckets.set(key, 0)
    }
    for (const p of partners) {
      const key = new Date(p.created_at).toISOString().slice(0, 10)
      if (signupBuckets.has(key)) signupBuckets.set(key, signupBuckets.get(key) + 1)
    }
    const signupsByDay = Array.from(signupBuckets.entries()).map(([date, count]) => ({ date, count }))

    // Per-partner rollups, for the leaderboard.
    const revenueByPartner = new Map()
    for (const t of purchases) {
      revenueByPartner.set(t.partner_id, (revenueByPartner.get(t.partner_id) || 0) + (t.amount_paise || 0))
    }
    const invitesByPartner = new Map()
    for (const inv of invites) {
      invitesByPartner.set(inv.partner_id, (invitesByPartner.get(inv.partner_id) || 0) + 1)
    }
    const topPartners = partners
      .map((p) => ({
        id: p.id,
        businessName: p.business_name,
        status: p.status,
        revenuePaise: revenueByPartner.get(p.id) || 0,
        invitesCreated: invitesByPartner.get(p.id) || 0,
        creditsRemaining: p.credits_remaining,
      }))
      .sort((a, b) => b.revenuePaise - a.revenuePaise || b.invitesCreated - a.invitesCreated)
      .slice(0, 8)

    // Program health, at a glance: an activation funnel (how many partners
    // make it from signup all the way to actually shipping an invite to a
    // client), a per-package breakdown (which tier sells), and a "needs
    // attention" list (approved partners who bought credits or not but have
    // never actually created an invite) — the numbers an admin actually
    // needs to judge whether the portal is gaining traction, not just its
    // running totals.
    const approvedPartners = partners.filter((p) => p.approved_at)
    const avgApprovalHours =
      approvedPartners.length > 0
        ? approvedPartners.reduce(
            (sum, p) => sum + (new Date(p.approved_at).getTime() - new Date(p.created_at).getTime()),
            0,
          ) /
          approvedPartners.length /
          (1000 * 60 * 60)
        : null

    const funnel = {
      signedUp: partners.length,
      approved: approvedPartners.length,
      purchasedCredits: revenueByPartner.size,
      createdInvite: invitesByPartner.size,
    }

    const packageStats = new Map()
    for (const t of purchases) {
      const key = t.package_id || 'unknown'
      const entry = packageStats.get(key) || { packageId: key, purchases: 0, creditsSold: 0, revenuePaise: 0 }
      entry.purchases += 1
      entry.creditsSold += t.credits || 0
      entry.revenuePaise += t.amount_paise || 0
      packageStats.set(key, entry)
    }
    const packageBreakdown = Array.from(packageStats.values())
      .map((entry) => ({ ...entry, label: getPartnerPackageById(entry.packageId)?.label || entry.packageId }))
      .sort((a, b) => b.revenuePaise - a.revenuePaise)

    const activePartnerCount = partnersByStatus.active || 0
    const health = {
      avgApprovalHours,
      avgRevenuePerActivePartnerPaise: activePartnerCount > 0 ? Math.round(totalRevenuePaise / activePartnerCount) : 0,
      avgInvitesPerActivePartner: activePartnerCount > 0 ? invites.length / activePartnerCount : 0,
      creditUtilizationPct:
        totalCreditsSold > 0
          ? Math.round(((totalCreditsSold - totalCreditsRemaining) / totalCreditsSold) * 100)
          : 0,
    }

    // Active partners who've never spent a credit on a client invite —
    // whether they never bought, or bought and haven't shipped anything
    // yet. Oldest-first, so the partner waiting longest surfaces first.
    const needsAttention = partners
      .filter((p) => p.status === 'active' && !invitesByPartner.has(p.id))
      .sort((a, b) => new Date(a.created_at) - new Date(b.created_at))
      .slice(0, 6)
      .map((p) => ({
        id: p.id,
        businessName: p.business_name,
        creditsRemaining: p.credits_remaining,
        hasPurchased: revenueByPartner.has(p.id),
        createdAt: p.created_at,
      }))

    const partnerNameById = new Map(partners.map((p) => [p.id, p.business_name]))
    const recentTransactions = purchases.slice(0, 8).map((t) => ({
      partnerId: t.partner_id,
      businessName: partnerNameById.get(t.partner_id) || 'Unknown partner',
      credits: t.credits,
      amountPaise: t.amount_paise,
      packageId: t.package_id,
      createdAt: t.created_at,
    }))
    const recentInvites = invites.slice(0, 8).map((inv) => ({
      id: inv.id,
      partnerId: inv.partner_id,
      businessName: partnerNameById.get(inv.partner_id) || 'Unknown partner',
      coupleNames: inv.couple_names,
      venue: inv.venue,
      createdAt: inv.created_at,
    }))
    const recentSignups = partners.slice(0, 8).map((p) => ({
      id: p.id,
      businessName: p.business_name,
      status: p.status,
      createdAt: p.created_at,
    }))

    res.status(200).json({
      ok: true,
      stats: {
        generatedAt: new Date().toISOString(),
        windowDays: STATS_WINDOW_DAYS,
        partners: {
          total: partners.length,
          ...partnersByStatus,
          newLast30d: partners.filter((p) => isRecent(p.created_at)).length,
        },
        revenue: {
          totalPaise: totalRevenuePaise,
          last30dPaise: revenueLast30dPaise,
          byDay: revenueByDay,
        },
        credits: {
          totalSold: totalCreditsSold,
          totalRemaining: totalCreditsRemaining,
        },
        invites: {
          total: invites.length,
          last30d: invites.filter((i) => isRecent(i.created_at)).length,
        },
        signupsByDay,
        funnel,
        health,
        packageBreakdown,
        needsAttention,
        topPartners,
        recentTransactions,
        recentInvites,
        recentSignups,
      },
    })
  } catch (err) {
    console.error('[admin] failed to load stats:', err)
    res.status(500).json({ ok: false, error: 'could not load dashboard stats' })
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
