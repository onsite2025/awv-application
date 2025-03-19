/**
 * Format a date into a readable string
 * @param date The date to format
 * @returns Formatted date string (MM/DD/YYYY)
 */
export function formatDate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return 'Invalid Date';
  }
  
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${month}/${day}/${year}`;
}

/**
 * Get a date object from various formats
 * @param date Date string, timestamp, or Date object
 * @returns A Date object or null if invalid
 */
export function parseDate(date: string | number | Date): Date | null {
  if (!date) return null;
  
  if (date instanceof Date) {
    return isNaN(date.getTime()) ? null : date;
  }
  
  try {
    const parsedDate = new Date(date);
    return isNaN(parsedDate.getTime()) ? null : parsedDate;
  } catch (e) {
    return null;
  }
}

/**
 * Format a date to ISO string without the time component
 * @param date The date to format
 * @returns ISO date string (YYYY-MM-DD)
 */
export function formatISODate(date: Date): string {
  if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
    return '';
  }
  
  return date.toISOString().split('T')[0];
} 