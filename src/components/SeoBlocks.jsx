import { Link } from 'react-router-dom'

// Renders the page-body blocks that routesSeo.js, categoryContent.js and
// templateSeo.js define (and utils/seoHtml.js turns into raw HTML), so a
// visitor and a crawler read the same text. A string is a paragraph; an array
// is a paragraph of text and { text, href } links; then { h2 }, { h3 },
// { links: [...] } and { cta: { label, href } }.
export function LinkOrAnchor({ href, className, children }) {
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
  if (block.h2) return <h2 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{block.h2}</h2>
  if (block.h3) return <h3 className="mt-2 font-serif text-lg text-ink">{block.h3}</h3>
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

export default function SeoBlocks({ blocks }) {
  return blocks.map((block, i) => <Block key={i} block={block} />)
}
