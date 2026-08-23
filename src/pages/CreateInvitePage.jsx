import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  Camera,
  Check,
  Clock,
  Copy,
  CreditCard,
  Link as LinkIcon,
  Loader2,
  Mail,
  MapPin,
  MessageSquareText,
  Music2,
  Phone,
  ShieldCheck,
  User,
  Users,
  Wand2,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import TemplateStyleSelector from '../components/builder/TemplateStyleSelector'
import InvitePreviewPanel from '../components/builder/InvitePreviewPanel'
import PhotoUploader from '../components/builder/PhotoUploader'
import EventsListEditor from '../components/builder/EventsListEditor'
import SongSearchPicker from '../components/builder/SongSearchPicker'
import PaymentModal from '../components/builder/PaymentModal'
import {
  OCCASIONS,
  getBuilderTemplateById,
  getBuilderTemplatesForOccasion,
  getOccasion,
} from '../data/builderTemplates'
import { PRICING } from '../data/templatesData'
import { getActivePrice, isSaleActive } from '../data/sale'
import { createInvite } from '../utils/inviteApi'
import { getTemplatePrices } from '../utils/templatePriceApi'
import { todayDateInputValue } from '../utils/todayDateInput'
import { ROUTES_SEO } from '../data/routesSeo'

const EMPTY_FORM = {
  names: '',
  eventTitle: '',
  date: '',
  time: '',
  venue: '',
  locationUrl: '',
  message: '',
  hostName: '',
  hostEmail: '',
  hostPhone: '',
  // "Family Details" (wedding only — see the groomName/brideName fields
  // below) — rendered as two cards under the couple's names on the live
  // invitation (see WelcomeSplash.jsx's couple.people).
  groomName: '',
  groomParents: '',
  brideName: '',
  brideParents: '',
}

// Ganesh Chaturthi's "Festival Schedule" reuses the generic "Additional
// Events" list (see builder/EventsListEditor.jsx, backed by the same
// `events` JSON column every occasion's invite already stores) rather than
// adding dedicated new form fields/DB columns for each session. Auto-seeding
// these four titled-but-otherwise-empty rows the moment a buyer lands on
// this occasion is what makes it read as "dedicated fields" in the UI —
// the buyer fills in (or deletes) each one — and guarantees
// buildGaneshExperienceTemplate.js's keyword match always has something to
// find by default. MAX_ADDITIONAL_EVENTS is 5, so one extra custom entry
// still fits.
const GANESH_SCHEDULE_SEED = ['Morning Aarti', 'Evening Aarti', 'Visarjan Yatra', 'Maha Prasad'].map((title) => ({
  title,
  date: '',
  time: '',
  venue: '',
  locationUrl: '',
}))

// Shown once, right after a successful payment — the ONLY moment the host
// dashboard link (with its one-time host_token, see api/invites/index.js)
// is ever available. There's no login system in this app and no "resend my
// dashboard link" flow, so the copy here is deliberately blunt about saving
// it now.
function SuccessPanel({ invite, onCopy, copiedLink, onContinue }) {
  const inviteUrl = `${window.location.origin}/i/${invite.slug}`
  const hostUrl = `${window.location.origin}/i/${invite.slug}/host/${invite.hostToken}`

  return (
    <div className="mx-auto max-w-xl rounded-3xl border border-white/60 bg-ivory/70 backdrop-blur-xl p-6 shadow-card sm:p-10 text-center">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-blush">
        <Check className="h-6 w-6 text-rose" strokeWidth={2} />
      </div>
      <h2 className="font-serif text-2xl sm:text-3xl text-ink">Your Invitation Is Live!</h2>
      <p className="mt-2 text-ink-soft">
        Save both links below before continuing — the dashboard link in
        particular is shown only once and can&apos;t be recovered later.
      </p>

      <div className="mt-6 space-y-3 text-left">
        <div className="rounded-xl border border-champagne-deep/50 bg-ivory/80 p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-1.5">
            Share this with guests
          </p>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm text-ink">{inviteUrl}</span>
            <button
              type="button"
              onClick={() => onCopy('invite', inviteUrl)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-xs font-medium text-ivory"
            >
              {copiedLink === 'invite' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedLink === 'invite' ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gold/50 bg-blush/40 p-4">
          <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.2em] text-ink-soft mb-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-rose" />
            Your private host dashboard — save this!
          </p>
          <div className="flex items-center gap-2">
            <span className="flex-1 truncate text-sm text-ink">{hostUrl}</span>
            <button
              type="button"
              onClick={() => onCopy('host', hostUrl)}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rose px-3 py-1.5 text-xs font-medium text-ivory"
            >
              {copiedLink === 'host' ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              {copiedLink === 'host' ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="mt-2 text-xs text-ink-soft">
            See live RSVPs, download a guest-list CSV, and get an email
            summary before your event. Never share this link with guests.
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3 text-sm font-semibold text-ink shadow-soft"
      >
        Continue to My Invitation
      </button>
    </div>
  )
}

// Phase 2 of the self-service Invitation Builder: pick a template style,
// fill in the details, watch the live preview update as you type, then pay
// (Razorpay Standard Checkout — see PaymentModal.jsx) and land on
// a real, shareable /i/:slug invitation page with working RSVP + Wishes Wall
// (see GeneratedInvitePage.jsx). Phase 1 handed this off to WhatsApp instead
// (see the removed CustomizeModal.jsx) — every "Buy Now"/"Customize" CTA
// site-wide now links straight here instead (see utils/createLink.js), with
// the occasion/template pre-selected via ?occasion=&template= when known.
export default function CreateInvitePage() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  // Arriving via a "Customize"/"Buy Now" CTA elsewhere on the site (see
  // utils/createLink.js) pre-selects the occasion — and the exact template,
  // when the clicked one is among the builder's curated set — instead of
  // always dropping visitors on the first wedding style. When that's how
  // they got here, they've already implicitly picked a category (by
  // Customizing a wedding/Ganesh/Satsang template specifically), so
  // TemplateStyleSelector skips the occasion tabs entirely rather than
  // inviting them to go browse a category they didn't ask for.
  const requestedOccasionId = searchParams.get('occasion')
  // `!o.disabled` — a stale/hand-typed ?occasion=ganesh-chaturthi or
  // ?occasion=guruji-satsang link (see OCCASIONS' own comment in
  // builderTemplates.js) falls back to the default wedding occasion below,
  // same as if the param were missing or invalid, rather than honoring it.
  const occasionPreselected = OCCASIONS.some((o) => o.id === requestedOccasionId && !o.disabled)
  const initialOccasionId = occasionPreselected ? requestedOccasionId : OCCASIONS[0].id

  const [occasionId, setOccasionId] = useState(initialOccasionId)
  const [templateId, setTemplateId] = useState(() => {
    const candidates = getBuilderTemplatesForOccasion(initialOccasionId)
    const requestedTemplateId = searchParams.get('template')
    const requested = candidates.find((t) => t.id === requestedTemplateId)
    return (requested ?? candidates[0]).id
  })
  const [form, setForm] = useState(EMPTY_FORM)
  const [photos, setPhotos] = useState([])
  const [events, setEvents] = useState(() =>
    initialOccasionId === 'ganesh-chaturthi' ? GANESH_SCHEDULE_SEED : [],
  )
  // Background Music Selection (see builder/SongSearchPicker.jsx) — null
  // until the host confirms a Spotify search result; { title, artist,
  // albumArt, previewUrl } once they do. Optional: skipping it just means
  // the generated invitation plays the standard default track instead of
  // the host's own pick (see DEFAULT_BG_MUSIC_URL in InvitationExperience.jsx).
  const [song, setSong] = useState(null)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)
  const [createdInvite, setCreatedInvite] = useState(null)
  const [copiedLink, setCopiedLink] = useState(null) // 'invite' | 'host' | null

  const occasion = getOccasion(occasionId)
  const template = getBuilderTemplateById(templateId)

  // Super Admin Template Price Management overrides (see
  // api/_lib/templatePrices.js) — a sparse { [templateId]: price } map of
  // just the templates an admin has actually repriced. Fetched once and
  // kept fresh in the background; never blocks rendering — until it
  // resolves (or if it ever fails), every template just uses the same
  // global default price it always has, so a slow network or a
  // misconfigured Supabase project can never break checkout. See
  // getTemplatePrices()'s own comment.
  const [templatePriceOverrides, setTemplatePriceOverrides] = useState({})
  useEffect(() => {
    let cancelled = false
    getTemplatePrices()
      .then((rows) => {
        if (cancelled) return
        setTemplatePriceOverrides(Object.fromEntries(rows.map((row) => [row.templateKey, row.price])))
      })
      .catch((err) => console.error('[CreateInvitePage] failed to load template price overrides:', err))
    return () => {
      cancelled = true
    }
  }, [])

  // The price actually charged this session for the SELECTED template: a
  // Super Admin's override for it if one exists, otherwise the same global
  // default every template used before per-template pricing existed — the
  // launch-sale price while it's running, the standing launch price once it
  // ends (see ../data/sale.js). Every price shown on this page, and the
  // amount PaymentModal actually charges via Razorpay, reads from this so
  // nothing here can drift out of sync with what checkout enforces
  // server-side (POST /api/create-order re-derives this exact same value).
  const activePrice = templatePriceOverrides[template.id] ?? getActivePrice()
  const saleLive = isSaleActive()
  // Only meaningful as a "launch sale" badge when this template is actually
  // cheaper than the standing price — an admin override that happens to
  // price a template ABOVE PRICING.price (a premium template, say) should
  // never render as a negative-percent "sale".
  const savingsPercent =
    activePrice < PRICING.price ? Math.round(((PRICING.price - activePrice) / PRICING.price) * 100) : 0

  const handleOccasionChange = (nextOccasionId) => {
    setOccasionId(nextOccasionId)
    setTemplateId(getBuilderTemplatesForOccasion(nextOccasionId)[0].id)
    if (nextOccasionId === 'ganesh-chaturthi') {
      setEvents((prev) => (prev.length === 0 ? GANESH_SCHEDULE_SEED : prev))
    }
  }

  const handleField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isPastDate = (dateStr) => Boolean(dateStr) && dateStr < todayDateInputValue()

  const missingRequired =
    submitAttempted &&
    (!form.names.trim() ||
      !form.date ||
      !form.venue.trim() ||
      !form.hostName.trim() ||
      !form.hostEmail.trim() ||
      !form.hostPhone.trim())

  const pastDateError = submitAttempted && isPastDate(form.date)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setSaveError(null)
    if (
      !form.names.trim() ||
      !form.date ||
      !form.venue.trim() ||
      !form.hostName.trim() ||
      !form.hostEmail.trim() ||
      !form.hostPhone.trim() ||
      isPastDate(form.date)
    )
      return
    setPaymentOpen(true)
  }

  // Fires once PaymentModal's Razorpay Checkout flow confirms and verifies
  // payment — save the invite, then show the one-time success panel below
  // (not an automatic navigate — the host dashboard link/token is only ever
  // returned in this one response, see api/invites/index.js, so the user
  // needs a moment to actually see and save it before moving on).
  const handlePaymentSuccess = useCallback(
    async (paymentId) => {
      setSaving(true)
      setSaveError(null)
      try {
        const invite = await createInvite({
          occasion: occasionId,
          templateId: template.id,
          templateName: template.name,
          names: form.names.trim(),
          eventTitle: form.eventTitle.trim(),
          date: form.date,
          time: form.time,
          venue: form.venue.trim(),
          locationUrl: form.locationUrl.trim(),
          message: form.message.trim(),
          hostName: form.hostName.trim(),
          hostEmail: form.hostEmail.trim(),
          hostPhone: form.hostPhone.trim(),
          groomName: form.groomName.trim(),
          groomParents: form.groomParents.trim(),
          brideName: form.brideName.trim(),
          brideParents: form.brideParents.trim(),
          amount: activePrice,
          paymentId,
          photos,
          events,
          bgSongTitle: song?.title || '',
          bgSongArtist: song?.artist || '',
          bgSongAlbumArt: song?.albumArt || '',
          bgSongPreviewUrl: song?.previewUrl || '',
        })
        setCreatedInvite(invite)
        setPaymentOpen(false)
        setSaving(false)
        // The success panel replaces a long scrolled-down form; without
        // this the user lands mid-page instead of at the top of the panel.
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (err) {
        console.error('[Invitation Builder] failed to save invite after payment:', err)
        setSaveError(
          "Your payment went through, but we couldn't save your invitation just now. Please try again — nothing was charged twice.",
        )
        setPaymentOpen(false)
        setSaving(false)
      }
    },
    [occasionId, template, form, photos, events, song, activePrice],
  )

  const handleCopyLink = async (kind, url) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedLink(kind)
      setTimeout(() => setCopiedLink((current) => (current === kind ? null : current)), 2000)
    } catch (err) {
      console.error('[Invitation Builder] clipboard copy failed:', err)
    }
  }

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/create']} path="/create" />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-14 pb-10 sm:pt-16 sm:pb-12">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[8%] top-8 bg-blush-deep/40" size={130} duration={11} />
              <FloatingOrb className="right-[10%] top-16 bg-gold-soft/30" size={100} duration={9} delay={1.2} />
              <FloatingIcon icon={Wand2} className="right-[8%] top-10 hidden sm:block" duration={8} delay={0.8} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={Wand2} tone="rose">Invitation Builder</SectionEyebrow>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-4">
              Build Your Invitation, Live
            </h1>
            <p className="mx-auto max-w-xl text-ink-soft">
              Choose a style, fill in your details, and watch your invitation
              take shape instantly — then check out to get your own live,
              shareable invitation link.
            </p>
          </div>
        </section>

        <section className="bg-ivory px-6 py-12 sm:py-16">
          {createdInvite ? (
            <SuccessPanel
              invite={createdInvite}
              onCopy={handleCopyLink}
              copiedLink={copiedLink}
              onContinue={() => navigate(`/i/${createdInvite.slug}`)}
            />
          ) : (
          <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
              {/* On desktop, a sticky right rail next to the form. On
                  mobile, this renders no inline box at all — just a
                  floating "Preview" button that opens the same live
                  preview as a bottom sheet — see InvitePreviewPanel.jsx. */}
              <div className="lg:order-2">
                <InvitePreviewPanel
                  template={template}
                  values={form}
                  occasionId={occasionId}
                  photos={photos}
                  events={events}
                  song={song}
                />
              </div>

              <div className="lg:order-1 min-w-0 space-y-8">
                <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                      1
                    </span>
                    <h2 className="font-serif text-xl text-ink">Choose Your Style</h2>
                  </div>
                  <TemplateStyleSelector
                    occasionId={occasionId}
                    templateId={templateId}
                    onOccasionChange={handleOccasionChange}
                    onTemplateChange={setTemplateId}
                    showOccasionPicker={!occasionPreselected}
                  />
                </div>

                <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                      2
                    </span>
                    <h2 className="font-serif text-xl text-ink">Add Your Details</h2>
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

                    {occasionId === 'wedding' && (
                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Users className="h-3.5 w-3.5 text-rose" />
                          Family Details <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          Shown as two cards under your names — e.g. &ldquo;Son
                          of Mr. Rajesh &amp; Mrs. Kavita Malhotra&rdquo;. Leave
                          blank to skip this section.
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
                          </div>
                        </div>
                      </div>
                    )}

                    {occasionId === 'wedding' && (
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
                    )}

                    {occasionId === 'ganesh-chaturthi' && (
                      <div>
                        <label htmlFor="eventTitle" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Clock className="h-3.5 w-3.5 text-rose" />
                          Sthapana Muhurat <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <input
                          id="eventTitle"
                          type="time"
                          value={form.eventTitle}
                          onChange={handleField('eventTitle')}
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                        <p className="mt-1.5 text-xs text-ink-soft">
                          The auspicious Pran Pratishtha moment — shown on your invitation as the puja muhurat.
                        </p>
                      </div>
                    )}

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

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 border-t border-champagne-deep/30 pt-5">
                      <div>
                        <label htmlFor="hostName" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <User className="h-3.5 w-3.5 text-rose" />
                          Your Name
                        </label>
                        <input
                          id="hostName"
                          type="text"
                          required
                          value={form.hostName}
                          onChange={handleField('hostName')}
                          placeholder="Who's organizing this invite?"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>
                      <div>
                        <label htmlFor="hostEmail" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Mail className="h-3.5 w-3.5 text-rose" />
                          Your Email
                        </label>
                        <input
                          id="hostEmail"
                          type="email"
                          required
                          value={form.hostEmail}
                          onChange={handleField('hostEmail')}
                          placeholder="you@example.com"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>
                      <div>
                        <label htmlFor="hostPhone" className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Phone className="h-3.5 w-3.5 text-rose" />
                          Your Phone Number
                        </label>
                        <input
                          id="hostPhone"
                          type="tel"
                          required
                          value={form.hostPhone}
                          onChange={handleField('hostPhone')}
                          placeholder="+91 98765 43210"
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
                      </div>
                    </div>
                    <p className="-mt-2 text-xs text-ink-soft/80">
                      Private — used only for your host dashboard link and a
                      guest-list reminder email before your event. Never shown
                      to guests.
                    </p>

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
                        placeholder="Share a warm note for your guests"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft resize-none"
                      />
                    </div>

                    {(occasionId === 'wedding' || occasionId === 'ganesh-chaturthi') && (
                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Camera className="h-3.5 w-3.5 text-rose" />
                          Your Photos <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <PhotoUploader photos={photos} onChange={setPhotos} />
                      </div>
                    )}

                    {occasionId === 'wedding' && (
                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <CalendarPlus className="h-3.5 w-3.5 text-rose" />
                          Additional Events <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          Add other functions — Haldi, Sangeet, Mehndi,
                          Reception — each with its own date, time and venue.
                        </p>
                        <EventsListEditor events={events} onChange={setEvents} />
                      </div>
                    )}

                    {occasionId === 'ganesh-chaturthi' && (
                      <div>
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <CalendarPlus className="h-3.5 w-3.5 text-rose" />
                          Festival Schedule <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          We&rsquo;ve started you off with Morning Aarti, Evening
                          Aarti, Visarjan Yatra and Maha Prasad — fill in each
                          time, or delete any you don&rsquo;t need.
                        </p>
                        <EventsListEditor
                          events={events}
                          onChange={setEvents}
                          titlePlaceholder="e.g. Morning Aarti"
                        />
                      </div>
                    )}

                    {(occasionId === 'wedding' || occasionId === 'ganesh-chaturthi') && (
                      <div className="border-t border-champagne-deep/30 pt-5">
                        <label className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                          <Music2 className="h-3.5 w-3.5 text-rose" />
                          Background Music Selection <span className="normal-case text-ink-soft/70">(optional)</span>
                        </label>
                        <p className="mb-3 text-xs text-ink-soft">
                          {occasionId === 'ganesh-chaturthi'
                            ? 'Search for a devotional bhajan or festive instrumental, preview it, then confirm one to play the moment guests open your invitation.'
                            : 'Search Spotify, preview any track, then confirm one to play the moment guests open your invitation.'}
                        </p>
                        <SongSearchPicker
                          value={song}
                          onConfirm={setSong}
                          onRemove={() => setSong(null)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-3xl border border-white/60 bg-ivory/60 backdrop-blur-xl p-6 shadow-card sm:p-8">
                  <div className="mb-5 flex items-center gap-2">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose text-xs font-semibold text-ivory">
                      3
                    </span>
                    <h2 className="font-serif text-xl text-ink">Generate Your Invite</h2>
                  </div>

                  {missingRequired && (
                    <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                      <span>
                        Please add your names, event date, venue, and your own
                        name and email before generating your invite.
                      </span>
                    </div>
                  )}

                  {saveError && (
                    <div className="mb-4 flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose" />
                      <span>{saveError}</span>
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={saving}
                    whileHover={reduceMotion || saving ? undefined : { y: -2, scale: 1.01 }}
                    whileTap={saving ? undefined : { scale: 0.98 }}
                    className="flex w-full items-center justify-center gap-2 whitespace-nowrap rounded-full bg-gold px-5 py-4 text-base font-semibold text-ink shadow-soft transition-transform disabled:opacity-70 disabled:cursor-not-allowed sm:px-7"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                        Saving Your Invite&hellip;
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4 shrink-0" />
                        {/* Full copy needs real room to stay on one line —
                            a shorter mobile-only label swaps in below
                            `sm:` rather than letting this wrap to two
                            lines on a phone-width button. */}
                        <span className="sm:hidden">Generate My Invite</span>
                        <span className="hidden sm:inline">Proceed to Checkout — Generate My Invite</span>
                      </>
                    )}
                  </motion.button>
                  <p className="mt-3 flex flex-wrap items-center justify-center gap-1.5 text-center text-xs text-ink-soft">
                    <span className="font-semibold text-ink">
                      &#8377;{activePrice.toLocaleString('en-IN')}
                    </span>
                    {saleLive && savingsPercent > 0 && (
                      <>
                        <span className="text-ink-soft/60 line-through">
                          &#8377;{PRICING.price.toLocaleString('en-IN')}
                        </span>
                        <span className="rounded-full bg-blush px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.06em] text-rose">
                          Save {savingsPercent}%
                        </span>
                      </>
                    )}
                    <span>
                      via Razorpay — then get your own live, shareable invitation link instantly.
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </form>
          )}
        </section>
      </main>

      <SiteFooter />

      <PaymentModal
        open={paymentOpen}
        amount={activePrice}
        originalAmount={saleLive && savingsPercent > 0 ? PRICING.price : null}
        templateId={template.id}
        summary={{ templateName: template.name, names: form.names.trim() || occasion.namesPlaceholder }}
        onClose={() => (saving ? null : setPaymentOpen(false))}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
