import { Link } from 'react-router-dom'
import { ArrowRight, Flame, PencilLine, Send, Eye } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { FoldedHandsIcon } from '../components/icons/FoldedHandsIcon'
import SiteHeader from '../components/SiteHeader'
import SiteFooter from '../components/SiteFooter'
import SEO from '../components/SEO'
import { SectionEyebrow, FloatingOrb, FloatingIcon } from '../components/PageDecor'
import SatsangSpotlight from '../components/SatsangSpotlight'
import { SATSANG_TEMPLATES } from '../data/satsangTemplatesData'
import { ROUTES_SEO } from '../data/routesSeo'
import { buildCreateLink } from '../utils/createLink'

const STEPS = [
  {
    icon: PencilLine,
    title: 'Add your satsang details',
    text: 'Your family name, date, venue, programme and photos.',
  },
  {
    icon: Eye,
    title: 'Watch it come together',
    text: 'The live preview updates as you type, then checkout takes a minute.',
  },
  {
    icon: Send,
    title: 'Share it with your sangat',
    text: 'Send one link on WhatsApp, and see every RSVP and seva on your dashboard.',
  },
]

// Where anyone looking for a Guruji Satsang invite lands: the invitation
// available today (SatsangSpotlight.jsx), how it works, and a way to start.
export default function GurujiSatsangsPage() {
  const reduceMotion = useReducedMotion()
  const template = SATSANG_TEMPLATES.find((t) => t.fullExperience)

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SEO {...ROUTES_SEO['/guruji-satsangs']} path="/guruji-satsangs" />
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-12 pb-4 sm:pt-16">
          {!reduceMotion && (
            <>
              <FloatingOrb className="left-[8%] top-10 bg-champagne-deep/40" size={150} duration={11} />
              <FloatingOrb className="right-[10%] top-20 bg-gold-soft/30" size={120} duration={9} delay={1.2} />
              <FloatingIcon icon={Flame} className="right-[8%] top-14 hidden sm:block" duration={8} delay={0.8} />
            </>
          )}

          <div className="relative mx-auto max-w-3xl text-center">
            <div className="mb-4 flex justify-center">
              <SectionEyebrow icon={FoldedHandsIcon} tone="gold">Guruji Satsang Invitations</SectionEyebrow>
            </div>
            <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-4">
              Devotional Invitations for Guruji&rsquo;s Satsang
            </h1>
            <p className="mx-auto max-w-xl text-ink-soft">
              Create a beautiful satsang invitation in minutes and share it with
              your sangat on WhatsApp.
            </p>
          </div>
        </section>

        <SatsangSpotlight />

        <section className="bg-ivory px-6 py-14 sm:py-16">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center font-serif text-2xl sm:text-3xl text-ink">How it works</h2>
            <ol className="mt-8 grid gap-6 sm:grid-cols-3">
              {STEPS.map(({ icon: Icon, title, text }, i) => (
                <li key={title} className="rounded-2xl border border-champagne-deep/40 bg-linen/60 p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-rose">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-3 font-serif text-xl text-ink">
                    {i + 1}. {title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{text}</p>
                </li>
              ))}
            </ol>

            {template && (
              <div className="mt-10 flex justify-center">
                <Link
                  to={buildCreateLink({ occasion: 'guruji-satsang', sourceId: template.slug })}
                  className="inline-flex items-center gap-2 rounded-full bg-rose px-7 py-3.5 text-sm font-semibold text-ivory shadow-soft transition-transform hover:scale-[1.03]"
                >
                  Create Your Satsang Invite
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
