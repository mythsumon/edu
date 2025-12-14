/**
 * Format a date to a localized string
 * @param date The date to format
 * @param locale The locale to use for formatting (default: 'ko-KR')
 * @returns Formatted date string
 */
export const formatDate = (date: Date, locale: string = 'ko-KR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};

/**
 * Format a date to a short localized string
 * @param date The date to format
 * @param locale The locale to use for formatting (default: 'ko-KR')
 * @returns Formatted short date string
 */
export const formatShortDate = (date: Date, locale: string = 'ko-KR'): string => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
};

export default {
  formatDate,
  formatShortDate,
};