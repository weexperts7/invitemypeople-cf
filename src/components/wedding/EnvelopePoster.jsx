import CulturalMotif from '../CulturalMotif'
import EnvelopeLanding from '../EnvelopeLanding'
import { themeToCssVars } from '../../utils/themeToCssVars'

// Catalog-card poster for every template on the shared invitation: the
// opening screen a guest lands on, from the same EnvelopeLanding the invite
// renders, so the card always matches what the template really looks like.
export default function EnvelopePoster({ template }) {
  const { motif, palette, motifAccent, couple } = template

  return (
    <div className="relative h-full w-full bg-ivory" style={themeToCssVars(template)}>
      <CulturalMotif motif={motif} palette={palette} accent={motifAccent} />
      <EnvelopeLanding
        poster
        motif={motif}
        palette={palette}
        motifAccent={motifAccent}
        coupleNames={couple?.names}
      />
    </div>
  )
}
