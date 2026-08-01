// Maps a template's palette and typography onto the CSS custom properties
// src/index.css declares in @theme. Every Tailwind color/font utility in the
// invitation tree (bg-ivory, text-rose, border-gold-soft, font-serif, ...)
// resolves to var(--color-*) / var(--font-*), so overriding these on a
// wrapper element re-skins an entire component tree — palette, motifs, and
// heading typeface alike — without touching any child component's markup.
//
// Shared by every experience component (wedding InvitationExperience and all
// Satsang layouts, legacy and bespoke alike) so the mapping only lives once.
export function themeToCssVars(template) {
  if (!template) return undefined
  const { palette, fonts } = template
  return {
    ...(palette && {
      '--color-ivory': palette.ivory,
      '--color-linen': palette.linen,
      '--color-champagne': palette.champagne,
      '--color-champagne-deep': palette.champagneDeep,
      '--color-blush': palette.blush,
      '--color-blush-deep': palette.blushDeep,
      '--color-rose': palette.rose,
      '--color-gold': palette.gold,
      '--color-gold-soft': palette.goldSoft,
      '--color-ink': palette.ink,
      '--color-ink-soft': palette.inkSoft,
    }),
    ...(fonts?.serif && { '--font-serif': fonts.serif }),
    ...(fonts?.script && { '--font-script': fonts.script }),
  }
}
