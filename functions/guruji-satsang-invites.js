// The old "launching soon" address. Guruji Satsang is live now, so anyone
// arriving from an old link or search result moves to the real page for good.
export function onRequest({ request }) {
  return Response.redirect(new URL('/guruji-satsangs', request.url), 301)
}
