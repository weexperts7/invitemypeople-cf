import { useCallback, useEffect, useState } from 'react'
import { Routes, Route, useLocation, useParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import AboutPage from './pages/AboutPage'
import WeddingsPage from './pages/WeddingsPage'
import GurujiSatsangsPage from './pages/GurujiSatsangsPage'
import GaneshChaturthiPage from './pages/GaneshChaturthiPage'
import ComingSoonPage from './pages/ComingSoonPage'
import NotFoundPage from './pages/NotFoundPage'
import InvitationExperience from './components/InvitationExperience'
import SatsangExperience from './components/SatsangExperience'
import GaneshExperience from './components/GaneshExperience'
import SEO from './components/SEO'
import PreviewContext from './context/PreviewContext'
import { getTemplateById } from './data/templatesData'
import { getSatsangTemplateBySlug } from './data/satsangTemplatesData'
import { getGaneshTemplateBySlug } from './data/ganeshTemplatesData'
import { COMING_SOON_OCCASIONS } from './data/occasionsData'

// A Satsang invitation is a shareable, directly-linkable page — see
// satsangTemplatesData.js — rather than only living behind in-app preview
// state like the wedding templates (which stay state-driven via
// PreviewContext/openPreview below).
function SatsangRoute() {
  const { slug } = useParams()
  const template = getSatsangTemplateBySlug(slug)

  return (
    <>
      {template && (
        <SEO
          title={`${template.name} — Guruji Satsang Invitation | InviteMyPeople`}
          description={template.description}
          path={`/satsang/${slug}`}
        />
      )}
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
        <SEO
          title={`${template.name} — Ganesh Chaturthi Invitation | InviteMyPeople`}
          description={template.description}
          path={`/templates/ganesh-chaturthi/${slug}`}
        />
      )}
      <GaneshExperience template={template} />
    </>
  )
}

function App() {
  const location = useLocation()
  const [previewId, setPreviewId] = useState(null)

  const openPreview = useCallback((id) => {
    setPreviewId(id)
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [])

  const closePreview = useCallback(() => setPreviewId(null), [])

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

  return (
    <PreviewContext.Provider value={openPreview}>
      <AnimatePresence>
        {previewId && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
          >
            <InvitationExperience
              template={getTemplateById(previewId)}
              onBack={closePreview}
              isPreview
            />
          </motion.div>
        )}
      </AnimatePresence>

      {!previewId && (
        // A plain CSS fade-in, not framer-motion — wrapping this route tree
        // in AnimatePresence's exit-then-enter sequencing froze client-side
        // navigations at opacity:0, and even a bare motion.div's JS-driven
        // tween was observed getting interrupted mid-fade on rapid
        // successive navigations (React 19 + Framer Motion 12 + React
        // Router 7). A CSS keyframe animation runs on the compositor, so a
        // remount always completes it regardless of React's render timing.
        <div key={location.pathname} className="page-fade-in">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/weddings" element={<WeddingsPage />} />
            <Route path="/guruji-satsangs" element={<GurujiSatsangsPage />} />
            <Route path="/satsang/:slug" element={<SatsangRoute />} />
            <Route path="/templates/ganesh-chaturthi" element={<GaneshChaturthiPage />} />
            <Route path="/templates/ganesh-chaturthi/:slug" element={<GaneshRoute />} />
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
      )}
    </PreviewContext.Provider>
  )
}

export default App
