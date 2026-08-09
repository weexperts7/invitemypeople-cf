import { motion, useReducedMotion } from 'framer-motion'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import { SectionEyebrow } from './PageDecor'
import { ScrollText } from 'lucide-react'

/**
 * Shared shell for the legal pages (Privacy Policy, Terms of Service,
 * Refund Policy) — none of them need the marketing hero/CTA machinery the
 * rest of the site uses, just a consistent, readable single-column layout
 * with the site's chrome around it.
 *
 * `sections` is a list of { heading, blocks } where each block is either a
 * plain paragraph string, or a `{ items }` bullet list — list items can
 * themselves be a plain string or a `{ lead, text }` pair to bold a leading
 * term (e.g. "Personal Information:") the way the source copy does.
 */
export default function LegalPageLayout({ title, updated, intro, sections }) {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-14 sm:pt-24 sm:pb-16">
          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex justify-center"
            >
              <SectionEyebrow icon={ScrollText} tone="gold">Legal</SectionEyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-serif text-4xl sm:text-5xl leading-[1.1] text-ink"
            >
              {title}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.16 }}
              className="mt-4 text-sm text-ink-soft"
            >
              Last Updated: {updated}
            </motion.p>
          </div>
        </section>

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl"
          >
            {intro && (
              <div className="mb-10 space-y-4 text-base text-ink-soft leading-relaxed">
                {intro.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            )}

            <div className="space-y-10">
              {sections.map((section) => (
                <div key={section.heading}>
                  <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-4">
                    {section.heading}
                  </h2>
                  <div className="space-y-4 text-base text-ink-soft leading-relaxed">
                    {section.blocks.map((block, i) =>
                      typeof block === 'string' ? (
                        <p key={i}>{block}</p>
                      ) : (
                        <ul key={i} className="list-disc space-y-2.5 pl-5 marker:text-rose">
                          {block.items.map((item, j) => (
                            <li key={j}>
                              {typeof item === 'string' ? (
                                item
                              ) : (
                                <>
                                  <span className="font-semibold text-ink">{item.lead}</span>{' '}
                                  {item.text}
                                </>
                              )}
                            </li>
                          ))}
                        </ul>
                      ),
                    )}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
