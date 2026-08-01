// Longer couple names (e.g. "Gurpreet & Simran", "Alexander & Isabella")
// wrap onto a second line at the same fixed font size that fits shorter
// ones (e.g. "Aarav & Diya") comfortably. Buckets the name into a size
// tier by length so each display site can pick its own font-size classes
// per tier while sharing the same length thresholds.
export function coupleNameTier(name) {
  const len = name?.length ?? 0
  if (len <= 12) return 0
  if (len <= 16) return 1
  if (len <= 20) return 2
  return 3
}
