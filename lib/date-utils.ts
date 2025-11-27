/**
 * Date and time formatting utilities
 *
 * Centralized date/time formatting functions to ensure consistency across
 * the application and avoid duplication.
 */

/**
 * Format date string to readable format (e.g., "Jan 15, 2024")
 *
 * Handles date-only strings (YYYY-MM-DD) without timezone conversion
 * to avoid off-by-one day errors.
 *
 * @param dateStr - ISO date string or date-only string (YYYY-MM-DD)
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";

  // For date-only strings (YYYY-MM-DD), parse components directly
  // to avoid timezone conversion issues
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year = '', month = '', day = ''] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  // Fallback for other date formats
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format date string to long readable format (e.g., "January 15, 2024")
 *
 * @param dateStr - ISO date string or date-only string (YYYY-MM-DD)
 * @returns Formatted date string or "N/A" if invalid
 */
export function formatDateLong(dateStr: string | null | undefined): string {
  if (!dateStr) return "N/A";

  // For date-only strings (YYYY-MM-DD), parse components directly
  const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (match) {
    const [, year = '', month = '', day = ''] = match;
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }

  // Fallback for other date formats
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Format time to 12-hour format (e.g., "2:30 PM")
 *
 * @param dateStr - ISO datetime string
 * @returns Formatted time string
 */
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

/**
 * Format appointment datetime to readable format (e.g., "Jan 15, 2024 at 2:30 PM")
 *
 * @param dateStr - ISO datetime string
 * @returns Formatted datetime string
 */
export function formatAppointmentDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateFormatted} at ${timeFormatted}`;
}

/**
 * Format datetime to readable format with long month (e.g., "January 15, 2024 at 2:30 PM")
 *
 * @param dateStr - ISO datetime string
 * @returns Formatted datetime string
 */
export function formatDateTimeLong(dateStr: string): string {
  const date = new Date(dateStr);
  const dateFormatted = date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timeFormatted = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
  return `${dateFormatted} at ${timeFormatted}`;
}

/**
 * Calculate age from date of birth
 *
 * @param dateStr - Date of birth string (YYYY-MM-DD format)
 * @returns Age in years or null if invalid
 */
export function calculateAge(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null;

  // Parse date-only string (YYYY-MM-DD)
  const datePart = dateStr.split('T')[0];
  if (!datePart) return null;

  const parts = datePart.split('-').map(Number);
  if (parts.length !== 3 || parts.some(isNaN)) return null;

  const [year, month, day] = parts;
  const birthDate = new Date(year!, month! - 1, day!);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }

  return age;
}

/**
 * Get initials from first and last name
 *
 * @param firstName - First name
 * @param lastName - Last name
 * @returns Initials (e.g., "JD" for "John Doe")
 */
export function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}
