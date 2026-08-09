import { motion, useReducedMotion } from 'framer-motion'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Calendar, Clock } from 'lucide-react'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { getBlogPostBySlug, formatBlogDate } from '../data/blogPosts'

// Renders one `body` block from blogPosts.js — the same { h2 }/{ h3 }/
// string/segment-array scheme routesSeo.js's STATIC_ROUTES_SEO bodies use
// (see api/render.js's renderBodyBlock, which mirrors this exactly for the
// raw, pre-hydration SSR shell). Unlike LandingPage.jsx's rendering of
// HOMEPAGE_SEO_BODY, headings aren't demoted a level here — this page's
// article *is* the page, sitting directly under its own <h1>, so a `{ h2 }`
// entry stays an <h2> and `{ h3 }` stays an <h3>.
function BlogBodyBlock({ block }) {
  if (typeof block === 'string') {
    return <p className="text-ink-soft leading-relaxed text-base sm:text-lg">{block}</p>
  }
  if (Array.isArray(block)) {
    return (
      <p className="text-ink-soft leading-relaxed text-base sm:text-lg">
        {block.map((seg, j) =>
          typeof seg === 'string' ? (
            <span key={j}>{seg}</span>
          ) : (
            <Link
              key={j}
              to={seg.href}
              className="text-rose underline decoration-rose/40 underline-offset-2 hover:decoration-rose"
            >
              {seg.text}
            </Link>
          ),
        )}
      </p>
    )
  }
  if (block.h3) {
    return <h3 className="font-serif text-xl sm:text-2xl text-ink pt-2">{block.h3}</h3>
  }
  return <h2 className="font-serif text-2xl sm:text-3xl text-ink pt-4">{block.h2}</h2>
}

// A directly-linkable, dynamic blog post page — see App.jsx's /blog/:slug
// route and blogPosts.js for the content source. Mirrors the shell every
// other page shares (SiteHeader/SiteFooter/<SEO>) around a single-column
// article, the same layout LegalPageLayout.jsx uses for the policy pages.
export default function BlogPostPage() {
  const { slug } = useParams()
  const post = getBlogPostBySlug(slug)
  const reduceMotion = useReducedMotion()

  if (!post) {
    return (
      <div className="min-h-svh w-full bg-linen text-ink flex flex-col">
        <SEO
          title="Post Not Found | InviteMyPeople"
          description="The blog post you're looking for doesn't exist."
          path={`/blog/${slug}`}
          noindex
        />
        <SiteHeader />
        <main className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-24 text-center">
          <h1 className="font-serif text-3xl sm:text-4xl text-ink">Post Not Found</h1>
          <p className="max-w-md text-ink-soft">
            We couldn&rsquo;t find the article you were looking for. It may have moved, or the
            link might be off.
          </p>
          <Link
            to="/blog"
            className="mt-2 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-ivory shadow-card"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO
        title={post.title}
        description={post.description}
        path={`/blog/${post.slug}`}
        ogTitle={post.title}
        ogDescription={post.description}
      />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-16 pb-12 sm:pt-20 sm:pb-14">
          <div className="relative mx-auto max-w-3xl">
            <Link
              to="/blog"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-ink-soft hover:text-rose transition-colors mb-6"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back to Blog
            </Link>
            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 24 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="font-serif text-3xl sm:text-5xl leading-[1.15] text-ink"
            >
              {post.h1}
            </motion.h1>
            <div className="mt-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.15em] text-ink-soft/70">
              <span className="inline-flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {formatBlogDate(post.date)}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {post.readingTime}
              </span>
            </div>
          </div>
        </section>

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <motion.article
            initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl space-y-5"
          >
            {post.body.map((block, i) => (
              <BlogBodyBlock key={i} block={block} />
            ))}
          </motion.article>
        </section>

        {post.cta && (
          <section className="bg-ink px-6 py-16 sm:py-20">
            <motion.div
              initial={reduceMotion ? undefined : { opacity: 0, y: 20 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="mx-auto max-w-2xl text-center"
            >
              <h2 className="font-serif text-2xl sm:text-4xl text-ivory mb-4">
                Ready to skip the spreadsheet?
              </h2>
              <p className="mx-auto max-w-lg text-white/70 mb-9">
                Build a live, interactive invitation with RSVP tracking built in — and watch
                responses land in your dashboard instead of a group chat.
              </p>
              <Link
                to={post.cta.href}
                className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-semibold text-ink shadow-soft transition-transform hover:scale-[1.03]"
              >
                {post.cta.label}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </motion.div>
          </section>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
