import { useCallback, useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  Copy,
  Download,
  HeartHandshake,
  Loader2,
  Lock,
  Music4,
  Quote,
  Users,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { getHostDashboard } from '../utils/hostApi'
import { rsvpsToCsv, downloadCsv } from '../utils/rsvpCsv'
import { formatInviteDate, formatInviteTime } from '../utils/formatInviteDateTime'

// Refetch cadence for the "live" guest list — see the plan's design note:
// polling a token-gated endpoint every ~12s rather than standing up
// browser-side Supabase Realtime (which would need a first-ever public
// Supabase client plus real RLS policies this app has never needed before).
// "Live" here means "at most ~12s stale," which is plenty for a wedding
// guest list.
const POLL_INTERVAL_MS = 12000

function StatCard({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/60 bg-ivory/60 backdrop-blur-xl px-5 py-4 text-center shadow-soft">
      <div className="font-serif text-3xl text-ink">{value}</div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-ink-soft">{label}</div>
    </div>
  )
}

function attendanceBadge(attendance) {
  const joyful = attendance === 'joyfully'
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        joyful ? 'bg-blush text-ink' : 'bg-champagne text-ink-soft'
      }`}
    >
      {joyful ? 'Attending' : 'Declined'}
    </span>
  )
}

// The private companion to /i/:slug (see GeneratedInvitePage.jsx) — the
// host's own live RSVP list + CSV export, gated by the host_token generated
// once at creation time (see CreateInvitePage.jsx's success panel, and
// api/invites/[slug]/host.js server-side). There's no login system in this
// app; this token IS the access control, so a wrong/missing token gets the
// same quiet "forbidden" treatment regardless of whether the slug itself
// exists — never confirm or deny that on the failure path.
export default function HostDashboardPage() {
  const { slug, hostToken } = useParams()
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState('loading') // loading | success | forbidden | error
  const [data, setData] = useState(null)
  const [copied, setCopied] = useState(false)
  const pollRef = useRef(null)

  const load = useCallback(
    async ({ silent } = {}) => {
      if (!silent) setStatus('loading')
      try {
        const result = await getHostDashboard(slug, hostToken)
        setData(result)
        setStatus('success')
      } catch (err) {
        // A poll tick failing shouldn't blank out an already-loaded
        // dashboard — only the initial load can transition to an error/
        // forbidden state.
        if (!silent) {
          const forbidden = /invalid host link/i.test(err.message || '')
          setStatus(forbidden ? 'forbidden' : 'error')
        } else {
          console.error('[Host Dashboard] background refresh failed:', err)
        }
      }
    },
    [slug, hostToken],
  )

  useEffect(() => {
    load()
    pollRef.current = setInterval(() => load({ silent: true }), POLL_INTERVAL_MS)
    return () => clearInterval(pollRef.current)
  }, [load])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[Host Dashboard] clipboard copy failed:', err)
    }
  }

  const handleDownloadCsv = () => {
    if (!data) return
    const csv = rsvpsToCsv(data.rsvps)
    downloadCsv(`${slug}-rsvps.csv`, csv)
  }

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-linen text-ink">
        <div className="flex items-center gap-2 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your dashboard&hellip;
        </div>
      </div>
    )
  }

  if (status === 'forbidden' || status === 'error') {
    return (
      <div className="min-h-svh w-full bg-linen text-ink">
        <SEO title="Host Dashboard | InviteMyPeople" path={`/i/${slug}/host`} noindex />
        <SiteHeader />
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
          <Lock className="h-10 w-10 text-rose" strokeWidth={1.2} />
          <h1 className="font-serif text-2xl text-ink">
            {status === 'forbidden' ? "This link isn't valid" : "Something went wrong"}
          </h1>
          <p className="text-ink-soft">
            {status === 'forbidden'
              ? 'Double-check the dashboard link you saved after checkout — it needs to match exactly.'
              : "We couldn't load your dashboard just now. Please try again in a moment."}
          </p>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const { invite, rsvps, summary } = data

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO title={`Host Dashboard — ${invite.names} | InviteMyPeople`} path={`/i/${slug}/host`} noindex />
      <SiteHeader />

      <main className="mx-auto max-w-4xl px-6 py-14 sm:py-16">
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Host Dashboard</p>
          <h1 className="mt-1 font-serif text-3xl sm:text-4xl text-ink">{invite.names}</h1>
          <p className="mt-2 text-ink-soft">
            {invite.eventTitle ? `${invite.eventTitle} — ` : ''}
            {formatInviteDate(invite.date)}
            {invite.time ? ` at ${formatInviteTime(invite.time)}` : ''} · {invite.venue}
          </p>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-2 rounded-full border border-champagne-deep/50 bg-ivory/70 px-4 py-2 text-sm text-ink transition-colors hover:bg-ivory"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-rose" /> : <Copy className="h-3.5 w-3.5" />}
              {copied ? 'Copied!' : 'Copy Dashboard Link'}
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              disabled={rsvps.length === 0}
              className="inline-flex items-center gap-2 rounded-full bg-rose px-4 py-2 text-sm font-medium text-ivory shadow-card disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              Download CSV
            </button>
          </div>
        </motion.div>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatCard label="Responses" value={summary.totalResponses} />
          <StatCard label="Attending" value={summary.attendingCount} />
          <StatCard label="Declined" value={summary.decliningCount} />
          <StatCard label="Total Guests" value={summary.totalGuests} />
        </div>

        <div className="mt-10">
          <h2 className="mb-4 flex items-center gap-2 font-serif text-xl text-ink">
            <Users className="h-4 w-4 text-rose" />
            Guest Responses
          </h2>

          {rsvps.length === 0 ? (
            <div className="rounded-2xl border border-white/60 bg-ivory/50 px-5 py-8 text-center text-ink-soft">
              No responses yet — check back soon, this page updates on its own.
            </div>
          ) : (
            <div className="space-y-3">
              {rsvps.map((rsvp) => (
                <div
                  key={rsvp.id}
                  className="rounded-2xl border border-white/60 bg-ivory/50 backdrop-blur-xl shadow-soft px-5 py-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <HeartHandshake className="h-3.5 w-3.5 text-rose shrink-0" />
                      <span className="font-serif text-lg text-ink">{rsvp.guestName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-ink-soft">
                      {attendanceBadge(rsvp.attendance)}
                      {rsvp.attendance === 'joyfully' && (
                        <span>
                          {rsvp.guestCount} guest{rsvp.guestCount === 1 ? '' : 's'}
                        </span>
                      )}
                    </div>
                  </div>

                  {rsvp.guestEmail && (
                    <p className="mt-1 text-xs text-ink-soft/80">{rsvp.guestEmail}</p>
                  )}

                  {rsvp.message && (
                    <p className="mt-2 text-sm text-ink-soft leading-relaxed">{rsvp.message}</p>
                  )}

                  {(rsvp.song || rsvp.advice) && (
                    <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-soft/80">
                      {rsvp.song && (
                        <span className="flex items-center gap-1.5">
                          <Music4 className="h-3 w-3" />
                          {rsvp.song}
                        </span>
                      )}
                      {rsvp.advice && (
                        <span className="flex items-center gap-1.5">
                          <Quote className="h-3 w-3" />
                          {rsvp.advice}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-10 flex gap-2 rounded-xl border border-champagne-deep/40 bg-champagne/30 px-4 py-3 text-sm text-ink-soft">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-ink-soft" />
          <span>
            This page is private — anyone with this exact link can see your guest list. Don&apos;t
            share it the way you share your invitation link.
          </span>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
