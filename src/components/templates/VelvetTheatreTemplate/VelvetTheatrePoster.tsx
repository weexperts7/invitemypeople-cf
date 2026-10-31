import './VelvetTheatreTemplate.css'
import TheatreStage from './components/TheatreStage'

interface VelvetTheatrePosterProps {
  template: {
    couple?: { names?: string }
    greeting?: { line?: string }
    weddingDate?: string
  }
}

/**
 * Catalog-card poster: the template's real stage with the curtains already
 * drawn back, so a browser sees the design itself (see posterRegistry.js).
 */
export default function VelvetTheatrePoster({ template }: VelvetTheatrePosterProps) {
  const [firstName = '', secondName = ''] = (template.couple?.names ?? '').split(/\s*&\s*/)
  const date = template.weddingDate ? new Date(template.weddingDate) : null

  return (
    <div className="vtt-root vtt-poster">
      <TheatreStage
        poster
        phase="open"
        onTap={() => {}}
        firstName={firstName}
        secondName={secondName}
        greetingLine={template.greeting?.line ?? ''}
        invitationLine=""
        dateLine={date ? date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
        height={null}
        reduceMotion
      />
    </div>
  )
}
