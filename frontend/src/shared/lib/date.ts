import { format as formatDateFns, parse, isValid } from 'date-fns'

/**
 * Format date to readable string
 */
export function formatDate(date: Date | string, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  }).format(dateObj)
}

/**
 * Format date to YYYY.MM.DD format
 */
export function formatDateDot(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDateFns(dateObj, 'MM.dd.yyyy')
}

/**
 * Format date to MM/DD/YYYY format
 */
export function formatDateSlash(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDateFns(dateObj, 'MM/dd/yyyy')
}

/**
 * Format date and time
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000)

  if (diffInSeconds < 60) return 'just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return formatDate(dateObj)
}

/**
 * Convert date string from various formats to ISO format (YYYY-MM-DD)
 * Supports: M/D/YYYY, MM/DD/YYYY, MMDDYYYY, and already ISO formatted dates
 * Returns empty string if conversion fails
 */
export function convertToISODate(value: string): string {
  if (!value || value.trim() === "") return ""
  const trimmed = value.trim()

  // If already in ISO format (YYYY-MM-DD), validate and return as-is
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const parsed = parse(trimmed, 'yyyy-MM-dd', new Date())
    return isValid(parsed) ? trimmed : ""
  }

  // Try parsing M/D/YYYY or MM/DD/YYYY format
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slashMatch) {
    const parsed = parse(trimmed, 'M/d/yyyy', new Date())
    if (isValid(parsed)) {
      return formatDateFns(parsed, 'yyyy-MM-dd')
    }
  }

  // Try parsing MMDDYYYY format
  const numericMatch = trimmed.match(/^(\d{2})(\d{2})(\d{4})$/)
  if (numericMatch) {
    const parsed = parse(trimmed, 'MMddyyyy', new Date())
    if (isValid(parsed)) {
      return formatDateFns(parsed, 'yyyy-MM-dd')
    }
  }

  return ""
}

