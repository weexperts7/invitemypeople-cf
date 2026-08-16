import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import SiteHeader from './SiteHeader'
import SiteFooter from './SiteFooter'
import WishesWall from './WishesWall'
import { formatInviteDate } from '../utils/formatInviteDateTime'

// Rendered by GeneratedInvitePage.jsx instead of the live RSVP experience
// once getEventStatus() (see ../utils/eventStatus.js) says an invite's event
// — plus its 24-hour post-event buffer — has passed. A calm, read-only
// "thank you" page rather than a stale RSVP form inviting guests to respond
// to something that's already happened. Nothing here is interactive besides
// navigation; WishesWall is read-only (it only ever fetches, never posts —
// see WishesWall.jsx), so it's safe to still show the blessings guests left.
export default function EventConcludedView({ invite }) {
  const dateLabel = formatInviteDate(invite.date)

  return (
    <div className="min-h-svh w-full bg-linen text-ink">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden bg-petals px-6 pt-16 pb-14 sm:pt-20 sm:pb-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blush border border-gold-soft shadow-card">
            <Heart className="h-6 w-6 text-rose" strokeWidth={1.5} />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
            Event Concluded
          </p>
          <h1 className="font-serif text-3xl sm:text-5xl leading-[1.1] text-ink mb-4">
            {invite.names}
          </h1>
          <p className="mx-auto max-w-xl text-ink-soft">
            {dateLabel ? `This celebration took place on ${dateLabel}. ` : ''}
            Thank you to everyone who joined, sent their blessings, and
            shared in the joy — RSVPs for this invitation are now closed.
          </p>
        </section>

        <WishesWall
          slug={invite.slug}
          heading="Wishes From Guests"
          subheading="Blessings left behind for this celebration"
        />

        <section className="px-6 pb-16 text-center">
          <Link
            to="/create"
            className="inline-flex items-center gap-2 rounded-full bg-rose px-5 py-2.5 text-sm font-medium text-ivory shadow-card"
          >
            Build Your Own Invitation
          </Link>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
