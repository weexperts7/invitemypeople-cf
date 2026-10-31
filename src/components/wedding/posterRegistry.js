import EnvelopePoster from './EnvelopePoster'
import VelvetTheatrePoster from '../templates/VelvetTheatreTemplate/VelvetTheatrePoster.tsx'
import RangMahalPoster from '../templates/RangMahalTemplate/RangMahalPoster.tsx'

// Maps a wedding template's `layout` to the catalog-card poster built from
// its own artwork. Templates without one share InvitationExperience's opening
// screen, so EnvelopePoster is their poster too. A template's `cardImage`
// wins over either (see TemplateShowcase.jsx).
const WEDDING_POSTERS = {
  'velvet-theatre': VelvetTheatrePoster,
  'rang-mahal': RangMahalPoster,
}

export function getWeddingPoster(layout) {
  return (layout && WEDDING_POSTERS[layout]) || EnvelopePoster
}
