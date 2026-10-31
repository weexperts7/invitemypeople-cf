import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  Camera,
  Check,
  Clock,
  Copy,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Music2,
  Phone,
  Sparkles,
  Users,
} from 'lucide-react'
import SEO from '../../components/SEO'
import TemplateStyleSelector from '../../components/builder/TemplateStyleSelector'
import InvitePreviewPanel from '../../components/builder/InvitePreviewPanel'
import PhotoUploader from '../../components/builder/PhotoUploader'
import EventsListEditor from '../../components/builder/EventsListEditor'
import SinglePhotoUploader from '../../components/builder/SinglePhotoUploader'
import SongSearchPicker from '../../components/builder/SongSearchPicker'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { getBuilderTemplateById, getBuilderTemplatesForOccasion, getOccasion } from '../../data/builderTemplates'
import { getMyCredits, createClientInvite } from '../../utils/partnerApi'
import { SITE_URL } from '../../data/routesSeo'
import { todayDateInputValue } from '../../utils/todayDateInput'
import { PORTRAIT_HINT, VENUE_PHOTO_HINT } from '../../utils/photoUpload'

const OCCASION_ID = 'wedding' // Partner Portal is wedding-only for now — see B2B-PARTNER-PORTAL-SETUP.md.
const PHOTO_ENDPOINT = '/api/partners/photos'

const EMPTY_FORM = {
  names: '',
  eventTitle: '',
  clientEmail: '',
  clientPhone: '',
  date: '',
  time: '',
  venue: '',
  locationUrl: '',
  message: '',
  // The short invocation above the couple's names (see WelcomeSplash.jsx's
  // greeting.line — "Shubh Vivah", "Radhe Radhe", "Rab Rakha", ...). Falls
  // back to the selected template's own stock line when left blank (see
  // buildWeddingExperienceTemplate.js).
  greetingLine: '',
  // "Family Details" — rendered as two cards under the couple's names on
  // the live invitation (see WelcomeSplash.jsx's couple.people).
  groomName: '',
  groomParents: '',
  brideName: '',
  brideParents: '',
  groomPhoto: '',
  bridePhoto: '',
  venuePhoto: '',
}

// Shown once, right after a successful generation — the /p/:slug link this
// partner hands off to their client. Deliberately NOT the host-dashboard
// link: that's the client's own private view of their live RSVPs (guest
// emails, attendance, messages), emailed directly to the client alone (see
// buildPartnerInviteReadyEmail()) — the partner never gets standing access
// to it through the Portal UI or API response (see createClientInvite() in
// api/_lib/partnerHandlers.js, which strips hostToken before this page ever
// sees it). Mirrors CreateInvitePage.jsx's own SuccessPanel for the
// consumer flow, minus that host-dashboard block.
function SuccessPanel({ invite, onCopy, copiedLink, onCreateAnother }) {
  const inviteUrl = `${SITE_URL}/p/${invite.slug}`

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-ivory/70 backdrop-blur-xl p-6 shadow-card sm:p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush">
        <Check className="h-6 w-6 text-rose" strokeWidth={2} />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl text-ink">Your Client&rsquo;s Invitation Is Live!</h2>
      <p className="mt-2 text-ink-soft">
        Share this link with your client — it&rsquo;s exactly what their
        guests will see. We&rsquo;ve also emailed your client this link,
        plus their own private dashboard link for tracking RSVPs.
      </p>

      <div className="mt-6 rounded-xl border border-champagne-deep/50 bg-ivory/80 p-4 text-left">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-1.5">Shareable link</p>
        <div className="flex items-center gap-2">
          <span className="flex-1 truncate text-sm text-ink">{inviteUrl}</span>
          <button
            type="button"
            onClick={() => onCopy(inviteUrl)}
            className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-xs font-medium text-ivory"
          >
            {copiedLink ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copiedLink ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <button
          type="button"
          onClick={onCreateAnother}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-gold px-6 py-3 text-sm font-semibold text-ink shadow-soft"
        >
          Create Another Invite
        </button>
        <Link
          to="/partners/dashboard"
          className="inline-flex items-center justify-center gap-2 rounded-full border border-champagne-deep/50 bg-ivory/70 px-6 py-3 text-sm font-medium text-ink"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  )
}

// The B2B Partner Portal's invite creation flow (see
// PartnerOverviewPage.jsx's "Create Invite" CTA) — the partner fills in
// exactly the fields a consumer would on /create, with the same
// form-left/preview-right layout and live preview, but spends 1 credit
// instead of paying Razorpay, and has no host-dashboard step. Auth + the
// active-partner-status guard both come from PartnerPortalShell.jsx, which
// mounts this inside the sidebar layout — no SiteHeader/SiteFooter or
// self-wrapped RequirePartnerAuth here, unlike its old standalone version.
export default function PartnerCreateInvitePage() {
  const reduceMotion = useReducedMotion()
  const { accessToken } = usePartnerAuth()

  const templates = getBuilderTemplatesForOccasion(OCCASION_ID)
  const occasion = getOccasion(OCCASION_ID)

  const [templateId, setTemplateId] = useState(templates[0].id)
  const [form, setForm] = useState(EMPTY_FORM)
  const [photos, setPhotos] = useState([])
  const [events, setEvents] = useState([])
  const [song, setSong] = useState(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState(null)
  const [createdInvite, setCreatedInvite] = useState(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [credits, setCredits] = useState(null)

  const template = getBuilderTemplateById(templateId)

  const loadCredits = useCallback(async () => {
    try {
      setCredits(await getMyCredits(accessToken))
    } catch (err) {
      console.error('[PartnerCreateInvite] failed to load credits:', err)
    }
  }, [accessToken])

  useEffect(() => {
    loadCredits()
  }, [loadCredits])

  const noCredits = (credits?.creditsRemaining ?? 0) < 1

  const handleField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handlePhoto = (field) => (url) => setForm((prev) => ({ ...prev, [field]: url }))

  const isPastDate = (dateStr) => Boolean(dateStr) && dateStr < todayDateInputValue()

  const isMissingRequired = () =>
    !form.names.trim() || !form.date || !form.venue.trim() || !form.clientEmail.trim() || !form.clientPhone.trim()

  const missingRequired = submitAttempted && isMissingRequired()
  const pastDateError = submitAttempted && isPastDate(form.date)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setCreateError(null)
    if (isMissingRequired()) return
    if (isPastDate(form.date)) return
    if (noCredits) return

    setCreating(true)
    try {
      const { invite } = await createClientInvite(accessToken, {
        templateId: template.id,
        coupleNames: form.names.trim(),
        eventTitle: form.eventTitle.trim(),
        clientEmail: form.clientEmail.trim(),
        clientPhone: form.clientPhone.trim(),
        weddingDate: form.date,
        weddingTime: form.time,
        venue: form.venue.trim(),
        locationUrl: form.locationUrl.trim(),
        message: form.message.trim(),
        greetingLine: form.greetingLine.trim(),
        groomName: form.groomName.trim(),
        groomParents: form.groomParents.trim(),
        brideName: form.brideName.trim(),
        brideParents: form.brideParents.trim(),
        // Kept in `form` across a style change, but only saved on a template
        // that actually shows them.
        groomPhoto: template.hasPortraits ? form.groomPhoto : '',
        bridePhoto: template.hasPortraits ? form.bridePhoto : '',
        venuePhoto: template.hasVenuePhotos ? form.venuePhoto : '',
        photos,
        events,
        bgSongTitle: song?.title || '',
        bgSongArtist: song?.artist || '',
        bgSongAlbumArt: song?.albumArt || '',
        bgSongPreviewUrl: song?.previewUrl || '',
      })
      setCreatedInvite(invite)
      await loadCredits()
    } catch (err) {
      console.error('[PartnerCreateInvite] failed to create invite:', err)
      setCreateError(err.message || 'Could not create the invite.')
    } finally {
      setCreating(false)
    }
  }

  const handleCopyLink = async (url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    } catch (err) {
      console.error('[PartnerCreateInvite] clipboard copy failed:', err)
    }
  }

  const handleCreateAnother = () => {
    setCreatedInvite(null)
    setForm(EMPTY_FORM)
    setPhotos([])
    setEvents([])
    setSong(null)
    setSubmitAttempted(false)
    setCreateError(null)
  }

  return (
    <div className="px-6 py-10 sm:py-14">
      <SEO title="Create a Client Invite | Partner Dashboard" path="/partners/dashboard/create" noindex />

      <div className="mx-auto max-w-6xl">
        <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Portal</p>
        <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
          <Sparkles className="h-6 w-6 text-rose" />
          Create a Client Invite
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-ink-soft">
          Choose a style and fill in your client&rsquo;s details — the
          exact same builder your own customers use. This spends 1 credit
          and gives you a live, shareable link instantly.
        </p>
        {!createdInvite && (
          <p className="mt-2 text-sm font-medium text-rose">
            {credits ? `${credits.creditsRemaining} credit${credits.creditsRemaining === 1 ? '' : 's'} remaining` : ' '}
          </p>
        )}
      </div>

      <div className="mt-8">
          {createdInvite ? (
            <SuccessPanel
              invite={createdInvite}
              onCopy={handleCopyLink}
              copiedLink={copiedLink}
              onCreateAnother={handleCreateAnother}
            />
          ) : (
            <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
              <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
                {/* On desktop, a sticky right rail next to the form. On
                    mobile, this renders no inline box at all — just a
                    floating "Preview" button that opens the same live
                    preview as a bottom sheet — see InvitePreviewPanel.jsx
                    (same layout as CreateInvitePage.jsx). */}
                <div className="lg:order-2">
                  <InvitePreviewPanel
                    template={template}
                    values={form}
                    occasionId={OCCASION_ID}
                    photos={photos}
                    events={events}
                    song={song}
                    showRsvp={false}
                    caption="Updates instantly as you type — this is exactly what your client’s guests will see."
                  />
                </div>

                <div className="lg:order-1 min-w-0 space-y-8">
                  <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                        1
                      </span>
                      <h2 className="font-serif text-xl text-ink">Choose a Style</h2>
                    </div>
                    <TemplateStyleSelector
                      occasionId={OCCASION_ID}
                      templateId={templateId}
                      onOccasionChange={() => {}}
                      onTemplateChange={setTemplateId}
                      showOccasionPicker={false}
                    />
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                        2
                      </span>
                      <h2 className="font-serif text-xl text-ink">Add Your Client&rsquo;s Details</h2>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="names" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          {occasion.namesLabel}
                        </label>
                        <input
                          id="names"
                          type="text"
                          required
                          value={form.names}
                          onChange={handleField('names')}
                          placeholder={occasion.namesPlaceholder}
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Users className="h-3.5 w-3.5 text-rose" />
                          Family Details <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          Shown as two cards under the couple&rsquo;s names —
                          e.g. &ldquo;Son of Mr. Rajesh &amp; Mrs. Kavita
                          Malhotra&rdquo;. Leave blank to skip this section.
                        </p>
                        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                          <div className="space-y-3">
                            <input
                              id="groomName"
                              type="text"
                              value={form.groomName}
                              onChange={handleField('groomName')}
                              placeholder="Groom's full name"
                              className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                            />
                            <input
                              id="groomParents"
                              type="text"
                              value={form.groomParents}
                              onChange={handleField('groomParents')}
                              placeholder="e.g. Son of Mr. Rajesh & Mrs. Kavita Malhotra"
                              className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                            />
                            {template.hasPortraits && (
                              <SinglePhotoUploader
                                label="Groom's photo"
                                hint={PORTRAIT_HINT}
                                url={form.groomPhoto}
                                onChange={handlePhoto('groomPhoto')}
                                endpoint={PHOTO_ENDPOINT}
                                token={accessToken}
                              />
                            )}
                          </div>
                          <div className="space-y-3">
                            <input
                              id="brideName"
                              type="text"
                              value={form.brideName}
                              onChange={handleField('brideName')}
                              placeholder="Bride's full name"
                              className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                            />
                            <input
                              id="brideParents"
                              type="text"
                              value={form.brideParents}
                              onChange={handleField('brideParents')}
                              placeholder="e.g. Daughter of Mr. Anil & Mrs. Sunita Kapoor"
                              className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                            />
                            {template.hasPortraits && (
                              <SinglePhotoUploader
                                label="Bride's photo"
                                hint={PORTRAIT_HINT}
                                url={form.bridePhoto}
                                onChange={handlePhoto('bridePhoto')}
                                endpoint={PHOTO_ENDPOINT}
                                token={accessToken}
                              />
                            )}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label htmlFor="eventTitle" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          Function Name <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <input
                          id="eventTitle"
                          type="text"
                          value={form.eventTitle}
                          onChange={handleField('eventTitle')}
                          placeholder="e.g. Wedding Ceremony"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="clientEmail" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                            <Mail className="h-3.5 w-3.5 text-rose" />
                            Client&rsquo;s Email
                          </label>
                          <input
                            id="clientEmail"
                            type="email"
                            required
                            value={form.clientEmail}
                            onChange={handleField('clientEmail')}
                            placeholder="couple@example.com"
                            className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                          />
                        </div>
                        <div>
                          <label htmlFor="clientPhone" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                            <Phone className="h-3.5 w-3.5 text-rose" />
                            Client&rsquo;s Phone Number
                          </label>
                          <input
                            id="clientPhone"
                            type="tel"
                            required
                            value={form.clientPhone}
                            onChange={handleField('clientPhone')}
                            placeholder="+91 98765 43210"
                            className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                          />
                        </div>
                      </div>

                      <p className="text-xs text-ink-soft">
                        We&rsquo;ll email your client their live invitation link as
                        soon as it&rsquo;s generated.
                      </p>

                      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                        <div>
                          <label htmlFor="date" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                            <Calendar className="h-3.5 w-3.5 text-rose" />
                            Event Date
                          </label>
                          <input
                            id="date"
                            type="date"
                            required
                            min={todayDateInputValue()}
                            value={form.date}
                            onChange={handleField('date')}
                            className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                          />
                          {pastDateError && (
                            <p className="mt-1.5 text-xs text-red-500">
                              Please choose a date that isn&rsquo;t in the past.
                            </p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="time" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                            <Clock className="h-3.5 w-3.5 text-rose" />
                            Event Time
                          </label>
                          <input
                            id="time"
                            type="time"
                            value={form.time}
                            onChange={handleField('time')}
                            className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="venue" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <MapPin className="h-3.5 w-3.5 text-rose" />
                          Venue Name
                        </label>
                        <input
                          id="venue"
                          type="text"
                          required
                          value={form.venue}
                          onChange={handleField('venue')}
                          placeholder="e.g. Rambagh Palace Gardens, Jaipur"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                        {template.hasVenuePhotos && (
                          <div className="mt-3">
                            <SinglePhotoUploader
                              shape="wide"
                              label="Venue photo"
                              hint={VENUE_PHOTO_HINT}
                              url={form.venuePhoto}
                              onChange={handlePhoto('venuePhoto')}
                              endpoint={PHOTO_ENDPOINT}
                              token={accessToken}
                            />
                          </div>
                        )}
                      </div>

                      <div>
                        <label htmlFor="locationUrl" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <LinkIcon className="h-3.5 w-3.5 text-rose" />
                          Location URL <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <input
                          id="locationUrl"
                          type="text"
                          value={form.locationUrl}
                          onChange={handleField('locationUrl')}
                          placeholder="Paste your Google Maps link"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>

                      <div>
                        <label htmlFor="greetingLine" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Sparkles className="h-3.5 w-3.5 text-rose" />
                          Opening Greeting <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <input
                          id="greetingLine"
                          type="text"
                          maxLength={80}
                          value={form.greetingLine}
                          onChange={handleField('greetingLine')}
                          placeholder='e.g. "Shubh Vivah" or "Together With Love"'
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                        <p className="mt-1.5 text-xs text-ink-soft">
                          Shown just above the couple&rsquo;s names. Leave blank
                          to use this template&rsquo;s own line.
                        </p>
                      </div>

                      <div>
                        <label htmlFor="message" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <MessageSquareText className="h-3.5 w-3.5 text-rose" />
                          Custom Welcome Message
                        </label>
                        <textarea
                          id="message"
                          rows={3}
                          value={form.message}
                          onChange={handleField('message')}
                          placeholder="Share a warm note for the guests"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft resize-none"
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Camera className="h-3.5 w-3.5 text-rose" />
                          Photos <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <PhotoUploader
                          photos={photos}
                          onChange={setPhotos}
                          endpoint={PHOTO_ENDPOINT}
                          token={accessToken}
                        />
                      </div>

                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <CalendarPlus className="h-3.5 w-3.5 text-rose" />
                          Additional Events <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          Add other functions — Haldi, Sangeet, Mehndi,
                          Reception — each with its own date, time and venue.
                        </p>
                        <EventsListEditor
                          events={events}
                          onChange={setEvents}
                          venuePhotoHint={template.hasVenuePhotos ? VENUE_PHOTO_HINT : undefined}
                          uploadEndpoint={PHOTO_ENDPOINT}
                          uploadToken={accessToken}
                        />
                      </div>

                      <div className="border-t border-champagne-deep/30 pt-5">
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Music2 className="h-3.5 w-3.5 text-rose" />
                          Background Music Selection <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          Search Spotify, preview any track, then confirm one
                          to play the moment guests open the invitation.
                        </p>
                        <SongSearchPicker
                          value={song}
                          onConfirm={setSong}
                          onRemove={() => setSong(null)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                    <div className="mb-5 flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                        3
                      </span>
                      <h2 className="font-serif text-xl text-ink">Generate the Invite</h2>
                    </div>

                    {missingRequired && (
                      <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                        <span>Please add the couple&rsquo;s names, email, phone number, event date, and venue before generating the invite.</span>
                      </div>
                    )}

                    {createError && (
                      <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                        <span>{createError}</span>
                      </div>
                    )}

                    {noCredits && !createError && (
                      <div className="mb-4 flex gap-2 rounded-xl border border-gold/40 bg-champagne/40 px-4 py-3 text-sm text-ink">
                        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-ink-soft" />
                        <span>
                          You have no credits remaining —{' '}
                          <Link to="/partners/dashboard/credits" className="font-medium text-rose underline">
                            buy a package
                          </Link>{' '}
                          first.
                        </span>
                      </div>
                    )}

                    <motion.button
                      type="submit"
                      disabled={creating || noCredits}
                      whileHover={reduceMotion || creating || noCredits ? undefined : { y: -2, scale: 1.01 }}
                      whileTap={creating || noCredits ? undefined : { scale: 0.98 }}
                      className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 py-4 text-base font-semibold text-ink shadow-soft transition-transform disabled:opacity-70 disabled:cursor-not-allowed sm:px-7"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                          Generating&hellip;
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 shrink-0" />
                          {/* Shorter mobile-only label — the full "(1
                              credit)" wording needs more room than a
                              phone-width button has without wrapping to
                              two lines. */}
                          <span className="sm:hidden">Generate Invite</span>
                          <span className="hidden sm:inline">Generate Invite (1 credit)</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
            </form>
          )}
      </div>
    </div>
  )
}
