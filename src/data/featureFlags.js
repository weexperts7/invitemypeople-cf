// Small on/off switches for UI that's only worth showing once there's
// enough content behind it — not real feature flags (no remote config, no
// per-user targeting), just named constants so the "why is this hidden"
// reasoning lives in one place instead of being silently commented out at
// each call site.

// The wedding template search bar + tradition filter chips (LandingPage.jsx's
// "Choose Your Style" section and the dedicated WeddingsPage.jsx gallery).
// Both browse the same handful of templates today, so search/filtering
// mostly just proves there's not much to search — re-enable once the
// catalog is big enough that narrowing it down is actually useful.
export const SHOW_WEDDING_TEMPLATE_FILTERS = false
