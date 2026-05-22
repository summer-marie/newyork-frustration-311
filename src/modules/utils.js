/**
 * Utility Functions Module
 * 
 * Shared helper functions for data formatting and manipulation.
 * Keep these pure functions with no side effects for easy testing.
 */

/**
 * Format number with thousands separators
 * 
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., 1047 → "1,047")
 * 
 * Uses browser's Intl.NumberFormat for locale-aware formatting
 */
export function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

/**
 * Convert all-caps borough names to title case
 * 
 * @param {string} str - Borough name (e.g., "BROOKLYN", "STATEN ISLAND")
 * @returns {string} Title-cased name (e.g., "Brooklyn", "Staten Island")
 * 
 * Handles multi-word borough names correctly
 */
export function formatBorough(str) {
  if (!str) return ''  // Guard: handle null/undefined
  // Split on spaces, capitalize first letter of each word, rejoin
  return str.toLowerCase().split(' ').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join(' ')
}

/**
 * Get top N items from an array sorted by a specific key
 * 
 * @param {Array} arr - Array of objects to sort
 * @param {string} key - Object property to sort by
 * @param {number} n - Number of top items to return (default: 10)
 * @returns {Array} Top N items sorted descending by key value
 * 
 * Example: getTopN([{zip: '11220', count: 37}, ...], 'count', 5)
 * Returns the 5 ZIPs with highest counts
 */
export function getTopN(arr, key, n = 10) {
  if (!Array.isArray(arr)) return []  // Guard: validate input
  // Create copy to avoid mutating original, sort descending, take first N
  const sorted = [...arr].sort((a, b) => b[key] - a[key])
  return sorted.slice(0, n)
}

/**
 * Calculate percentage with two decimal places
 * 
 * @param {number} value - Numerator
 * @param {number} total - Denominator
 * @returns {string} Percentage as string (e.g., "23.45")
 * 
 * TODO: Currently unused - consider for future "percent of total" calculations
 */
export function calculatePercentage(value, total) {
  if (total === 0) return 0  // Avoid division by zero
  return ((value / total) * 100).toFixed(2)
}

/**
 * Sort array of objects by a numeric key
 * 
 * @param {Array} data - Array of objects to sort
 * @param {string} key - Object property to sort by
 * @param {boolean} ascending - Sort order (default: false = descending)
 * @returns {Array} New sorted array (original unchanged)
 * 
 * TODO: Currently unused - may be useful for future sorting features
 */
export function sortByValue(data, key, ascending = false) {
  if (!Array.isArray(data)) return []  // Guard: validate input
  // Create copy to avoid mutation, then sort based on direction
  const sorted = [...data].sort((a, b) => {
    if (ascending) {
      return a[key] - b[key]  // Low to high
    }
    return b[key] - a[key]  // High to low (default)
  })
  return sorted
}
