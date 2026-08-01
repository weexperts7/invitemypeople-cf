import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import InvitationExperience from './components/InvitationExperience'
import SatsangExperience from './components/SatsangExperience'
import { getTemplateById } from './data/templatesData'
import { getSatsangTemplateBySlug } from './data/satsangTemplatesData'

// The only real URL route this app has: /satsang/:slug, so a Satsang
// invitation is a shareable, directly-linkable page rather than only living
// behind in-app preview state (unlike the wedding templates, which stay
// state-driven — see openPreview/backToTemplates below).
function matchSatsangSlug(pathname) {
  const match = pathname.match(/^\/satsang\/([^/]+)\/?$/)
  return match ? decodeURIComponent(match[1]) : null
}

function App() {
  const [path, setPath] = useState(() => window.location.pathname)
  const [view, setView] = useState('marketplace') // marketplace | preview
  const [activeTemplateId, setActiveTemplateId] = useState(null)

  useEffect(() => {
    const onPopState = () => setPath(window.location.pathname)
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  const openPreview = (id) => {
    setActiveTemplateId(id)
    setView('preview')
    window.scrollTo(0, 0)
  }

  const backToTemplates = () => {
    setView('marketplace')
  }

  const satsangSlug = matchSatsangSlug(path)
  if (satsangSlug) {
    return <SatsangExperience template={getSatsangTemplateBySlug(satsangSlug)} />
  }

  return (
    <AnimatePresence mode="wait">
      {view === 'preview' ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <InvitationExperience
            template={getTemplateById(activeTemplateId)}
            onBack={backToTemplates}
            isPreview
          />
        </motion.div>
      ) : (
        <motion.div
          key="marketplace"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
        >
          <LandingPage onPreview={openPreview} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default App
