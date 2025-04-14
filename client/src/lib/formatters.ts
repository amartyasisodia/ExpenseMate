/**
 * Formats a number as currency
 * @param amount - The amount to format
 * @param currencyCode - The currency code (default: USD)
 * @returns Formatted currency string
 */
export function formatCurrency(amount: number, currencyCode = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

/**
 * Formats a percentage value
 * @param value - The percentage value (0-100)
 * @returns Formatted percentage string
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Formats a date to a standardized string
 * @param date - The date to format
 * @param format - The format style ('short', 'medium', 'long')
 * @returns Formatted date string
 */
export function formatDate(date: Date | string, format: 'short' | 'medium' | 'long' = 'medium'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'numeric' : format === 'medium' ? 'short' : 'long',
    day: 'numeric'
  };
  
  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
}

/**
 * Formats a date range
 * @param startDate - The start date
 * @param endDate - The end date
 * @returns Formatted date range string
 */
export function formatDateRange(startDate: Date | string, endDate: Date | string): string {
  const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
  const end = typeof endDate === 'string' ? new Date(endDate) : endDate;
  
  return `${start.getDate().toString().padStart(2, '0')}.${(start.getMonth() + 1).toString().padStart(2, '0')} - ${end.getDate().toString().padStart(2, '0')}.${(end.getMonth() + 1).toString().padStart(2, '0')}`;
}

/**
 * Formats a number with thousands separators
 * @param value - The number to format
 * @returns Formatted number string
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value);
}
