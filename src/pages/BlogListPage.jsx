import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, Calendar, Clock, Sparkles } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import { BLOG_POSTS, formatBlogDate } from '../data/blogPosts'

// The blog's listing route — deliberately simple (a hero + a card grid)
// since its job is discovery and internal linking (see routesSeo.js's
// HOMEPAGE_SEO_BODY and SITE_NAV_LINKS, both of which now point here), not
// showcasing design the way the template gallery pages do. Each card links
// to /blog/:slug (see BlogPostPage.jsx), which carries the actual
// long-form, keyword-rich content.
export default function BlogListPage() {
  const reduceMotion = useReducedMotion()

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO
        title="Wedding & Event Planning Blog | InviteMyPeople"
        description="Practical guides on digital wedding invitations, WhatsApp RSVP tracking, and guest management for Indian weddings, Guruji Satsangs & more."
        path="/blog"
        ogTitle="The InviteMyPeople Blog"
        ogDescription="Guides on interactive RSVP tracking, digital wedding invitations, and guest management for hosts planning weddings, Guruji Satsangs and more."
      />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-16 sm:pt-24 sm:pb-20">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[10%] top-14 bg-blush-deep/40" size={160} duration={11} />
              <FloatingOrb className="right-[8%] top-24 bg-gold-soft/30" size={130} duration={9} delay={1.2} />
              <FloatingIcon icon={BookOpen} className="right-[10%] top-16 hidden sm:block" duration={9} delay={0.6} />
              <FloatingIcon icon={Sparkles} className="left-[8%] bottom-10 hidden sm:block" duration={10} delay={1} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-5 flex justify-center"
            >
              <SectionEyebrow icon={BookOpen} tone="gold">Blog</SectionEyebrow>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.08 }}
              className="font-serif text-4xl sm:text-6xl leading-[1.1] text-ink"
            >
              The InviteMyPeople Blog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.16 }}
              className="mx-auto mt-6 max-w-2xl text-base sm:text-lg text-ink-soft leading-relaxed"
            >
              Practical, no-fluff guides on digital wedding invitations, WhatsApp RSVP tracking, and
              guest management — written by the team behind InviteMyPeople.
            </motion.p>
          </div>
        </section>

        <section className="bg-ivory px-6 py-16 sm:py-20">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6">
              {BLOG_POSTS.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.55, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="group block rounded-3xl border border-white/70 bg-linen p-7 sm:p-9 shadow-card transition-transform hover:-translate-y-1"
                  >
                    <div className="flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.15em] text-ink-soft/70 mb-3">
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatBlogDate(post.date)}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        {post.readingTime}
                      </span>
                    </div>
                    <h2 className="font-serif text-2xl sm:text-3xl text-ink mb-3 leading-snug">
                      {post.title}
                    </h2>
                    <p className="text-sm sm:text-base text-ink-soft leading-relaxed mb-4">
                      {post.excerpt}
                    </p>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-rose">
                      Read the guide
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
