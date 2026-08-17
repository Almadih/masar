import type { Locale } from '@/locales/translations';

/**
 * Formats a number with locale-appropriate numerals and grouping.
 * Arabic uses 'ar-SD' standard Eastern Arabic numerals or formatted digits.
 * English uses standard 'en-US' Western numerals.
 */
export function formatNumber(value: number, locale: Locale): string {
  if (value === undefined || value === null || isNaN(value)) {
    return '0';
  }
  return locale === 'ar' ? value.toLocaleString('ar-SD') : value.toLocaleString('en-US');
}

/**
 * Returns a directional route arrow consistent with text direction.
 * In Arabic (RTL), movement from Start to Destination points left: '⟵'
 * In English (LTR), movement from Start to Destination points right: '➔'
 */
export function formatRouteArrow(locale: Locale): string {
  return locale === 'ar' ? '⟵' : '➔';
}

export const getDirectionArrow = formatRouteArrow;

/**
 * Formats a distance value with its unit label (e.g. "450 كم" / "450 km").
 * Supports passing string label or t translation function.
 */
export function formatDistance(
  km: number,
  locale: Locale,
  labelOrT?: string | ((path: string) => string)
): string {
  const formattedNum = formatNumber(km, locale);
  let label = locale === 'ar' ? 'كم' : 'km';
  if (typeof labelOrT === 'function') {
    label = labelOrT('common.km');
  } else if (typeof labelOrT === 'string') {
    label = labelOrT;
  }
  return `${formattedNum} ${label}`;
}

/**
 * Formats a photo count with its label (e.g. "12 صورة" / "12 photos").
 * Supports passing string label or t translation function.
 */
export function formatPhotosCount(
  count: number,
  locale: Locale,
  labelOrT?: string | ((path: string) => string)
): string {
  const formattedNum = formatNumber(count, locale);
  let label = locale === 'ar' ? 'صورة' : 'photos';
  if (typeof labelOrT === 'function') {
    label = labelOrT('common.photos');
  } else if (typeof labelOrT === 'string') {
    label = labelOrT;
  }
  return `${formattedNum} ${label}`;
}
