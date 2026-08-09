// Ferries the Invitation Builder's in-progress form state (see
// CreateInvitePage.jsx) across into the same-origin iframe that renders
// its live preview (LiveDraftPreviewPage.jsx, embedded by
// builder/LiveInvitePreview.jsx) — sessionStorage is shared by same-origin
// iframes with their embedding tab, and writing to it fires a `storage`
// event on every OTHER same-origin window (i.e. the iframe, not the
// builder page itself), so the preview updates live with no polling and
// no postMessage handshake to keep in sync.
const KEY = 'imp:draft-invite-preview'

export const DRAFT_INVITE_PREVIEW_KEY = KEY

export function writeDraftInvitePreview(data) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(data))
  } catch (err) {
    console.error('[Invitation Builder] failed to sync live preview:', err)
  }
}

export function readDraftInvitePreview() {
  try {
    const raw = sessionStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch (err) {
    console.error('[Invitation Builder] failed to read live preview draft:', err)
    return null
  }
}
