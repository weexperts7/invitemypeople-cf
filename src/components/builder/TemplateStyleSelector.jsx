// Step 1 of the Invitation Builder: pick an occasion, then a template style
// within it. Kept as small on-palette swatches (not full TemplateShowcase
// renders) since this is a picker meant to scan quickly, not a gallery —
// the live preview pane next to it is where the full design actually shows.
import { useRef } from 'react'
import { motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { OCCASIONS, getBuilderTemplatesForOccasion } from '../../data/builderTemplates'

// Shown in place of a normal click on a `disabled` occasion tab (see
// OCCASIONS' own comment in builderTemplates.js) — small enough not to
// unbalance the pill's existing icon+label layout.
const SOON_BADGE = (
  <span className="rounded-full bg-ink-soft/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.1em]">
    Soon
  </span>
)

// How far one arrow-button click scrolls the track — a bit less than two
// cards' worth (card + gap, see the w-32/gap-3 track below) so the card at
// the edge is never left half-cut-off between clicks.
const SCROLL_STEP_PX = 280

export default function TemplateStyleSelector({
  occasionId,
  templateId,
  onOccasionChange,
  onTemplateChange,
  // False when the visitor arrived already knowing what they want — e.g. a
  // "Customize" click on a specific template elsewhere on the site (see
  // utils/createLink.js) — so CreateInvitePage passes false and this skips
  // straight to that occasion's styles instead of tempting them to go
  // exploring other occasions and lose their pick.
  showOccasionPicker = true,
}) {
  const templates = getBuilderTemplatesForOccasion(occasionId)
  const trackRef = useRef(null)
  const activeOccasion = OCCASIONS.find((o) => o.id === occasionId)

  const scrollTrack = (direction) => {
    trackRef.current?.scrollBy({ left: direction * SCROLL_STEP_PX, behavior: 'smooth' })
  }

  return (
    <div>
      {showOccasionPicker ? (
        <div className="flex flex-wrap gap-2">
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion.id}
              type="button"
              disabled={occasion.disabled}
              onClick={() => !occasion.disabled && onOccasionChange(occasion.id)}
              aria-disabled={occasion.disabled}
              title={occasion.disabled ? `${occasion.label} — launching soon` : undefined}
              className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                occasion.disabled
                  ? 'cursor-not-allowed border-champagne-deep/30 bg-ivory/40 text-ink-soft/50'
                  : occasionId === occasion.id
                    ? 'border-rose bg-rose text-ivory shadow-card'
                    : 'border-champagne-deep/50 bg-ivory/60 text-ink-soft hover:bg-champagne/40'
              }`}
            >
              <occasion.icon className="h-3.5 w-3.5" />
              {occasion.label}
              {occasion.disabled && SOON_BADGE}
            </button>
          ))}
        </div>
      ) : (
        activeOccasion && (
          <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.2em] text-ink-soft">
            <activeOccasion.icon className="h-3.5 w-3.5 text-rose" />
            {activeOccasion.label} Styles
          </div>
        )
      )}

      <div className={`flex min-w-0 items-center gap-2 ${showOccasionPicker ? 'mt-4' : 'mt-3'}`}>
        <div
          ref={trackRef}
          className="no-scrollbar flex min-w-0 flex-1 gap-3 overflow-x-auto scroll-smooth snap-x snap-proximity py-1"
        >
          {templates.map((template) => {
            const isActive = template.id === templateId
            return (
              <motion.button
                key={template.id}
                type="button"
                layout
                onClick={() => onTemplateChange(template.id)}
                whileTap={{ scale: 0.97 }}
                className={`group relative flex w-32 shrink-0 snap-start flex-col overflow-hidden rounded-2xl border text-left shadow-card transition-shadow ${
                  isActive ? 'border-rose ring-2 ring-rose/40' : 'border-white/60 hover:shadow-soft'
                }`}
              >
                <div
                  className="relative flex h-16 w-full items-center justify-center overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${template.palette.champagne} 0%, ${template.palette.blushDeep} 100%)`,
                  }}
                >
                  <span
                    className="text-lg"
                    style={{ color: template.palette.gold, fontFamily: '"Great Vibes", cursive' }}
                  >
                    {template.greeting?.symbol ?? template.name.charAt(0)}
                  </span>
                  {isActive && (
                    <span className="absolute right-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-rose text-ivory">
                      <Check className="h-3 w-3" />
                    </span>
                  )}
                </div>
                <div className="bg-ivory/80 px-2.5 py-2">
                  <p className="truncate text-xs font-medium text-ink">{template.name}</p>
                  <p className="truncate text-[10px] text-ink-soft">{template.tagline}</p>
                </div>
              </motion.button>
            )
          })}
        </div>

        {templates.length > 3 && (
          <div className="flex shrink-0 flex-col gap-1.5">
            <button
              type="button"
              onClick={() => scrollTrack(-1)}
              aria-label="Scroll styles left"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory/70 text-ink-soft transition-colors hover:text-rose"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => scrollTrack(1)}
              aria-label="Scroll styles right"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-champagne-deep/50 bg-ivory/70 text-ink-soft transition-colors hover:text-rose"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
