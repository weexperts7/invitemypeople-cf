import AmbientLights from './AmbientLights'
import ScratchCanvas from './ScratchCanvas'

interface ScratchRevealProps {
  eyebrow: string
  message: string
  hashtag: string
  revealThreshold?: number
  reduceMotion?: boolean
}

/**
 * The "secret message" scratch card — a big scratch surface further down
 * the dashboard hiding a note from the couple. Built on the shared
 * `ScratchCanvas` mechanic (also used by CoupleHero's date reveal).
 */
export default function ScratchReveal({ eyebrow, message, hashtag, revealThreshold = 0.45, reduceMotion = false }: ScratchRevealProps) {
  return (
    <section aria-label="Scratch card" className="relative overflow-hidden bg-[#2c1d18] px-5 py-16 sm:px-8">
      <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
      <div className="relative z-10 mx-auto max-w-md text-center">
        <p className="mst-font-seal text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">{eyebrow}</p>
        <h3 className="mst-font-display mt-2 text-2xl font-semibold text-[#fbf3e3]">Go on, scratch it</h3>

        <ScratchCanvas
          revealThreshold={revealThreshold}
          ariaLabel="Scratch to reveal a message from the couple"
          className="mx-auto mt-8 aspect-[5/3] w-full"
        >
          <p className="mst-font-display text-lg leading-relaxed text-[#fbf3e3]">{message}</p>
          <p className="mst-font-seal text-xs tracking-[0.15em] text-[#d4af37]">{hashtag}</p>
        </ScratchCanvas>
      </div>
    </section>
  )
}
