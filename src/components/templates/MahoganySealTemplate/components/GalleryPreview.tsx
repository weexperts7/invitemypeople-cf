import { useState } from 'react'
import AmbientLights from './AmbientLights'

interface GalleryPreviewProps {
  photos: string[]
  reduceMotion?: boolean
}

/**
 * Photo preview strip — a responsive grid of thumbnails that opens into a
 * simple full-screen lightbox on tap. Plain `useState` for the open index,
 * no dependency beyond React itself.
 *
 * Dark mahogany, matching EventItinerary's own reasoning (see its comment):
 * the intro video is never anything but wood tones and lamplight, so this
 * section stays in that family too — `#3d2820` here, a shade lighter than
 * the itinerary's `#1a100d`, for gentle depth variation between adjacent
 * sections without ever crossing into a bright, video-doesn't-show-this
 * cream.
 */
export default function GalleryPreview({ photos, reduceMotion = false }: GalleryPreviewProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  if (!photos.length) return null

  return (
    <section aria-label="Gallery preview" className="relative overflow-hidden bg-[#3d2820] px-5 py-16 sm:px-8">
      <AmbientLights variant="wash" density="soft" reduceMotion={reduceMotion} />
      <div className="relative z-10 mx-auto max-w-lg">
        <p className="mst-font-seal text-center text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">A Few Favorites</p>
        <h3 className="mst-font-display mt-2 text-center text-3xl font-semibold text-[#fbf3e3]">Gallery</h3>

        <div className="mt-8 grid grid-cols-3 gap-2 sm:gap-3">
          {photos.slice(0, 6).map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setOpenIndex(i)}
              className="group relative aspect-square overflow-hidden rounded-lg border border-[#d4af37]/30 shadow-[0_4px_14px_-4px_rgba(0,0,0,0.45)]"
              aria-label={`Open photo ${i + 1}`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-110"
              />
              <span className="pointer-events-none absolute inset-0 bg-[#d4af37]/0 transition-colors duration-300 group-hover:bg-[#d4af37]/10" />
            </button>
          ))}
        </div>
      </div>

      {openIndex !== null && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center bg-[#1a100d]/90 p-6 transition-opacity duration-300"
          role="dialog"
          aria-modal="true"
          aria-label="Photo viewer"
          onClick={() => setOpenIndex(null)}
        >
          <button
            type="button"
            onClick={() => setOpenIndex(null)}
            aria-label="Close"
            className="absolute right-5 top-5 text-2xl leading-none text-[#f2d675] transition-transform hover:scale-110"
          >
            &times;
          </button>
          <img
            src={photos[openIndex]}
            alt=""
            className="max-h-[80vh] max-w-full rounded-xl border border-[#d4af37]/40 object-contain shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </section>
  )
}
