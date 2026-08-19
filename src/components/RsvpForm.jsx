import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import {
  CheckCircle2,
  HeartHandshake,
  Loader2,
  AlertCircle,
  Music4,
  Quote,
} from 'lucide-react'
import Celebration from './Celebration'

// Supabase-backed in production (api/rsvps/index.js) and the flat-file
// counterpart in local dev (server/index.js) — see
// RSVPS-AND-REMINDERS-SETUP.md. Same-origin, so a plain JSON POST works with
// no CORS setup, unlike the old external Google Apps Script endpoint this
// replaced.
//
// `endpoint` is an optional override — the B2B Partner Portal's /p/:slug
// viewer (see PartnerInviteViewerPage.jsx) passes '/api/partners/rsvps' so
// guest RSVPs on a partner-created invite land in that table's own
// `partner_rsvps`, never the consumer `rsvps` table. Same pattern
// PhotoUploader.jsx's `endpoint` prop already established.
const DEFAULT_ENDPOINT = '/api/rsvps'

export default function RsvpForm({ palette, slug, endpoint = DEFAULT_ENDPOINT }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    attending: 'joyfully',
    guests: '1',
    song: '',
    advice: '',
    message: '',
  })
  // Bots fill this in; real guests never see it.
  const [honeypot, setHoneypot] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [celebrate, setCelebrate] = useState(false)
  const reduceMotion = useReducedMotion()

  const handleChange = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (status === 'sending') return

    setStatus('sending')

    try {
      const isAttending = form.attending === 'joyfully'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationSlug: slug,
          guestName: form.name,
          guestEmail: form.email,
          attendanceStatus: form.attending,
          // "5+" (see the <select> below) isn't itself a number — Number('5+')
          // is NaN — so strip the trailing "+" before parsing. Everyone who
          // picks it is counted as exactly 5; there's no way to RSVP for more
          // than that today.
          guests: isAttending ? Number(String(form.guests).replace('+', '')) || 1 : 0,
          song: form.song,
          advice: form.advice,
          message: form.message,
          website: honeypot,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok || (result && result.ok === false)) {
        throw new Error(result?.error || `HTTP ${response.status}`)
      }

      setStatus('success')
      if (form.attending === 'joyfully') setCelebrate(true)
    } catch (err) {
      console.error(
        `[RSVP] submission to ${endpoint} failed — is the RSVP API running? (npm run dev starts it)`,
        err,
      )
      setStatus('error')
    }
  }

  const isSending = status === 'sending'

  return (
    <section className="px-6 py-20">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="font-serif text-3xl sm:text-4xl text-ink text-center mb-2"
      >
        RSVP
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="text-ink-soft text-center mb-10"
      >
        Kindly respond by June 1, 2026
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 34, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto rounded-3xl border border-white/60 bg-ivory/50 backdrop-blur-xl shadow-soft p-6 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8"
            >
              <motion.div
                initial={{ scale: 0, rotate: -120 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.1 }}
              >
                <CheckCircle2
                  className="w-12 h-12 text-rose mx-auto mb-4"
                  strokeWidth={1.2}
                />
              </motion.div>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 }}
                className="font-serif text-2xl text-ink mb-2"
              >
                Thank you, {form.name || 'friend'}!
              </motion.p>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-ink-soft"
              >
                Your response has been received with love. We can&apos;t wait to
                celebrate with you.
              </motion.p>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="space-y-5 text-left"
            >
              <AnimatePresence>
                {status === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex gap-2 rounded-xl border border-rose/40 bg-blush/50 px-4 py-3 text-sm text-ink">
                      <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose" />
                      <span>
                        We couldn&apos;t save your response just now. Please try
                        again in a moment.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label
                  htmlFor="name"
                  className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                >
                  Your Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Full name"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                >
                  Email <span className="normal-case text-ink-soft/70">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
              </div>

              {/* honeypot — hidden from guests, catches bots */}
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden="true"
                value={honeypot}
                onChange={(e) => setHoneypot(e.target.value)}
                style={{
                  position: 'absolute',
                  left: '-9999px',
                  width: 1,
                  height: 1,
                  opacity: 0,
                }}
              />

              <div>
                <span className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                  Will you attend?
                </span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'joyfully', label: 'Joyfully accepts' },
                    { value: 'regretfully', label: 'Regretfully declines' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`cursor-pointer rounded-xl border px-3 py-3 text-center text-sm transition-colors ${
                        form.attending === option.value
                          ? 'border-gold bg-blush text-ink'
                          : 'border-champagne-deep/40 bg-ivory/60 text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="attending"
                        value={option.value}
                        checked={form.attending === option.value}
                        onChange={handleChange('attending')}
                        className="sr-only"
                      />
                      {option.label}
                    </motion.label>
                  ))}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {form.attending === 'joyfully' && (
                  <motion.div
                    key="guests"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    <label
                      htmlFor="guests"
                      className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                    >
                      Number of Guests
                    </label>
                    <select
                      id="guests"
                      value={form.guests}
                      onChange={handleChange('guests')}
                      className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink focus:outline-none focus:ring-2 focus:ring-gold-soft"
                    >
                      {['1', '2', '3', '4', '5+'].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* keepsake questions */}
              <div className="flex items-center gap-3 pt-1">
                <span className="h-px flex-1 bg-champagne-deep/50" />
                <span className="text-[10px] tracking-[0.25em] uppercase text-ink-soft">
                  Just for fun
                </span>
                <span className="h-px flex-1 bg-champagne-deep/50" />
              </div>

              <div>
                <label
                  htmlFor="song"
                  className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                >
                  <Music4 className="w-3.5 h-3.5 text-rose" />
                  A song for the dance floor
                </label>
                <input
                  id="song"
                  type="text"
                  value={form.song}
                  onChange={handleChange('song')}
                  placeholder="Artist &ndash; Song title"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 transition-shadow focus:outline-none focus:ring-2 focus:ring-gold-soft"
                />
                <p className="mt-1.5 text-xs text-ink-soft/80">
                  We&apos;ll add it to the sangeet playlist.
                </p>
              </div>

              <div>
                <label
                  htmlFor="advice"
                  className="flex items-center gap-2 text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                >
                  <Quote className="w-3.5 h-3.5 text-rose" />
                  Marriage advice for us
                </label>
                <textarea
                  id="advice"
                  rows={3}
                  value={form.advice}
                  onChange={handleChange('advice')}
                  placeholder="The one thing you wish someone had told you&hellip;"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft resize-none"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2"
                >
                  Blessings &amp; Wishes
                </label>
                <textarea
                  id="message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Share your wishes for the couple"
                  className="w-full rounded-xl border border-champagne-deep/50 bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:ring-2 focus:ring-gold-soft resize-none"
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSending}
                whileHover={reduceMotion || isSending ? undefined : { y: -2, scale: 1.01 }}
                whileTap={isSending ? undefined : { scale: 0.98 }}
                className="relative w-full flex items-center justify-center gap-2 rounded-xl bg-rose text-ivory font-medium py-3 shadow-card overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {/* shimmer sweep */}
                {!reduceMotion && !isSending && (
                  <motion.span
                    className="pointer-events-none absolute inset-y-0 w-1/3"
                    style={{
                      background:
                        'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.38) 50%, rgba(255,255,255,0) 100%)',
                    }}
                    initial={{ x: '-150%' }}
                    animate={{ x: '350%' }}
                    transition={{
                      duration: 2.2,
                      repeat: Infinity,
                      repeatDelay: 1.6,
                      ease: 'easeInOut',
                    }}
                  />
                )}
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending&hellip;
                  </>
                ) : (
                  <>
                    <HeartHandshake className="w-4 h-4" />
                    Send RSVP
                  </>
                )}
              </motion.button>
            </motion.form>
          )}
        </AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {celebrate && (
          <Celebration
            intensity={1.5}
            label="We can't wait to see you!"
            onComplete={() => setCelebrate(false)}
            colors={
              palette
                ? [palette.gold, palette.goldSoft, palette.blushDeep, palette.rose, palette.champagne, palette.ivory].filter(
                    Boolean,
                  )
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </section>
  )
}
