import { useEffect, useState } from 'react'

// What every full Satsang template needs from its date: a countdown and a
// calendar link. Shared by ShukranaDarshanTemplate and GulabMargTemplate.
export const pad = (n: number) => String(n).padStart(2, '0')

export function parseDate(iso: string) {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? null : d
}

/** Google Calendar link; an unset time becomes an all-day entry. */
export function calendarLink(
  data: { familyName: string; timeLine: string; venue: string },
  start: Date,
) {
  const day = (d: Date) => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}`
  const stamp = (d: Date) => `${day(d)}T${pad(d.getHours())}${pad(d.getMinutes())}00`
  const dates = data.timeLine
    ? `${stamp(start)}/${stamp(new Date(start.getTime() + 3 * 3_600_000))}`
    : `${day(start)}/${day(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 1))}`
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: `Guruji Satsang — ${data.familyName}`,
    dates,
    ctz: 'Asia/Kolkata',
    location: data.venue,
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function useCountdown(target: Date | null) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [target])
  if (!target) return null
  const diff = Math.max(0, target.getTime() - now)
  return {
    done: diff === 0,
    units: [
      { label: 'Days', value: Math.floor(diff / 86_400_000) },
      { label: 'Hours', value: Math.floor(diff / 3_600_000) % 24 },
      { label: 'Minutes', value: Math.floor(diff / 60_000) % 60 },
    ],
  }
}
