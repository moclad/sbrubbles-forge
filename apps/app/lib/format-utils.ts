/**
 * Shared formatting and utility functions for the application
 */

/**
 * Maximum number of avatars to show in an avatar group before showing overflow count
 */
export const MAX_VISIBLE_AVATARS = 5;

/**
 * Get initials from a person's name
 * @param name - The person's full name
 * @returns The initials (up to 2 characters)
 * @example
 * getInitials("John Doe") // "JD"
 * getInitials("Alice") // "AL"
 * getInitials("") // ""
 */
export function getInitials(name: string): string {
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) {
    return '';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return parts
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

/**
 * Format a date range with localized formatting
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Formatted date range string
 * @example
 * formatDateRange(new Date(2024, 0, 1), new Date(2024, 0, 5)) // "01 Jan 2024 - 05 Jan 2024"
 */
export function formatDateRange(startDate: Date, endDate: Date): string {
  const formatter = new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

/**
 * Format a single date with localized formatting
 * @param date - The date to format
 * @returns Formatted date string
 * @example
 * formatDate(new Date(2024, 0, 1)) // "01 Jan 2024"
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Get the start of day (midnight) for a given date
 * @param date - The date to get start of day for
 * @returns A new Date object set to midnight
 */
export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

/**
 * Check if two dates are on the same calendar day
 * @param left - First date to compare
 * @param right - Second date to compare
 * @returns True if both dates are on the same day
 */
export function isSameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

/**
 * Subtract one day from a date
 * @param date - The date to subtract from
 * @returns A new Date object with one day subtracted
 */
export function subtractDays(date: Date, days = 1): Date {
  const result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

/**
 * Calculate the number of days between two dates (inclusive)
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns The number of days between the dates (minimum 1)
 */
export function getDaysBetween(startDate: Date, endDate: Date): number {
  const start = startOfDay(startDate).getTime();
  const end = startOfDay(endDate).getTime();
  const dayInMs = 1000 * 60 * 60 * 24;
  return Math.max(1, Math.floor((end - start) / dayInMs) + 1);
}
