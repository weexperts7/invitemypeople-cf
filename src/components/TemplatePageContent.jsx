import { Link } from 'react-router-dom'
import { ArrowRight, Bell, MessageCircle } from 'lucide-react'
import { LinkOrAnchor } from './SeoBlocks'
import { templatePage, rupees } from '../data/templateSeo'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'

// The readable part of a template's own page, shown under the full-screen
// demo. It lays out the same content the server puts in the raw HTML (see
// templateSeo.js: `parts` is that content split into pieces), so visitors and
// crawlers read the same words. `kind` is 'wedding', 'satsang' or 'ganesh'.
function Breadcrumb({ items }) {
  return (
    <nav aria-label="Breadcrumb" className="text-xs text-ink-soft">
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

function SectionHeading({ children }) {
  return (
    <div className="mt-14">
      <span className="block h-px w-10 bg-gold" aria-hidden="true" />
      <h2 className="mt-4 font-serif text-2xl text-ink sm:text-3xl">{children}</h2>
    </div>
  )
}

export default function TemplatePageContent({ kind, template }) {
  const overrides = useTemplatePriceOverrides()
  const page = templatePage(kind, template, overrides)
  if (!page) return null

  const { parts, cta, name } = page
  const [lead] = page.body
  const comingSoon = kind === 'ganesh'
  const [firstHow, ...otherHow] = parts.how

  return (
    <section className="bg-linen text-ink" aria-label={`About ${name}`}>
      <div className="h-px bg-gradient-to-r from-transparent via-gold/60 to-transparent" aria-hidden="true" />

      {/* pb-36 keeps the last links clear of the fixed "Create Your Own" bar. */}
      <article className="mx-auto max-w-2xl px-6 pb-36 pt-12 sm:pt-16">
        <Breadcrumb items={lead.breadcrumb} />

        <p className="mt-10 text-[11px] font-medium uppercase tracking-[0.28em] text-rose">{parts.eyebrow}</p>
        <h1 className="mt-3 font-serif text-[2rem] leading-[1.15] text-ink sm:text-5xl">{page.h1}</h1>

        <div className="mt-7 flex flex-col gap-4">
          <p className="text-lg leading-8 text-ink">{parts.intro[0]}</p>
          {parts.intro.slice(1).map((text) => (
            <p key={text} className="leading-8 text-ink-soft">
              {text}
            </p>
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-champagne-deep/40 bg-ivory/80 p-6 shadow-card sm:p-7">
          <h2 className="font-serif text-xl text-ink">Who {name} is for</h2>
          <p className="mt-3 leading-7 text-ink-soft">{parts.suits}</p>
        </div>

        <SectionHeading>What {name} includes</SectionHeading>
        <ul className="mt-5 flex flex-wrap gap-2.5">
          {parts.features.map((feature) => (
            <li
              key={feature}
              className="rounded-full border border-champagne-deep/40 bg-ivory px-4 py-2 text-sm text-ink-soft first-letter:uppercase"
            >
              {feature}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-6 text-ink-soft">{parts.appNote}</p>

        {!comingSoon && (
          <>
            <SectionHeading>{parts.howHeading}</SectionHeading>
            <p className="mt-5 leading-8 text-ink-soft">{firstHow}</p>
            {otherHow.map((text) => (
              <div key={text} className="mt-4 flex gap-3 rounded-2xl bg-blush/30 p-4">
                <MessageCircle className="mt-1 h-4 w-4 flex-none text-rose" aria-hidden="true" />
                <p className="text-sm leading-7 text-ink-soft">{text}</p>
              </div>
            ))}
          </>
        )}

        <div className="mt-14 rounded-3xl bg-ink p-7 text-ivory shadow-soft sm:p-9">
          {comingSoon ? (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold-soft">{parts.howHeading}</p>
              <p className="mt-3 font-serif text-3xl">Launching soon</p>
              <p className="mt-3 text-sm leading-7 text-ivory/75">{firstHow}</p>
              <p className="mt-2 text-sm leading-7 text-ivory/60">{parts.priceText}</p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-gold-soft">{parts.priceHeading}</p>
              <p className="mt-3 flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-serif text-5xl">{rupees(parts.price)}</span>
                {parts.priceList && <span className="text-xl text-ivory/45 line-through">{rupees(parts.priceList)}</span>}
              </p>
              <p className="mt-3 text-sm leading-7 text-ivory/75">{parts.priceNote}</p>
            </>
          )}
          <LinkOrAnchor
            href={cta.href}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
          >
            {comingSoon && <Bell className="h-4 w-4" aria-hidden="true" />}
            {cta.label}
          </LinkOrAnchor>
        </div>

        <SectionHeading>{parts.moreHeading}</SectionHeading>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {parts.siblings.map((sibling) => (
            <li key={sibling.href}>
              <Link
                to={sibling.href}
                className="group flex h-full items-center justify-between gap-3 rounded-2xl border border-champagne-deep/40 bg-ivory/70 px-5 py-4 text-ink transition-colors hover:border-rose hover:bg-ivory"
              >
                <span className="leading-6">{sibling.text}</span>
                <ArrowRight className="h-4 w-4 flex-none text-rose transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
        <Link to={page.categoryHref} className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-rose hover:underline">
          See every design on our {parts.categoryLabel}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </article>
    </section>
  )
}
