import { useRef, useState } from 'react'

import Honeypot from '../../../Honeypot'
import TurnstileWidget from '../../../TurnstileWidget'
import { useRsvpSubmit } from '../../../../hooks/useRsvpSubmit'
import AmbientLights from './AmbientLights'

interface RsvpFormProps {
  /** The real invite's slug — see `MahoganySealTemplateData.invitationSlug`'s own doc comment. */
  slug?: string
  reduceMotion?: boolean
}

const GUEST_COUNTS = ['1', '2', '3', '4', '5']
const MEAL_OPTIONS = [
  { value: 'veg', label: 'Vegetarian' },
  { value: 'non-veg', label: 'Non-Vegetarian' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'jain', label: 'Jain' },
]

const inputClasses =
  'w-full rounded-lg border border-[#d4af37]/30 bg-[#fbf3e3] px-4 py-2.5 text-[#2c1d18] placeholder:text-[#8a6a1f]/50 outline-none transition-colors focus:border-[#8b1e1e] focus:ring-2 focus:ring-[#8b1e1e]/15'
const labelClasses = 'mst-font-seal mb-1.5 block text-[11px] tracking-[0.12em] text-[#8a6a1f] uppercase'

/**
 * RSVP flow: guest name, attendance status, meal preference (shown only
 * when attending), and an optional note — posting to the same `/api/rsvps`
 * contract every other template's RSVP form uses (`useRsvpSubmit`), gated
 * by the same invisible Turnstile check and honeypot field.
 *
 * The backend's `rsvps` table has no dedicated meal-preference column (see
 * `api/_lib/rsvps.js`'s `cleanRsvp`) — rather than silently dropping it,
 * the selection is folded into the free-form `message` field before
 * submit, so it still reaches the host's dashboard. A dedicated column is
 * a one-line migration away whenever this template is wired in for real.
 */
export default function RsvpForm({ slug, reduceMotion = false }: RsvpFormProps) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    attending: 'joyfully',
    guests: '1',
    meal: 'veg',
    message: '',
  })
  const [honeypot, setHoneypot] = useState('')
  const { status, isSending, submit } = useRsvpSubmit(slug)

  const [captchaToken, setCaptchaToken] = useState<string | null>(null)
  const turnstileRef = useRef<{ reset: () => void } | null>(null)

  const handleChange =
    (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isAttending = form.attending === 'joyfully'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!captchaToken) return

    const mealLabel = MEAL_OPTIONS.find((m) => m.value === form.meal)?.label
    const composedMessage = isAttending && mealLabel ? `Meal preference: ${mealLabel}${form.message ? ` — ${form.message}` : ''}` : form.message

    const ok = await submit(
      {
        guestName: form.name,
        guestEmail: form.email,
        attendanceStatus: form.attending,
        guests: isAttending ? Number(form.guests) || 1 : 0,
        message: composedMessage,
      },
      honeypot,
      captchaToken
    )
    setCaptchaToken(null)
    turnstileRef.current?.reset()
    return ok
  }

  const handleReset = () => {
    setForm({ name: '', email: '', attending: 'joyfully', guests: '1', meal: 'veg', message: '' })
  }

  return (
    <section aria-label="RSVP" className="relative overflow-hidden bg-[#2c1d18] px-5 py-16 sm:px-8">
      <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
      <div className="relative z-10 mx-auto max-w-md">
        <p className="mst-font-seal text-center text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">Kindly RSVP</p>
        <h3 className="mst-font-display mt-2 text-center text-3xl font-semibold text-[#fbf3e3]">Will you join us?</h3>

        <div className="mt-8 rounded-2xl border border-[#d4af37]/30 bg-[#fbf3e3] p-6 shadow-[0_20px_50px_rgba(0,0,0,0.4)] sm:p-8">
          {status === 'success' ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <span className="mst-seal flex h-14 w-14 items-center justify-center rounded-full text-xl text-[#f2d675]">✓</span>
              <p className="mst-font-display text-2xl font-semibold text-[#2c1d18]">
                Thank you{form.name ? `, ${form.name}` : ''}!
              </p>
              <p className="max-w-xs text-sm text-[#6b5a4f]">
                {isAttending
                  ? "Your RSVP is in — we can't wait to celebrate with you."
                  : "We'll miss you, but thank you for letting us know."}
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="mst-font-seal mt-2 text-[11px] tracking-[0.15em] text-[#8a6a1f] uppercase underline underline-offset-4 hover:text-[#8b1e1e]"
              >
                Submit another response
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              {status === 'error' && (
                <div className="rounded-lg border border-[#8b1e1e]/40 bg-[#8b1e1e]/10 px-4 py-2.5 text-sm text-[#8b1e1e]">
                  We couldn't save your response — please try again.
                </div>
              )}

              <div>
                <label htmlFor="mst-rsvp-name" className={labelClasses}>
                  Your Name
                </label>
                <input
                  id="mst-rsvp-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange('name')}
                  placeholder="Full name"
                  className={inputClasses}
                />
              </div>

              <div>
                <label htmlFor="mst-rsvp-email" className={labelClasses}>
                  Email <span className="normal-case tracking-normal text-[#8a6a1f]/60">(optional)</span>
                </label>
                <input
                  id="mst-rsvp-email"
                  type="email"
                  value={form.email}
                  onChange={handleChange('email')}
                  placeholder="you@example.com"
                  className={inputClasses}
                />
              </div>

              <Honeypot value={honeypot} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHoneypot(e.target.value)} />

              <div>
                <span className={labelClasses}>Will you attend?</span>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'joyfully', label: 'Attending' },
                    { value: 'regretfully', label: 'Regrets' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`mst-font-seal cursor-pointer rounded-lg border px-3 py-2.5 text-center text-xs tracking-[0.1em] uppercase transition-colors ${
                        form.attending === option.value
                          ? 'border-[#8b1e1e] bg-[#8b1e1e]/10 text-[#8b1e1e]'
                          : 'border-[#d4af37]/30 text-[#8a6a1f] hover:border-[#d4af37]/60'
                      }`}
                    >
                      <input
                        type="radio"
                        name="mst-attending"
                        value={option.value}
                        checked={form.attending === option.value}
                        onChange={handleChange('attending')}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </div>

              {isAttending && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="mst-rsvp-guests" className={labelClasses}>
                      Guests
                    </label>
                    <select id="mst-rsvp-guests" value={form.guests} onChange={handleChange('guests')} className={inputClasses}>
                      {GUEST_COUNTS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="mst-rsvp-meal" className={labelClasses}>
                      Meal
                    </label>
                    <select id="mst-rsvp-meal" value={form.meal} onChange={handleChange('meal')} className={inputClasses}>
                      {MEAL_OPTIONS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div>
                <label htmlFor="mst-rsvp-message" className={labelClasses}>
                  A note for the couple <span className="normal-case tracking-normal text-[#8a6a1f]/60">(optional)</span>
                </label>
                <textarea
                  id="mst-rsvp-message"
                  rows={3}
                  value={form.message}
                  onChange={handleChange('message')}
                  placeholder="Share your wishes for the couple"
                  className={inputClasses}
                />
              </div>

              <TurnstileWidget
                ref={turnstileRef}
                action="rsvp_submit"
                onSuccess={setCaptchaToken}
                onExpire={() => setCaptchaToken(null)}
                onError={() => setCaptchaToken(null)}
              />

              <button
                type="submit"
                disabled={isSending || !captchaToken}
                className="mst-font-seal w-full rounded-lg bg-[#8b1e1e] py-3 text-sm tracking-[0.15em] text-[#fbf3e3] uppercase shadow-[0_10px_24px_-8px_rgba(139,30,30,0.6)] transition-transform hover:enabled:scale-[1.01] active:enabled:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSending ? 'Sending…' : 'Send RSVP'}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
