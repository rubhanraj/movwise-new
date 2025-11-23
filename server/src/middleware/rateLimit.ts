/**
 * Rate Limiting Middleware
 * Protects against abuse, brute-force attacks, and bot spam
 */

import rateLimit from 'express-rate-limit';
import { Request } from 'express';

/**
 * Get client IP address (handles reverse proxy/nginx)
 */
function getClientIp(req: Request): string {
  // Check X-Forwarded-For header (set by nginx reverse proxy)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    // X-Forwarded-For can contain multiple IPs, take the first one
    const ips = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    return ips.split(',')[0].trim();
  }
  
  // Fallback to direct connection IP
  return req.ip || req.socket.remoteAddress || 'unknown';
}

/**
 * Standard rate limit handler
 */
const standardHandler = (req: Request & { rateLimit?: { resetTime?: number } }, res: any) => {
  const resetTime = req.rateLimit?.resetTime || Date.now() + 60000; // Default to 60 seconds
  const retryAfter = Math.ceil((resetTime - Date.now()) / 1000);
  
  res.status(429).json({
    success: false,
    message: 'Too many requests',
    error: 'Rate limit exceeded. Please try again later.',
    retryAfter: retryAfter > 0 ? retryAfter : 60,
  });
};

/**
 * Contact Form Rate Limiter
 * Max 10 requests per minute per IP
 */
export const contactFormLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: 'Too many contact form submissions',
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  keyGenerator: (req) => getClientIp(req),
  handler: standardHandler,
  skip: (req) => {
    // Skip rate limiting in development for testing (optional)
    return process.env.NODE_ENV === 'development' && req.headers['x-skip-rate-limit'] === 'true';
  },
});

/**
 * ILR Form Rate Limiter
 * Max 5 requests per minute per IP (more restrictive due to complexity)
 */
export const ilrFormLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 requests per minute
  message: 'Too many ILR form submissions',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: standardHandler,
  skip: (req) => {
    return process.env.NODE_ENV === 'development' && req.headers['x-skip-rate-limit'] === 'true';
  },
});

/**
 * General API Rate Limiter
 * Max 100 requests per 15 minutes per IP
 */
export const generalApiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes
  message: 'Too many API requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: standardHandler,
});

/**
 * Strict Rate Limiter (for sensitive operations)
 * Max 3 requests per 15 minutes per IP
 */
export const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per 15 minutes
  message: 'Too many requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: standardHandler,
});

/**
 * CSRF Token Rate Limiter
 * Max 20 requests per minute per IP
 */
export const csrfTokenLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many CSRF token requests',
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => getClientIp(req),
  handler: standardHandler,
});

