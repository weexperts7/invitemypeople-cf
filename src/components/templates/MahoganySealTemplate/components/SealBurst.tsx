interface SealBurstProps {
  /** Mounted only while true — plays once and the parent unmounts it, it never lingers in the DOM. */
  active: boolean
  reduceMotion?: boolean
}

/**
 * The one-shot burst of warm gold light that plays over the intro→
 * dashboard handoff — the visual stand-in for the wax seal cracking open,
 * not just a plain crossfade. `MahoganySealTemplate` mounts this the
 * instant the guest opens the invite (same moment `IntroOverlay` starts
 * fading/zooming out) and unmounts it once `mst-burst-flash` has finished,
 * so it exists only for that one transition and never intercepts a click
 * or sits idle afterward.
 *
 * `fixed` + a high z-index (above `IntroOverlay`'s `z-50`) because it has
 * to bridge *both* layers of the handoff — the tail end of the video
 * fading out underneath it and the first moment of the dashboard fading
 * in — so it can't be scoped inside either one.
 *
 * Skips rendering entirely for `reduceMotion`: it has no non-animated
 * form worth showing (a static gold radial hanging over the screen for no
 * reason isn't "reduced," it's just clutter), so this is one of the few
 * places in the template that's pure motion, all-or-nothing.
 */
export default function SealBurst({ active, reduceMotion = false }: SealBurstProps) {
  if (!active || reduceMotion) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[60]">
      <div
        className="absolute inset-0 animate-[mst-burst-flash_950ms_cubic-bezier(.16,1,.3,1)_forwards]"
        style={{
          background:
            'radial-gradient(circle at 50% 42%, rgba(255,244,214,0.95) 0%, rgba(242,214,117,0.6) 26%, rgba(212,175,55,0.22) 48%, transparent 72%)',
        }}
      />
    </div>
  )
}
