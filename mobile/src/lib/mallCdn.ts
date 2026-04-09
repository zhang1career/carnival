import { mallCdnBaseUrl } from "@/lib/config";

/** Full image URI: CDN path when `thumbnail` is set, otherwise `imageUrl`. */
export function mallProductImageUri(thumbnail: string | undefined, imageUrl: string): string {
  const t = typeof thumbnail === "string" ? thumbnail.trim() : "";
  if (t) {
    if (/^https?:\/\//i.test(t)) {
      return t;
    }
    const base = mallCdnBaseUrl.replace(/\/$/, "");
    if (base) {
      return `${base}/${t}`;
    }
  }
  return imageUrl;
}

/** Resolves each media key like list `thumbnail` (comma-separated segments from API → array). */
export function mallProductImageUriList(keys: string[] | undefined, fallbackImageUrl: string): string[] {
  if (!keys?.length) {
    return [];
  }
  return keys.map((key) => mallProductImageUri(key, fallbackImageUrl));
}
