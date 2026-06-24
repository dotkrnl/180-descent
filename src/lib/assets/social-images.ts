import type { Locale } from "@lib/schemas/day";

const SOCIAL_IMAGE_PATH_PREFIX = "/assets/images/social";

export function bookSocialImageFile(locale: Locale): string {
  return locale === "zh" ? "180-descent-zh.png" : "180-descent.png";
}

export function daySocialImageFile(locale: Locale, dayPath: string): string {
  return locale === "zh" ? `zh-day-${dayPath}.png` : `day-${dayPath}.png`;
}

export function bookSocialImagePath(locale: Locale): string {
  return socialImagePath(bookSocialImageFile(locale));
}

export function daySocialImagePath(locale: Locale, dayPath: string): string {
  return socialImagePath(daySocialImageFile(locale, dayPath));
}

function socialImagePath(fileName: string): string {
  return `${SOCIAL_IMAGE_PATH_PREFIX}/${fileName}`;
}
