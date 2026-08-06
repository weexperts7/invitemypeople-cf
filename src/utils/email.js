// Shared Brevo transactional-email helpers — mirrors the split in
// src/utils/razorpay.js: one framework-agnostic module (process.env.*
// directly, no React/browser APIs) imported by both the local-dev Express
// routes (server/index.js) and their Vercel Serverless counterparts
// (api/invites/index.js). Server-side only.
//
// Used for the order-confirmation email sent right after a paid invite is
// created (POST /api/invites, both runtimes). The separate 4-hour reminder
// email (supabase/functions/send-event-reminders) runs on Deno, which can't
// import this file — it duplicates a small parseFromAddress() of its own,
// matching that file's existing style of self-contained duplicated helpers.
import { SITE_URL } from '../data/routesSeo.js'
import { formatInviteDate, formatInviteTime } from './formatInviteDateTime.js'

const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email'

function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
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
  // already displays (e.g. "₹2,100").
  const amountLabel = Number(invite.amount) > 0 ? `₹${Number(invite.amount).toLocaleString('en-IN')}` : null

  const subject = `Your invitation for ${invite.names} is live!`

  const html = `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; color: #2a2320;">
      <h2 style="margin-bottom: 4px;">You're all set, ${escapeHtml(invite.hostName || 'there')} 🎉</h2>
      <p>Your invitation for <strong>${escapeHtml(invite.names)}</strong> has been created${amountLabel ? ` (payment of ${amountLabel} received)` : ''}.</p>
      ${
        whenLabel || invite.venue
          ? `<p>${whenLabel ? `<strong>${escapeHtml(whenLabel)}</strong><br/>` : ''}${invite.venue ? escapeHtml(invite.venue) : ''}</p>`
          : ''
      }

      <p style="margin-top: 24px;"><strong>Share this with your guests:</strong><br/>
      <a href="${inviteUrl}" style="color: #b3541e;">${inviteUrl}</a></p>

      <p style="margin-top: 24px; padding: 16px; background: #fbf3ea; border-radius: 8px;">
        <strong>Your private host dashboard</strong> — view live RSVPs and download your guest list as a CSV:<br/>
        <a href="${hostUrl}" style="color: #b3541e;">${hostUrl}</a>
      </p>

      <p style="color: #7a6a63; font-size: 12px; margin-top: 24px;">
        Save the host dashboard link now — it's shown only this once and can't be recovered if
        lost (there's no login system, no "resend my link" flow). Keep it private; anyone with
        this link can see your guest responses. It's safe to share the invitation link above with
        guests — it never exposes your dashboard.
      </p>
    </div>
  `

  return { subject, html }
}
