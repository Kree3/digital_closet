// errorHandlingService.js
// Service for consistent error logging and handling across the application

/**
 * Log an error with consistent formatting and context
 * @param {string} context - The context/module where the error occurred (e.g. '[galleryService]')
 * @param {string} operation - The operation that failed (e.g. 'addArticles error')
 * @param {Error|any} error - The error object or error message
 */
export function logError(context, operation, error) {
  const errorMessage = error instanceof Error ? error.message : String(error);
  const fullMessage = `${context} ${operation}: ${errorMessage}`;
  
  console.error(fullMessage);
  
  // In the future, this could be extended to:
  // - Send errors to crash reporting services (Sentry, Bugsnag, etc.)
  // - Log to analytics platforms
  // - Store errors locally for debugging
  // - Filter sensitive information
}

/**
 * Log a warning with consistent formatting
 * @param {string} context - The context/module where the warning occurred
 * @param {string} message - The warning message
 */
export function logWarning(context, message) {
  console.warn(`${context} ${message}`);
}

/**
 * Log info with consistent formatting
 * @param {string} context - The context/module 
 * @param {string} message - The info message
 */
export function logInfo(context, message) {
  console.log(`${context} ${message}`);
}