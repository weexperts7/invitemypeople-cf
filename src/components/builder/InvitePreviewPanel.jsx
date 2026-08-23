// Positions the Invitation Builder's live preview (LiveInvitePreview.jsx)
// differently by device — used by both CreateInvitePage.jsx and
// PartnerCreateInvitePage.jsx, which share the exact same builder layout.
//
// Desktop (>= lg, matches Tailwind's `lg:` breakpoint): the familiar sticky
// right rail, always visible next to the form.
//
// Mobile: a locked, half-finished invitation isn't a useful thing to greet
// a buyer with — the form is what they actually need to act on first. So
// on mobile the preview stays out of the initial view entirely and opens
// on demand from a floating "Preview" button, as a bottom sheet.
//
// Only ever mounts ONE <LiveInvitePreview> — never a CSS-hidden desktop
// copy plus a separate always-mounted mobile-modal copy — since that
// component's iframe + debounced sessionStorage draft sync
// (utils/draftInvitePreview.js) is real, ongoing work; a second idle copy
// would just double it for nothing. Switching between "desktop rail" and
// "mobile sheet, closed" instead mounts/unmounts that one instance.
import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Eye, X } from 'lucide-react'
import LiveInvitePreview from './LiveInvitePreview'
import useBodyScrollLock from '../../hooks/useBodyScrollLock'

const DESKTOP_QUERY = '(min-width: 1024px)' // Tailwind's `lg`

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(DESKTOP_QUERY).matches,
  )

  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY)
    const onChange = (e) => setIsDesktop(e.matches)
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [])

  return isDesktop
}

const DEFAULT_CAPTION =
  'Updates instantly as you type — scroll inside the phone to see the whole page, exactly how your guests will.'

export default function InvitePreviewPanel({ caption = DEFAULT_CAPTION, ...previewProps }) {
  const isDesktop = useIsDesktop()
  const [mobileOpen, setMobileOpen] = useState(false)
  const reduceMotion = useReducedMotion()

  // Scroll lock while the mobile sheet is open — without it, the page
  // behind a `fixed` overlay keeps scrolling under it.
  useBodyScrollLock(!isDesktop && mobileOpen)

  const label = (
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-ink-soft">
      <Eye className="h-3.5 w-3.5 text-rose" />
      Live Preview
    </div>
  )

  if (isDesktop) {
    return (
      <div className="lg:sticky lg:top-24">
        <div className="mb-3">{label}</div>
        <LiveInvitePreview {...previewProps} />
        <p className="mt-3 text-center text-xs text-ink-soft/80">{caption}</p>
      </div>
    )
  }

  return (
    <>
      <motion.button
        type="button"
        onClick={() => setMobileOpen(true)}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-[70] flex items-center gap-2 rounded-full bg-rose px-5 py-3.5 text-sm font-semibold text-ivory shadow-soft"
      >
        <Eye className="h-4 w-4" />
        Preview
      </motion.button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-end justify-center bg-ink/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              animate={reduceMotion ? { opacity: 1 } : { y: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 32 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[85vh] w-full overflow-y-auto rounded-t-3xl border-t border-white/60 bg-ivory px-6 pb-8 pt-5 shadow-soft"
            >
              <div className="mb-4 flex items-center justify-between">
                {label}
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close preview"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-champagne/50 text-ink-soft"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <LiveInvitePreview {...previewProps} />
              <p className="mt-3 text-center text-xs text-ink-soft/80">{caption}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
