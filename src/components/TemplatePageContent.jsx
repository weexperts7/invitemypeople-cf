import { Link } from 'react-router-dom'
import SeoBlocks from './SeoBlocks'
import { templatePage } from '../data/templateSeo'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'

// The readable part of a template's own page, shown under the full-screen
// demo: breadcrumb, H1, the written copy, a link to customise it, and links to
// sibling templates. It renders the same blocks the server puts in the raw
// HTML (see templateSeo.js and utils/seoHtml.js), so visitors and crawlers
// read identical text. `kind` is 'wedding', 'satsang' or 'ganesh'.
function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-2 text-sm text-ink-soft">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {i > 0 && <span aria-hidden="true">›</span>}
            {item.href ? (
              <Link to={item.href} className="hover:text-rose hover:underline">
                {item.label}
              </Link>
            ) : (
              <span aria-current="page">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default function TemplatePageContent({ kind, template }) {
  const overrides = useTemplatePriceOverrides()
  const page = templatePage(kind, template, overrides)
  if (!page) return null

  const [lead, ...rest] = page.body
  return (
    // pb-32 keeps the last links clear of the fixed "Create Your Own" bar.
    <section className="bg-linen px-6 pb-32 pt-14 text-ink sm:pt-20" aria-label={`About ${page.name}`}>
      <article className="mx-auto flex max-w-2xl flex-col gap-4">
        <Breadcrumb items={lead.breadcrumb} />
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">{page.h1}</h1>
        <SeoBlocks blocks={rest} />
      </article>
    </section>
  )
}
