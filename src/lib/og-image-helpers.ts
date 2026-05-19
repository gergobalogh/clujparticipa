/** Pure helper functions for OG image generation. */

const MAX_OG_TITLE_LENGTH = 80;

/** Truncate title to MAX_OG_TITLE_LENGTH chars with ellipsis for ImageResponse.
 *  Ensures title fits within 2 visual lines at the OG image font size.
 */
export const truncateOgTitle = (title: string): string => {
  if (title.length <= MAX_OG_TITLE_LENGTH) return title;
  return title.slice(0, MAX_OG_TITLE_LENGTH) + "...";
};
