const TWO_GIS_HOST_PATTERN = /(^|\.)2gis\.(kz|ru|com)$/i;

export function isTwoGisUrl(value: string): boolean {
  try {
    return TWO_GIS_HOST_PATTERN.test(new URL(value).hostname);
  } catch {
    return false;
  }
}
