const line = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export function CalendarIcon() {
  return (
    <svg className="skd-icon" viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </svg>
  )
}

export function MapPinIcon() {
  return (
    <svg className="skd-icon" viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <path d="M12 21s7-6.1 7-11.5a7 7 0 1 0-14 0C5 14.9 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </svg>
  )
}

export function LockIcon() {
  return (
    <svg className="skd-icon" viewBox="0 0 24 24" aria-hidden="true" {...line}>
      <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
      <path d="M8 10.5V7.5a4 4 0 0 1 8 0v3" />
    </svg>
  )
}

/** A langar thali: a rimmed plate with small katoris. */
export function ThaliIcon() {
  return (
    <svg className="skd-thali" viewBox="0 0 120 120" aria-hidden="true">
      <circle cx="60" cy="60" r="54" fill="#fff4dc" stroke="#b5721a" strokeWidth="3" />
      <circle cx="60" cy="60" r="45" fill="none" stroke="#e2b871" strokeWidth="1.5" strokeDasharray="2 5" strokeLinecap="round" />
      <circle cx="42" cy="44" r="13" fill="#e8912a" stroke="#b5721a" strokeWidth="2" />
      <circle cx="78" cy="44" r="13" fill="#f2c463" stroke="#b5721a" strokeWidth="2" />
      <circle cx="60" cy="78" r="14" fill="#8a1538" stroke="#5e0e26" strokeWidth="2" />
      <circle cx="56" cy="74" r="3" fill="#e9c46a" />
    </svg>
  )
}
