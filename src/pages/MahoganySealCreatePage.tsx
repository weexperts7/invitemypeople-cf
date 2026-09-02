import { useState } from 'react'
import { Link } from 'react-router-dom'

import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import '../components/templates/MahoganySealTemplate/MahoganySealTemplate.css'
import { formatDateLabel } from '../components/templates/MahoganySealTemplate/defaults'
import EventDetailsEditor from '../components/templates/MahoganySealTemplate/components/EventDetailsEditor'
import MstPhotoUploader from '../components/templates/MahoganySealTemplate/components/MstPhotoUploader'
import { EMPTY_LEAD_EVENT, type LeadEvent } from '../components/templates/MahoganySealTemplate/components/leadFormTypes'

// Every WhatsApp CTA site-wide reaches this same business number (see
// SiteHeader.jsx/SiteFooter.jsx/WeddingsPage.jsx, all const WHATSAPP_NUMBER
// = '918847044554').
const WHATSAPP_NUMBER = '918847044554'

interface LeadForm {
  partner1Name: string
  partner2Name: string
  weddingDate: string
  weddingTime: string
  hashtag: string
  song: string
  footerMessage: string
  hostName: string
  hostPhone: string
  hostEmail: string
  notes: string
}

const EMPTY_FORM: LeadForm = {
  partner1Name: '',
  partner2Name: '',
  weddingDate: '',
  weddingTime: '',
  hashtag: '',
  song: '',
  footerMessage: '',
  hostName: '',
  hostPhone: '',
  hostEmail: '',
  notes: '',
}

// `font-sans` (Poppins/system-ui, the site's own default body font — see
// index.css's `--font-sans`) rather than inheriting `.mst-root`'s decorative
// Cormorant Garamond: that display serif is meant for headings and labels,
// not text a guest is actively typing/reading back — at input-field sizes
// it reads faint and hard to make out. Labels (`labelClasses`, via
// `mst-font-seal`) keep the template's own branded type; only what a buyer
// actually types switches to a plain, always-legible font.
const inputClasses =
  'w-full rounded-lg border border-[#d4af37]/30 bg-[#fbf3e3] px-4 py-2.5 font-sans text-[#2c1d18] placeholder:text-[#8a6a1f]/50 outline-none transition-colors focus:border-[#8b1e1e] focus:ring-2 focus:ring-[#8b1e1e]/15'
const labelClasses = 'mst-font-seal mb-1.5 block text-[11px] tracking-[0.12em] text-[#d4af37] uppercase'
const sectionCardClasses = 'rounded-2xl border border-[#d4af37]/25 bg-[#3d2820]/60 p-5 sm:p-8'

function StepBadge({ n }: { n: number }) {
  return (
    <span className="mst-font-seal flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#8b1e1e] text-xs font-semibold text-[#fbf3e3]">
      {n}
    </span>
  )
}

function composeWhatsAppMessage(form: LeadForm, events: LeadEvent[], gallery: string[], p1Photo: string[], p2Photo: string[]) {
  const lines: string[] = []
  lines.push("Hi! I'd love to create my own Mahogany Seal wedding invitation. Here are our details:")
  lines.push('')
  lines.push(`Couple: ${form.partner1Name} & ${form.partner2Name}`)
  if (form.hashtag) lines.push(`Hashtag: ${form.hashtag}`)
  if (form.weddingDate) {
    lines.push(`Wedding Date: ${formatDateLabel(form.weddingDate)}${form.weddingTime ? ` — ${form.weddingTime}` : ''}`)
  }

  const filledEvents = events.filter((e) => e.name || e.date || e.venue)
  if (filledEvents.length) {
    lines.push('')
    lines.push('Events:')
    filledEvents.forEach((e, i) => {
      const bits = [e.date ? formatDateLabel(e.date) : null, e.time, e.venue].filter(Boolean).join(', ')
      lines.push(`${i + 1}. ${e.name || 'Event'}${bits ? ` — ${bits}` : ''}${e.note ? ` (${e.note})` : ''}`)
    })
  }

  if (gallery.length) {
    lines.push('')
    lines.push('Gallery Photos:')
    gallery.forEach((url, i) => lines.push(`${i + 1}. ${url}`))
  }

  if (p1Photo[0] || p2Photo[0]) {
    lines.push('')
    lines.push('Individual Photos (for our caricature video):')
    if (p1Photo[0]) lines.push(`${form.partner1Name || 'Partner 1'}: ${p1Photo[0]}`)
    if (p2Photo[0]) lines.push(`${form.partner2Name || 'Partner 2'}: ${p2Photo[0]}`)
  }

  if (form.song) {
    lines.push('')
    lines.push(`Background Song: ${form.song}`)
  }

  if (form.footerMessage) {
    lines.push('')
    lines.push(`Footer Message: ${form.footerMessage}`)
  }

  if (form.notes) {
    lines.push('')
    lines.push(`Anything else: ${form.notes}`)
  }

  lines.push('')
  lines.push(`My name: ${form.hostName}`)
  lines.push(`My phone: ${form.hostPhone}`)
  if (form.hostEmail) lines.push(`My email: ${form.hostEmail}`)

  return lines.join('\n')
}

/**
 * The Mahogany Seal template's detailed "tell us everything" form — couple
 * names, wedding date, an events list, hashtag, gallery photos, each
 * partner's individual photo for the caricature, a background song, a
 * footer message, contact details. Nothing on the site links here
 * automatically anymore: the template's own "Create Your Own Invitation" CTA (see
 * `MahoganySealTemplate.tsx`) and the listing card's "Customize" button
 * (see `TemplateCard.jsx`) both open a plain WhatsApp chat straight away
 * instead — an instant, near-zero-friction lead the moment someone taps
 * either one, before they've had to fill in a single field. This page is
 * what our team sends the lead *after* that first WhatsApp reply, so they
 * can fill in the rest of the details on their own time; its own URL
 * (`/mahogany-seal/create`) is deliberately a clean, permanent one since
 * it's meant to be pasted straight into a real conversation, not read as
 * an internal/temporary link.
 *
 * The self-service Invitation Builder's instant, Razorpay-backed checkout
 * doesn't apply here — this template's caricature intro video is bespoke,
 * hand-produced work — so submitting this form still hands off to
 * WhatsApp (same WHATSAPP_NUMBER every other CTA site-wide already uses)
 * with everything filled in, rather than an instant checkout; the team
 * follows up with the buyer's own live template link and payment details
 * once it's ready.
 *
 * Every photo (`MstPhotoUploader`) uploads immediately to the same
 * `POST /api/photos` endpoint the real Invitation Builder uses — so what
 * lands in the WhatsApp message is a real, clickable Supabase Storage URL,
 * not a raw file WhatsApp's own web share sheet has no way to attach for
 * us. Nothing here writes to any database table; the WhatsApp message IS
 * the submission, same as the site's original Phase 1 "Buy Now on
 * WhatsApp" CTA (see utils/createLink.js's own comment on that history) —
 * so this page can't affect the self-service builder's own DB-backed flow
 * (`invites` table, Razorpay, `/api/invites`) at all.
 */
export default function MahoganySealCreatePage() {
  const [form, setForm] = useState<LeadForm>(EMPTY_FORM)
  const [events, setEvents] = useState<LeadEvent[]>([{ ...EMPTY_LEAD_EVENT }])
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([])
  const [partner1Photo, setPartner1Photo] = useState<string[]>([])
  const [partner2Photo, setPartner2Photo] = useState<string[]>([])
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleField = (field: keyof LeadForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const missingRequired =
    !form.partner1Name.trim() || !form.partner2Name.trim() || !form.weddingDate || !form.hostName.trim() || !form.hostPhone.trim()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitAttempted(true)
    if (missingRequired) {
      // Scrolls the guest back up to the top-of-form error banner instead
      // of leaving them stranded at the bottom next to the submit button
      // wondering why nothing happened.
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    const message = composeWhatsAppMessage(form, events, galleryPhotos, partner1Photo, partner2Photo)
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer')
    setSubmitted(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleStartOver = () => {
    setForm(EMPTY_FORM)
    setEvents([{ ...EMPTY_LEAD_EVENT }])
    setGalleryPhotos([])
    setPartner1Photo([])
    setPartner2Photo([])
    setSubmitAttempted(false)
    setSubmitted(false)
  }

  return (
    <div className="mst-root min-h-svh w-full bg-[#1a100d]">
      <SEO
        title="Create Your Own Mahogany Seal Invitation | InviteMyPeople"
        description="Share your wedding details and we'll hand-build your own Mahogany Seal invitation, caricature video included."
        path="/mahogany-seal/create"
        noindex
      />
      <SiteHeader />

      <main className="px-6 py-14 sm:py-20">
        <div className="mx-auto max-w-2xl">
          <Link
            to="/templates/wedding/mahogany-seal"
            className="mst-font-seal mb-8 inline-flex items-center gap-1.5 text-xs tracking-[0.15em] text-[#8a6a1f] uppercase transition-colors hover:text-[#d4af37]"
          >
            &larr; Back to the invitation
          </Link>

          {submitted ? (
            <div className="rounded-3xl border border-[#d4af37]/30 bg-[#2c1d18] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.5)] sm:p-12">
              <span className="mst-seal mx-auto flex h-16 w-16 items-center justify-center rounded-full text-2xl text-[#f2d675]">✓</span>
              <p className="mst-font-display mt-6 text-3xl font-semibold text-[#fbf3e3]">Thank you, {form.hostName}!</p>
              <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#fbf3e3]/70">
                We've opened WhatsApp with every detail you shared, already filled in — just hit{' '}
                <span className="text-[#f2d675]">Send</span> there. Our team will get back to you within 24 hours
                with your own live template link and payment details.
              </p>
              <p className="mst-font-seal mx-auto mt-4 max-w-sm text-[11px] tracking-[0.1em] text-[#d4af37]/70 uppercase">
                Didn't see WhatsApp open? Check your pop-up blocker, or message us directly at +91 88470 44554.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleStartOver}
                  className="mst-font-seal rounded-full border border-[#d4af37]/40 px-6 py-3 text-xs tracking-[0.15em] text-[#d4af37] uppercase transition-colors hover:bg-[#d4af37]/10"
                >
                  Submit another request
                </button>
                <Link
                  to="/templates/wedding/mahogany-seal"
                  className="mst-font-seal rounded-full bg-[#8b1e1e] px-6 py-3 text-xs tracking-[0.15em] text-[#fbf3e3] uppercase shadow-[0_10px_24px_-8px_rgba(139,30,30,0.6)]"
                >
                  Back to the invitation
                </Link>
              </div>
            </div>
          ) : (
            <>
              <p className="mst-font-seal text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">Mahogany Seal</p>
              <h1 className="mst-font-display mt-2 text-3xl font-semibold text-[#fbf3e3] sm:text-4xl">
                Create Your Own Invitation
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-[#fbf3e3]/70 sm:text-base">
                Share your details below and we'll hand-build this exact experience — cinematic intro, countdown,
                itinerary, gallery, and RSVP — around your own wedding. When you're done, we'll open WhatsApp with
                everything filled in for you to send.
              </p>

              <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={1} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">The Couple &amp; The Date</h2>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cyo-partner1" className={labelClasses}>
                          Partner 1 Name
                        </label>
                        <input
                          id="cyo-partner1"
                          type="text"
                          required
                          value={form.partner1Name}
                          onChange={handleField('partner1Name')}
                          placeholder="e.g. Shaya"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor="cyo-partner2" className={labelClasses}>
                          Partner 2 Name
                        </label>
                        <input
                          id="cyo-partner2"
                          type="text"
                          required
                          value={form.partner2Name}
                          onChange={handleField('partner2Name')}
                          placeholder="e.g. Rehaan"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cyo-date" className={labelClasses}>
                          Wedding Date
                        </label>
                        <input
                          id="cyo-date"
                          type="date"
                          required
                          value={form.weddingDate}
                          onChange={handleField('weddingDate')}
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor="cyo-time" className={labelClasses}>
                          Time <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                        </label>
                        <input
                          id="cyo-time"
                          type="text"
                          value={form.weddingTime}
                          onChange={handleField('weddingTime')}
                          placeholder="e.g. 6:30 PM onwards"
                          className={inputClasses}
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="cyo-hashtag" className={labelClasses}>
                        Wedding Hashtag <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                      </label>
                      <input
                        id="cyo-hashtag"
                        type="text"
                        value={form.hashtag}
                        onChange={handleField('hashtag')}
                        placeholder="e.g. #ShayaWedsRehaan"
                        className={inputClasses}
                      />
                    </div>
                  </div>
                </div>

                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={2} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">Your Events</h2>
                  </div>
                  <p className="mb-4 font-sans text-xs text-[#fbf3e3]/60">
                    Engagement, Wedding Ceremony, Reception — add each function with its own date, time and venue.
                  </p>
                  <EventDetailsEditor events={events} onChange={setEvents} />
                </div>

                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={3} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">Your Photos</h2>
                  </div>

                  <div className="mb-6">
                    <label className={labelClasses}>
                      Gallery Photos <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                    </label>
                    <p className="mb-3 font-sans text-xs text-[#fbf3e3]/60">
                      A few favorites for the gallery strip guests will scroll through.
                    </p>
                    <MstPhotoUploader
                      photos={galleryPhotos}
                      onChange={setGalleryPhotos}
                      max={6}
                      hint="Up to 6 photos, JPEG/PNG/WebP, 4MB each."
                    />
                  </div>

                  <div>
                    <label className={labelClasses}>Individual Couple Photos</label>
                    <div className="mt-3 rounded-xl border border-[#d4af37]/40 bg-[#8b1e1e]/10 px-4 py-3">
                      <p className="font-sans text-xs leading-relaxed text-[#f2d675]">
                        ✨ We'll turn these two photos into your very own animated caricature video for the intro —
                        just like the one you saw when you opened this invite. Clear, front-facing photos work best.
                      </p>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-6 sm:max-w-xs">
                      <div>
                        {/* Same `labelClasses` every other field label on this
                            page uses (was its own slightly-smaller, slightly
                            dimmer one-off style) — sat right next to "Gallery
                            Photos"/"Individual Couple Photos" above, a
                            different size read as visibly inconsistent. */}
                        <p className={labelClasses}>{form.partner1Name || 'Partner 1'}</p>
                        <MstPhotoUploader photos={partner1Photo} onChange={setPartner1Photo} max={1} />
                      </div>
                      <div>
                        <p className={labelClasses}>{form.partner2Name || 'Partner 2'}</p>
                        <MstPhotoUploader photos={partner2Photo} onChange={setPartner2Photo} max={1} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={4} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">Your Song</h2>
                  </div>
                  <label htmlFor="cyo-song" className={labelClasses}>
                    Background music for your invitation{' '}
                    <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                  </label>
                  <p className="mb-3 font-sans text-xs text-[#fbf3e3]/60">
                    This plays the moment a guest opens your invite, right alongside the intro video — a song name
                    and artist is enough, or paste a YouTube/Spotify link if you already have one in mind.
                  </p>
                  <input
                    id="cyo-song"
                    type="text"
                    value={form.song}
                    onChange={handleField('song')}
                    placeholder="e.g. Perfect – Ed Sheeran, or a YouTube/Spotify link"
                    className={inputClasses}
                  />
                </div>

                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={5} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">Footer Message</h2>
                  </div>
                  <label htmlFor="cyo-footer" className={labelClasses}>
                    Shown at the very bottom of your invitation{' '}
                    <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                  </label>
                  <textarea
                    id="cyo-footer"
                    rows={3}
                    value={form.footerMessage}
                    onChange={handleField('footerMessage')}
                    placeholder="e.g. Your presence is the best gift we could ask for. Thank you for being part of our story."
                    className={`${inputClasses} resize-none`}
                  />
                </div>

                <div className={sectionCardClasses}>
                  <div className="mb-5 flex items-center gap-2">
                    <StepBadge n={6} />
                    <h2 className="mst-font-display text-xl text-[#fbf3e3]">Your Contact Details</h2>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="cyo-host-name" className={labelClasses}>
                        Your Name
                      </label>
                      <input
                        id="cyo-host-name"
                        type="text"
                        required
                        value={form.hostName}
                        onChange={handleField('hostName')}
                        placeholder="Who should we ask for on WhatsApp?"
                        className={inputClasses}
                      />
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label htmlFor="cyo-host-phone" className={labelClasses}>
                          WhatsApp Number
                        </label>
                        <input
                          id="cyo-host-phone"
                          type="tel"
                          required
                          value={form.hostPhone}
                          onChange={handleField('hostPhone')}
                          placeholder="+91 98765 43210"
                          className={inputClasses}
                        />
                      </div>
                      <div>
                        <label htmlFor="cyo-host-email" className={labelClasses}>
                          Email <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                        </label>
                        <input
                          id="cyo-host-email"
                          type="email"
                          value={form.hostEmail}
                          onChange={handleField('hostEmail')}
                          placeholder="you@example.com"
                          className={inputClasses}
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="cyo-notes" className={labelClasses}>
                        Anything else we should know?{' '}
                        <span className="normal-case tracking-normal text-[#8a6a1f]/70">(optional)</span>
                      </label>
                      <textarea
                        id="cyo-notes"
                        rows={2}
                        value={form.notes}
                        onChange={handleField('notes')}
                        className={`${inputClasses} resize-none`}
                      />
                    </div>
                  </div>
                </div>

                {submitAttempted && missingRequired && (
                  <div className="rounded-lg border border-[#8b1e1e]/40 bg-[#8b1e1e]/10 px-4 py-2.5 font-sans text-sm text-[#f2d675]">
                    Please add both names, your wedding date, and your name and WhatsApp number before continuing.
                  </div>
                )}

                <button
                  type="submit"
                  className="mst-font-seal flex w-full items-center justify-center gap-2 rounded-full bg-[#8b1e1e] py-4 text-sm tracking-[0.15em] text-[#fbf3e3] uppercase shadow-[0_10px_24px_-8px_rgba(139,30,30,0.6)] transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Send My Details via WhatsApp
                </button>
                <p className="text-center font-sans text-xs text-[#fbf3e3]/50">
                  We'll reply on WhatsApp with your live template link — payment is completed there once you're happy
                  with it.
                </p>
              </form>
            </>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
