/**
 * Server-side input validation and sanitization utilities
 * Never trust client input - all validation must happen on the server
 */

/**
 * Strip HTML tags from input to prevent XSS attacks
 */
export function stripHtmlTags(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove HTML tags and decode HTML entities
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/')
    .replace(/&#x60;/g, '`')
    .replace(/&#x3D;/g, '=');
}

/**
 * Sanitize string input by removing potentially dangerous characters
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  // Remove null bytes and control characters (except newlines and tabs for messages)
  return input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, '').trim();
}

/**
 * Validate and sanitize name field
 * Allowed: letters, spaces, hyphens, apostrophes
 * Max length: 100 characters
 * XSS Prevention: Strips HTML tags
 */
export function validateName(name: unknown): string {
  if (typeof name !== 'string') {
    throw new Error('Name must be a string');
  }

  // Strip HTML tags first to prevent XSS
  let sanitized = stripHtmlTags(name);
  sanitized = sanitizeString(sanitized);
  
  if (sanitized.length === 0) {
    throw new Error('Name is required');
  }

  if (sanitized.length > 100) {
    throw new Error('Name must be 100 characters or less');
  }

  // Whitelist: letters (including accented), spaces, hyphens, apostrophes
  const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
  if (!namePattern.test(sanitized)) {
    throw new Error('Name can only contain letters, spaces, hyphens, and apostrophes');
  }

  return sanitized;
}

/**
 * Validate and sanitize email field
 * Max length: 254 characters (RFC 5321)
 * XSS Prevention: Strips HTML tags
 */
export function validateEmail(email: unknown): string {
  if (typeof email !== 'string') {
    throw new Error('Email must be a string');
  }

  // Strip HTML tags first to prevent XSS
  let sanitized = stripHtmlTags(email);
  sanitized = sanitizeString(sanitized.toLowerCase());
  
  if (sanitized.length === 0) {
    throw new Error('Email is required');
  }

  if (sanitized.length > 254) {
    throw new Error('Email must be 254 characters or less');
  }

  // Basic email pattern validation
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(sanitized)) {
    throw new Error('Invalid email address format');
  }

  // Additional checks for common issues
  if (sanitized.includes('..') || sanitized.startsWith('.') || sanitized.startsWith('@')) {
    throw new Error('Invalid email address format');
  }

  return sanitized;
}

/**
 * Validate and sanitize phone number
 * Allowed: digits, spaces, hyphens, parentheses, plus sign
 * Max length: 20 characters
 * XSS Prevention: Strips HTML tags
 */
export function validatePhone(phone: unknown): string {
  if (typeof phone !== 'string') {
    throw new Error('Phone must be a string');
  }

  // Strip HTML tags first to prevent XSS
  let sanitized = stripHtmlTags(phone);
  sanitized = sanitizeString(sanitized);
  
  if (sanitized.length === 0) {
    throw new Error('Phone is required');
  }

  if (sanitized.length > 20) {
    throw new Error('Phone must be 20 characters or less');
  }

  // Whitelist: digits, spaces, hyphens, parentheses, plus sign
  const phonePattern = /^[\d\s\-()+]+$/;
  if (!phonePattern.test(sanitized)) {
    throw new Error('Phone can only contain digits, spaces, hyphens, parentheses, and plus sign');
  }

  // Must contain at least some digits
  const digitCount = sanitized.replace(/\D/g, '').length;
  if (digitCount < 7) {
    throw new Error('Phone must contain at least 7 digits');
  }

  return sanitized;
}

/**
 * Validate and sanitize message/text field
 * Max length: 2000 characters
 * XSS Prevention: Strips HTML tags (messages don't need HTML)
 */
export function validateMessage(message: unknown, maxLength: number = 2000): string {
  if (typeof message !== 'string') {
    throw new Error('Message must be a string');
  }

  // Strip HTML tags first to prevent XSS
  let sanitized = stripHtmlTags(message);
  sanitized = sanitizeString(sanitized);
  
  if (sanitized.length > maxLength) {
    throw new Error(`Message must be ${maxLength} characters or less`);
  }

  return sanitized;
}

/**
 * Validate and sanitize service/language/enum fields
 * Allowed: letters, spaces, hyphens, underscores
 * Max length: 50 characters
 * XSS Prevention: Strips HTML tags
 */
export function validateEnumField(value: unknown, maxLength: number = 50): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value !== 'string') {
    throw new Error('Field must be a string');
  }

  // Strip HTML tags first to prevent XSS
  let sanitized = stripHtmlTags(value);
  sanitized = sanitizeString(sanitized);
  
  if (sanitized.length === 0) {
    return null;
  }

  if (sanitized.length > maxLength) {
    throw new Error(`Field must be ${maxLength} characters or less`);
  }

  // Whitelist: letters, numbers, spaces, hyphens, underscores
  const enumPattern = /^[a-zA-Z0-9\s\-_]+$/;
  if (!enumPattern.test(sanitized)) {
    throw new Error('Field can only contain letters, numbers, spaces, hyphens, and underscores');
  }

  return sanitized;
}

/**
 * Validate numeric ID (for route parameters)
 */
export function validateId(id: unknown): number {
  if (typeof id === 'string') {
    const parsed = parseInt(id, 10);
    if (isNaN(parsed) || parsed <= 0) {
      throw new Error('Invalid ID: must be a positive number');
    }
    return parsed;
  }

  if (typeof id === 'number') {
    if (isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      throw new Error('Invalid ID: must be a positive integer');
    }
    return id;
  }

  throw new Error('Invalid ID format');
}

/**
 * Validate pagination parameters
 */
export function validatePagination(page: unknown, limit: unknown): { page: number; limit: number; offset: number } {
  let pageNum = 1;
  let limitNum = 10;

  if (page !== undefined && page !== null) {
    if (typeof page === 'string') {
      pageNum = parseInt(page, 10);
    } else if (typeof page === 'number') {
      pageNum = page;
    }
    
    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Page must be a positive integer');
    }
  }

  if (limit !== undefined && limit !== null) {
    if (typeof limit === 'string') {
      limitNum = parseInt(limit, 10);
    } else if (typeof limit === 'number') {
      limitNum = limit;
    }
    
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new Error('Limit must be between 1 and 100');
    }
  }

  const offset = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, offset };
}

/**
 * Validate numeric field (salary, scores, etc.)
 */
export function validateNumber(value: unknown, min?: number, max?: number): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  let num: number;
  if (typeof value === 'string') {
    num = parseFloat(value);
  } else if (typeof value === 'number') {
    num = value;
  } else {
    throw new Error('Value must be a number');
  }

  if (isNaN(num)) {
    throw new Error('Invalid number format');
  }

  if (min !== undefined && num < min) {
    throw new Error(`Number must be at least ${min}`);
  }

  if (max !== undefined && num > max) {
    throw new Error(`Number must be at most ${max}`);
  }

  return num;
}

/**
 * Validate boolean field
 */
export function validateBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'true' || lower === '1' || lower === 'yes') {
      return true;
    }
    if (lower === 'false' || lower === '0' || lower === 'no') {
      return false;
    }
  }
  throw new Error('Value must be a boolean');
}

/**
 * Validate enum value (yes/no, etc.)
 */
export function validateYesNo(value: unknown): 'yes' | 'no' | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase();
    if (lower === 'yes' || lower === 'y' || lower === 'true' || lower === '1') {
      return 'yes';
    }
    if (lower === 'no' || lower === 'n' || lower === 'false' || lower === '0') {
      return 'no';
    }
  }

  if (typeof value === 'boolean') {
    return value ? 'yes' : 'no';
  }

  throw new Error('Value must be "yes" or "no"');
}

