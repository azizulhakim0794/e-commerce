export function isValidImageSource(src?: string | null): src is string {
  if (!src) return false;

  const trimmed = src.trim();
  if (!trimmed) return false;

  if (trimmed.startsWith("/")) return true;
  if (trimmed.startsWith("data:")) return true;

  try {
    const url = new URL(trimmed);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}
