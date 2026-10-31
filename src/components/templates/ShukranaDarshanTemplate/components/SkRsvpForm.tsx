import { useRef, useState } from 'react'

import Honeypot from '../../../Honeypot'
import TurnstileWidget from '../../../TurnstileWidget'
import { useRsvpSubmit } from '../../../../hooks/useRsvpSubmit'
import type { ShukranaWish } from '../types'

const MAX_GUESTS = 12
const SEVA_OPTIONS = ['Langar seva', 'Chai prasad', 'Shabad', 'Flowers', 'Joda seva', 'Clean-up']

/**
 * Same `/api/rsvps` contract, Turnstile gate and honeypot as every other RSVP
 * form in the app, plus the seva a guest offers, which the host sees on their
 * dashboard. With no `slug` (the catalog page and builder preview) nothing is
 * sent: the form just shows what a guest would see. `onShukrana` hands a saved
 * message to the Shukrana Wall below, so the guest sees it land.
 */
export default function SkRsvpForm({ slug, onShukrana }: { slug?: string; onShukrana: (wish: ShukranaWish) => void }) {
  const [form, setForm] = useState({ name: '', attending: '', guests: 1, message: '' })
  const [seva, setSeva] = useState<string[]>([])
  const [honeypot, setHoneypot] = useState('')
  const [demoDone, setDemoDone] = useState(false)
  const { status, isSending, submit } = useRsvpSubmit(slug)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const toggleSeva = (option: string) =>
    setSeva((prev) => (prev.includes(option) ? prev.filter((s) => s !== option) : [...prev, option]))

  const isAttending = form.attending === 'joyfully'
  const canSubmit = Boolean(form.name.trim() && form.attending && (captchaToken || !slug)) && !isSending
  const done = status === 'success' || demoDone

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const wish = { name: form.name.trim(), message: form.message.trim(), timestamp: new Date().toISOString() }
    if (!slug) {
      setDemoDone(true)
      if (wish.message) onShukrana(wish)
      return
    }
    const saved = await submit(
      {
        guestName: form.name,
        attendanceStatus: form.attending,
        guests: isAttending ? form.guests : 0,
        message: form.message,
        seva: isAttending ? seva.join(', ') : '',
      },
      honeypot,
      captchaToken
    )
    if (saved && wish.message) onShukrana(wish)
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  return (
    <section className="skd-section skd-section--cream" data-skd-reveal aria-label="RSVP">
      <p className="skd-kicker">Will you join us?</p>
      <h2 className="skd-title">Join the Sangat</h2>

      <div className="skd-card">
        {done ? (
          <div className="skd-rsvp-done">
            <p className="skd-title">Shukrana{form.name ? `, ${form.name.trim().split(' ')[0]}` : ''}!</p>
            <p className="skd-lead">
              {isAttending
                ? seva.length > 0
                  ? 'Your place is saved, and your seva has reached the family.'
                  : 'Your place is saved. See you at satsang.'
                : 'Thank you for letting us know. Jai Guruji.'}
            </p>
            {form.message.trim() && <p className="skd-note">Your shukrana is on the wall below.</p>}
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === 'error' && <div className="skd-error">We couldn&rsquo;t save your response. Please try again.</div>}

            <label className="skd-field">
              <span className="skd-field-label">Your name *</span>
              <input
                className="skd-input"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
            </label>

            <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

            <div className="skd-field">
              <span className="skd-field-label">Will you be coming? *</span>
              <div className="skd-choice-row" role="radiogroup">
                {[
                  { value: 'joyfully', label: 'Yes, Jai Guruji' },
                  { value: 'regretfully', label: 'Sorry, I can’t' },
                ].map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={form.attending === o.value}
                    className={`skd-choice${form.attending === o.value ? ' skd-choice--on' : ''}`}
                    onClick={() => set('attending', o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {isAttending && (
              <>
                <div className="skd-field">
                  <span className="skd-field-label">How many of you?</span>
                  <div className="skd-stepper">
                    <button
                      type="button"
                      aria-label="Fewer people"
                      onClick={() => set('guests', Math.max(1, form.guests - 1))}
                      disabled={form.guests <= 1}
                    >
                      −
                    </button>
                    <span aria-live="polite">{form.guests}</span>
                    <button
                      type="button"
                      aria-label="More people"
                      onClick={() => set('guests', Math.min(MAX_GUESTS, form.guests + 1))}
                      disabled={form.guests >= MAX_GUESTS}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="skd-field">
                  <span className="skd-field-label">Would you like to offer seva? (optional)</span>
                  <div className="skd-seva">
                    {SEVA_OPTIONS.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={seva.includes(option)}
                        className={`skd-seva-chip${seva.includes(option) ? ' skd-seva-chip--on' : ''}`}
                        onClick={() => toggleSeva(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <label className="skd-field">
              <span className="skd-field-label">Your shukrana (optional)</span>
              <textarea
                className="skd-input skd-textarea"
                rows={3}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Share a few words for the sangat…"
              />
            </label>

            {slug && (
              <TurnstileWidget
                ref={turnstileRef}
                action="rsvp_submit"
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />
            )}

            <button type="submit" className="skd-btn skd-btn--block" disabled={!canSubmit}>
              {isSending ? 'Sending…' : 'Confirm'}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
