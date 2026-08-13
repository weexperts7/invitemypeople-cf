import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { AlertCircle, Loader2 } from 'lucide-react'
import SEO from '../../components/SEO'
import PartnerBrandBadge from '../../components/partners/PartnerBrandBadge'
import InvitationExperience from '../../components/InvitationExperience'
import { getPartnerInviteBySlug } from '../../utils/partnerApi'
import { getBuilderTemplateById } from '../../data/builderTemplates'
import { buildWeddingExperienceTemplate } from '../../utils/buildWeddingExperienceTemplate'

// The shareable /p/:slug link a partner's client hands to their guests —
// the "generated invite viewer" white-label branding gets injected into
// (see PartnerBrandBadge.jsx). Deliberately its own page, not a route
// param on GeneratedInvitePage.jsx: it reads from the isolated
// `partner_invites` table (via the public GET /api/partners/invites/:slug
// endpoint) and never imports any B2C table or route.
//
// It DOES now render through the exact same <InvitationExperience>
// component tree /i/:slug does — envelope reveal, timeline, gallery,
// background music, the works — built by the same
// buildWeddingExperienceTemplate() GeneratedInvitePage.jsx uses, just fed
// from a partner_invites row instead of an invites row (see
// PartnerCreateInvitePage.jsx, which saves in that same
// { names, eventTitle, date, time, venue, locationUrl, message, events,
// photos, bgSong* } shape). `showRsvp={false}`: partner invites don't have
// guest RSVP/Wishes Wall yet — see InvitationExperience.jsx's own comment
// on that prop.
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

  const template = getBuilderTemplateById(invite.templateId)
  const experienceTemplate = buildWeddingExperienceTemplate(
    {
      names: invite.coupleNames,
      eventTitle: invite.eventTitle,
      date: invite.weddingDate,
      time: invite.weddingTime,
      venue: invite.venue,
      locationUrl: invite.locationUrl,
      message: invite.message,
      groomName: invite.groomName,
      groomParents: invite.groomParents,
      brideName: invite.brideName,
      brideParents: invite.brideParents,
      events: invite.events,
      photos: invite.photos,
      bgSongTitle: invite.bgSongTitle,
      bgSongArtist: invite.bgSongArtist,
      bgSongAlbumArt: invite.bgSongAlbumArt,
      bgSongPreviewUrl: invite.bgSongPreviewUrl,
    },
    template,
  )

  return (
    <>
      <SEO
        title={`${invite.coupleNames} — Invitation`}
        description={`You're invited! ${invite.coupleNames}'s wedding invitation.`}
        path={`/p/${invite.slug}`}
        noindex
      />
      <PartnerBrandBadge partner={partner}>
        <InvitationExperience
          template={experienceTemplate}
          invitationSlug={`p-${invite.slug}`}
          showRsvp={false}
        />
      </PartnerBrandBadge>
    </>
  )
}
