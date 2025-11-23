/**
 * Frontend security utilities for XSS prevention
 * React automatically escapes content, but these utilities provide additional safety
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * React does this automatically, but this provides explicit control when needed
 */
export function escapeHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };

  return text.replace(/[&<>"'/]/g, (char) => map[char] || char);
}

/**
 * Strip HTML tags from text (for display purposes)
 * Use this when you need to display user input as plain text
 */
export function stripHtml(text: string): string {
  if (typeof text !== 'string') {
    return '';
  }

  // Create a temporary div element to parse HTML
  const tmp = document.createElement('div');
  tmp.textContent = text;
  
  // Get text content (automatically strips HTML)
  return tmp.textContent || tmp.innerText || '';
}

/**
 * Sanitize user input before displaying
 * Combines HTML escaping and tag stripping
 */
export function sanitizeForDisplay(text: string): string {
  return escapeHtml(stripHtml(text));
}

/**
 * Validate that a string doesn't contain script tags or dangerous patterns
 */
export function containsDangerousContent(text: string): boolean {
  if (typeof text !== 'string') {
    return false;
  }

  const dangerousPatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick=, onerror=, etc.
    /<iframe/gi,
    /<object/gi,
    /<embed/gi,
    /<link/gi,
    /<meta/gi,
  ];

  return dangerousPatterns.some((pattern) => pattern.test(text));
}

