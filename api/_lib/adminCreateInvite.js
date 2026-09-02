// POST /api/admin/create-invite — admin only. Lets a Super Admin mint a
// live invite straight from the Admin Panel (see
// src/pages/admin/AdminCreateInvitePage.jsx), bypassing BOTH the B2C
// Razorpay checkout (api/create-order.js / api/verify-payment.js /
// api/invites/index.js) and the B2B partner-credit spend
// (spend_partner_credit_for_invite() / api/_lib/partners.js#spendCreditForInvite)
// — for support requests, demos, VIP comps, and the like.
//
// CRITICAL, by design (this feature's own safety mandate): this file NEVER
// calls spend_partner_credit_for_invite() or writes to
// partners.credits_remaining, NEVER touches Razorpay or any payment-
// verification route, and adds no new columns/constraints to `invites` or
// `partner_invites` — every insert below is a row shape those tables
// already accept (partner_invites.credit_transaction_id is already a
// nullable FK — see 0001_b2b_partner_portal.sql).
//
// Two branches, chosen by `destination`:
//   - 'direct'  -> public.invites, rendered at /i/:slug (consumer viewer)
//   - 'partner' -> public.partner_invites, rendered at /p/:slug (partner
//                  co-branded viewer) — requires an existing `partnerId`
//
// Collects the SAME full field set CreateInvitePage.jsx/
// PartnerCreateInvitePage.jsx already do (Family Details, Function Name,
// Opening Greeting, Photos, Additional Events, Background Music, plus the
// host's — or, for a partner invite, the client's — own contact details),
// not just the bare minimum — an admin-minted invite should look and
// behave identically to a paid/credit-spent one, right down to the
// confirmation email, to anyone who opens it.
//
// cleanCreateInvitePayload()/isValidSlugFormat()/insertPartnerInviteSupabase()
// below are also imported by server/index.js's local-dev mirror of this
// route: partner_invites is real Supabase in both dev and prod (same reason
// every other /api/partners/*, /api/admin/* route is a shared handler — see
// api/_lib/partnerHandlers.js's header), so the partner branch needs no dev
// duplicate. The 'direct' branch DOES get a separate dev implementation
// (writing to the flat INVITES_FILE instead of Supabase) — the same
// dev/prod split every other consumer-invite route already has (compare
// api/invites/index.js vs. server/index.js's own POST /api/invites) — so
// only its shared validation, not its insert, lives here.
import { getSupabase } from './supabase.js'
import { requireAdmin } from './auth.js'
import {
  clean,
  generateHostToken as generateDirectHostToken,
  randomSlugSuffix as directSlugSuffix,
  toEventDateColumn,
  rowToInvite,
} from './invites.js'
import {
  generateHostToken as generatePartnerHostToken,
  randomSlugSuffix as partnerSlugSuffix,
  rowToPartnerInvite,
} from './partners.js'
import { slugify } from '../../src/utils/slugify.js'
import { SITE_URL } from '../../src/data/routesSeo.js'
import { MAX_PHOTOS } from '../../src/utils/photoUpload.js'
import { cleanEvents } from '../../src/utils/cleanEvents.js'
import {
  sendTransactionalEmail,
  buildOrderConfirmationEmail,
  buildPartnerInviteReadyEmail,
} from '../../src/utils/email.js'

const MAX_SLUG_ATTEMPTS = 6
const SLUG_FORMAT_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

// Client-side mirrors this exact rule (AdminCreateInvitePage.jsx's slug
// input) so a rejected slug never has to make a round trip to find out.
export function isValidSlugFormat(slug) {
  const value = String(slug ?? '')
  return value.length > 0 && value.length <= 80 && SLUG_FORMAT_RE.test(value)
}

// Shared field cleaning/validation for both branches — the form is
// identical whichever destination is picked (see AdminCreateInvitePage.jsx);
// only where the row lands differs. Deliberately does NOT enforce "date
// can't be in the past" the way the paid consumer/partner flows do — an
// admin override tool needs to be able to backfill a past event (a support
// request, a missed booking) without fighting its own validation.
export function cleanCreateInvitePayload(body = {}) {
  const destination = body.destination === 'partner' ? 'partner' : 'direct'
  const names = clean(body.names, 120)
  const date = clean(body.date, 20)
  const time = clean(body.time, 10)
  const venue = clean(body.venue, 200)
  const locationUrl = clean(body.locationUrl, 500)
  const message = clean(body.message, 2000)
  const templateId = clean(body.templateId, 80)
  const partnerId = clean(body.partnerId, 60)
  const customSlug = clean(body.slug, 80).toLowerCase()

  // Function Name + Opening Greeting — same optional fields
  // CreateInvitePage.jsx/PartnerCreateInvitePage.jsx collect.
  const eventTitle = clean(body.eventTitle, 80)
  const greetingLine = clean(body.greetingLine, 80)

  // "Family Details" — optional groom's/bride's name + parents, rendered as
  // the two cards under the couple's names (see WelcomeSplash.jsx's
  // couple.people) on both the consumer and partner viewers alike.
  const groomName = clean(body.groomName, 120)
  const groomParents = clean(body.groomParents, 200)
  const brideName = clean(body.brideName, 120)
  const brideParents = clean(body.brideParents, 200)

  // Photos — already-uploaded URLs (see PhotoUploader.jsx, which uploads
  // each file itself before this form is ever submitted), same shape and
  // cap as every other invite-creation route.
  const photos = Array.isArray(body.photos)
    ? body.photos.filter((p) => typeof p === 'string').slice(0, MAX_PHOTOS).map((p) => clean(p, 500))
    : []

  // Additional Events ("Haldi, Sangeet, Mehndi, Reception, ...").
  const events = cleanEvents(body.events, clean)

  // Background Music Selection (see SongSearchPicker.jsx) — all four
  // travel together, same as CreateInvitePage.jsx's own block.
  const bgSongTitle = clean(body.bgSongTitle, 200)
  const bgSongArtist = clean(body.bgSongArtist, 200)
  const bgSongAlbumArt = clean(body.bgSongAlbumArt, 500)
  const bgSongPreviewUrl = clean(body.bgSongPreviewUrl, 500)

  // The partner's CLIENT contact details — required for a partner invite,
  // same as createClientInvite() (api/_lib/partnerHandlers.js) requires:
  // this is where the invitation-ready email below actually gets sent, so
  // there must be somewhere for it to go.
  const clientEmail = clean(body.clientEmail, 200).toLowerCase()
  const clientPhone = clean(body.clientPhone, 30)

  // The HOST's own contact details — required for a direct/consumer
  // invite, same as CreateInvitePage.jsx's "Your Name/Email/Phone"
  // requires: this is where the order-confirmation email below (with the
  // live link + private host-dashboard link) actually gets sent.
  const hostName = clean(body.hostName, 120)
  const hostEmail = clean(body.hostEmail, 200).toLowerCase()
  const hostPhone = clean(body.hostPhone, 30)

  // Mahogany Seal only — an already-uploaded caricature video URL (see
  // POST /api/admin/mahogany-video, MahoganyVideoUploader.jsx). Harmless to
  // clean/store for any other template too (both tables' columns are
  // plain nullable text — see 0014_admin_mahogany_caricature_video.sql),
  // it's just never surfaced in the form or read by any other template's
  // adapter.
  const caricatureVideoUrl = clean(body.caricatureVideoUrl, 500)

  // Mahogany Seal only — the couple's own wedding hashtag (see
  // 0015_admin_mahogany_hashtag.sql), same field
  // MahoganySealCreatePage.jsx's WhatsApp-lead form collects. Harmless to
  // clean/store for any other template too, same as caricatureVideoUrl above.
  const hashtag = clean(body.hashtag, 60)

  let error = null
  if (!names) error = 'names is required'
  else if (!date) error = 'date is required'
  else if (!venue) error = 'venue is required'
  else if (destination === 'partner' && !partnerId) error = 'partnerId is required for a partner invite'
  else if (destination === 'partner' && !clientEmail) error = "client's email is required for a partner invite"
  else if (destination === 'partner' && !clientEmail.includes('@')) error = "client's email looks invalid"
  else if (destination === 'partner' && !clientPhone) error = "client's phone number is required for a partner invite"
  else if (destination === 'direct' && !hostName) error = "host's name is required for a direct invite"
  else if (destination === 'direct' && !hostEmail) error = "host's email is required for a direct invite"
  else if (destination === 'direct' && !hostEmail.includes('@')) error = "host's email looks invalid"
  else if (destination === 'direct' && !hostPhone) error = "host's phone number is required for a direct invite"
  else if (customSlug && !isValidSlugFormat(customSlug)) {
    error = 'slug may only contain lowercase letters, numbers, and hyphens'
  }

  return {
    ok: !error,
    error,
    destination,
    names,
    date,
    time,
    venue,
    locationUrl,
    message,
    templateId,
    partnerId,
    customSlug,
    eventTitle,
    greetingLine,
    groomName,
    groomParents,
    brideName,
    brideParents,
    photos,
    events,
    bgSongTitle,
    bgSongArtist,
    bgSongAlbumArt,
    bgSongPreviewUrl,
    clientEmail,
    clientPhone,
    hostName,
    hostEmail,
    hostPhone,
    caricatureVideoUrl,
    hashtag,
  }
}

// A collision on an admin-chosen custom slug is reported back as "already
// taken" rather than silently mutated into something the admin didn't ask
// for — only an auto-generated slug gets the random-suffix retry loop every
// other invite-creation route already uses.
function candidateSlugs(base, customSlug, suffixFn) {
  if (customSlug) return [customSlug]
  return Array.from({ length: MAX_SLUG_ATTEMPTS }, () => `${base}-${suffixFn()}`)
}

function slugTakenError(customSlug) {
  const err = new Error(customSlug ? 'that slug is already taken' : 'could not generate a unique slug')
  err.statusCode = 409
  return err
}

// ---------------------------------------------------------------------------
// Branch A: direct / consumer invite -> public.invites, /i/:slug.
// ---------------------------------------------------------------------------
export function buildDirectInviteRow(fields, admin) {
  return {
    // Must be 'wedding' — GeneratedInvitePage.jsx branches its whole render
    // on invite.occasion, and every template in src/data/templatesData.js
    // (the picker this form uses) is a wedding template.
    occasion: 'wedding',
    template_id: fields.templateId || null,
    names: fields.names,
    date: fields.date,
    event_date: toEventDateColumn(fields.date),
    time: fields.time || null,
    venue: fields.venue,
    location_url: fields.locationUrl || null,
    message: fields.message || null,
    greeting_line: fields.greetingLine || null,
    amount: 0,
    // Not a real Razorpay payment id — a breadcrumb so this row is
    // recognizable later as an admin override, not a failed/fudged
    // payment. payment_status 'paid' is what makes it a live, guest-
    // visible invite (mirrors api/invites/index.js's own paymentId-present
    // check) without Razorpay or api/verify-payment.js ever being called.
    payment_id: `admin-override:${admin.email}`,
    payment_status: 'paid',
    photos: fields.photos ?? [],
    event_title: fields.eventTitle || null,
    events: fields.events ?? [],
    bg_song_title: fields.bgSongTitle || null,
    bg_song_artist: fields.bgSongArtist || null,
    bg_song_album_art: fields.bgSongAlbumArt || null,
    bg_song_preview_url: fields.bgSongPreviewUrl || null,
    groom_name: fields.groomName || null,
    groom_parents: fields.groomParents || null,
    bride_name: fields.brideName || null,
    bride_parents: fields.brideParents || null,
    host_name: fields.hostName,
    host_email: fields.hostEmail,
    host_phone: fields.hostPhone,
    host_token: generateDirectHostToken(),
    caricature_video_url: fields.caricatureVideoUrl || null,
    hashtag: fields.hashtag || null,
  }
}

export async function insertDirectInviteSupabase(supabase, fields, admin) {
  const row = buildDirectInviteRow(fields, admin)
  const base = slugify(fields.names) || 'invite'
  const candidates = candidateSlugs(base, fields.customSlug, directSlugSuffix)

  let lastError = null
  for (const slug of candidates) {
    const { data, error } = await supabase.from('invites').insert({ ...row, slug }).select().single()
    if (!error) {
      // hostToken is spread in ONLY here, once — same allowlist discipline
      // api/invites/index.js uses — so sendDirectInviteReadyEmail() below
      // has it to build the host's private dashboard link; every other
      // read of a direct invite still goes through rowToInvite()'s
      // allowlist alone.
      const invite = { ...rowToInvite(data), hostToken: data.host_token }
      return { slug: data.slug, url: `${SITE_URL}/i/${data.slug}`, invite }
    }
    lastError = error
    if (error.code !== '23505' || fields.customSlug) break // not a unique-violation, or a chosen slug — don't retry
  }
  if (lastError?.code === '23505') throw slugTakenError(fields.customSlug)
  throw lastError || new Error('could not save invitation')
}

// Emails the host their live link + private host dashboard link — the SAME
// order-confirmation email api/invites/index.js sends once Razorpay
// verifies, so an admin-minted direct invite reaches its host exactly the
// way a paid one would. Non-blocking, same contract as
// sendPartnerInviteReadyEmail() below.
export async function sendDirectInviteReadyEmail(invite) {
  try {
    await sendTransactionalEmail({
      to: invite.hostEmail,
      toName: invite.hostName,
      ...buildOrderConfirmationEmail(invite),
    })
  } catch (err) {
    console.error('[admin] direct invite-ready email failed:', err)
  }
}

// ---------------------------------------------------------------------------
// Branch B: partner co-branded invite -> public.partner_invites, /p/:slug.
// Deliberately a plain insert, never spend_partner_credit_for_invite() —
// see this file's header. credit_transaction_id stays null: there's no
// partner_credit_transactions row to link back to since no credit was spent.
// ---------------------------------------------------------------------------
export function buildPartnerInviteRow(fields) {
  return {
    template_id: fields.templateId || null,
    couple_names: fields.names,
    wedding_date: fields.date,
    wedding_time: fields.time || null,
    venue: fields.venue,
    location_url: fields.locationUrl || null,
    message: fields.message || null,
    greeting_line: fields.greetingLine || null,
    event_title: fields.eventTitle || null,
    photos: fields.photos ?? [],
    events: fields.events ?? [],
    bg_song_title: fields.bgSongTitle || null,
    bg_song_artist: fields.bgSongArtist || null,
    bg_song_album_art: fields.bgSongAlbumArt || null,
    bg_song_preview_url: fields.bgSongPreviewUrl || null,
    client_email: fields.clientEmail || null,
    client_phone: fields.clientPhone || null,
    groom_name: fields.groomName || null,
    groom_parents: fields.groomParents || null,
    bride_name: fields.brideName || null,
    bride_parents: fields.brideParents || null,
    credit_transaction_id: null,
    host_token: generatePartnerHostToken(),
    caricature_video_url: fields.caricatureVideoUrl || null,
    hashtag: fields.hashtag || null,
  }
}

export async function insertPartnerInviteSupabase(supabase, partnerId, fields) {
  const row = buildPartnerInviteRow(fields)
  const base = `p-${slugify(fields.names) || 'invite'}`
  const candidates = candidateSlugs(base, fields.customSlug, partnerSlugSuffix)

  let lastError = null
  for (const slug of candidates) {
    const { data, error } = await supabase
      .from('partner_invites')
      .insert({ ...row, partner_id: partnerId, slug })
      .select()
      .single()
    if (!error) {
      // hostToken is spread in ONLY here, once — same allowlist discipline
      // spendCreditForInvite() uses (api/_lib/partners.js) — so
      // sendPartnerInviteReadyEmail() below has it to build the client's
      // private dashboard link; every other read of a partner invite still
      // goes through rowToPartnerInvite()'s allowlist alone.
      const invite = { ...rowToPartnerInvite(data), hostToken: data.host_token }
      return { slug: data.slug, url: `${SITE_URL}/p/${data.slug}`, invite }
    }
    lastError = error
    if (error.code !== '23505' || fields.customSlug) break
  }
  if (lastError?.code === '23505') throw slugTakenError(fields.customSlug)
  throw lastError || new Error('could not save invitation')
}

// Emails the client their live link + private host dashboard link — the
// SAME invitation-ready email createClientInvite() sends when a partner
// spends a credit (see api/_lib/partnerHandlers.js), so an admin-minted
// invite reaches its client exactly the way a normal one would. Never
// blocks or fails the request on an email-provider hiccup, same
// non-blocking contract every other transactional email in this app uses.
export async function sendPartnerInviteReadyEmail(invite, businessName) {
  try {
    await sendTransactionalEmail({
      to: invite.clientEmail,
      toName: invite.coupleNames,
      ...buildPartnerInviteReadyEmail(invite, { businessName }),
    })
  } catch (err) {
    console.error('[admin] partner invite-ready email failed:', err)
  }
}

// ---------------------------------------------------------------------------
// The full Vercel/prod handler — both branches go through Supabase here
// (production has no flat-file consumer store to divert 'direct' to; see
// this file's header). server/index.js's dev mirror does NOT import this
// function — it reimplements the 'direct' branch against INVITES_FILE and
// calls insertPartnerInviteSupabase() above directly for the 'partner' one.
// ---------------------------------------------------------------------------
export async function adminCreateInvite(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ ok: false, error: 'method not allowed' })
  }

  const admin = await requireAdmin(req, res)
  if (!admin) return

  const fields = cleanCreateInvitePayload(req.body || {})
  if (!fields.ok) return res.status(400).json({ ok: false, error: fields.error })

  try {
    const supabase = getSupabase()

    if (fields.destination === 'partner') {
      const { data: partnerRow, error: partnerError } = await supabase
        .from('partners')
        .select('id, business_name')
        .eq('id', fields.partnerId)
        .maybeSingle()
      if (partnerError) throw partnerError
      if (!partnerRow) return res.status(400).json({ ok: false, error: 'partner not found' })

      const result = await insertPartnerInviteSupabase(supabase, fields.partnerId, fields)
      await sendPartnerInviteReadyEmail(result.invite, partnerRow.business_name)
      console.log(`[admin] ${admin.email} minted partner invite "${result.slug}" for partner ${fields.partnerId} (no credit spent, client emailed)`)
      return res.status(200).json({ ok: true, destination: 'partner', slug: result.slug, url: result.url })
    }

    const result = await insertDirectInviteSupabase(supabase, fields, admin)
    await sendDirectInviteReadyEmail(result.invite)
    console.log(`[admin] ${admin.email} minted direct invite "${result.slug}" (no payment collected, host emailed)`)
    return res.status(200).json({ ok: true, destination: 'direct', slug: result.slug, url: result.url })
  } catch (err) {
    console.error('[admin] failed to create invite:', err)
    if (err.statusCode === 409) return res.status(409).json({ ok: false, error: err.message })
    res.status(500).json({ ok: false, error: 'could not create invite' })
  }
}
