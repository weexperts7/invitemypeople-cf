// A small modak (offering sweet) glyph, drawn in the same stroke style as
// the lucide-react icon set so it drops into slots like <Icon className="…" />.
// Used for the Ganesh Chaturthi nav link and as GaneshIdolPhoto's fallback.
export function GaneshIcon({ className = '', strokeWidth = 1.8, ...props }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...props}
    >
      <path d="M12 3c3.5 1.4 5.5 4 5.5 7.4 0 4.4-2.6 7.2-5.5 8.6-2.9-1.4-5.5-4.2-5.5-8.6C6.5 7 8.5 4.4 12 3Z" />
      <path d="M12 3V1.4" />
      <path d="M9 9.5c1-1 2-1.4 3-1.4s2 .4 3 1.4" />
    </svg>
  )
}
