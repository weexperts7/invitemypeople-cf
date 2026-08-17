// Fires a Meta Pixel PageView for a client-side route change (see App.jsx's
// effect keyed on location.pathname). index.html's own base Meta Pixel
// snippet already fires the *first* PageView on initial load — and is the
// thing that defines window.fbq at all, gated to production only (real
// visitor traffic on invitemypeople.com/www.invitemypeople.com; see that
// script's own comment) — so checking for window.fbq here reuses that same
// production gate for free instead of duplicating the hostname check.
// Non-production environments never get window.fbq, so this is a no-op
// there — nothing to track, nothing thrown.
export function trackPageView() {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
    window.fbq('track', 'PageView')
  }
}
