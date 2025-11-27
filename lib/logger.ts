/**
 * Lightweight logger utility for frontend logging.
 *
 * Automatically filters debug/info logs in production while keeping
 * warnings and errors visible for debugging production issues.
 *
 * Usage:
 * ```typescript
 * import { logger } from '@/lib/logger';
 *
 * logger.debug('Detailed debugging info', { data });
 * logger.info('General information');
 * logger.warn('Warning message');
 * logger.error('Error occurred', error);
 * ```
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  /**
   * Debug-level logging (only in development).
   * Use for detailed debugging information that's not needed in production.
   */
  debug: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.debug('[DEBUG]', ...args);
    }
  },

  /**
   * Info-level logging (only in development).
   * Use for general informational messages about application state.
   */
  info: (...args: unknown[]): void => {
    if (isDevelopment) {
      console.info('[INFO]', ...args);
    }
  },

  /**
   * Warning-level logging (always shown).
   * Use for potentially problematic situations that should be investigated.
   */
  warn: (...args: unknown[]): void => {
    console.warn('[WARN]', ...args);
  },

  /**
   * Error-level logging (always shown).
   * Use for error conditions that need immediate attention.
   */
  error: (...args: unknown[]): void => {
    console.error('[ERROR]', ...args);
  },
};
