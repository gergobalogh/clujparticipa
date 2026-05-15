/** Category-to-Tailwind color mappings shared across idea components. */

/** Full color mapping (background + text) used in card view. */
export const categoryCardColors: Record<string, string> = {
  INFRASTRUCTURE: "bg-civic-orange-light text-civic-orange",
  EDUCATION: "bg-civic-blue-light text-civic-blue",
  ENVIRONMENT: "bg-civic-teal-light text-civic-teal",
  CULTURE: "bg-purple-50 text-purple-700",
  SAFETY: "bg-red-50 text-red-700",
  TRANSPORT: "bg-cyan-50 text-cyan-700",
  HEALTH: "bg-pink-50 text-pink-700",
  OTHER: "bg-paper-muted text-ink-muted",
};

/** Text-only color mapping used in list rows. */
export const categoryListColors: Record<string, string> = {
  INFRASTRUCTURE: "text-civic-orange",
  EDUCATION: "text-civic-blue",
  ENVIRONMENT: "text-civic-teal",
  CULTURE: "text-purple-700",
  SAFETY: "text-red-700",
  TRANSPORT: "text-cyan-700",
  HEALTH: "text-pink-700",
  OTHER: "text-ink-muted",
};

/** Resolve a category to its card color class, falling back to OTHER. */
export function resolveCategoryCardColor(category: string): string {
  return categoryCardColors[category] ?? categoryCardColors.OTHER;
}

/** Resolve a category to its list color class, falling back to OTHER. */
export function resolveCategoryListColor(category: string): string {
  return categoryListColors[category] ?? categoryListColors.OTHER;
}
