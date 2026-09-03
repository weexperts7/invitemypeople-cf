import { useEffect, useRef } from 'react'
import { Routes, Route, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom'
import LandingPage from './components/LandingPage'
import AboutPage from './pages/AboutPage'
import WeddingsPage from './pages/WeddingsPage'
import GurujiSatsangsPage from './pages/GurujiSatsangsPage'
import GaneshChaturthiPage from './pages/GaneshChaturthiPage'
import CreateInvitePage from './pages/CreateInvitePage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import LiveDraftPreviewPage from './pages/LiveDraftPreviewPage'
import GeneratedInvitePage from './pages/GeneratedInvitePage'
import HostDashboardPage from './pages/HostDashboardPage'
import ComingSoonPage from './pages/ComingSoonPage'
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'
import RefundPolicyPage from './pages/RefundPolicyPage'
import NotFoundPage from './pages/NotFoundPage'
import PartnerPortalLayout from './components/partners/PartnerPortalLayout'
import PartnerLandingPage from './pages/partners/PartnerLandingPage'
import PartnerSignupPage from './pages/partners/PartnerSignupPage'
import PartnerLoginPage from './pages/partners/PartnerLoginPage'
import PartnerForgotPasswordPage from './pages/partners/PartnerForgotPasswordPage'
import PartnerResetPasswordPage from './pages/partners/PartnerResetPasswordPage'
import PartnerPendingPage from './pages/partners/PartnerPendingPage'
import { RequirePartnerPortal } from './components/partners/PartnerPortalShell'
import PartnerOverviewPage from './pages/partners/PartnerOverviewPage'
import PartnerCreateInvitePage from './pages/partners/PartnerCreateInvitePage'
import PartnerInvitesPage from './pages/partners/PartnerInvitesPage'
import PartnerCreditsPage from './pages/partners/PartnerCreditsPage'
import PartnerBrandingPage from './pages/partners/PartnerBrandingPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminPartnersPage from './pages/admin/AdminPartnersPage'
import AdminInvitesPage from './pages/admin/AdminInvitesPage'
import AdminPricingPage from './pages/admin/AdminPricingPage'
import AdminCreateInvitePage from './pages/admin/AdminCreateInvitePage'
import { RequireAdminPortal } from './components/admin/AdminShell'
import PartnerInviteViewerPage from './pages/partners/PartnerInviteViewerPage'
import PartnerHostDashboardPage from './pages/partners/PartnerHostDashboardPage'
import InvitationExperience from './components/InvitationExperience'
import MahoganySealTemplate from './components/templates/MahoganySealTemplate'
import MahoganySealCreatePage from './pages/MahoganySealCreatePage'
import PinkGoldFloralTemplate from './components/templates/PinkGoldFloralTemplate/PinkGoldFloralTemplate'
import SatsangExperience from './components/SatsangExperience'
import GaneshExperience from './components/GaneshExperience'
import SEO from './components/SEO'
import { getTemplateById } from './data/templatesData'
import { getSatsangTemplateBySlug } from './data/satsangTemplatesData'
import { getGaneshTemplateBySlug } from './data/ganeshTemplatesData'
import { COMING_SOON_OCCASIONS } from './data/occasionsData'
import { satsangSeo, ganeshSeo, weddingSeo } from './data/routesSeo'
import { trackPageView } from './utils/metaPixel'

// A wedding invitation is likewise a shareable, directly-linkable page under
// /templates/wedding/:id — its "Preview" button (TemplateCard.jsx) opens
// this in a new tab rather than the in-app modal overlay the other two
// routes below briefly needed as a stopgap.
function WeddingRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  const template = getTemplateById(id)

  return (
    <>
      {template && <SEO {...weddingSeo(template)} path={`/templates/wedding/${id}`} />}
      <InvitationExperience template={template} isPreview onBack={() => navigate('/')} />
    </>
  )
}

// Temporary — lets you preview MahoganySealTemplate directly while it's
// still dormant/unregistered in the real template catalog. Wraps it in the
// exact same "phone card" shell InvitationExperience.jsx gives every
// bespoke layout (see its own comment on the two lines below that matter):
// width-capped and rounded only from `sm:` up, so a real phone viewport is
// unaffected (full-bleed, edge-to-edge — the video fills the *phone's*
// screen, not the browser's), while a desktop browser gets a properly
// phone-shaped frame instead of the template's `position:fixed` intro
// video stretching across the entire browser window.
//
// `no-scrollbar` (index.css's existing utility — already used elsewhere,
// nothing new added here) hides the OS's own scrollbar chrome on this
// card without disabling scrolling itself: a real phone shows a thin,
// auto-hiding indicator while actively scrolling, not Windows/Chrome's
// permanent track+thumb, which read as visibly "wrong" for a page meant
// to look like a phone screen — most noticeably while the intro video is
// still up, since nothing about the video itself is scrollable at all.
//
// `sm:h-[calc(100svh_-_4rem)]` (not plain `100svh`) accounts for this
// wrapper's own `sm:py-8` (2rem top + 2rem bottom = 4rem) — with plain
// `100svh` the card plus that padding came out 4rem taller than the
// actual viewport, so the whole *page* picked up a second scrollbar with
// nothing of substance to scroll to, on top of the card's own internal
// one. Together the two now fill exactly one viewport. `sm:min-h-0`
// alongside it resets the plain `min-h-svh` this card also carries (its
// own mobile-only fallback, below `sm:`) — left unset at `sm:` and up,
// that `min-height: 100svh` would otherwise win over the smaller explicit
// `height` here and silently cancel the subtraction out.
function MahoganySealPreviewRoute() {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#0c0705] sm:py-8">
      <div className="no-scrollbar relative w-full max-w-md min-h-svh overflow-hidden sm:min-h-0 sm:h-[calc(100svh_-_4rem)] sm:overflow-y-auto sm:rounded-[2.5rem] sm:border sm:border-[#d4af37]/30 sm:shadow-[0_30px_80px_rgba(0,0,0,0.6)] sm:[transform:translateZ(0)]">
        <MahoganySealTemplate />
      </div>
    </div>
  )
}

// Same "dormant preview while unregistered in the real catalog" pattern as
// MahoganySealPreviewRoute above — lets PinkGoldFloralTemplate be viewed at
// its own URL without adding it to templatesData.js/layoutRegistry.js yet.
// Cream/blush shell (not Mahogany's dark one) to match this template's own
// light background instead of letting its edges show through a mismatched
// frame color.
function PinkGoldFloralPreviewRoute() {
  return (
    <div className="flex min-h-svh w-full justify-center bg-[#fbe6c4] sm:py-8">
      <div className="no-scrollbar relative w-full max-w-md min-h-svh overflow-hidden sm:min-h-0 sm:h-[calc(100svh_-_4rem)] sm:overflow-y-auto sm:rounded-[2.5rem] sm:border sm:border-[#c9932f]/30 sm:shadow-[0_30px_80px_rgba(169,114,15,0.35)] sm:[transform:translateZ(0)]">
        <PinkGoldFloralTemplate />
      </div>
    </div>
  )
}

// A Satsang invitation is a shareable, directly-linkable page — see
// satsangTemplatesData.js.
function SatsangRoute() {
  const { slug } = useParams()
  const template = getSatsangTemplateBySlug(slug)

  return (
    <>
      {template && <SEO {...satsangSeo(template)} path={`/satsang/${slug}`} />}
      <SatsangExperience template={template} />
    </>
  )
}

// A Ganesh Chaturthi invitation is likewise a shareable, directly-linkable
// page — see ganeshTemplatesData.js — under /templates/ganesh-chaturthi/:slug.
function GaneshRoute() {
  const { slug } = useParams()
  const template = getGaneshTemplateBySlug(slug)

  return (
    <>
      {template && (
        <SEO {...ganeshSeo(template)} path={`/templates/ganesh-chaturthi/${slug}`} />
      )}
      <GaneshExperience template={template} />
    </>
  )
}

function App() {
  const location = useLocation()

  // Client-side navigation doesn't reset scroll position the way a full
  // page load does — without this, following a link (e.g. "Preview" on a
  // Satsang template) while scrolled down on the previous page opens the
  // new page still scrolled to that same spot instead of the top.
  useEffect(() => {
    // `behavior: 'instant'` overrides the global `scroll-behavior: smooth`
    // (index.css) — without it this animates down from wherever the user
    // had scrolled, and gets visibly thrown off by the new page's own
    // layout shifting under it while that animation is still running.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [location.pathname])

  // Meta Pixel PageView for client-side route changes — index.html's base
  // snippet only ever fires once, for the very first real page load, so an
  // SPA navigation (React Router swapping routes with no full reload) would
  // otherwise never register as a new PageView. Skips the first run here
  // specifically to avoid double-counting that same initial load (already
  // tracked by the base snippet) — every pathname change after that is a
  // genuine new page. trackPageView() (utils/metaPixel.js) itself is a
  // no-op outside production, so this is inert in dev/preview.
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    trackPageView()
  }, [location.pathname])

  return (
    // A plain CSS fade-in, not framer-motion — wrapping this route tree in
    // AnimatePresence's exit-then-enter sequencing froze client-side
    // navigations at opacity:0, and even a bare motion.div's JS-driven tween
    // was observed getting interrupted mid-fade on rapid successive
    // navigations (React 19 + Framer Motion 12 + React Router 7). A CSS
    // keyframe animation runs on the compositor, so a remount always
    // completes it regardless of React's render timing.
    <div key={location.pathname} className="page-fade-in">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/weddings" element={<WeddingsPage />} />
        <Route path="/templates/wedding/:id" element={<WeddingRoute />} />
        <Route path="/guruji-satsangs" element={<GurujiSatsangsPage />} />
        <Route path="/satsang/:slug" element={<SatsangRoute />} />
        <Route path="/templates/ganesh-chaturthi" element={<GaneshChaturthiPage />} />
        <Route path="/templates/ganesh-chaturthi/:slug" element={<GaneshRoute />} />
        <Route path="/create" element={<CreateInvitePage />} />
        <Route path="/_preview/mahogany-seal" element={<MahoganySealPreviewRoute />} />
        <Route path="/_preview/pink-gold-floral" element={<PinkGoldFloralPreviewRoute />} />
        {/* A real, permanent page — NOT nested under /_preview like the
            bare dev-preview route above. This one is manually pasted into
            real WhatsApp conversations with leads (see
            MahoganySealTemplate.tsx's own comment on the "Create Your Own"
            CTA), so it needs a clean, public URL rather than reading as an
            internal/temporary one. */}
        <Route path="/mahogany-seal/create" element={<MahoganySealCreatePage />} />
        <Route path="/blog" element={<BlogListPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />
        {/* Not a real destination — only ever loaded in the same-origin
            iframe inside the Invitation Builder's own live preview (see
            builder/LiveInvitePreview.jsx / draftInvitePreview.js). */}
        <Route path="/create/live-preview" element={<LiveDraftPreviewPage />} />
        <Route path="/i/:slug" element={<GeneratedInvitePage />} />
        <Route path="/i/:slug/host/:hostToken" element={<HostDashboardPage />} />
        {/* Partner-generated client invite — public, no auth, isolated
            from the B2C /i/:slug viewer above (see
            PartnerInviteViewerPage.jsx). */}
        <Route path="/p/:slug" element={<PartnerInviteViewerPage />} />
        <Route path="/p/:slug/host/:hostToken" element={<PartnerHostDashboardPage />} />
        <Route path="/privacy" element={<PrivacyPolicyPage />} />
        <Route path="/terms" element={<TermsOfServicePage />} />
        <Route path="/refund" element={<RefundPolicyPage />} />
        {/* B2B Partner Program landing page — public marketing page, not
            gated behind PartnerAuthProvider (unlike the routes grouped
            under PartnerPortalLayout just below), same as any other
            marketing route (About, Weddings, ...). Both its CTAs route
            into the actual signup/login flow. */}
        <Route path="/partners" element={<PartnerLandingPage />} />
        {/* B2B Partner Portal — see PartnerPortalLayout.jsx. One shared
            Supabase Auth session (PartnerAuthProvider) covers both the
            partner-facing routes and the internal /admin/* routes, so
            they're grouped under a single layout route here. */}
        <Route element={<PartnerPortalLayout />}>
          <Route path="/partners/signup" element={<PartnerSignupPage />} />
          <Route path="/partners/login" element={<PartnerLoginPage />} />
          {/* Password reset, shared by both /partners/login and
              /admin/login since they're one Supabase Auth account model —
              see PartnerAuthContext.jsx's sendPasswordReset()/
              updatePassword(). */}
          <Route path="/partners/forgot-password" element={<PartnerForgotPasswordPage />} />
          <Route path="/partners/reset-password" element={<PartnerResetPasswordPage />} />
          <Route path="/partners/pending" element={<PartnerPendingPage />} />
          {/* The actual portal "app" — persistent sidebar, routed
              pages, no marketing SiteHeader/SiteFooter in between them.
              See PartnerPortalShell.jsx. */}
          <Route element={<RequirePartnerPortal />}>
            <Route path="/partners/dashboard" element={<PartnerOverviewPage />} />
            <Route path="/partners/dashboard/create" element={<PartnerCreateInvitePage />} />
            <Route path="/partners/dashboard/invites" element={<PartnerInvitesPage />} />
            <Route path="/partners/dashboard/credits" element={<PartnerCreditsPage />} />
            <Route path="/partners/dashboard/branding" element={<PartnerBrandingPage />} />
          </Route>
          <Route path="/admin/login" element={<AdminLoginPage />} />
          {/* The internal Admin Panel — persistent sidebar chrome, same
              pattern as RequirePartnerPortal above. See AdminShell.jsx. */}
          <Route element={<RequireAdminPortal />}>
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/partners" element={<AdminPartnersPage />} />
            <Route path="/admin/invites" element={<AdminInvitesPage />} />
            <Route path="/admin/pricing" element={<AdminPricingPage />} />
            <Route path="/admin/create-invite" element={<AdminCreateInvitePage />} />
          </Route>
        </Route>
        {COMING_SOON_OCCASIONS.map((occasion) => (
          <Route
            key={occasion.slug}
            path={`/${occasion.slug}`}
            element={<ComingSoonPage occasion={occasion} />}
          />
        ))}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  )
}

export default App
