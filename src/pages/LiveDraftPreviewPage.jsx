import { useEffect, useState } from 'react'
import SEO from '../components/SEO'
import InvitationExperience from '../components/InvitationExperience'
import GaneshExperience from '../components/GaneshExperience'
import { getBuilderTemplateById } from '../data/builderTemplates'
import { buildWeddingExperienceTemplate } from '../utils/buildWeddingExperienceTemplate'
import { buildGaneshExperienceTemplate } from '../utils/buildGaneshExperienceTemplate'
import { DRAFT_INVITE_PREVIEW_KEY, readDraftInvitePreview } from '../utils/draftInvitePreview'
import { slugify } from '../utils/slugify'

// Rendered only inside the Invitation Builder's phone-frame live preview
// (see builder/LiveInvitePreview.jsx), in a same-origin iframe — never
// linked anywhere a visitor could land on directly (SEO below keeps it out
// of search regardless). It's a real, separate document specifically so
// the real component tree (InvitationExperience for wedding,
// GaneshExperience for Ganesh Chaturthi) runs in its own real browsing
// context: its `position: fixed` chrome, `min-h-svh` sections, and
// scroll-linked animations all measure against THIS iframe's own viewport
// (sized to a phone by the frame around it), not the desktop builder page.
// The result is the exact same component tree a guest gets at /i/:slug —
// not a hand-built approximation of it — reading its data from
// sessionStorage (see utils/draftInvitePreview.js), refreshed live as the
// buyer types.
export default function LiveDraftPreviewPage() {
  const [draft, setDraft] = useState(() => readDraftInvitePreview())

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key && e.key !== DRAFT_INVITE_PREVIEW_KEY) return
      setDraft(readDraftInvitePreview())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const seo = (
    <SEO
      title="Live Preview | InviteMyPeople"
      description="Invitation Builder live preview."
      path="/create/live-preview"
      noindex
    />
  )
  // This document only ever exists scaled down inside the builder's phone
  // frame (see builder/LiveInvitePreview.jsx): a native scrollbar there
  // would sit outside the visible, clipped screen area and never show up
  // usably, so it's hidden at the root; and `overscroll-behavior: contain`
  // stops scrolling past the bottom here from chaining into — and
  // scrolling away — the actual builder page around the frame.
  const hideScrollbar = (
    <style>{`html, body {
      scrollbar-width: none;
      overscroll-behavior: contain;
    }
    html::-webkit-scrollbar, body::-webkit-scrollbar { display: none; }`}</style>
  )

  if (!draft) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-linen px-6 text-center text-sm text-ink-soft">
        {seo}
        {hideScrollbar}
        Start filling in your details to see your invitation here.
      </div>
    )
  }

  const template = getBuilderTemplateById(draft.templateId)
  // Namespaced away from real invitation slugs (see GeneratedInvitePage.jsx)
  // so a stray RSVP/wish submitted against this still-unpaid draft can
  // never collide with the real invite once it's actually created.
  const invitationSlug = `preview-${slugify(draft.names) || 'draft'}`

  // draft.occasionId is only ever 'wedding' or 'ganesh-chaturthi' here —
  // LiveInvitePreview.jsx only mounts this iframe (isRichPreview) for those
  // two; Guruji Satsang stays on the lighter hero-card preview and never
  // reaches this page.
  if (draft.occasionId === 'ganesh-chaturthi') {
    return (
      <>
        {seo}
        {hideScrollbar}
        <GaneshExperience
          template={buildGaneshExperienceTemplate(draft, template)}
          invitationSlug={invitationSlug}
          showChrome={false}
        />
      </>
    )
  }

  return (
    <>
      {seo}
      {hideScrollbar}
      <InvitationExperience
        template={buildWeddingExperienceTemplate(draft, template)}
        invitationSlug={invitationSlug}
        showRsvp={draft.showRsvp ?? true}
      />
    </>
  )
}
