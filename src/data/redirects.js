// Permanent (301) redirects for URLs that used to exist and may still be
// linked or indexed. One list, read by functions/[[path]].js in production
// and server/index.js locally, so neither can drift from the other. Plain
// data only, so it is safe to import from Node.
//
// Every internal link must point at the destination, never at a key here:
// a link to a redirecting URL costs crawlers an extra hop.
export const REDIRECTS = {
  // Guruji Satsang is live; this was its "launching soon" address.
  '/guruji-satsang-invites': '/guruji-satsangs',
  // Duplicate of the real category page, which is the one Google already shows.
  '/ganesh-chaturthi-invites': '/templates/ganesh-chaturthi',
}
