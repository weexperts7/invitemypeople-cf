import SeoBlocks from './SeoBlocks'
import { getCategoryBlocks } from '../data/categoryContent'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'

// The written part of a category page: for Guruji Satsangs the main copy, for
// every category a list of its templates with descriptive links, and the FAQ.
// Server-rendered into the raw HTML from the same blocks (routesSeo.js), and
// the FAQPage structured data is built from the same FAQ data.
export default function CategoryContent({ path }) {
  const overrides = useTemplatePriceOverrides()
  const blocks = getCategoryBlocks(path, overrides)
  if (!blocks) return null
  return (
    <section className="bg-linen px-6 py-16 text-ink sm:py-20">
      <div className="mx-auto flex max-w-3xl flex-col gap-4">
        <SeoBlocks blocks={blocks} />
      </div>
    </section>
  )
}
