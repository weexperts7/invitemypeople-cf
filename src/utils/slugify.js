// Turns "Meenal & Avinash" into "meenal-avinash" — a stable, URL- and
// Google-Sheet-tab-safe identifier for a couple's invitation, derived
// straight from their names so nothing extra needs configuring per template.
export function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/&/g, ' ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}
