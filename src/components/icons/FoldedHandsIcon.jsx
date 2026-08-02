// A small folded-hands (Namaste) glyph, drawn in the same stroke style as
// the lucide-react icon set so it drops into slots like <Icon className="…" />.
export function FoldedHandsIcon({ className = '', strokeWidth = 1.8, ...props }) {
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
      <path d="M12 3c-2.6 2.8-4.5 6.3-4.5 10.2 0 3 1.7 5.6 4.5 7.8 2.8-2.2 4.5-4.8 4.5-7.8C16.5 9.3 14.6 5.8 12 3Z" />
      <path d="M12 4.5V19" />
      <path d="M8.3 14.8c-1.2 1-1.7 2.3-1.3 3.9" />
      <path d="M15.7 14.8c1.2 1 1.7 2.3 1.3 3.9" />
    </svg>
  )
}
