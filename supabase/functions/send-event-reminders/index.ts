// Supabase Edge Function — invoked every 10 minutes by pg_cron (see
// RSVPS-AND-REMINDERS-SETUP.md for the `cron.schedule(...)` call). Finds
// every invite whose main event starts within the next 4 hours and hasn't
// been reminded yet (public.invites_due_for_reminder(), same file), claims
// each one atomically, and emails the host a guest-list summary via Brevo.
//
// Deliberately NOT a Vercel Cron route — Vercel's Hobby plan caps cron jobs
// at once/day, nowhere near enough precision for a 4-hour window. Supabase's
// own pg_cron + this Edge Function works regardless of Vercel plan tier.
//
// v1 scope: only the invite's primary event (date/time columns) — NOT each
// entry in the `events` jsonb array (Haldi/Sangeet/etc). Invites with no
// `time` set are silently skipped forever ("4 hours before" is meaningless
// without a time).
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY')
// Brevo requires the sender address (or its domain) to be verified in the
// Brevo dashboard before it will deliver to arbitrary host emails — unlike
// Resend, there's no always-works sandbox address to fall back to, so an
// unverified sender can fail/bounce silently. Verify it before relying on
// this for a real event — see RSVPS-AND-REMINDERS-SETUP.md.
const EMAIL_FROM = Deno.env.get('EMAIL_FROM') || 'InviteMyPeople <hello@invitemypeople.com>'

// Duplicated rather than imported from src/utils/email.js — this is a Deno
// runtime (Supabase Edge Functions) and can't import from the Node/Vite
// codebase, same reason escapeHtml()/formatEventDateTime() below are
// self-contained instead of shared.
function parseFromAddress(value: string) {
  const raw = String(value ?? '').trim()
  const match = raw.match(/^(.*)<(.+)>$/)
  if (match) {
    return { name: match[1].trim().replace(/^"|"$/g, '') || undefined, email: match[2].trim() }
  }
  return { name: undefined, email: raw }
}

function escapeHtml(str: string) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

function formatEventDateTime(date: string, time: string) {
  try {
    const dt = new Date(`${date}T${time}:00`)
    return dt.toLocaleString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    })
  } catch {
    return `${date} ${time}`
  }
}

function buildEmailHtml(invite: any, rsvps: any[], summary: any) {
  const attendingRows = rsvps
    .filter((r) => r.attendance === 'joyfully')
    .map(
      (r) =>
        `<li>${escapeHtml(r.guest_name)}${r.guest_count > 1 ? ` (+${r.guest_count - 1})` : ''}</li>`,
    )
    .join('')

  return `
    <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
      <h2>${escapeHtml(invite.names)} — RSVP Summary</h2>
      <p>Your event is coming up in about 4 hours:</p>
      <p><strong>${escapeHtml(formatEventDateTime(invite.date, invite.time))}</strong><br/>
      ${escapeHtml(invite.venue)}</p>
      <p>
        ${summary.totalResponses} response${summary.totalResponses === 1 ? '' : 's'} —
        ${summary.attendingCount} attending (${summary.totalGuests} guests total),
        ${summary.decliningCount} declined.
      </p>
      ${attendingRows ? `<p><strong>Attending guests:</strong></p><ul>${attendingRows}</ul>` : ''}
      <p style="color: #7a6a63; font-size: 12px; margin-top: 24px;">
        See the full guest list any time at your host dashboard link
        (sent when you created this invite).
      </p>
    </div>
  `
}

Deno.serve(async (_req) => {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'Supabase env vars not set' }), {
      status: 500,
    })
  }
  if (!BREVO_API_KEY) {
    return new Response(JSON.stringify({ ok: false, error: 'BREVO_API_KEY not set' }), {
      status: 500,
    })
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

  const { data: dueInvites, error: dueError } = await supabase.rpc('invites_due_for_reminder')
  if (dueError) {
    console.error('[send-event-reminders] failed to query due invites:', dueError)
    return new Response(JSON.stringify({ ok: false, error: dueError.message }), { status: 500 })
  }

  let sent = 0
  let skipped = 0

  for (const invite of dueInvites || []) {
    // Claim before send — guarantees no double-send even if this function
    // runs concurrently or the cron fires twice close together. A failed
    // Brevo call below means this invite just doesn't get retried; a
    // manual `update invites set reminder_sent_at = null where slug = '...'`
    // is the escape hatch (see RSVPS-AND-REMINDERS-SETUP.md).
    const { data: claimed, error: claimError } = await supabase
      .from('invites')
      .update({ reminder_sent_at: new Date().toISOString() })
      .eq('id', invite.id)
      .is('reminder_sent_at', null)
      .select()
    if (claimError) {
      console.error(`[send-event-reminders] claim failed for invite ${invite.id}:`, claimError)
      continue
    }
    if (!claimed || claimed.length === 0) {
      skipped++
      continue // another concurrent run already claimed this one
    }

    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('invite_id', invite.id)
    if (rsvpError) {
      console.error(`[send-event-reminders] failed to load rsvps for invite ${invite.id}:`, rsvpError)
      continue
    }

    const attending = (rsvps || []).filter((r) => r.attendance === 'joyfully')
    const declining = (rsvps || []).filter((r) => r.attendance !== 'joyfully')
    const summary = {
      totalResponses: (rsvps || []).length,
      attendingCount: attending.length,
      decliningCount: declining.length,
      totalGuests: attending.reduce((sum, r) => sum + (Number(r.guest_count) || 0), 0),
    }

    const html = buildEmailHtml(invite, rsvps || [], summary)
    const sender = parseFromAddress(EMAIL_FROM)

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: invite.host_email }],
        subject: `RSVPs so far for ${invite.names}`,
        htmlContent: html,
      }),
    })

    if (brevoResponse.ok) {
      sent++
      console.log(`[send-event-reminders] sent reminder for invite ${invite.id} (${invite.slug})`)
    } else {
      const body = await brevoResponse.text().catch(() => '')
      console.error(
        `[send-event-reminders] Brevo request failed for invite ${invite.id} (${invite.slug}): ${brevoResponse.status} ${body}`,
      )
    }
  }

  return new Response(JSON.stringify({ ok: true, sent, skipped, checked: (dueInvites || []).length }), {
    headers: { 'Content-Type': 'application/json' },
  })
})
