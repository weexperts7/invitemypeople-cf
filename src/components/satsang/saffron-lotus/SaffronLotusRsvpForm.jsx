import { useRef, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Feather, Loader2, AlertCircle } from 'lucide-react'
import Celebration from '../../Celebration'
import Honeypot from '../../Honeypot'
import TurnstileWidget from '../../TurnstileWidget'
import { useRsvpSubmit } from '../../../hooks/useRsvpSubmit'
import { LotusDivider } from './lotusDividers'

export default function SaffronLotusRsvpForm({ palette, slug }) {
  const [form, setForm] = useState({ name: '', attending: 'joyfully', guests: '1', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const reduceMotion = useReducedMotion()
  const { status, isSending, submit } = useRsvpSubmit(slug)
  const gold = palette?.gold ?? '#d9932e'

  // Cloudflare Turnstile — see TurnstileWidget.jsx / RsvpForm.jsx's identical
  // wiring for why this gates the submit button and resets after every attempt.
  const [captchaToken, setCaptchaToken] = useState(null)
  const turnstileRef = useRef(null)

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!captchaToken) return
    const isAttending = form.attending === 'joyfully'
    const ok = await submit(
      {
        guestName: form.name,
        attendanceStatus: form.attending,
        guests: isAttending ? Number(form.guests) || 1 : 0,
        message: form.message,
      },
      honeypot,
      captchaToken,
    )
    if (ok && isAttending) setCelebrate(true)
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  return (
    <section className="px-6 py-14">
      <LotusDivider color={gold} className="mb-8" />

      <div className="mb-6 text-left">
        <p className="text-[10px] tracking-[0.3em] uppercase text-rose mb-2 flex items-center gap-1.5">
          <Feather className="w-3.5 h-3.5" strokeWidth={1.6} />
          Your Presence
        </p>
        <h2 className="font-serif text-2xl sm:text-3xl text-ink">Kindly Respond</h2>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 26, rotate: -0.6 }}
        whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="ml-4 sm:ml-8 max-w-[92%] rounded-tl-md rounded-tr-[2.25rem] rounded-bl-[2.25rem] rounded-br-md border p-6 sm:p-7 shadow-soft"
        style={{ borderColor: `${gold}55`, background: 'var(--color-linen)' }}
      >
        <AnimatePresence mode="wait">
          {status === 'success' ? (
            <motion.div
              key="thanks"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-left py-6"
            >
              <CheckCircle2 className="w-10 h-10 mb-3 text-rose" strokeWidth={1.2} />
              <p className="font-serif text-2xl text-ink mb-2">Thank you, {form.name || 'friend'}!</p>
              <p className="text-ink-soft text-sm">Received with gratitude. Jai Guruji.</p>
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
                      <span>We couldn&apos;t save your response — please try again shortly.</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="lotus-name" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                  Your Name
                </label>
                <input
                  id="lotus-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Full name"
                  className="w-full rounded-lg border-0 border-b-2 bg-transparent px-1 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none"
                  style={{ borderColor: `${gold}70` }}
                />
              </div>

              <Honeypot value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

              <div>
                <span className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">Will you attend?</span>
                <div className="flex gap-3">
                  {[
                    { value: 'joyfully', label: 'Joyfully accepts' },
                    { value: 'regretfully', label: 'Regretfully declines' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileTap={{ scale: 0.97 }}
                      className={`cursor-pointer rounded-full border px-4 py-2 text-center text-xs transition-colors ${
                        form.attending === option.value
                          ? 'border-gold bg-blush text-ink'
                          : 'border-champagne-deep/40 bg-ivory/50 text-ink-soft'
                      }`}
                    >
                      <input
                        type="radio"
                        name="lotus-attending"
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
                    <label htmlFor="lotus-guests" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                      Number of Guests
                    </label>
                    <select
                      id="lotus-guests"
                      value={form.guests}
                      onChange={handleChange('guests')}
                      className="w-full rounded-lg border-0 border-b-2 bg-transparent px-1 py-2 text-ink focus:outline-none"
                      style={{ borderColor: `${gold}70` }}
                    >
                      {['1', '2', '3', '4', '5', '6'].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label htmlFor="lotus-message" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                  Blessings &amp; Wishes
                </label>
                <textarea
                  id="lotus-message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Share your blessings and wishes"
                  className="w-full rounded-lg border-0 border-b-2 bg-transparent px-1 py-2 text-ink placeholder:text-ink-soft/60 focus:outline-none resize-none"
                  style={{ borderColor: `${gold}70` }}
                />
              </div>

              <TurnstileWidget
                ref={turnstileRef}
                action="rsvp_submit"
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />

              <motion.button
                type="submit"
                disabled={isSending || !captchaToken}
                whileHover={reduceMotion || isSending ? undefined : { y: -2 }}
                whileTap={isSending ? undefined : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-full bg-rose text-ivory font-medium py-3 shadow-card disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending&hellip;
                  </>
                ) : (
                  <>
                    <Feather className="w-4 h-4" />
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
            label="We look forward to your presence!"
            onComplete={() => setCelebrate(false)}
            colors={
              palette
                ? [palette.gold, palette.goldSoft, palette.rose, palette.champagneDeep, palette.champagne, palette.ivory].filter(
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
