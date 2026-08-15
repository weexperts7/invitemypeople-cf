// Shared Brevo transactional-email helpers — mirrors the split in
// src/utils/razorpay.js: one framework-agnostic module (process.env.*
// directly, no React/browser APIs) imported by both the local-dev Express
// routes (server/index.js) and their Vercel Serverless counterparts
// (api/invites/index.js). Server-side only.
//
// Used for the order-confirmation email sent right after a paid invite is
// created (POST /api/invites, both runtimes), and the B2B Partner Portal's
// application/approval emails (api/_lib/partnerHandlers.js). The separate
// 4-hour reminder email (supabase/functions/send-event-reminders) runs on
// Deno, which can't import this file — it duplicates parseFromAddress() and
// the branded renderEmailShell()/BRAND palette below, matching that file's
// existing style of self-contained duplicated helpers. Keep both copies of
// BRAND in sync with src/index.css's @theme block if the site palette ever
// changes.
import { SITE_URL } from '../data/routesSeo.js'
import { formatInviteDate, formatInviteTime } from './formatInviteDateTime.js'

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// ---------------------------------------------------------------------------
// Shared branded chrome — every build*Email() below renders its own content
// into renderEmailShell() instead of hand-rolling its own bare
// `<div style="font-family: sans-serif...">` wrapper the way this file used
// to. Brings every outgoing email in line with the actual site: the same
// "InviteMyPeople" logo mark (see Logo.jsx), the same brand palette (see
// src/index.css's @theme block — keep these two in sync if that palette
// changes), and a real footer instead of no footer at all.
//
// Email clients can't load this app's Tailwind classes or web fonts
// (Cormorant Garamond/Poppins), and Gmail strips <style> blocks in the
// body, so this leans on web-safe stand-ins with the same character
// (Georgia for serif headings, a system sans stack for body copy) and
// inlines every style. Table-based layout, not flex/grid, for the same
// reason — the only markup old and new email clients agree on.
// ---------------------------------------------------------------------------
const BRAND = {
  rose: '#6b1d2b',
  gold: '#c9a24b',
  champagne: '#f0e2c8',
  champagneDeep: '#e3cd9c',
  blush: '#f6e2df',
  ivory: '#fdfaf4',
  linen: '#f6efe4',
  ink: '#4a3f3a',
  inkSoft: '#7a6a63',
}
const SERIF_STACK = "Georgia, 'Times New Roman', serif"
const SANS_STACK = "'Segoe UI', Helvetica, Arial, sans-serif"

/** `<h2>`-equivalent for email body copy — serif, brand ink, consistent spacing. */
function emailHeading(html) {
  return `<h2 style="margin: 0 0 12px; font-family: ${SERIF_STACK}; font-size: 22px; font-weight: 600; color: ${BRAND.ink};">${html}</h2>`
}

/** The one button style every email's primary CTA uses — rose fill, pill shape, matches the site's own buttons. */
function emailButton(label, url) {
  return `<a href="${url}" style="display: inline-block; margin-top: 20px; padding: 12px 26px; background: ${BRAND.rose}; color: ${BRAND.ivory}; border-radius: 999px; text-decoration: none; font-weight: 600; font-size: 14px;">${escapeHtml(label)}</a>`
}

/** A plain inline link in brand rose, for secondary URLs that aren't the email's main CTA. */
function emailLink(label, url) {
  return `<a href="${url}" style="color: ${BRAND.rose}; font-weight: 600;">${escapeHtml(label)}</a>`
}

/** Highlighted callout box (champagne tint) for a second, secondary link/detail — e.g. a host dashboard link below the main CTA. */
function emailCallout(html) {
  return `<div style="margin-top: 20px; padding: 16px; background: ${BRAND.champagne}; border-radius: 12px;">${html}</div>`
}

// Same "envelope + heart" mark as Logo.jsx, reduced to table+CSS an email
// client can actually render — a rose circle badge (✉) beside the
// "InviteMyPeople" wordmark with "My" picked out in rose. No external image
// request for it to block, unlike an actual <img> logo would need.
function renderLogoMark() {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
      <tr>
        <td style="padding-right: 10px; vertical-align: middle;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="36" height="36" style="background: ${BRAND.rose}; border-radius: 10px;">
            <tr><td align="center" valign="middle" style="width: 36px; height: 36px; font-size: 16px; line-height: 1; color: ${BRAND.ivory};">&#9993;</td></tr>
          </table>
        </td>
        <td style="vertical-align: middle; font-family: ${SERIF_STACK}; font-size: 22px; color: ${BRAND.ink};">
          Invite<span style="color: ${BRAND.rose};">My</span>People
        </td>
      </tr>
    </table>
  `
}

/**
 * Wraps a build*Email() function's inner content (already-escaped HTML) in
 * the shared branded shell: logo header linking back to the site, an ivory
 * content card on a linen background (mirrors the on-site card treatment —
 * see e.g. PartnerLoginPage.jsx's own `bg-ivory`/`shadow-card` panel), and a
 * consistent footer with the same tagline/contact/copyright SiteFooter.jsx
 * uses.
 */
function renderEmailShell(bodyHtml) {
  const year = new Date().getFullYear()
  return `
    <div style="background: ${BRAND.linen}; padding: 32px 16px; font-family: ${SANS_STACK};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 520px; margin: 0 auto;">
        <tr>
          <td style="padding-bottom: 24px; text-align: center;">
            <a href="${SITE_URL}" style="text-decoration: none;">${renderLogoMark()}</a>
          </td>
        </tr>
        <tr>
          <td style="background: ${BRAND.ivory}; border-radius: 16px; padding: 32px; border: 1px solid ${BRAND.champagneDeep};">
            <div style="color: ${BRAND.ink}; font-size: 15px; line-height: 1.6;">${bodyHtml}</div>
          </td>
        </tr>
        <tr>
          <td style="padding-top: 24px; text-align: center; color: ${BRAND.inkSoft}; font-size: 12px; line-height: 1.6;">
            <p style="margin: 0 0 4px;">Beautifully interactive digital invitations for every celebration.</p>
            <p style="margin: 0 0 4px;">
              <a href="mailto:invitemypeople@gmail.com" style="color: ${BRAND.inkSoft}; text-decoration: underline;">invitemypeople@gmail.com</a>
            </p>
            <p style="margin: 0;">&copy; ${year} InviteMyPeople. Crafted with love.</p>
          </td>
        </tr>
      </table>
    </div>
  `
}

/**
 * Splits an `EMAIL_FROM` value like "InviteMyPeople <hello@invitemypeople.com>"
 * into Brevo's separate `{ name, email }` sender shape. Falls back to
 * treating the whole string as the email if there are no angle brackets.
 */
export function parseFromAddress(value) {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^(.*)<(.+)>$/)
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, '') || undefined, email: match[2].trim() }
  }
  return { name: undefined, email: raw }
}

/**
 * Sends one transactional email via Brevo's HTTP API. Never throws — a
 * missing BREVO_API_KEY/EMAIL_FROM, a non-OK response, or a network failure
 * all just log and resolve to a non-ok result. Every caller (order
 * confirmation today, maybe more later) sits in a critical path that must
 * keep working even if email is misconfigured or Brevo itself is down.
 */
export async function sendTransactionalEmail({ to, toName, subject, html }) {
  const apiKey = process.env.BREVO_API_KEY
  const from = process.env.EMAIL_FROM
  if (!apiKey || !from) {
    console.warn('[email] BREVO_API_KEY / EMAIL_FROM not set — skipping send:', subject)
    return { ok: false, skipped: true }
  }
  if (!to) {
    console.warn('[email] no recipient address — skipping send:', subject)
    return { ok: false, skipped: true }
  }

  try {
    const sender = parseFromAddress(from)
    const response = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to, name: toName || undefined }],
        subject,
        htmlContent: html,
      }),
    })

    if (!response.ok) {
      const body = await response.text().catch(() => '')
      console.error(`[email] Brevo request failed: ${response.status} ${body}`)
      return { ok: false }
    }

    const data = await response.json().catch(() => ({}))
    return { ok: true, messageId: data?.messageId }
  } catch (err) {
    console.error('[email] Brevo request threw:', err)
    return { ok: false }
  }
}

/**
 * Builds the order-confirmation email sent to the host right after their
 * invite is created/paid (POST /api/invites, both runtimes). Pure — no I/O.
 * Accepts the camelCase invite shape both api/invites/index.js's response
 * object and server/index.js's saved entry already share (names, eventTitle,
 * date, time, venue, slug, hostName, hostToken, amount).
 */
export function buildOrderConfirmationEmail(invite) {
  const inviteUrl = `${SITE_URL}/i/${invite.slug}`
  const hostUrl = `${SITE_URL}/i/${invite.slug}/host/${invite.hostToken}`
  const dateLabel = formatInviteDate(invite.date)
  const timeLabel = formatInviteTime(invite.time)
  const whenLabel = [dateLabel, timeLabel].filter(Boolean).join(' at ')
  // invite.amount is stored in rupees, not paise — PaymentModal.jsx only
  // converts to paise right at the Razorpay order-creation call
  // (`amount: Math.round(amount * 100)`); the persisted/returned invite
  // amount (and this label) stays in the same rupee units the checkout UI
  // already displays (e.g. "₹2,499").
  const amountLabel = Number(invite.amount) > 0 ? `₹${Number(invite.amount).toLocaleString('en-IN')}` : null

  const subject = `Your invitation for ${invite.names} is live!`

  const body = `
    ${emailHeading(`You're all set, ${escapeHtml(invite.hostName || 'there')} 🎉`)}
    <p style="margin: 0;">Your invitation for <strong>${escapeHtml(invite.names)}</strong> has been created${amountLabel ? ` (payment of ${amountLabel} received)` : ''}.</p>
    ${
      whenLabel || invite.venue
        ? `<p style="margin: 12px 0 0;">${whenLabel ? `<strong>${escapeHtml(whenLabel)}</strong><br/>` : ''}${invite.venue ? escapeHtml(invite.venue) : ''}</p>`
        : ''
    }

    <p style="margin: 20px 0 0; font-size: 13px; color: ${BRAND.inkSoft};">Share this with your guests:</p>
    ${emailButton('View your invitation', inviteUrl)}

    ${emailCallout(`
      <strong>Your private host dashboard</strong> — view live RSVPs and download your guest list as a CSV:<br/>
      ${emailLink(hostUrl, hostUrl)}
    `)}

    <p style="color: ${BRAND.inkSoft}; font-size: 12px; margin: 20px 0 0;">
      Save the host dashboard link now — it's shown only this once and can't be recovered if
      lost (there's no login system, no "resend my link" flow). Keep it private; anyone with
      this link can see your guest responses. It's safe to share the invitation link above with
      guests — it never exposes your dashboard.
    </p>
  `

  return { subject, html: renderEmailShell(body) }
}

/**
 * Sent right after POST /api/partners/signup saves a new pending partner —
 * confirms the application was received and sets expectations (manual
 * admin review, no instant access). Accepts the camelCase partner shape
 * rowToPartner() (api/_lib/partners.js) returns.
 */
export function buildPartnerApplicationReceivedEmail(partner) {
  const subject = `We've received your partner application`
  const body = `
    ${emailHeading('Thanks for applying! 👋')}
    <p style="margin: 0;">We've received <strong>${escapeHtml(partner.businessName)}</strong>'s application to join our
    B2B Partner Program.</p>
    <p style="margin: 12px 0 0;">Our team reviews every application by hand — you'll get another email as soon as a decision is
    made, usually within a couple of business days.</p>
  `
  return { subject, html: renderEmailShell(body) }
}

/**
 * Sent to ADMIN_EMAILS[0] right after a new partner signs up — the only
 * heads-up an admin gets that something is waiting in
 * /admin/partners besides checking the dashboard themselves.
 */
export function buildPartnerAdminNotificationEmail(partner) {
  const subject = `New partner application: ${partner.businessName}`
  const body = `
    ${emailHeading('New partner application')}
    <p style="margin: 0;"><strong>${escapeHtml(partner.businessName)}</strong> (${escapeHtml(partner.email)},
    ${escapeHtml(partner.phone || '')}) is waiting for review.</p>
    ${emailButton('Review in the admin dashboard', `${SITE_URL}/admin/partners`)}
  `
  return { subject, html: renderEmailShell(body) }
}

/** Sent when an admin approves a pending partner. */
export function buildPartnerApprovedEmail(partner) {
  const subject = `You're approved — welcome to the Partner Program`
  const body = `
    ${emailHeading("You're in! 🎉")}
    <p style="margin: 0;"><strong>${escapeHtml(partner.businessName)}</strong> has been approved. You can now log in,
    purchase invite credits, and start creating client invites.</p>
    ${emailButton('Log in to your dashboard', `${SITE_URL}/partners/login`)}
  `
  return { subject, html: renderEmailShell(body) }
}

/**
 * Sent to the CLIENT right after a partner spends a credit to create their
 * invite (POST /api/partners/invites) — the couple/host themselves, not the
 * partner. Mirrors buildOrderConfirmationEmail()'s shape but points at
 * /p/:slug (not /i/:slug) and has no host-dashboard link, since partner
 * invites have no host-dashboard concept (see PartnerInviteViewerPage.jsx /
 * InvitationExperience.jsx's showRsvp prop). Accepts the camelCase invite
 * shape rowToPartnerInvite() (api/_lib/partners.js) returns, plus the
 * partner row (rowToPartner()) so the email can credit who made it.
 */
export function buildPartnerInviteReadyEmail(invite, partner) {
  const inviteUrl = `${SITE_URL}/p/${invite.slug}`
  const dateLabel = formatInviteDate(invite.weddingDate)
  const timeLabel = formatInviteTime(invite.weddingTime)
  const whenLabel = [dateLabel, timeLabel].filter(Boolean).join(' at ')

  const subject = `Your invitation for ${invite.coupleNames} is live!`

  const body = `
    ${emailHeading('Your invitation is ready 🎉')}
    <p style="margin: 0;"><strong>${escapeHtml(partner.businessName)}</strong> has created your invitation for
    <strong>${escapeHtml(invite.coupleNames)}</strong>.</p>
    ${
      whenLabel || invite.venue
        ? `<p style="margin: 12px 0 0;">${whenLabel ? `<strong>${escapeHtml(whenLabel)}</strong><br/>` : ''}${invite.venue ? escapeHtml(invite.venue) : ''}</p>`
        : ''
    }

    <p style="margin: 20px 0 0; font-size: 13px; color: ${BRAND.inkSoft};">Share this with your guests:</p>
    ${emailButton('View your invitation', inviteUrl)}

    <p style="color: ${BRAND.inkSoft}; font-size: 12px; margin: 20px 0 0;">
      Questions about your invitation? Reach out to ${escapeHtml(partner.businessName)} directly —
      they created this for you.
    </p>
  `

  return { subject, html: renderEmailShell(body) }
}

/**
 * Sent by POST /api/partners/forgot-password (api/_lib/partnerHandlers.js)
 * with the recovery link Supabase Auth's admin.generateLink() produced.
 * Routed through Brevo — same as every other transactional email this app
 * sends — specifically so this lands from EMAIL_FROM's own domain instead
 * of Supabase's default noreply@mail.app.supabase.io, which is what
 * supabase.auth.resetPasswordForEmail()'s own built-in email would have
 * sent from. `link` still points at Supabase's /auth/v1/verify endpoint
 * (which then redirects into /partners/reset-password) — only where the
 * email itself comes from changes, not the recovery mechanism.
 */
export function buildPartnerPasswordResetEmail(link) {
  const subject = 'Reset your Partner Portal password'
  const body = `
    ${emailHeading('Reset your password')}
    <p style="margin: 0;">We got a request to reset the password on your Partner Portal account. Click below to choose a
    new one:</p>
    ${emailButton('Reset password', link)}

    <p style="color: ${BRAND.inkSoft}; font-size: 12px; margin: 20px 0 0;">
      This link expires soon and can only be used once. If you didn't request this, you can safely
      ignore this email — your password won't change.
    </p>
  `
  return { subject, html: renderEmailShell(body) }
}

/** Sent when an admin rejects a pending partner. `partner.rejectedReason` is optional. */
export function buildPartnerRejectedEmail(partner) {
  const subject = `Update on your partner application`
  const reasonLine = partner.rejectedReason
    ? `<p style="margin: 12px 0 0;"><strong>Reason:</strong> ${escapeHtml(partner.rejectedReason)}</p>`
    : ''
  const body = `
    ${emailHeading('About your application')}
    <p style="margin: 0;">We reviewed <strong>${escapeHtml(partner.businessName)}</strong>'s application and aren't able to
    approve it at this time.</p>
    ${reasonLine}
    <p style="margin: 12px 0 0;">If you think this was a mistake or your circumstances have changed, reply to this email and
    we're happy to take another look.</p>
  `
  return { subject, html: renderEmailShell(body) }
}
