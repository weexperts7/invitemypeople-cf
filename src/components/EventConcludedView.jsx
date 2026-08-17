import { Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import WishesWall from './WishesWall'
import { formatInviteDate } from '../utils/formatInviteDateTime'

// Rendered by GeneratedInvitePage.jsx instead of the live RSVP experience
// once getEventStatus() (see ../utils/eventStatus.js) says an invite's event
// — plus its 24-hour post-event buffer — has passed. A calm, read-only
// "thank you" page rather than a stale RSVP form inviting guests to respond
// to something that's already happened. Nothing here is interactive besides
// navigation; WishesWall is read-only (it only ever fetches, never posts —
// see WishesWall.jsx), so it's safe to still show the blessings guests left.
//
// Deliberately mirrors InvitationExperience.jsx's own shell + isPreview
// treatment (the "template demo" pages under /templates/wedding/:id etc.
// use) rather than SiteHeader/SiteFooter chrome: same bg-linen wrapper
// with the card centered/rounded on desktop and full-bleed on mobile, and
// the same floating bottom CTA bar style as that isPreview overlay — so a
// concluded invite reads as one more state of the same invitation page a
// guest was just looking at, not a different site entirely.
export default function EventConcludedView({ invite }) {
  const dateLabel = formatInviteDate(invite.date)

  return (
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8">
      <div className="relative w-full max-w-md min-h-svh bg-ivory overflow-hidden sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40">
        <section className="relative overflow-hidden bg-petals px-6 pt-20 pb-14 sm:pt-24 sm:pb-16 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-blush border border-gold-soft shadow-card">
            <Heart className="h-6 w-6 text-rose" strokeWidth={1.5} />
          </div>
          <p className="text-xs uppercase tracking-[0.2em] text-ink-soft mb-3">
            Event Concluded
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl leading-[1.1] text-ink mb-4">
            {invite.names}
          </h1>
          <p className="mx-auto max-w-xs text-ink-soft">
            {dateLabel ? `This celebration took place on ${dateLabel}. ` : ''}
            Thank you to everyone who joined, sent their blessings, and
            shared in the joy — RSVPs for this invitation are now closed.
          </p>
        </section>

        <WishesWall
          slug={invite.slug}
          heading="Wishes From Guests"
          subheading="Blessings left behind for this celebration"
          sectionClassName="px-6 py-14 pb-32"
        />

        {/* Same fixed bottom CTA bar InvitationExperience.jsx renders for
            isPreview (its "Create Your Own — ₹X" bar) — pinned to the
            viewport, its content constrained to the card's own max-w-md so
            it lines up with the card above it on desktop. */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 bg-gradient-to-t from-ink/20 via-ink/5 to-transparent"
        >
          <Link
            to="/create"
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-full border border-white/30 bg-rose px-6 py-3.5 text-sm font-semibold text-ivory shadow-soft backdrop-blur-xl"
          >
            <Heart className="w-4 h-4" />
            Create Your Invite
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
