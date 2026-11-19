import { Link } from 'react-router-dom'
import { ArrowRight, Bell, MessageCircle } from 'lucide-react'
import { LinkOrAnchor } from './SeoBlocks'
import { templatePage, rupees } from '../data/templateSeo'
import { useTemplatePriceOverrides } from '../hooks/useTemplatePriceOverrides'
import './TemplatePageContent.css'

// The section under each template's demo, dressed in that template's own
// palette so it reads as part of the invitation above it. It lays out the
// same content the server puts in the raw HTML (templateSeo.js: `parts` is
// that content split into pieces), so visitors and crawlers read the same
// words. `kind` is 'wedding', 'satsang' or 'ganesh'.
function Ornament() {
  return (
    <div className="tpc-ornament" aria-hidden="true">
      <svg viewBox="0 0 120 16" fill="none" stroke="currentColor" strokeWidth="1">
        <path d="M0 8h46M74 8h46" />
        <path d="M60 2l6 6-6 6-6-6z" fill="currentColor" fillOpacity="0.25" />
        <circle cx="50" cy="8" r="1.4" fill="currentColor" />
        <circle cx="70" cy="8" r="1.4" fill="currentColor" />
      </svg>
    </div>
  )
}

function SectionTitle({ children }) {
  return (
    <>
      <Ornament />
      <h2 className="tpc-h2">{children}</h2>
    </>
  )
}

export default function TemplatePageContent({ kind, template }) {
  const overrides = useTemplatePriceOverrides()
  const page = templatePage(kind, template, overrides)
  if (!page) return null

  const { parts, cta, name } = page
  const [lead] = page.body
  const comingSoon = kind === 'ganesh'
  const { palette } = parts
  const [firstIntro, ...moreIntro] = parts.intro

  return (
    <section
      className="tpc"
      aria-label={`About ${name}`}
      style={{ '--tpc-bg': palette.bg, '--tpc-ink': palette.ink, '--tpc-accent': palette.accent, '--tpc-gold': palette.gold }}
    >
      <article className="tpc-wrap">
        <nav aria-label="Breadcrumb" className="tpc-crumbs">
          <ol>
            {lead.breadcrumb.map((item, i) => (
              <li key={item.label}>
                {i > 0 && <span aria-hidden="true">›</span>}
                {item.href ? <Link to={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
              </li>
            ))}
          </ol>
        </nav>

        <div className="mt-8">
          <Ornament />
        </div>
        <h1 className="tpc-title">
          <span className="tpc-title-name">{parts.title.name}</span>
          <span className="tpc-sr"> – </span>
          <span className="tpc-title-type">{parts.title.type}</span>
        </h1>

        <dl className="tpc-glance">
          <div>
            <dt>Price</dt>
            <dd>
              {parts.price ? rupees(parts.price) : 'Soon'}
              {parts.priceList && <s>{rupees(parts.priceList)}</s>}
            </dd>
          </div>
          <div>
            <dt>Made for</dt>
            <dd>{parts.madeFor}</dd>
          </div>
          <div>
            <dt>Delivery</dt>
            <dd>{parts.delivery}</dd>
          </div>
        </dl>

        <p className="tpc-lead">{firstIntro}</p>
        {moreIntro.map((text) => (
          <p key={text} className="tpc-p">
            {text}
          </p>
        ))}

        <div className="tpc-quote">
          <h2 className="tpc-kicker">Who {name} is for</h2>
          <p>{parts.suits}</p>
        </div>

        <div className="tpc-section">
          <SectionTitle>What {name} includes</SectionTitle>
          <ul className="tpc-features">
            {parts.features.map((feature) => (
              <li key={feature}>
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <p className="tpc-small">{parts.appNote}</p>
        </div>

        {parts.how.steps.length > 0 && (
          <div className="tpc-section">
            <SectionTitle>{parts.howHeading}</SectionTitle>
            {parts.how.intro && <p className="tpc-p text-center">{parts.how.intro}</p>}
            <ol className="tpc-steps">
              {parts.how.steps.map((step, i) => (
                <li key={step.title}>
                  <span className="tpc-step-num" aria-hidden="true">
                    {i + 1}
                  </span>
                  <div>
                    <h3>
                      <span className="tpc-sr">{i + 1}. </span>
                      {step.title}
                    </h3>
                    <p>{step.text}</p>
                  </div>
                </li>
              ))}
            </ol>
            {parts.how.note && (
              <p className="tpc-note">
                <MessageCircle aria-hidden="true" />
                <span>{parts.how.note}</span>
              </p>
            )}
          </div>
        )}

        <div className="tpc-ticket">
          {comingSoon ? (
            <>
              <h2 className="tpc-ticket-label">{parts.howHeading}</h2>
              <p className="tpc-ticket-soon">Launching soon</p>
              <p className="tpc-ticket-note">{parts.how.intro}</p>
              <p className="tpc-ticket-note">{parts.priceText}</p>
            </>
          ) : (
            <>
              <h2 className="tpc-ticket-label">{parts.priceHeading}</h2>
              <p className="tpc-ticket-price">
                {rupees(parts.price)}
                {parts.priceList && <s>{rupees(parts.priceList)}</s>}
              </p>
              <p className="tpc-ticket-note">{parts.priceNote}</p>
            </>
          )}
          <LinkOrAnchor href={cta.href} className="tpc-ticket-cta">
            {comingSoon && <Bell className="h-4 w-4" aria-hidden="true" />}
            {cta.label}
            {!comingSoon && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </LinkOrAnchor>
        </div>

        <div className="tpc-section">
          <SectionTitle>{parts.moreHeading}</SectionTitle>
          <ul className="tpc-related">
            {parts.siblings.map((s) => (
              <li key={s.href}>
                <Link
                  to={s.href}
                  className="tpc-card"
                  style={{ '--card-bg': s.palette.bg, '--card-ink': s.palette.ink, '--card-accent': s.palette.accent, '--card-gold': s.palette.gold }}
                >
                  <span className="tpc-card-art" aria-hidden="true" />
                  <span className="tpc-card-body">
                    <span className="tpc-card-name">{s.name}</span>
                    <span className="tpc-card-label">{s.label}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="tpc-all">
            <Link to={page.categoryHref}>
              See every design on our {parts.categoryLabel}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </article>
    </section>
  )
}
