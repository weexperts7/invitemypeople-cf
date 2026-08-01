// Minimal client-side navigation for the handful of real URL routes this app
// has (currently just /satsang/:slug — see App.jsx). Wraps history.pushState
// and manually re-dispatches 'popstate' since pushState alone doesn't fire it,
// which is what App.jsx listens on to re-render the matched route.
export function navigate(path) {
  if (window.location.pathname === path) return
  window.history.pushState({}, '', path)
  window.dispatchEvent(new PopStateEvent('popstate'))
  window.scrollTo(0, 0)
}
