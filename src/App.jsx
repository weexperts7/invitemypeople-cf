import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import LandingPage from './components/LandingPage'
import InvitationExperience from './components/InvitationExperience'
import { getTemplateById } from './data/templatesData'

function App() {
  const [view, setView] = useState('marketplace') // marketplace | preview
  const [activeTemplateId, setActiveTemplateId] = useState(null)

  const openPreview = (id) => {
    setActiveTemplateId(id)
    setView('preview')
    window.scrollTo(0, 0)
  }

  const backToTemplates = () => {
    setView('marketplace')
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
