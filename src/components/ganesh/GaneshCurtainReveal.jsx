import { useState } from 'react'
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion'
import GaneshIdolPhoto from '../GaneshIdolPhoto'
import Celebration from '../Celebration'

// The "digital curtain opening" interaction — two sacred red-and-gold
// curtains part on tap to reveal Bappa's idol and the host's greeting.
// Shared by every Ganesh Chaturthi template's hero (see MarigoldMandapExperience
// and LegacyGaneshExperience) so the reveal behaves identically while each
// template's palette re-skins it. Modeled on BlessingEnvelope.jsx's
// stage/timing pattern, but curtains parting horizontally instead of an
// envelope flap opening.
export default function GaneshCurtainReveal({ palette, greeting, host, onOpen }) {
  const [stage, setStage] = useState('closed') // closed | opening | open
  const [burst, setBurst] = useState(null)
  const reduceMotion = useReducedMotion()

  const gold = palette?.gold ?? '#d9932e'
  const rose = palette?.rose ?? '#c2410c'

  const handleTap = () => {
    if (stage !== 'closed') return
    setStage('opening')
    const openDelay = reduceMotion ? 100 : 900
    const burstDelay = reduceMotion ? 200 : 1200
    setTimeout(() => {
      setStage('open')
      onOpen?.()
    }, openDelay)
    setTimeout(() => setBurst({ id: Date.now() }), burstDelay)
  }

  return (
    <div className="relative flex flex-col items-center px-6 pt-16 pb-6 text-center overflow-hidden">
      <div className="relative w-full max-w-xs" style={{ minHeight: 280 }}>
        {/* Revealed content sits behind the curtains */}
        <div className="flex flex-col items-center pt-4">
          <GaneshIdolPhoto size={132} palette={palette} className="mb-4" />

          {greeting?.symbol && (
            <p className="text-2xl mb-1" style={{ color: gold }}>
              {greeting.symbol}
            </p>
          )}
          <p className="text-xs tracking-[0.3em] uppercase text-ink-soft mb-3">
            {greeting?.line ?? 'Ganpati Bappa Morya'}
          </p>
          <h1 className="font-script text-4xl sm:text-5xl leading-tight mb-4" style={{ color: rose }}>
            {host?.familyName}
          </h1>
          <p className="max-w-xs text-sm sm:text-base text-ink-soft leading-relaxed">
            {host?.hostLine}
          </p>
        </div>

        {/* Curtain panels */}
        <button
          type="button"
          onClick={handleTap}
          disabled={stage !== 'closed'}
          aria-label="Tap to open the curtains for Bappa's darshan"
          className="absolute inset-0"
          style={{ pointerEvents: stage === 'closed' ? 'auto' : 'none' }}
        >
          <motion.div
            className="absolute inset-y-0 left-0 w-1/2 shadow-[6px_0_18px_-6px_rgba(0,0,0,0.35)]"
            style={{
              background: `linear-gradient(90deg, ${rose} 0%, ${gold} 130%)`,
              transformOrigin: 'left center',
            }}
            animate={stage === 'closed' ? { x: '0%' } : { x: '-102%' }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            <span
              className="absolute right-2 top-0 h-full w-1"
              style={{ background: `${gold}bb` }}
            />
          </motion.div>
          <motion.div
            className="absolute inset-y-0 right-0 w-1/2 shadow-[-6px_0_18px_-6px_rgba(0,0,0,0.35)]"
            style={{
              background: `linear-gradient(270deg, ${rose} 0%, ${gold} 130%)`,
              transformOrigin: 'right center',
            }}
            animate={stage === 'closed' ? { x: '0%' } : { x: '102%' }}
            transition={{ duration: 0.9, ease: [0.65, 0, 0.35, 1] }}
          >
            <span
              className="absolute left-2 top-0 h-full w-1"
              style={{ background: `${gold}bb` }}
            />
          </motion.div>

          {stage === 'closed' && (
            <motion.p
              className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs tracking-[0.25em] uppercase text-ivory whitespace-nowrap"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              Tap for Darshan
            </motion.p>
          )}
        </button>
      </div>

      <AnimatePresence>
        {burst && (
          <Celebration
            key={burst.id}
            intensity={1.3}
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
    </div>
  )
}
