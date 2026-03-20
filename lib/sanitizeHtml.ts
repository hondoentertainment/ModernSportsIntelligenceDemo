/**
 * Sanitize HTML before use with `dangerouslySetInnerHTML` (defense in depth for XSS).
 * Uses DOMPurify with a conservative allowlist for UI snippets and syntax-highlight spans.
 */

import DOMPurify from 'dompurify';

const SANITIZE_CONFIG = {
  ALLOWED_TAGS: [
    'span',
    'b',
    'i',
    'em',
    'strong',
    'a',
    'p',
    'br',
    'div',
    'ul',
    'ol',
    'li',
    'h1',
    'h2',
    'h3',
    'h4',
    'pre',
    'code',
  ],
  ALLOWED_ATTR: ['class', 'href', 'target', 'rel'],
};

/**
 * @param dirty - Raw HTML string (e.g. template preview or highlighted JSON).
 * @returns Sanitized HTML safe for React `dangerouslySetInnerHTML`.
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof dirty !== 'string' || dirty.length === 0) {
    return '';
  }
  return DOMPurify.sanitize(dirty, { ...SANITIZE_CONFIG });
}
