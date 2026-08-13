import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ImagePlus, Loader2 } from 'lucide-react'
import Logo from '../../components/Logo'
import SEO from '../../components/SEO'
import { signupPartner, uploadPartnerLogo } from '../../utils/partnerApi'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// Public application form for the B2B Partner Program (sweet shop / wedding
// box creators). Creates a real Supabase Auth login (see POST
// /api/partners/signup) plus a `partners` row that starts
// 'pending_approval' — nothing here grants access; an admin has to approve
// it first (see AdminPartnersPage.jsx), and PartnerLoginPage.jsx routes a
// pending/rejected login to PartnerPendingPage.jsx accordingly.
// Same minimal, no-SiteHeader/SiteFooter treatment as PartnerLoginPage.jsx/
// AdminLoginPage.jsx — this is a portal entry point, not a marketing page,
// so it deliberately skips the full site nav in favor of just the brand
// mark and a plain copyright line.
export default function PartnerSignupPage() {
  const [form, setForm] = useState({
    businessName: '',
    address: '',
    phone: '',
    email: '',
    password: '',
  })
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [status, setStatus] = useState('idle') // idle | submitting | success | error
  const [error, setError] = useState(null)

  const update = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleLogoChange = (e) => {
    const file = e.target.files?.[0] || null
    setLogoFile(file)
    setLogoPreview(file ? URL.createObjectURL(file) : null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('submitting')
    setError(null)
    try {
      // Uploaded before the account exists — there's no partner id yet to
      // authenticate the upload with, so this mirrors api/photos.js's own
      // unauthenticated-upload-then-reference-the-URL pattern (see
      // uploadPartnerLogo()'s own comment).
      let logoUrl = ''
      if (logoFile) {
        logoUrl = await uploadPartnerLogo(logoFile)
      }
      await signupPartner({ ...form, logoUrl })
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col bg-linen text-ink">
      <SEO title="Become a Partner | InviteMyPeople" path="/partners/signup" noindex />

      <main className="flex flex-1 flex-col items-center px-6 py-14">
        <Link to="/" aria-label="InviteMyPeople home">
          <Logo size="md" />
        </Link>

        <div className="mt-10 w-full max-w-md rounded-3xl border border-white/60 bg-ivory/70 px-6 py-8 shadow-card sm:px-8">
          {status === 'success' ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto mb-4 h-11 w-11 text-rose" strokeWidth={1.2} />
              <h1 className="font-serif text-2xl text-ink">Application received</h1>
              <p className="mt-2 text-ink-soft">
                We&rsquo;ll review it and email you at <strong>{form.email}</strong> once a decision is
                made — usually within a couple of business days.
              </p>
              <Link
                to="/partners/login"
                className="mt-6 inline-block rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-ivory shadow-card"
              >
                Go to login
              </Link>
            </div>
          ) : (
            <>
              <p className="text-center text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Program</p>
              <h1 className="mt-1 text-center font-serif text-3xl text-ink">Apply as a partner</h1>

              <form onSubmit={handleSubmit} className="mt-8 space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Business name</label>
                  <input required className={FIELD_CLASS} value={form.businessName} onChange={update('businessName')} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Full address</label>
                  <textarea
                    required
                    rows={2}
                    className={FIELD_CLASS}
                    value={form.address}
                    onChange={update('address')}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Phone</label>
                  <input required className={FIELD_CLASS} value={form.phone} onChange={update('phone')} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Email</label>
                  <input required type="email" className={FIELD_CLASS} value={form.email} onChange={update('email')} />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Logo</label>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-champagne-deep/60 bg-ivory/50 px-4 py-3 text-sm text-ink-soft hover:bg-ivory">
                    {logoPreview ? (
                      <img src={logoPreview} alt="Logo preview" className="h-10 w-10 rounded-lg object-cover" />
                    ) : (
                      <ImagePlus className="h-5 w-5" />
                    )}
                    {logoFile ? logoFile.name : 'Upload your logo (JPEG, PNG, or WebP)'}
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleLogoChange} />
                  </label>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-ink-soft">Password</label>
                  <input
                    required
                    type="password"
                    minLength={8}
                    className={FIELD_CLASS}
                    value={form.password}
                    onChange={update('password')}
                  />
                  <p className="mt-1 text-xs text-ink-soft/70">At least 8 characters.</p>
                </div>

                {error && (
                  <p className="rounded-lg bg-blush px-3 py-2 text-sm text-rose">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-5 py-3 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
                >
                  {status === 'submitting' && <Loader2 className="h-4 w-4 animate-spin" />}
                  Submit application
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-ink-soft">
                Already applied?{' '}
                <Link to="/partners/login" className="font-medium text-rose">
                  Log in
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <footer className="px-6 py-6 text-center text-xs text-ink-soft">
        &copy; {new Date().getFullYear()} InviteMyPeople. All rights reserved.
      </footer>
    </div>
  )
}
