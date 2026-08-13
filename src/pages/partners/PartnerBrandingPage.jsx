import { useEffect, useState } from 'react'
import { CheckCircle2, ImagePlus, Loader2 } from 'lucide-react'
import SEO from '../../components/SEO'
import { usePartnerAuth } from '../../hooks/usePartnerAuth'
import { updateProfile as updateProfileApi, uploadPartnerLogo } from '../../utils/partnerApi'

const FIELD_CLASS =
  'w-full rounded-xl border border-champagne-deep/40 bg-ivory/70 px-4 py-2.5 text-sm text-ink placeholder:text-ink-soft/60 focus:border-rose focus:outline-none focus:ring-1 focus:ring-rose'

// "Branding" in the sidebar (see PartnerPortalShell.jsx) — the business
// profile form (name/phone/address/logo) that themes the "Curated
// exclusively by {Business Name}" badge on every /p/:slug client invite
// (see PartnerBrandBadge.jsx), split out from the old all-in-one
// PartnerDashboardPage.jsx onto its own page.
export default function PartnerBrandingPage() {
  const { partner, accessToken, refreshProfile } = usePartnerAuth()

  const [profile, setProfile] = useState(null)
  const [logoFile, setLogoFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (partner) {
      setProfile({
        businessName: partner.businessName || '',
        address: partner.address || '',
        phone: partner.phone || '',
        logoUrl: partner.logoUrl || '',
      })
    }
  }, [partner])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSaved(false)
    try {
      let logoUrl = profile.logoUrl
      if (logoFile) {
        logoUrl = await uploadPartnerLogo(logoFile)
      }
      await updateProfileApi(accessToken, { ...profile, logoUrl })
      await refreshProfile()
      setLogoFile(null)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      console.error('[PartnerBranding] failed to save profile:', err)
    } finally {
      setSaving(false)
    }
  }

  if (!profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center text-ink-soft">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 sm:py-14">
      <SEO title="Branding | Partner Dashboard" path="/partners/dashboard/branding" noindex />

      <p className="text-xs uppercase tracking-[0.2em] text-ink-soft">Partner Portal</p>
      <h1 className="mt-1 flex items-center gap-2 font-serif text-3xl text-ink">
        <ImagePlus className="h-6 w-6 text-rose" />
        Business Profile &amp; Branding
      </h1>
      <p className="mt-2 max-w-xl text-sm text-ink-soft">
        This name, address, and logo appear on every invitation you
        generate for a client — the &ldquo;Curated exclusively by&rdquo;
        badge on their shareable link.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-8 grid gap-4 rounded-2xl border border-white/60 bg-ivory/50 px-5 py-5 shadow-soft sm:grid-cols-2"
      >
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Business name</label>
          <input
            className={FIELD_CLASS}
            value={profile.businessName}
            onChange={(e) => setProfile((p) => ({ ...p, businessName: e.target.value }))}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-soft">Phone</label>
          <input
            className={FIELD_CLASS}
            value={profile.phone}
            onChange={(e) => setProfile((p) => ({ ...p, phone: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-soft">Address</label>
          <textarea
            rows={2}
            className={FIELD_CLASS}
            value={profile.address}
            onChange={(e) => setProfile((p) => ({ ...p, address: e.target.value }))}
          />
        </div>
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-medium text-ink-soft">Logo</label>
          <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-champagne-deep/60 bg-ivory/50 px-4 py-3 text-sm text-ink-soft hover:bg-ivory">
            {logoFile ? (
              <img src={URL.createObjectURL(logoFile)} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : profile.logoUrl ? (
              <img src={profile.logoUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
            ) : (
              <ImagePlus className="h-5 w-5" />
            )}
            {logoFile ? logoFile.name : 'Change logo'}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
            />
          </label>
        </div>

        <div className="sm:col-span-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-semibold text-ivory shadow-card disabled:opacity-60"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
          {saved && (
            <span className="flex items-center gap-1.5 text-sm text-rose">
              <CheckCircle2 className="h-4 w-4" />
              Saved
            </span>
          )}
        </div>
      </form>
    </div>
  )
}
