// A hidden field bots fill in but real guests never see, used to silently
// drop spam submissions server-side. Shared by every RSVP form variant.
export default function Honeypot({ value, onChange, name = 'website' }) {
  return (
    <input
      type="text"
      name={name}
      tabIndex={-1}
      autoComplete="off"
      aria-hidden="true"
      value={value}
      onChange={onChange}
      style={{
        position: 'absolute',
        left: '-9999px',
        width: 1,
        height: 1,
        opacity: 0,
      }}
    />
  )
}
