export const IMAGE_MAX_COUNT = 5;
export const IMAGE_MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
export const IMAGE_ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;
export const IMAGE_ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'] as const;

/** Alt text is auto-generated from idea title for MVP; no user-entered alt field. */
export const IMAGE_UPLOAD_DIR = 'uploads/ideas';

export function isAllowedMimeType(mime: string): boolean {
  return (IMAGE_ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}
