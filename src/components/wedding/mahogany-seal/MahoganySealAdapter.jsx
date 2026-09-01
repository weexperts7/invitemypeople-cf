import MahoganySealTemplate from '../../templates/MahoganySealTemplate'

// Adapts MahoganySealTemplate into the wedding `layout` registry
// (layoutRegistry.js) so it shows up in the real catalog (TEMPLATES in
// templatesData.js) and is reachable at /templates/wedding/mahogany-seal,
// same as every other bespoke layout (see RoyalPlumCurtainAdapter.jsx next
// door for the pattern this mirrors).
//
// Unlike RoyalPlumCurtainAdapter, this one deliberately ignores `template`/
// `invitationSlug`: MahoganySealTemplate isn't wired to accept the site's
// generic wedding-template shape (couple.names as "A & B", ceremonies list,
// weddingDate, ...) the way RoyalPlumTemplate is — it has its own typed
// `MahoganySealTemplateData` and, more importantly, no buyer ever reaches
// this component through the self-service builder (`/create`) that would
// normally supply that data. Every visitor lands here purely to preview
// the design; personalizing it happens over WhatsApp instead (see
// MahoganySealCreatePage.tsx), so this always renders the same curated
// showcase dataset (mockData.ts) `<MahoganySealTemplate />` falls back to
// with no `data` prop — matching what the dormant /_preview/mahogany-seal
// route has shown all along.
export default function MahoganySealAdapter({ onOpen }) {
  return <MahoganySealTemplate onOpen={onOpen} />
}
