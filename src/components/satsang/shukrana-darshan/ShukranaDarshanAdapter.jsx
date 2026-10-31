import ShukranaDarshanTemplate from '../../templates/ShukranaDarshanTemplate/ShukranaDarshanTemplate.tsx'
import { DEFAULT_SATSANG_BHAJAN_URL, GURUJI_PHOTO_SRC } from '../../../data/satsangTemplatesData'
import { themeToCssVars } from '../../../utils/themeToCssVars'

// What the catalog page and the builder preview show until there's a real
// sangat behind them, so a visitor can see these sections working. Never used
// on a real invite: `invitationSlug` is only set there.
const DEMO = {
  jaapCount: 1287,
  wishes: [
    { name: 'Neha', message: 'Shukrana Guruji for bringing the sangat together again.' },
    { name: 'Rakesh Uncle', message: 'Blessed to be part of this satsang. Jai Guruji!' },
  ],
}

// Adapts a Satsang template (the catalog demo, or a buyer's invite merged by
// buildSatsangExperienceTemplate.js) into ShukranaDarshanTemplate's `data`.
export default function ShukranaDarshanAdapter({ template, invitationSlug }) {
  const { host, event, greeting, mahaprasad, programme } = template

  return (
    // The same phone-card shell InvitationExperience.jsx gives bespoke layouts
    // — see that file for why each of these classes is load-bearing.
    <div className="min-h-svh w-full bg-linen flex justify-center sm:py-8" style={themeToCssVars(template)}>
      <div className="no-scrollbar relative w-full max-w-md min-h-svh overflow-hidden sm:min-h-0 sm:h-[calc(100svh_-_4rem)] sm:overflow-y-auto sm:rounded-[2.5rem] sm:shadow-soft sm:border sm:border-champagne-deep/40 sm:[transform:translateZ(0)]">
    <ShukranaDarshanTemplate
      data={{
        familyName: host.familyName,
        hostLine: host.hostLine,
        greetingSymbol: greeting.symbol,
        greetingLine: greeting.line,
        gurujiPhoto: GURUJI_PHOTO_SRC,
        dateLine: event.date,
        timeLine: event.time,
        venue: event.venue,
        mapUrl: event.mapHref,
        startISO: event.startISO,
        programme,
        langarTime: mahaprasad.time,
        langarNote: mahaprasad.note,
        photos: template.photos ?? [],
        musicUrl: template.bgMusic?.previewUrl || DEFAULT_SATSANG_BHAJAN_URL,
        invitationSlug,
        shareUrl: typeof window !== 'undefined' ? window.location.href : '',
        privateNote: template.privateNote ?? '',
        demo: invitationSlug ? undefined : DEMO,
      }}
    />
      </div>
    </div>
  )
}
