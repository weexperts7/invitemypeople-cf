import { useCallback, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CalendarPlus,
  Camera,
  Clock,
  CreditCard,
  Eye,
  Link as LinkIcon,
  Loader2,
  MapPin,
  MessageSquareText,
  Wand2,
} from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import TemplateStyleSelector from '../components/builder/TemplateStyleSelector'
import InvitePreviewCard from '../components/builder/InvitePreviewCard'
import PhotoUploader from '../components/builder/PhotoUploader'
import EventsListEditor from '../components/builder/EventsListEditor'
import PaymentModal from '../components/builder/PaymentModal'
import {
  OCCASIONS,
  getBuilderTemplateById,
  getBuilderTemplatesForOccasion,
  getOccasion,
} from '../data/builderTemplates'
import { PRICING } from '../data/templatesData'
import { createInvite } from '../utils/inviteApi'
import { ROUTES_SEO } from '../data/routesSeo'

const EMPTY_FORM = {
  names: '',
  eventTitle: '',
  date: '',
  time: '',
  venue: '',
  locationUrl: '',
  message: '',
}

// Phase 2 of the self-service Invitation Builder: pick a template style,
// fill in the details, watch the live preview update as you type, then pay
// (Razorpay Standard Checkout — see PaymentModal.jsx) and land on
// a real, shareable /i/:slug invitation page with working RSVP + Wishes Wall
// (see GeneratedInvitePage.jsx). Phase 1 handed this off to WhatsApp instead
// — that flow still exists everywhere else on the site (see CustomizeModal.jsx).
export default function CreateInvitePage() {
  const reduceMotion = useReducedMotion()
  const navigate = useNavigate()
  const [occasionId, setOccasionId] = useState(OCCASIONS[0].id)
  const [templateId, setTemplateId] = useState(
    () => getBuilderTemplatesForOccasion(OCCASIONS[0].id)[0].id,
  )
  const [form, setForm] = useState(EMPTY_FORM)
  const [photos, setPhotos] = useState([])
  const [events, setEvents] = useState([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [paymentOpen, setPaymentOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState(null)

  const occasion = getOccasion(occasionId)
  const template = getBuilderTemplateById(templateId)

  const handleOccasionChange = (nextOccasionId) => {
    setOccasionId(nextOccasionId)
    setTemplateId(getBuilderTemplatesForOccasion(nextOccasionId)[0].id)
  }

  const handleField = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const missingRequired =
    submitAttempted && (!form.names.trim() || !form.date || !form.venue.trim())

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitAttempted(true)
    setSaveError(null)
    if (!form.names.trim() || !form.date || !form.venue.trim()) return
    setPaymentOpen(true)
  }

  // Fires once PaymentModal's Razorpay Checkout flow confirms and verifies
  // payment — save the invite, then send the user straight to their new
  // live page.
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
          amount: PRICING.shagunPrice,
          paymentId,
          photos,
          events,
        })
        navigate(`/i/${invite.slug}`)
      } catch (err) {
        console.error('[Invitation Builder] failed to save invite after payment:', err)
        setSaveError(
          "Your payment went through, but we couldn't save your invitation just now. Please try again — nothing was charged twice.",
        )
        setPaymentOpen(false)
        setSaving(false)
      }
    },
    [occasionId, template, form, photos, events, navigate],
  )

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
          <form onSubmit={handleSubmit} className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.05fr_1fr] lg:items-start">
              {/* Preview comes first in the DOM so mobile visitors see the
                  payoff immediately; on desktop it flips to a sticky right
                  rail next to the form. */}
              <div className="order-1 lg:order-2 lg:sticky lg:top-24">
                <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
                  <Eye className="h-3.5 w-3.5 text-rose" />
                  Live Preview
                </div>
                <InvitePreviewCard template={template} values={form} />
                <p className="mt-3 text-center text-xs text-ink-soft/80">
                  Updates instantly as you type — this is exactly how your
                  invitation will look.
                </p>
              </div>

              <div className="order-2 lg:order-1 space-y-8">
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
                          value={form.date}
                          onChange={handleField('date')}
                          className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                        />
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
                        type="url"
                        value={form.locationUrl}
                        onChange={handleField('locationUrl')}
                        placeholder="Paste your Google Maps link"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                      />
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
                        placeholder="Share a warm note for your guests"
                        className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft resize-none"
                      />
                    </div>

                    {occasionId === 'wedding' && (
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
                        Please add your names, event date and venue before
                        generating your invite.
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
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-gold px-7 py-4 text-base font-semibold text-ink shadow-soft transition-transform disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Saving Your Invite&hellip;
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Proceed to Checkout — Generate My Invite
                      </>
                    )}
                  </motion.button>
                  <p className="mt-3 text-center text-xs text-ink-soft">
                    &#8377;{PRICING.shagunPrice.toLocaleString('en-IN')} via Razorpay
                    (Test Mode) — then get your own live, shareable invitation
                    link instantly.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </section>
      </main>

      <SiteFooter />

      <PaymentModal
        open={paymentOpen}
        amount={PRICING.shagunPrice}
        summary={{ templateName: template.name, names: form.names.trim() || occasion.namesPlaceholder }}
        onClose={() => (saving ? null : setPaymentOpen(false))}
        onSuccess={handlePaymentSuccess}
      />
    </div>
  )
}
