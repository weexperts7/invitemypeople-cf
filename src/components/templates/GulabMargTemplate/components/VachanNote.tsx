import { useState } from 'react'

import { ROSE_VACHANS } from '../../ShukranaDarshanTemplate/vachans'
import { createBell } from '../../ShukranaDarshanTemplate/components/bell'

interface VachanNoteProps {
  familyName: string
  dateLine: string
  shareUrl: string
  /** The vachan can still be shared, just not the invite. */
  isPrivate: boolean
}

/**
 * A paper note tied to the vine, holding one of Guruji's vachans. Each guest
 * gets their own: it turns over with a bell to show the vachan, and can be
 * passed on over WhatsApp.
 */
export default function VachanNote({ familyName, dateLine, shareUrl, isPrivate }: VachanNoteProps) {
  const [turned, setTurned] = useState(false)
  const [vachan] = useState(() => ROSE_VACHANS[Math.floor(Math.random() * ROSE_VACHANS.length)])

  const turn = () => {
    navigator.vibrate?.(15)
    const bell = createBell()
    bell.resume()
    bell.ring()
    setTurned(true)
  }

  const vachanText = `Jai Guruji 🙏\n\n${vachan.text}\n(${vachan.meaning})`
  const shareText = isPrivate
    ? vachanText
    : `${vachanText}\n\n${familyName} invite you to satsang on ${dateLine}. Open the garden gate for your own vachan: ${shareUrl}`

  return (
    <>
      <p className="gm-kicker">Tied to the vine for you</p>
      <h2 className="gm-title">A Note from the Garden</h2>

      <div className={`gm-note${turned ? ' gm-note--turned' : ''}`}>
        <div className="gm-note-face gm-note-front" aria-hidden={turned}>
          <p>Every guest receives one of Guruji&rsquo;s vachans. This one is yours.</p>
          {!turned && (
            <button type="button" className="gm-btn" onClick={turn}>
              Open Guruji&rsquo;s Vachan
            </button>
          )}
        </div>
        <blockquote className="gm-note-face gm-note-back" aria-hidden={!turned}>
          <span lang="pa-Latn">{vachan.text}</span>
          <small>{vachan.meaning}</small>
        </blockquote>
      </div>

      {turned && (
        <a
          className="gm-link"
          href={`https://api.whatsapp.com/send?${new URLSearchParams({ text: shareText }).toString()}`}
          target="_blank"
          rel="noreferrer"
        >
          Share this vachan on WhatsApp
        </a>
      )}
    </>
  )
}
