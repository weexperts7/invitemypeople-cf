/**
 * ShukranaDarshanTemplate — public type contract. ShukranaDarshanAdapter.jsx
 * maps the site's shared Satsang template shape onto `ShukranaData`.
 */

export interface ProgrammeItem {
  title: string
  /** Display time, e.g. "6:00 PM". Empty when the host hasn't set one. */
  time: string
}

export interface ShukranaWish {
  name: string
  message: string
  timestamp?: string
}

export interface ShukranaData {
  familyName: string
  hostLine: string
  greetingSymbol: string
  greetingLine: string
  gurujiPhoto: string
  dateLine: string
  timeLine: string
  venue: string
  /** Falls back to a Google Maps search on `venue`. */
  mapUrl?: string
  /** Local timestamp the countdown and calendar link use. */
  startISO: string
  programme: ProgrammeItem[]
  langarTime: string
  langarNote: string
  photos: string[]
  musicUrl: string
  /** Only set on a real invite. RSVPs and jaap save against it. */
  invitationSlug?: string
  shareUrl: string
  /** Set on an invite-only satsang, which also drops every prompt to share it. */
  privateNote: string
  /** Sample content for the catalog page and builder preview. */
  demo?: { jaapCount: number; wishes: ShukranaWish[] }
}
