// Phone-shaped chrome around the Invitation Builder's live preview (see
// LiveInvitePreview.jsx) — so what a buyer sees while building matches how
// most guests will actually open it: on a phone. A fixed-height "screen"
// mimics a real device viewport, so the full page — hero, timeline,
// gallery — is reachable by scrolling inside the frame, exactly like the
// real thing.
//
// `screenHeight` lets callers match their content's own scroll model:
// `scroll` true (default) makes this div itself the scroll container
// (plain stacked content, e.g. the non-wedding hero preview); false leaves
// it `overflow-hidden` because the child already scrolls itself (the
// wedding preview's scaled-down iframe — see LiveInvitePreview.jsx —
// scrolls its own document, and a second outer scrollbar would just fight
// it).
export default function MobilePreviewFrame({ children, screenHeight = 600, scroll = true }) {
  return (
    <div className="mx-auto w-full max-w-[320px]">
      <div className="relative rounded-[2.75rem] border-[6px] border-ink bg-ink p-2 shadow-card">
        {/* Notch */}
        <div className="absolute left-1/2 top-2 z-20 h-5 w-28 -translate-x-1/2 rounded-full bg-ink" />
        {/* Side buttons — purely decorative, sells the phone silhouette */}
        <div className="absolute -left-[6px] top-24 h-8 w-[3px] rounded-l-full bg-ink" />
        <div className="absolute -left-[6px] top-36 h-12 w-[3px] rounded-l-full bg-ink" />
        <div className="absolute -right-[6px] top-28 h-16 w-[3px] rounded-r-full bg-ink" />

        <div
          style={{ height: screenHeight }}
          className={`relative rounded-[2.25rem] bg-ivory no-scrollbar overscroll-contain ${
            scroll ? 'overflow-y-auto overflow-x-hidden' : 'overflow-hidden'
          }`}
        >
          {children}
        </div>
      </div>
    </div>
  )
}
