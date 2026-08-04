// The Invitation Builder's live preview — a real, high-fidelity miniature
// of the selected template (same CulturalMotif tiling + FrameCorners
// ornament the full-size invitation experiences render, just themed and
// laid out for a single card) rather than a generic mock, so what a user
// sees here is an honest preview of their finished invitation.
import { motion } from 'framer-motion'
import { CalendarDays, Clock, MapPin, Sparkles } from 'lucide-react'
import CulturalMotif from '../CulturalMotif'
import { FrameCorners } from '../TemplateFrame'
import { formatInviteDate, formatInviteTime, mapsSearchUrl } from '../../utils/formatInviteDateTime'

export default function InvitePreviewCard({ template, values }) {
  const { palette, motif, motifAccent, fonts, greeting, name, connective, example } = template

  const names = values.names.trim() || example.names
  const isoDate = values.date || example.date
  const time24 = values.time || example.time
  const venue = values.venue.trim() || example.venue
  const message = values.message.trim() || example.message
  const mapHref = values.locationUrl.trim() || mapsSearchUrl(venue)

  const dateLabel = formatInviteDate(isoDate)
  const timeLabel = formatInviteTime(time24)

  return (
    <motion.div
      layout
      className="relative w-full overflow-hidden rounded-[2rem] border shadow-soft"
      style={{
        borderColor: `${palette.goldSoft}80`,
        background: `linear-gradient(160deg, ${palette.linen} 0%, ${palette.champagne} 55%, ${palette.blush} 100%)`,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(circle at 85% 90%, ${palette.blushDeep}55, transparent 55%)`,
        }}
      />
      <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />
      <FrameCorners motif={motif} palette={palette} accent={motifAccent} size="w-10 h-10 sm:w-12 sm:h-12" />

      <div className="relative flex flex-col items-center gap-3 px-6 py-10 text-center sm:px-10 sm:py-14">
        <span
          className="rounded-full border px-3 py-1 text-[10px] uppercase tracking-[0.22em]"
          style={{
            borderColor: `${palette.goldSoft}90`,
            color: palette.inkSoft,
            background: `${palette.ivory}90`,
          }}
        >
          {name}
        </span>

        {greeting?.symbol && (
          <p className="text-2xl leading-none" style={{ color: palette.gold }}>
            {greeting.symbol}
          </p>
        )}
        <p
          className="text-[11px] font-medium uppercase tracking-[0.3em]"
          style={{ color: palette.inkSoft }}
        >
          {greeting?.line ?? name}
        </p>

        <span className="block h-px w-12" style={{ background: palette.goldSoft }} />

        <p
          key={names}
          className="px-2 text-3xl leading-tight sm:text-4xl"
          style={{ color: palette.rose, fontFamily: '"Great Vibes", cursive' }}
        >
          {names}
        </p>

        {connective && (
          <p
            className="max-w-sm text-sm leading-relaxed"
            style={{ color: palette.ink, fontFamily: fonts?.serif ?? '"Cormorant Garamond", serif' }}
          >
            {connective}
          </p>
        )}

        <div
          className="mt-3 flex w-full max-w-sm flex-col gap-2.5 rounded-2xl border px-5 py-4 text-sm"
          style={{ borderColor: `${palette.goldSoft}60`, background: `${palette.ivory}70`, color: palette.ink }}
        >
          <div className="flex items-center justify-center gap-2">
            <CalendarDays className="h-4 w-4 shrink-0" style={{ color: palette.gold }} />
            <span>{dateLabel || 'Add your event date'}</span>
            {timeLabel && (
              <>
                <Clock className="ml-2 h-4 w-4 shrink-0" style={{ color: palette.gold }} />
                <span>{timeLabel}</span>
              </>
            )}
          </div>
          <div className="flex items-start justify-center gap-2 text-center">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0" style={{ color: palette.gold }} />
            <span className="leading-snug">{venue || 'Add your venue name'}</span>
          </div>
          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mx-auto mt-0.5 inline-flex items-center gap-1 text-xs font-medium underline underline-offset-2"
              style={{ color: palette.rose }}
            >
              View on Map
            </a>
          )}
        </div>

        {message && (
          <p
            className="mt-2 max-w-sm text-sm italic leading-relaxed"
            style={{ color: palette.inkSoft }}
          >
            &ldquo;{message}&rdquo;
          </p>
        )}

        <div className="mt-4 flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em]" style={{ color: palette.inkSoft }}>
          <Sparkles className="h-3 w-3" style={{ color: palette.gold }} />
          Made with InviteMyPeople
        </div>
      </div>
    </motion.div>
  )
}
