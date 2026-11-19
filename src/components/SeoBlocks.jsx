import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'

// Renders the page-body blocks that routesSeo.js and categoryContent.js define
// (and utils/seoHtml.js turns into raw HTML), so a visitor and a crawler read
// the same text. A string is a paragraph; an array is a paragraph of text and
// { text, href } links; then { h2 }, { h3 } followed by its answer (shown as an
// accordion), { links: [...] } and { cta: { label, href } }.
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

const PARAGRAPH = 'text-[17px] leading-8 text-ink-soft'

function Heading({ children }) {
  return (
    <div className="mt-12">
      <span className="block h-px w-10 bg-gold" aria-hidden="true" />
      <h2 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{children}</h2>
    </div>
  )
}

function LinkList({ links }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {links.map((link) => (
        <li key={link.href}>
          <Link
            to={link.href}
            className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-champagne-deep/40 bg-ivory/70 px-5 py-4 text-ink transition-colors hover:border-rose hover:bg-ivory"
          >
            <span className="leading-6">{link.text}</span>
            <ArrowRight className="h-4 w-4 flex-none text-rose transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </li>
      ))}
    </ul>
  )
}

// One FAQ item. A native <details>: the answer is in the page text whether or
// not it is open, and it works without any script.
function Faq({ question, answer }) {
  return (
    <details className="group rounded-2xl border border-champagne-deep/40 bg-ivory/80 px-5 py-4 open:shadow-card">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 [&::-webkit-details-marker]:hidden">
        <h3 className="font-serif text-lg leading-snug text-ink">{question}</h3>
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-blush/60 text-rose transition-transform group-open:rotate-45">
          <Plus className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        </span>
      </summary>
      <p className="mt-3 leading-7 text-ink-soft">{answer}</p>
    </details>
  )
}

export default function SeoBlocks({ blocks }) {
  const out = []
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i]
    if (typeof block === 'string') {
      out.push(<p key={i} className={PARAGRAPH}>{block}</p>)
    } else if (Array.isArray(block)) {
      out.push(
        <p key={i} className={PARAGRAPH}>
          {block.map((seg, j) =>
            typeof seg === 'string' ? (
              seg
            ) : (
              <Link key={j} to={seg.href} className="text-rose underline-offset-2 hover:underline">
                {seg.text}
              </Link>
            ),
          )}
        </p>,
      )
    } else if (block.h2) {
      out.push(<Heading key={i}>{block.h2}</Heading>)
    } else if (block.h3) {
      out.push(<Faq key={i} question={block.h3} answer={blocks[i + 1]} />)
      i += 1
    } else if (block.links) {
      out.push(<LinkList key={i} links={block.links} />)
    } else if (block.cta) {
      out.push(
        <div key={i}>
          <LinkOrAnchor
            href={block.cta.href}
            className="inline-flex items-center rounded-full bg-rose px-6 py-3 text-sm font-semibold text-ivory shadow-soft transition-transform hover:scale-[1.03]"
          >
            {block.cta.label}
          </LinkOrAnchor>
        </div>,
      )
    }
  }
  return out
}
