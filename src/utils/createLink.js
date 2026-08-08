import { findBuilderTemplateBySource } from '../data/builderTemplates'

// Every "Buy Now" / "Customize" CTA across the site used to hand off to
// WhatsApp (see the now-removed CustomizeModal.jsx) — that was Phase 1.
// Phase 2's self-service Invitation Builder (/create — see
// pages/CreateInvitePage.jsx) now works end-to-end, so every one of those
// CTAs should land there instead, with the occasion (and, when the clicked
// template happens to be one of the builder's curated ones — see
// data/builderTemplates.js) the specific style pre-selected.
export function buildCreateLink({ occasion, sourceId } = {}) {
  if (!occasion) return '/create'

  const params = new URLSearchParams({ occasion })
  const match = sourceId && findBuilderTemplateBySource(occasion, sourceId)
  if (match) params.set('template', match.id)

  return `/create?${params.toString()}`
}
