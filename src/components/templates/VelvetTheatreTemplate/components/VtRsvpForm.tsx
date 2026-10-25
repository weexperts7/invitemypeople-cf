import { useRef, useState } from 'react'

import Celebration from '../../../Celebration'
import Honeypot from '../../../Honeypot'
import TurnstileWidget from '../../../TurnstileWidget'
import { useRsvpSubmit } from '../../../../hooks/useRsvpSubmit'
import { TheatreMasks } from './LineArt'

const CELEBRATION_COLORS = ['#5c2018', '#8e161d', '#d6ad5a', '#efd7a1', '#faf8f5']
const MAX_GUESTS = 6

interface VtRsvpFormProps {
  slug?: string
  endpoint?: string
}

/**
 * Step 6 — same `/api/rsvps` contract (via the shared useRsvpSubmit hook),
 * Turnstile gate and honeypot as every other RSVP form in the app, rebuilt
 * in this template's cream-and-oxblood look for the reason
 * RoyalPlumRsvpForm.tsx gives: the shared RsvpForm.jsx is styled against the
 * site's Tailwind theme, which this template doesn't plug into.
 */
export default function VtRsvpForm({ slug, endpoint }: VtRsvpFormProps) {
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
    <section id="vtt-rsvp" className="vtt-section vtt-section--tint" data-vtt-reveal aria-label="RSVP">
      <TheatreMasks className="vtt-art vtt-art--small" />
      <h2 className="vtt-serif-title">Reserve your seat</h2>
      <p className="vtt-kicker">Kindly confirm your attendance</p>

      <div className="vtt-card">
        {status === 'success' ? (
          <div className="vtt-rsvp-done">
            <p className="vtt-script-title" style={{ fontSize: 40 }}>
              Thank you{form.name ? `, ${form.name.split(' ')[0]}` : ''}!
            </p>
            <p className="vtt-body">
              {isAttending ? 'Your seat is reserved — we can’t wait to celebrate with you.' : 'We’ll miss you, and we’re grateful for your love.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {status === 'error' && <div className="vtt-error">We couldn’t save your response — please try again.</div>}

            <label className="vtt-field">
              <span className="vtt-field-label">Full name *</span>
              <input
                className="vtt-input"
                type="text"
                required
                autoComplete="name"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="Your name"
              />
            </label>

            <label className="vtt-field">
              <span className="vtt-field-label">Email (optional)</span>
              <input
                className="vtt-input"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                placeholder="you@example.com"
              />
            </label>

            <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

            <div className="vtt-field">
              <span className="vtt-field-label">Will you attend? *</span>
              <div className="vtt-choice-row" role="radiogroup">
                {[
                  { value: 'joyfully', label: 'Yes, I’ll be there' },
                  { value: 'regretfully', label: 'Sorry, I can’t' },
                ].map((o) => (
                  <button
                    key={o.value}
                    type="button"
                    role="radio"
                    aria-checked={form.attending === o.value}
                    className={`vtt-choice${form.attending === o.value ? ' vtt-choice--on' : ''}`}
                    onClick={() => set('attending', o.value)}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            {isAttending && (
              <div className="vtt-field">
                <span className="vtt-field-label">Number of guests</span>
                <div className="vtt-stepper">
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

            <label className="vtt-field">
              <span className="vtt-field-label">Message for the couple (optional)</span>
              <textarea
                className="vtt-input vtt-textarea"
                rows={3}
                value={form.message}
                onChange={(e) => set('message', e.target.value)}
                placeholder="Write us a few words…"
              />
            </label>

            <TurnstileWidget
              ref={turnstileRef}
              action="rsvp_submit"
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            <button type="submit" className="vtt-btn vtt-btn--solid vtt-btn--block" disabled={!canSubmit}>
              {isSending ? 'Sending…' : 'Confirm'}
            </button>
          </form>
        )}
      </div>

      {celebrate && (
        <Celebration
          intensity={1.4}
          label="See you at the show!"
          colors={CELEBRATION_COLORS}
          onComplete={() => setCelebrate(false)}
        />
      )}
    </section>
  )
}
