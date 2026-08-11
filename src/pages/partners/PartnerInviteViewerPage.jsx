import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, Heart, Loader2, MapPin } from 'lucide-react'
import SEO from '../../components/SEO'
import PartnerBrandBadge from '../../components/partners/PartnerBrandBadge'
import { getPartnerInviteBySlug } from '../../utils/partnerApi'
import { getTemplateById } from '../../data/templatesData'
import { formatInviteDate, formatInviteTime, mapsSearchUrl } from '../../utils/formatInviteDateTime'

// The shareable /p/:slug link a partner's client hands to their guests —
// the "generated invite viewer" white-label branding gets injected into
// (see PartnerBrandBadge.jsx). Deliberately its own page, not a variant of
// GeneratedInvitePage.jsx: it reads from the isolated `partner_invites`
// table (via the public GET /api/partners/invites/:slug endpoint) and
// never imports the B2C InvitationExperience/GaneshExperience components
// or their RSVP/Wishes Wall wiring — see B2B-PARTNER-PORTAL-SETUP.md for
// why. It DOES read src/data/templatesData.js — plain, read-only template
// data, the same list CreateInvitePage.jsx's gallery already reads — purely
// to theme this page with the partner's chosen look.
function themeStyle(template) {
  const palette = template?.palette
  if (!palette) return undefined
  return {
    '--pv-ivory': palette.ivory,
    '--pv-linen': palette.linen,
    '--pv-champagne': palette.champagne,
    '--pv-champagne-deep': palette.champagneDeep,
    '--pv-blush': palette.blush,
    '--pv-rose': palette.rose,
    '--pv-gold': palette.gold,
    '--pv-ink': palette.ink,
    '--pv-ink-soft': palette.inkSoft,
  }
}

export default function PartnerInviteViewerPage() {
  const { slug } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [invite, setInvite] = useState(null)
  const [partner, setPartner] = useState(null)

  useEffect(() => {
    let cancelled = false
    setStatus('loading')

    getPartnerInviteBySlug(slug)
      .then((result) => {
        if (cancelled) return
        setInvite(result.invite)
        setPartner(result.partner)
        setStatus('success')
      })
      .catch((err) => {
        if (cancelled) return
        console.error(`[PartnerInviteViewer] failed to load "${slug}":`, err)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (status === 'loading') {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-linen text-ink">
        <div className="flex items-center gap-2 text-ink-soft">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading invitation&hellip;
        </div>
      </div>
    )
  }

  if (status === 'error' || !invite || !partner) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center gap-4 bg-linen px-6 text-center text-ink">
        <AlertCircle className="h-10 w-10 text-rose" strokeWidth={1.2} />
        <h1 className="font-serif text-2xl">Invitation Not Found</h1>
        <p className="text-ink-soft">This link may have been mistyped.</p>
      </div>
    )
  }

  const template = getTemplateById(invite.templateId)
  const mapHref = invite.locationUrl?.trim() || mapsSearchUrl(invite.venue)
  const whenLabel = [formatInviteDate(invite.weddingDate), formatInviteTime(invite.weddingTime)]
    .filter(Boolean)
    .join(' at ')

  return (
    <div style={themeStyle(template)}>
      <SEO
        title={`${invite.coupleNames} — Invitation`}
        description={`You're invited! ${invite.coupleNames}'s wedding invitation.`}
        path={`/p/${invite.slug}`}
        noindex
      />
      <PartnerBrandBadge partner={partner}>
        <main
          className="flex flex-1 items-center justify-center px-6 py-16"
          style={{
            background: template
              ? `linear-gradient(180deg, var(--pv-linen, #f6efe4), var(--pv-champagne, #f0e2c8))`
              : undefined,
          }}
        >
          <div
            className="w-full max-w-md rounded-3xl border px-8 py-12 text-center shadow-soft"
            style={{
              background: template ? 'var(--pv-ivory)' : undefined,
              borderColor: template ? 'var(--pv-champagne-deep)' : undefined,
              color: template ? 'var(--pv-ink)' : undefined,
            }}
          >
            <Heart
              className="mx-auto mb-4 h-8 w-8"
              style={{ color: template ? 'var(--pv-rose)' : '#c98f8a' }}
              strokeWidth={1.2}
            />
            <p className="text-xs uppercase tracking-[0.25em]" style={{ color: template ? 'var(--pv-ink-soft)' : undefined }}>
              You&rsquo;re Invited
            </p>
            <h1 className="mt-3 font-serif text-4xl leading-tight">{invite.coupleNames}</h1>

            {invite.message && (
              <p className="mt-4 text-sm" style={{ color: template ? 'var(--pv-ink-soft)' : undefined }}>
                {invite.message}
              </p>
            )}

            <div
              className="mt-8 space-y-1 rounded-2xl border px-5 py-4 text-sm"
              style={{
                borderColor: template ? 'var(--pv-champagne-deep)' : undefined,
                background: template ? 'var(--pv-champagne)' : undefined,
              }}
            >
              {whenLabel && <p className="font-medium">{whenLabel}</p>}
              <p>{invite.venue}</p>
            </div>

            {mapHref && (
              <a
                href={mapHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium"
                style={{ color: template ? 'var(--pv-rose)' : '#c98f8a' }}
              >
                <MapPin className="h-3.5 w-3.5" />
                View on Map
              </a>
            )}
          </div>
        </main>
      </PartnerBrandBadge>
    </div>
  )
}
