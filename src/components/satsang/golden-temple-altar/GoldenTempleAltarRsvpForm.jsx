import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle2, Flame, Loader2, AlertCircle } from 'lucide-react'
import Celebration from '../../Celebration'
import Honeypot from '../../Honeypot'
import { useRsvpSubmit } from '../../../hooks/useRsvpSubmit'

export default function GoldenTempleAltarRsvpForm({ palette, slug }) {
  const [form, setForm] = useState({ name: '', attending: 'joyfully', guests: '1', message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const reduceMotion = useReducedMotion()
  const { status, isSending, submit } = useRsvpSubmit(slug)
  const gold = palette?.gold ?? '#c28a3a'
  const rose = palette?.rose ?? '#7a2230'

  const handleChange = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    const isAttending = form.attending === 'joyfully'
    const ok = await submit(
      {
        guestName: form.name,
        attendanceStatus: form.attending,
        guests: isAttending ? Number(form.guests) || 1 : 0,
        message: form.message,
      },
      honeypot,
    )
    if (ok && isAttending) setCelebrate(true)
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-md mx-auto rounded-2xl border-2 p-6 sm:p-7 shadow-card"
        style={{
          borderColor: `${gold}60`,
          background: `linear-gradient(160deg, ${palette?.linen ?? '#f6e6de'} 0%, ${palette?.ivory ?? '#fdf8f5'} 100%)`,
        }}
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
              <CheckCircle2 className="w-11 h-11 mx-auto mb-4" style={{ color: rose }} strokeWidth={1.2} />
              <p className="font-serif text-2xl text-ink mb-2">Thank you, {form.name || 'friend'}!</p>
              <p className="text-ink-soft text-sm">Your presence is a blessing. Jai Guruji.</p>
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
                <label htmlFor="altar-name" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                  Your Name
                </label>
                <input
                  id="altar-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Full name"
                  className="w-full rounded-lg border bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none"
                  style={{ borderColor: `${gold}55` }}
                />
              </div>

              <Honeypot value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />

              <div>
                <span className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">Will you attend?</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'joyfully', label: 'Joyfully accepts' },
                    { value: 'regretfully', label: 'Regretfully declines' },
                  ].map((option) => (
                    <motion.label
                      key={option.value}
                      whileHover={reduceMotion ? undefined : { y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className="cursor-pointer rounded-lg border px-3 py-3 text-center text-sm transition-colors"
                      style={
                        form.attending === option.value
                          ? { borderColor: gold, background: `${gold}1f`, color: 'var(--color-ink)' }
                          : { borderColor: `${gold}30`, color: 'var(--color-ink-soft)' }
                      }
                    >
                      <input
                        type="radio"
                        name="altar-attending"
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
                    <label htmlFor="altar-guests" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                      Number of Guests
                    </label>
                    <select
                      id="altar-guests"
                      value={form.guests}
                      onChange={handleChange('guests')}
                      className="w-full rounded-lg border bg-ivory/70 px-4 py-3 text-ink focus:outline-none"
                      style={{ borderColor: `${gold}55` }}
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
                <label htmlFor="altar-message" className="block text-xs tracking-[0.2em] uppercase text-ink-soft mb-2">
                  Blessings &amp; Wishes
                </label>
                <textarea
                  id="altar-message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Share your blessings and wishes"
                  className="w-full rounded-lg border bg-ivory/70 px-4 py-3 text-ink placeholder:text-ink-soft/60 focus:outline-none resize-none"
                  style={{ borderColor: `${gold}55` }}
                />
              </div>

              <motion.button
                type="submit"
                disabled={isSending}
                whileHover={reduceMotion || isSending ? undefined : { y: -2, scale: 1.01 }}
                whileTap={isSending ? undefined : { scale: 0.98 }}
                className="w-full flex items-center justify-center gap-2 rounded-lg text-ivory font-medium py-3 shadow-card disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ background: `linear-gradient(90deg, ${rose}, ${gold})` }}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending&hellip;
                  </>
                ) : (
                  <>
                    <Flame className="w-4 h-4" />
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
            label="Your presence graces the altar!"
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
    </>
  )
}
