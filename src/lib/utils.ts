/**
 * Utility functions for formatting and normalizing URLs, strings, and styles.
 */

/**
 * Ensures an external URL has a protocol (http:// or https://)
 * so that clicking <a href="..." target="_blank"> does not open
 * as a relative route on the current host.
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (!trimmed || trimmed === '#' || trimmed === '/') return '';
  
  // Already has protocol or is a special scheme
  if (/^(https?:|mailto:|tel:|sms:|\/\/)/i.test(trimmed)) {
    return trimmed;
  }
  
  // Otherwise default to https://
  return `https://${trimmed}`;
}
