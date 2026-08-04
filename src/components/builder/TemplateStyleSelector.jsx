// Step 1 of the Invitation Builder: pick an occasion, then a template style
// within it. Kept as small on-palette swatches (not full TemplateShowcase
// renders) since this is a picker meant to scan quickly, not a gallery —
// the live preview pane next to it is where the full design actually shows.
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { OCCASIONS, getBuilderTemplatesForOccasion } from '../../data/builderTemplates'

export default function TemplateStyleSelector({ occasionId, templateId, onOccasionChange, onTemplateChange }) {
  const templates = getBuilderTemplatesForOccasion(occasionId)

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {OCCASIONS.map((occasion) => (
          <button
            key={occasion.id}
            type="button"
            onClick={() => onOccasionChange(occasion.id)}
            className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              occasionId === occasion.id
                ? 'border-rose bg-rose text-ivory shadow-card'
                : 'border-champagne-deep/50 bg-ivory/60 text-ink-soft hover:bg-champagne/40'
            }`}
          >
            <occasion.icon className="h-3.5 w-3.5" />
            {occasion.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {templates.map((template) => {
          const isActive = template.id === templateId
          return (
            <motion.button
              key={template.id}
              type="button"
              layout
              onClick={() => onTemplateChange(template.id)}
              whileTap={{ scale: 0.97 }}
              className={`group relative flex flex-col overflow-hidden rounded-2xl border text-left shadow-card transition-shadow ${
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
    </div>
  )
}
