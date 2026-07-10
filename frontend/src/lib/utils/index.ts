import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges Tailwind CSS class names, resolving conflicts correctly.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a full name from first and last name parts.
 */
export function formatFullName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`.trim()
}

/**
 * Returns initials from a full name (up to 2 characters).
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Extracts a user-facing error message from an unknown error value.
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === 'string') return error

  if (
    error !== null &&
    typeof error === 'object' &&
    'response' in error
  ) {
    const axiosError = error as {
      response?: { data?: { message?: string } }
    }
    return axiosError.response?.data?.message ?? 'An unexpected error occurred.'
  }

  if (error instanceof Error) return error.message

  return 'An unexpected error occurred.'
}

/**
 * Delays execution for a given number of milliseconds.
 * Useful in development to simulate network latency.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
