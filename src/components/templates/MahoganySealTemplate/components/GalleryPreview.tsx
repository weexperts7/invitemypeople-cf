import { useState } from 'react'
import { createPortal } from 'react-dom'
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
      <div className="relative z-10 mx-auto max-w-xl">
        <p className="mst-font-seal text-center text-[11px] tracking-[0.4em] text-[#d4af37]/80 uppercase">A Few Favorites</p>
        <h3 className="mst-font-display mt-2 text-center text-3xl font-semibold text-[#fbf3e3]">Gallery</h3>

        {/* Two columns, not three — three-across squeezed each photo down to
            barely 100px on a phone screen. Wider container (max-w-xl, was
            max-w-lg) plus fewer, bigger columns makes every thumbnail
            roughly double its old size. */}
        <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
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

      {/* Portaled straight to <body> rather than rendered in place: every
          caller wraps this template in a phone-frame card with a
          *transformed*, scrollable ancestor (see App.jsx's/
          InvitationExperience.jsx's own comments on `sm:[transform:translateZ(0)]`)
          so `position:fixed` descendants clip to that card instead of the
          full browser window — but that same transformed ancestor also
          being a scroll container makes its `fixed` descendants scroll
          away WITH the content instead of staying centered on screen. A
          guest scrolled anywhere but the very top of the page would tap a
          photo and see nothing happen — the lightbox was opening, just
          rendered off-screen. A portal escapes that trap entirely, same
          fix CreateYourOwnModal.tsx (now MahoganySealCreatePage.tsx) and
          the "Create Your Own" bar needed for the same reason. */}
      {openIndex !== null &&
        createPortal(
          <div
            className="mst-root fixed inset-0 z-40 flex items-center justify-center bg-[#1a100d]/90 p-6 transition-opacity duration-300"
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
          </div>,
          document.body,
        )}
    </section>
  )
}
