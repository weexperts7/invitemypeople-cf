import './RangMahalTemplate.css'
import { Kalash, Latkan, Toran } from './components/Motifs'

interface RangMahalPosterProps {
  template: {
    couple?: { names?: string }
    weddingDate?: string
  }
}

function Door({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`rmt-door rmt-door--${side}`} style={{ transform: `rotateY(${side === 'left' ? -68 : 68}deg)` }}>
      <div className="rmt-door-face">
        <div className="rmt-door-print">
          <div className="rmt-cover">
            <div className="rmt-cover-frame" />
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Catalog-card poster: the gatefold caught mid-swing over the blessing, built
 * from the template's real styles and motifs (see posterRegistry.js) so the
 * card shows both the paper cover and the marigold interior.
 */
export default function RangMahalPoster({ template }: RangMahalPosterProps) {
  const date = template.weddingDate ? new Date(template.weddingDate) : null

  return (
    <div className="rmt-root rmt-poster">
      <div className="rmt-stage">
        <div className="rmt-blessing">
          <div className="rmt-toran">
            <Toran />
          </div>
          <div className="rmt-jharokha">
            <Kalash className="rmt-kalash" />
            <p className="rmt-poster-names">{template.couple?.names}</p>
            {date && (
              <p className="rmt-poster-date">
                {date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
        </div>
        <div className="rmt-fold">
          <Door side="left" />
          <Door side="right" />
        </div>
        <div className="rmt-latkan">
          <Latkan className="rmt-latkan-art" />
        </div>
      </div>
    </div>
  )
}
