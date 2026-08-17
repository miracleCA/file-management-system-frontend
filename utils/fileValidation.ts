export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const ALLOWED_FILE_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/gif', 'image/webp'];

export function validateFile(file: File): string | null {
  if (file.size > MAX_FILE_SIZE) {
    return `${file.name} is larger than the 10 MB limit.`;
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return `${file.name} is not supported. Only PDF, JPEG, PNG, GIF and WebP files are allowed.`;
  }

  return null;
}
