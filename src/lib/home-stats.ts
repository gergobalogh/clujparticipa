/**
 * Pure functions for homepage statistics display.
 *
 * These functions transform raw API data into display-ready values
 * without side effects. They serve as the domain logic layer between
 * the /api/stats response and the LocaleHomePage component.
 */

/**
 * Extract the count of ideas with COMPLETED status from statusCounts.
 * Returns 0 if the COMPLETED key is absent or has a falsy value.
 * This function is intentionally defensive: the /api/stats endpoint
 * may return statusCounts without a COMPLETED entry if no ideas
 * have reached that status.
 */
export const computeCompletedCount = (
  statusCounts: Record<string, number>
): number => {
  return statusCounts.COMPLETED ?? 0;
};

/**
 * Determine which zero-state locale key to use based on total ideas.
 *
 * When no ideas exist at all (totalIdeas === 0), we show a welcoming
 * message encouraging the very first submission. When ideas exist
 * but the recent list is empty (e.g. filtered to a district with
 * no ideas), we show the generic "no ideas" message.
 *
 * The returned string is a key into the Home namespace of locale files.
 */
export const resolveZeroState = (
  totalIdeas: number
): "noIdeasAtAll" | "noIdeas" => {
  return totalIdeas === 0 ? "noIdeasAtAll" : "noIdeas";
};
