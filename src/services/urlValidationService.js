// urlValidationService.js
// Service for validating URLs and handling URL expiration
// Follows Clean Architecture: screens call these functions for all URL validation

/**
 * Check if a URL is likely expired based on common patterns
 * @param {string} url - The URL to check
 * @returns {boolean} True if the URL appears to be expired or invalid
 */
export function isUrlLikelyExpired(url) {
  if (!url) return true;
  
  try {
    // Parse the URL to extract query parameters
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    
    // Check for expiration timestamp parameters (common in cloud storage URLs)
    // Format: se=2025-05-05T23%3A09%3A26Z (expiration time)
    const expirationTime = params.get('se');
    if (expirationTime) {
      // Parse the expiration time
      // URL decode the timestamp first (replace %3A with :)
      const decodedTime = decodeURIComponent(expirationTime);
      const expirationDate = new Date(decodedTime);
      const now = new Date();
      
      // If expiration date is in the past, URL is expired
      return expirationDate < now;
    }
    
    // For OpenAI DALL-E URLs specifically
    if (url.includes('oaidalleapiprodscus.blob.core.windows.net')) {
      // These URLs always have expiration params, but as a fallback
      // check if the URL contains a signature (sig parameter)
      const signature = params.get('sig');
      if (!signature) return true;
      
      // If we can't determine expiration but it's an OpenAI URL,
      // check if it's older than 2 hours (typical expiration)
      // This is a rough heuristic and not 100% reliable
      if (url.includes('st=')) {
        const startTime = params.get('st');
        if (startTime) {
          const decodedStartTime = decodeURIComponent(startTime);
          const startDate = new Date(decodedStartTime);
          const now = new Date();
          
          // If the URL was generated more than 2 hours ago, it's likely expired
          const twoHoursInMs = 2 * 60 * 60 * 1000;
          return (now - startDate) > twoHoursInMs;
        }
      }
    }
    
    // If we can't determine expiration, assume it's valid
    return false;
  } catch (error) {
    console.warn('[urlValidationService] Error checking URL expiration:', error);
    // If we can't parse the URL, it's likely invalid
    return true;
  }
}

/**
 * Validate an image URL and return a status object
 * @param {string} imageUrl - The image URL to validate
 * @returns {Object} Status object with properties: valid, expired, message
 */
export function validateImageUrl(imageUrl) {
  if (!imageUrl) {
    return { valid: false, expired: false, message: 'No image URL provided' };
  }
  
  const expired = isUrlLikelyExpired(imageUrl);
  
  if (expired) {
    return { valid: false, expired: true, message: 'Image URL has expired' };
  }
  
  return { valid: true, expired: false, message: 'URL appears valid' };
}
