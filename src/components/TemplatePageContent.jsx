import { Link } from 'react-router-dom'
import { templatePage } from '../data/templateSeo'

// The readable part of a template's own page, shown under the full-screen
// demo: breadcrumb, H1, the written copy, a link to customise it, and links to
// sibling templates. It renders the same blocks the server puts in the raw
// HTML (see templateSeo.js and utils/seoHtml.js), so visitors and crawlers
// read identical text. `kind` is 'wedding', 'satsang' or 'ganesh'.
function LinkOrAnchor({ href, className, children }) {
  if (/^https?:\/\//.test(href)) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link to={href} className={className}>
      {children}
    </Link>
  )
}

function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6 text-sm text-ink-soft">
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

function Block({ block }) {
  if (typeof block === 'string') return <p className="leading-relaxed text-ink-soft">{block}</p>
  if (Array.isArray(block)) {
    return (
      <p className="leading-relaxed text-ink-soft">
        {block.map((seg, i) =>
          typeof seg === 'string' ? (
            seg
          ) : (
            <Link key={i} to={seg.href} className="text-rose underline-offset-2 hover:underline">
              {seg.text}
            </Link>
          ),
        )}
      </p>
    )
  }
  if (block.h2) return <h2 className="mt-4 font-serif text-2xl text-ink">{block.h2}</h2>
  if (block.links) {
    return (
      <ul className="flex flex-col gap-2">
        {block.links.map((l) => (
          <li key={l.href}>
            <Link to={l.href} className="text-rose underline-offset-2 hover:underline">
              {l.text}
            </Link>
          </li>
        ))}
      </ul>
    )
  }
  if (block.cta) {
    return (
      <div>
        <LinkOrAnchor
          href={block.cta.href}
          className="inline-flex items-center rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ivory shadow-soft transition-transform hover:scale-[1.03]"
        >
          {block.cta.label}
        </LinkOrAnchor>
      </div>
    )
  }
  return null
}

export default function TemplatePageContent({ kind, template }) {
  const page = templatePage(kind, template)
  if (!page) return null

  const [lead, ...rest] = page.body
  return (
    <section className="bg-linen px-6 pb-32 pt-14 text-ink sm:pt-20" aria-label={`About ${page.name}`}>
      <article className="mx-auto flex max-w-2xl flex-col gap-4">
        <Breadcrumb items={lead.breadcrumb} />
        <h1 className="font-serif text-3xl leading-tight text-ink sm:text-4xl">{page.h1}</h1>
        {rest.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </article>
    </section>
  )
}
