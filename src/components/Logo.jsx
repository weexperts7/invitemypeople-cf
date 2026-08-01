import { Heart, Mail } from 'lucide-react'

// The site's brand mark — a heart nested right where an envelope's flap
// meets (Mail's flap-V sits almost exactly at its own vertical center, so a
// centered heart lands right on it), read together as "a love letter" —
// closer to what this product actually is than either icon alone. Paired
// with the "InviteMyPeople" wordmark ("My" picked out in rose). Used in the
// Hero's first fold and the footer signature.
const SIZES = {
  sm: { badge: 'h-8 w-8', icon: 'w-4 h-4', heart: 'w-1.5 h-1.5', text: 'text-lg sm:text-xl' },
  md: { badge: 'h-9 w-9', icon: 'w-5 h-5', heart: 'w-1.5 h-1.5', text: 'text-xl sm:text-2xl' },
  lg: { badge: 'h-12 w-12', icon: 'w-6 h-6', heart: 'w-2 h-2', text: 'text-2xl sm:text-3xl' },
  xl: {
    badge: 'h-14 w-14 sm:h-16 sm:w-16',
    icon: 'w-7 h-7 sm:w-8 sm:h-8',
    heart: 'w-2.5 h-2.5 sm:w-3 sm:h-3',
    text: 'text-3xl sm:text-4xl',
  },
}

export default function Logo({ size = 'md', className = '' }) {
  const s = SIZES[size] ?? SIZES.md

  return (
    <span className={`inline-flex items-center gap-3 ${className}`}>
      <span className={`relative flex items-center justify-center rounded-2xl bg-rose text-ivory shadow-card ${s.badge}`}>
        <Mail className={s.icon} strokeWidth={1.5} />
        <Heart className={`absolute inset-0 m-auto text-ivory ${s.heart}`} fill="currentColor" strokeWidth={0} />
      </span>
      <span className={`font-serif tracking-tight text-ink ${s.text}`}>
        Invite<span className="text-rose">My</span>People
      </span>
    </span>
  )
}
