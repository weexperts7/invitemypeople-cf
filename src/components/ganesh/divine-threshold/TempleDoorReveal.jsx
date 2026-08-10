import { useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import GaneshIdolPhoto from '../../GaneshIdolPhoto'
import Celebration from '../../Celebration'

// Divine Threshold's signature move, and the "show-stopping, immersive
// photo-driven interactive entry" this whole template exists for: a real
// festival photograph (template.heroPhoto.src) fills the screen behind two
// ornate temple doors that swing open in perspective on tap — doors, not a
// curtain (GaneshCurtainReveal.jsx) or a lidded box (ModakBlessingBox.jsx),
// so this template reads distinctly even though all three share the same
// closed/opening/open stage-machine shape. Falls back to a rich gradient
// wash (same onError convention as DurbarPhotoHero.jsx/GaneshIdolPhoto.jsx)
// if heroPhoto.src isn't present yet.
//
// Fires `onOpen` the moment the doors finish parting — GaneshExperience.jsx
// listens for this to start background music only once a guest has actually
// opened the invitation, exactly like GaneshCurtainReveal/ModakBlessingBox
// do for the other templates.
export default function TempleDoorReveal({ template, onOpen }) {
  const [stage, setStage] = useState('closed') // closed | opening | open
  const [errored, setErrored] = useState(false)
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()
  const { palette, greeting, host, event, heroPhoto } = template
  const gold = palette?.gold ?? '#d4a017'
  const rose = palette?.rose ?? '#c1272d'
  const showPhoto = heroPhoto?.src && !errored

  const handleTap = () => {
    if (stage !== 'closed') return
    setStage('opening')
    const openDelay = reduceMotion ? 100 : 950
    const burstDelay = reduceMotion ? 200 : 1250
    setTimeout(() => {
      setStage('open')
      onOpen?.()
    }, openDelay)
    setTimeout(() => setBurst({ id: Date.now() }), burstDelay)
  }

  return (
    <section className="relative isolate flex min-h-[72svh] flex-col items-center justify-end overflow-hidden px-6 pb-10 pt-16 text-center">
      <div className="absolute inset-0 -z-20">
        {showPhoto ? (
          <img
            src={heroPhoto.src}
            alt={heroPhoto.alt ?? ''}
            className="h-full w-full object-cover"
            onError={() => setErrored(true)}
          />
        ) : (
          <div
            className="h-full w-full"
            style={{
              background: `radial-gradient(circle at 50% 18%, ${palette?.champagneDeep ?? '#e8720c'}77, transparent 60%), linear-gradient(165deg, ${rose} 0%, ${palette?.ink ?? '#3a1408'} 100%)`,
            }}
          />
        )}
      </div>
      <div
        className="absolute inset-0 -z-10"
        style={{
          background:
            'linear-gradient(180deg, rgba(10,4,2,0.5) 0%, rgba(10,4,2,0.18) 34%, rgba(10,4,2,0.72) 100%)',
        }}
      />

      {/* Revealed content — sits behind the doors */}
      <div className="flex flex-col items-center">
        <GaneshIdolPhoto size={124} palette={palette} className="mb-4" />

        {greeting?.symbol && (
          <p className="text-2xl text-ivory mb-1 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">{greeting.symbol}</p>
        )}
        <p className="text-xs tracking-[0.35em] uppercase text-ivory/90 mb-4 drop-shadow-[0_2px_8px_rgba(0,0,0,0.85)]">
          {greeting?.line ?? 'Ganpati Bappa Morya'}
        </p>
        <h1 className="font-script text-4xl sm:text-5xl leading-tight mb-4 text-ivory drop-shadow-[0_2px_10px_rgba(0,0,0,0.55)]">
          {host?.familyName}
        </h1>
        <p className="max-w-sm text-sm sm:text-base text-ivory/90 leading-relaxed drop-shadow-[0_1px_6px_rgba(0,0,0,0.5)]">
          {host?.hostLine}
        </p>
      </div>

      {/* Temple doors */}
      <button
        type="button"
        onClick={handleTap}
        disabled={stage !== 'closed'}
        aria-label="Tap to open the temple doors for Bappa's darshan"
        className="absolute inset-0"
        style={{ pointerEvents: stage === 'closed' ? 'auto' : 'none', perspective: 1400 }}
      >
        <motion.div
          className="absolute inset-y-0 left-0 w-1/2 border-r shadow-[10px_0_24px_-8px_rgba(0,0,0,0.5)]"
          style={{
            background: `linear-gradient(120deg, ${rose} 0%, ${palette?.champagneDeep ?? '#e8720c'} 65%, ${gold} 130%)`,
            borderColor: `${gold}aa`,
            transformOrigin: 'left center',
            transformStyle: 'preserve-3d',
          }}
          animate={stage === 'closed' ? { rotateY: '0deg' } : { rotateY: '-98deg' }}
          transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}
        >
          <span className="absolute inset-4 rounded-md border" style={{ borderColor: `${gold}90` }} />
          <span
            className="absolute right-2 top-1/2 h-10 w-2 -translate-y-1/2 rounded-full"
            style={{ background: gold }}
          />
        </motion.div>
        <motion.div
          className="absolute inset-y-0 right-0 w-1/2 border-l shadow-[-10px_0_24px_-8px_rgba(0,0,0,0.5)]"
          style={{
            background: `linear-gradient(240deg, ${rose} 0%, ${palette?.champagneDeep ?? '#e8720c'} 65%, ${gold} 130%)`,
            borderColor: `${gold}aa`,
            transformOrigin: 'right center',
            transformStyle: 'preserve-3d',
          }}
          animate={stage === 'closed' ? { rotateY: '0deg' } : { rotateY: '98deg' }}
          transition={{ duration: 0.95, ease: [0.65, 0, 0.35, 1] }}
        >
          <span className="absolute inset-4 rounded-md border" style={{ borderColor: `${gold}90` }} />
          <span
            className="absolute left-2 top-1/2 h-10 w-2 -translate-y-1/2 rounded-full"
            style={{ background: gold }}
          />
        </motion.div>

        {stage === 'closed' && (
          <motion.p
            className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] uppercase text-ivory whitespace-nowrap"
            animate={{ opacity: [0.6, 1, 0.6] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          >
            Tap to Open the Doors
          </motion.p>
        )}
      </button>

      {stage === 'open' && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: [0, 6, 0] }}
          transition={{
            opacity: { duration: 0.6, delay: 0.5 },
            y: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
          }}
          className="mt-8 flex flex-col items-center gap-1 text-champagne/80"
        >
          <span className="text-[10px] uppercase tracking-[0.25em]">{event?.sthapanaDate}</span>
          <ChevronDown className="w-4 h-4" strokeWidth={1.6} />
        </motion.div>
      )}

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={1.4}
            onComplete={() => setBurst(null)}
            colors={
              palette
                ? [palette.gold, palette.goldSoft, palette.rose, palette.champagneDeep, palette.champagne, palette.ivory].filter(
                    Boolean,
                  )
                : undefined
            }
          />
        )}
      </AnimatePresence>
    </section>
  )
}
