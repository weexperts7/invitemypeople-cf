import { useRef, useState } from 'react'

import Celebration from '../../../Celebration'
import Honeypot from '../../../Honeypot'
import TurnstileWidget from '../../../TurnstileWidget'
import { useRsvpSubmit } from '../../../../hooks/useRsvpSubmit'

interface RoyalPlumRsvpFormProps {
  /** The real invite's slug — see `RoyalPlumTemplateData.invitationSlug`'s own doc comment. */
  slug?: string
}

const GUEST_COUNTS = ['1', '2', '3', '4', '5']

// The confetti burst on success reuses this template's own gold/plum
// palette rather than Celebration's default gold/rose mix, so it matches
// the page it just fired on instead of looking bolted on from elsewhere.
const CELEBRATION_COLORS = ['#f5d061', '#e6ba47', '#c79526', '#e3b8a8', '#fff4d2']

/**
 * Step E — the RSVP form every other wedding template already has (see
 * RsvpForm.jsx), rebuilt with this template's own gold-on-plum look instead
 * of importing the Tailwind/framer-motion original: that component's
 * classes (`text-ink`, `bg-ivory/50`, …) resolve against the site's
 * Tailwind CSS-variable theme, which this template deliberately doesn't
 * plug into (see RoyalPlumTemplate.css's header comment) — dropped in
 * as-is it would render a near-invisible light card on this page's dark
 * plum background. Same field set (`song`/`advice` alongside the usual
 * name/email/attending/guests/message) and the same `/api/rsvps` contract
 * via the shared `useRsvpSubmit` hook, just styled to match.
 */
export default function RoyalPlumRsvpForm({ slug }: RoyalPlumRsvpFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    attending: 'joyfully',
    guests: '1',
    song: '',
    advice: '',
    message: '',
  })
  const [honeypot, setHoneypot] = useState('')
  const [celebrate, setCelebrate] = useState(false)
  const { status, isSending, submit } = useRsvpSubmit(slug)

  // Same Turnstile gate every RSVP form in the app uses — see
  // TurnstileWidget.jsx's own comment on why it's invisible and single-use.
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) return
    const isAttending = form.attending === 'joyfully'
    const ok = await submit(
      {
        guestName: form.name,
        guestEmail: form.email,
        attendanceStatus: form.attending,
        guests: isAttending ? Number(form.guests) || 1 : 0,
        song: form.song,
        advice: form.advice,
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
    <section className="rpc-rsvp" data-rpc-reveal aria-label="RSVP">
      <h3
        className="rpc-gold-text"
        style={{ fontFamily: 'var(--rpc-font-royal)', textAlign: 'center', fontSize: 20, letterSpacing: '0.08em', marginBottom: 6 }}
      >
        Kindly RSVP
      </h3>
      <p className="rpc-tracking" style={{ textAlign: 'center', fontSize: 11, color: 'var(--rpc-rose-gold)', marginBottom: 32 }}>
        We'd love to know if you'll join us
      </p>

      <div className="rpc-event-card rpc-rsvp-card">
        <span className="rpc-corner rpc-corner--tl" style={{ width: 20, height: 20, top: 8, left: 8 }} />
        <span className="rpc-corner rpc-corner--br" style={{ width: 20, height: 20, bottom: 8, right: 8 }} />

        {status === 'success' ? (
          <div className="rpc-rsvp-success">
            <p style={{ fontFamily: 'var(--rpc-font-script)', fontSize: 30 }} className="rpc-gold-text">
              Thank you{form.name ? `, ${form.name}` : ''}!
            </p>
            <p style={{ fontSize: 13, color: 'var(--rpc-rose-gold)', marginTop: 8 }}>
              Your response has been received with love.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ textAlign: 'left' }}>
            {status === 'error' && (
              <div className="rpc-error-box">We couldn't save your response — please try again.</div>
            )}

            <div className="rpc-field">
              <label htmlFor="rpc-rsvp-name" className="rpc-field-label">
                Your Name
              </label>
              <input
                id="rpc-rsvp-name"
                type="text"
                required
                value={form.name}
                onChange={handleChange('name')}
                placeholder="Full name"
                className="rpc-input"
              />
            </div>

            <div className="rpc-field">
              <label htmlFor="rpc-rsvp-email" className="rpc-field-label">
                Email <span style={{ textTransform: 'none', letterSpacing: 0, opacity: 0.7 }}>(optional)</span>
              </label>
              <input
                id="rpc-rsvp-email"
                type="email"
                value={form.email}
                onChange={handleChange('email')}
                placeholder="you@example.com"
                className="rpc-input"
              />
            </div>

            <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

            <div className="rpc-field">
              <span className="rpc-field-label">Will you attend?</span>
              <div className="rpc-radio-group">
                {[
                  { value: 'joyfully', label: 'Joyfully accepts' },
                  { value: 'regretfully', label: 'Regretfully declines' },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={`rpc-radio-option${form.attending === option.value ? ' rpc-radio-option--active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="rpc-attending"
                      value={option.value}
                      checked={form.attending === option.value}
                      onChange={handleChange('attending')}
                      className="rpc-radio-input"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {form.attending === 'joyfully' && (
              <div className="rpc-field">
                <label htmlFor="rpc-rsvp-guests" className="rpc-field-label">
                  Number of Guests
                </label>
                <select
                  id="rpc-rsvp-guests"
                  value={form.guests}
                  onChange={handleChange('guests')}
                  className="rpc-select"
                >
                  {GUEST_COUNTS.map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="rpc-divider-label">
              <span className="rpc-tracking" style={{ fontSize: 10, color: 'var(--rpc-rose-gold)' }}>
                Just for fun
              </span>
            </div>

            <div className="rpc-field">
              <label htmlFor="rpc-rsvp-song" className="rpc-field-label">
                A song for the dance floor
              </label>
              <input
                id="rpc-rsvp-song"
                type="text"
                value={form.song}
                onChange={handleChange('song')}
                placeholder="Artist – Song title"
                className="rpc-input"
              />
            </div>

            <div className="rpc-field">
              <label htmlFor="rpc-rsvp-advice" className="rpc-field-label">
                Marriage advice for us
              </label>
              <textarea
                id="rpc-rsvp-advice"
                rows={3}
                value={form.advice}
                onChange={handleChange('advice')}
                placeholder="The one thing you wish someone had told you…"
                className="rpc-textarea"
              />
            </div>

            <div className="rpc-field">
              <label htmlFor="rpc-rsvp-message" className="rpc-field-label">
                Blessings &amp; Wishes
              </label>
              <textarea
                id="rpc-rsvp-message"
                rows={3}
                value={form.message}
                onChange={handleChange('message')}
                placeholder="Share your wishes for the couple"
                className="rpc-textarea"
              />
            </div>

            <TurnstileWidget
              ref={turnstileRef}
              action="rsvp_submit"
              onSuccess={setCaptchaToken}
              onExpire={() => setCaptchaToken(null)}
              onError={() => setCaptchaToken(null)}
            />

            <button type="submit" disabled={isSending || !captchaToken} className="rpc-btn rpc-btn--solid rpc-btn--block">
              {isSending ? 'Sending…' : 'Send RSVP'}
            </button>
          </form>
        )}
      </div>

      {celebrate && (
        <Celebration
          intensity={1.5}
          label="We can't wait to celebrate with you!"
          onComplete={() => setCelebrate(false)}
          colors={CELEBRATION_COLORS}
        />
      )}
    </section>
  )
}
