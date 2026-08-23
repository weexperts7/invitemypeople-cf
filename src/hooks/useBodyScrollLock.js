import { useEffect } from 'react'

// Locks page scroll while `active` is true — for any full-page overlay
// (nav menu, bottom sheet, modal) that shouldn't let the page behind it
// keep scrolling. Locks BOTH <html> and <body>: this app's actual
// scrolling element is <html> (document.scrollingElement — body has no
// height constraint forcing it to be the scroll box), so a body-only
// `overflow: hidden` silently does nothing here; body is locked too since
// some browsers/quirks-mode documents use it as the scroller instead.
export default function useBodyScrollLock(active) {
  useEffect(() => {
    if (!active) return
    const html = document.documentElement
    const body = document.body
    const previousHtmlOverflow = html.style.overflow
    const previousBodyOverflow = body.style.overflow
    html.style.overflow = 'hidden'
    body.style.overflow = 'hidden'
    return () => {
      html.style.overflow = previousHtmlOverflow
      body.style.overflow = previousBodyOverflow
    }
  }, [active])
}
