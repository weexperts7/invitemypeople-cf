import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { DurbarNiche } from '../ganeshMotifs'
import GaneshIdolPhoto from '../../GaneshIdolPhoto'

// The full-bleed photographic hero that opens Royal Durbar Darshan — a real
// festival photograph (template.heroPhoto.src, e.g.
// public/images/ganesh/royal-durbar/hero.jpg) stands in for the flat palette
// backdrop every other Ganesh template opens with. Falls back to a rich
// gradient wash (same onError convention as GaneshIdolPhoto) if that file
// hasn't been dropped in yet, so the template still looks intentional with
// no photo assets at all.
export default function DurbarPhotoHero({ template }) {
  const [errored, setErrored] = useState(false)
  const { palette, greeting, host, event, heroPhoto } = template
  const gold = palette?.gold ?? '#b8892c'
  const rose = palette?.rose ?? '#7a1230'
  const showPhoto = heroPhoto?.src && !errored

  return (
    <section className="relative isolate flex min-h-[68svh] flex-col items-center justify-end overflow-hidden px-6 pb-10 pt-16 text-center">
      <div className="absolute inset-0 -z-20">
        {showPhoto && (
          <img
            src={heroPhoto.src}
            alt={heroPhoto.alt ?? ''}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        )}
        {!showPhoto && (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(circle at 50% 18%, ${palette?.champagneDeep ?? '#cf9f42'}66, transparent 60%), linear-gradient(165deg, ${rose} 0%, ${palette?.ink ?? '#241009'} 100%)`,
            }}
          />
        )}
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,4,2,0.45) 0%, rgba(10,4,2,0.15) 32%, rgba(10,4,2,0.7) 100%)',
        }}
      />

      <DurbarNiche gold={gold} accent={rose}>
        <GaneshIdolPhoto size={116} palette={palette} />
      </DurbarNiche>

      {greeting?.symbol && (
        <p className="text-2xl text-ivory mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          {greeting.symbol}
        </p>
      )}
      <p className="text-xs tracking-[0.35em] uppercase text-ivory/90 mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
        {greeting?.line ?? 'Ganpati Bappa Morya'}
      </p>
      <p className="font-serif text-4xl sm:text-5xl leading-tight mb-4 text-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
        {host?.familyName}
      </p>
      <p className="max-w-sm text-sm sm:text-base text-ivory/90 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
        {host?.hostLine}
      </p>

      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: [0, 6, 0] }}
        transition={{
          opacity: { duration: 0.6, delay: 0.6 },
          y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
        }}
        className="mt-8 flex flex-col items-center gap-1 text-champagne/80"
      >
        <span className="text-[10px] uppercase tracking-[0.25em]">{event?.sthapanaDate}</span>
        <ChevronDown className="w-4 h-4" strokeWidth={1.6} />
      </motion.div>
    </section>
  )
}
