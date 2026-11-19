import SeoBlocks from './SeoBlocks'
import { getCategoryBlocks } from '../data/categoryContent'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'

// The written part of a category page: for Guruji Satsangs the main copy, for
// every category a list of its templates with descriptive links, and the FAQ.
// Server-rendered into the raw HTML from the same blocks (routesSeo.js), and
// the FAQPage structured data is built from the same FAQ data. Prices follow
// any price an admin has set.
export default function CategoryContent({ path }) {
  const overrides = useTemplatePriceOverrides()
  const blocks = getCategoryBlocks(path, overrides)
  if (!blocks) return null
  return (
    <section className="bg-linen text-ink">
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />
      {/* The first heading carries its own top gap, so this one starts tighter. */}
      <div className="mx-auto flex max-w-2xl flex-col gap-4 px-6 pb-20 pt-4 sm:pb-24">
        <SeoBlocks blocks={blocks} />
      </div>
    </section>
  )
}
