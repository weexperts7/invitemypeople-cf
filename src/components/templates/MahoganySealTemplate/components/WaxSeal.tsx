interface WaxSealProps {
  hashtag: string
  onClick: () => void
  /** Adds the slow pulse-ring "notice me" animation. Off for reduced-motion. */
  pulse?: boolean
  size?: number
  label?: string
}

/**
 * A clickable, embossed 3D red wax seal stamped with the couple's hashtag —
 * the primary call-to-action on the intro overlay. All texture (the
 * radial-gradient wax body, the two melted "drip" pseudo-elements, the
 * pressed-in text) lives in `.mst-seal` (MahoganySealTemplate.css); layout
 * and the pulse ring are plain Tailwind.
 */
export default function WaxSeal({ hashtag, onClick, pulse = true, size = 128, label = 'Tap to open invite' }: WaxSealProps) {
  return (
    <button
      type="button"
      onClick={(e) => {
        // Stops the tap from also bubbling up to a larger enclosing
        // "tap anywhere to open" region this button is sometimes nested
        // inside (IntroOverlay, once the intro video has ended) — without
        // this a single tap fires `onClick` twice: once here, once on the
        // ancestor's own handler.
        e.stopPropagation()
        onClick()
      }}
      aria-label={label}
      className={`mst-seal group relative flex shrink-0 items-center justify-center rounded-full transition-transform duration-200 ease-out hover:scale-[1.04] active:scale-95 ${
        pulse ? 'animate-[mst-glow-ring_2.6s_ease-out_infinite]' : ''
      }`}
      style={{ width: size, height: size }}
    >
      {/* Inner groove ring, stamped-in look */}
      <span
        aria-hidden="true"
        className="absolute rounded-full border border-[#f2d675]/30"
        style={{ inset: size * 0.1 }}
      />
      <span
        className="mst-font-seal px-2 text-center leading-tight font-semibold tracking-[0.14em] text-[#f2d675]/90 select-none"
        style={{ fontSize: Math.max(11, size * 0.115), textShadow: '0 1px 0 rgba(0,0,0,0.5), 0 -1px 0 rgba(255,255,255,0.12)' }}
      >
        {hashtag}
      </span>
    </button>
  )
}
