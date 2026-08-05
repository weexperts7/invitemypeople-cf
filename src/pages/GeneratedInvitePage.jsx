import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Flower,
  Heart,
  Loader2,
  MessageCircle,
  Music,
  PartyPopper,
  Sparkle,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import RsvpForm from '../components/RsvpForm'
import WishesWall from '../components/WishesWall'
import InvitePreviewCard from '../components/builder/InvitePreviewCard'
import InvitationExperience from '../components/InvitationExperience'
import { getBuilderTemplateById } from '../data/builderTemplates'
import { getInviteBySlug } from '../utils/inviteApi'
import { formatInviteDate, formatInviteTime, mapsSearchUrl } from '../utils/formatInviteDateTime'
import { SITE_URL } from '../data/routesSeo'

// Picks an icon by keyword in the event's own title — mirrors the variety
// the pre-built templates' own hardcoded ceremony lists already use
// (Flower/Music/Sparkle/Heart/PartyPopper) instead of every entry in a
// multi-event schedule showing the same icon.
function iconForEventTitle(title) {
  const t = (title || '').toLowerCase()
  if (t.includes('haldi')) return Flower
  if (t.includes('sangeet') || t.includes('dance')) return Music
  if (t.includes('mehndi') || t.includes('mehendi')) return Sparkle
  if (t.includes('reception') || t.includes('party')) return PartyPopper
  return Heart
}

// Formats one buyer-submitted event (main or additional) into the shape
// EventTimeline.jsx expects.
function toCeremony({ title, date, time, venue, locationUrl }) {
  return {
    icon: iconForEventTitle(title),
    title,
    date: formatInviteDate(date),
    time: formatInviteTime(time),
    venue,
    mapHref: locationUrl?.trim() || mapsSearchUrl(venue),
  }
}

// Wedding invites get the same full envelope/scratch-card/timeline/gallery
// experience every pre-built template uses (see InvitationExperience.jsx),
// built from a merged object: palette/motif/fonts/etc. from the selected
// builder template, but names/date/venue/message overridden with what the
// buyer actually submitted. The timeline shows the buyer's own real
// event(s) — the main one plus any "Additional Events" they added (see
// CreateInvitePage.jsx) — not the stock multi-ceremony schedule those
// templates ship with as a demo.
// Real uploaded photos (see CreateInvitePage.jsx) win over the template's
// stock "Our Moments" gallery when the buyer added any — but deliberately
// NOT the circular hero-photo medallion: that frame's tight circular crop
// was designed around specific pre-vetted stock photos, and forcing an
// arbitrary upload into it crops faces/framing unpredictably. The hero
// medallion stays whatever the template itself ships (often nothing).
function buildWeddingExperienceTemplate(invite, template) {
  const photos = invite.photos?.length ? invite.photos : []
  const mainEvent = toCeremony({
    title: invite.eventTitle?.trim() || 'Wedding Ceremony',
    date: invite.date,
    time: invite.time,
    venue: invite.venue,
    locationUrl: invite.locationUrl,
  })
  const additionalEvents = (invite.events ?? []).map(toCeremony)

  return {
    ...template,
    couple: {
      names: invite.names,
      invitationLine: invite.message?.trim() || template.connective,
      people: [],
    },
    ceremoniesHeading: 'Event Details',
    ceremonies: [mainEvent, ...additionalEvents],
    weddingDate: invite.time ? `${invite.date}T${invite.time}:00` : `${invite.date}T00:00:00`,
    photos,
  }
}

// Where a paid Invitation Builder submission (CreateInvitePage.jsx) lands —
// a real, shareable /i/:slug page loaded back from the local invites API
// (server/index.js), with a working RsvpForm and WishesWall wired to this
// invitation's own slug exactly like every other template's invitation page.
export default function GeneratedInvitePage() {
  const { slug } = useParams()
  const reduceMotion = useReducedMotion()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [invite, setInvite] = useState(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getInviteBySlug(slug)
      .then((data) => {
        if (cancelled) return
        setInvite(data)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        console.error(`[Generated Invite] failed to load "${slug}":`, err)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-linen text-ink">
        <div className="flex items-center gap-2 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading your invitation&hellip;
        </div>
      </div>
    )
  }

  if (status === 'error' || !invite) {
    return (
      <div className="min-h-svh w-full bg-linen text-ink">
        <SiteHeader />
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 px-6 py-24 text-center">
          <AlertCircle className="h-10 w-10 text-rose" strokeWidth={1.2} />
          <h1 className="font-serif text-2xl text-ink">Invitation Not Found</h1>
          <p className="text-ink-soft">
            We couldn&rsquo;t find an invitation at this link. It may have
            been mistyped, or hasn&rsquo;t finished generating yet.
          </p>
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-ivory shadow-card"
          >
            Build a New Invitation
          </Link>
        </div>
        <SiteFooter />
      </div>
    )
  }

  const template = getBuilderTemplateById(invite.templateId)
  const shareUrl = `${SITE_URL}/i/${invite.slug}`
  const shareText = `You're invited! ${invite.names} — ${formatInviteDate(invite.date)}. View & RSVP here: ${shareUrl}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('[Generated Invite] clipboard copy failed:', err)
    }
  }

  const seo = (
    <SEO
      title={`${invite.names} — Live Invitation | InviteMyPeople`}
      description={`${invite.names}'s live invitation, generated with InviteMyPeople.`}
      path={`/i/${invite.slug}`}
      noindex
    />
  )

  // Wedding invites: the shareable link is what GUESTS open — it should be
  // exactly the same self-contained envelope/scratch-card/timeline/gallery
  // experience every pre-built template's link already is (see
  // SatsangRoute/GaneshRoute in App.jsx), with no site nav or "copy your
  // link" chrome around it. It owns its own RSVP form and Wishes Wall
  // internally (both keyed to invite.slug via invitationSlug). The buyer's
  // own copy-link/WhatsApp-share moment lives on CreateInvitePage's success
  // step instead, not on the link guests actually receive.
  if (invite.occasion === 'wedding') {
    return (
      <>
        {seo}
        <InvitationExperience
          template={buildWeddingExperienceTemplate(invite, template)}
          invitationSlug={invite.slug}
        />
      </>
    )
  }

  // Ganesh Chaturthi / Guruji Satsang invites keep the lighter preview-card
  // treatment (plus the copy-link/share banner) for now — those templates
  // route through several bespoke per-template layout components (see
  // GaneshExperience.jsx / SatsangExperience.jsx) that don't yet support an
  // external slug override the way InvitationExperience now does.
  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      {seo}
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-14 pb-10 sm:pt-16 sm:pb-12 text-center">
          <motion.div
            initial={reduceMotion ? undefined : { scale: 0, rotate: -30 }}
            animate={reduceMotion ? undefined : { scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14 }}
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush border border-gold-soft shadow-card"
          >
            <PartyPopper className="h-6 w-6 text-rose" strokeWidth={1.5} />
          </motion.div>
          <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-3">
            Your Invitation Is Live!
          </h1>
          <p className="mx-auto max-w-xl text-ink-soft mb-8">
            {invite.templateName} is ready to share — copy your link below or
            send it straight to your guests on WhatsApp.
          </p>

          <div className="mx-auto flex max-w-lg flex-col gap-3 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-white/60 bg-ivory/80 backdrop-blur-xl px-5 py-3 shadow-card">
              <input
                readOnly
                value={shareUrl}
                onFocus={(e) => e.target.select()}
                className="w-full truncate bg-transparent text-sm text-ink focus:outline-none"
              />
              <button
                type="button"
                onClick={handleCopy}
                className="flex shrink-0 items-center gap-1.5 rounded-full bg-rose px-3.5 py-2 text-xs font-medium text-ivory shadow-card transition-colors"
              >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-5 py-3 text-sm font-semibold text-ink shadow-card transition-transform hover:scale-[1.03]"
            >
              <MessageCircle className="h-4 w-4" />
              Share on WhatsApp
            </a>
          </div>
        </section>

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-4 flex items-center justify-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
              <CheckCircle2 className="h-3.5 w-3.5 text-rose" />
              Your Invitation Preview
            </div>
            <InvitePreviewCard
              template={template}
              values={{
                names: invite.names,
                date: invite.date,
                time: invite.time,
                venue: invite.venue,
                locationUrl: invite.locationUrl,
                message: invite.message,
              }}
            />
          </div>
        </section>

        <RsvpForm palette={template.palette} slug={invite.slug} />
        <WishesWall slug={invite.slug} />
      </main>

      <SiteFooter />
    </div>
  )
}
