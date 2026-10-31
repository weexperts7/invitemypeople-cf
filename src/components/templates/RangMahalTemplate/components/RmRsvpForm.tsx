import { useRef, useState } from 'react'

import Celebration from '../../../Celebration'
import Honeypot from '../../../Honeypot'
import TurnstileWidget from '../../../TurnstileWidget'
import { useRsvpSubmit } from '../../../../hooks/useRsvpSubmit'

const CELEBRATION_COLORS = ['#ef9a12', '#fbc531', '#c2185b', '#721a27', '#fff3d6']
const MAX_GUESTS = 8

interface RmRsvpFormProps {
  slug?: string
  endpoint?: string
}

/**
 * Same `/api/rsvps` contract, Turnstile gate and honeypot as every other
 * RSVP form in the app, styled for this template's paper look — see
 * RoyalPlumRsvpForm.tsx on why bespoke layouts can't reuse RsvpForm.jsx.
 */
export default function RmRsvpForm({ slug, endpoint }: RmRsvpFormProps) {
  const [form, setForm] = useState({ name: '', email: '', attending: '', guests: 1, message: '' })
  const [honeypot, setHoneypot] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const { status, isSending, submit } = useRsvpSubmit(slug, endpoint)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const set = <K extends keyof typeof form>(field: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [field]: value }))

  const isAttending = form.attending === 'joyfully'
  const canSubmit = Boolean(form.name.trim() && form.attending && captchaToken) && !isSending

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!canSubmit) return
    const ok = await submit(
      {
        guestName: form.name,
        guestEmail: form.email,
        attendanceStatus: form.attending,
        guests: isAttending ? form.guests : 0,
        message: form.message,
      },
      honeypot,
      captchaToken
    )
    if (ok && isAttending) setCelebrate(true)
    setCaptchaToken(null)
    turnstileRef.current?.reset()
  }

  return (
    <section className="rmt-section" data-rmt-reveal aria-label="RSVP">
      <p className="rmt-kicker">We look forward to celebrating with you</p>
      <h2 className="rmt-title">Your Presence Is Our Blessing</h2>

      <div className="rmt-card">
        {status === 'success' ? (
          <div className="rmt-rsvp-done">
            <p className="rmt-title">Dhanyavaad{form.name ? `, ${form.name.split(' ')[0]}` : ''}!</p>
            <p className="rmt-body">
              {isAttending ? 'Your place is saved. We can’t wait to celebrate with you.' : 'We’ll miss you, and we’re grateful for your love.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === 'error' && <div className="rmt-error">We couldn’t save your response — please try again.</div>}

            <label className="rmt-field">
              <span className="rmt-field-label">Full name *</span>
              <input
                className="rmt-input"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className="rmt-field">
              <span className="rmt-field-label">Email (optional)</span>
              <input
                className="rmt-input"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

            <div className="rmt-field">
              <span className="rmt-field-label">Will you be joining us? *</span>
              <div className="rmt-choice-row" role="radiogroup">
                {[
                  { value: 'joyfully', label: 'Joyfully accepts' },
                  { value: 'regretfully', label: 'Regretfully declines' },
                ].map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={form.attending === o.value}
                    className={`rmt-choice${form.attending === o.value ? ' rmt-choice--on' : ''}`}
                    onClick={() => set('attending', o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {isAttending && (
              <div className="rmt-field">
                <span className="rmt-field-label">Number of guests</span>
                <div className="rmt-stepper">
                  <button
                    type="button"
                    aria-label="Fewer guests"
                    onClick={() => set('guests', Math.max(1, form.guests - 1))}
                    disabled={form.guests <= 1}
                  >
                    −
                  </button>
                  <span aria-live="polite">{form.guests}</span>
                  <button
                    type="button"
                    aria-label="More guests"
                    onClick={() => set('guests', Math.min(MAX_GUESTS, form.guests + 1))}
                    disabled={form.guests >= MAX_GUESTS}
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            <label className="rmt-field">
              <span className="rmt-field-label">Blessings for the couple (optional)</span>
              <textarea
                className="rmt-input rmt-textarea"
                rows={3}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Share your wishes…"
              />
            </label>

            <TurnstileWidget
              ref={turnstileRef}
              action="rsvp_submit"
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            <button type="submit" className="rmt-btn rmt-btn--block" disabled={!canSubmit}>
              {isSending ? 'Sending…' : 'Confirm RSVP'}
            </button>
          </form>
        )}
      </div>

      {celebrate && (
        <Celebration
          intensity={1.4}
          label="See you at the celebration!"
          colors={CELEBRATION_COLORS}
          onComplete={() => setCelebrate(false)}
        />
      )}
    </section>
  )
}
