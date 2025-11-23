/**
 * CSRF (Cross-Site Request Forgery) Protection Utilities
 * 
 * Generates and verifies CSRF tokens to prevent CSRF attacks
 */

import crypto from 'crypto';
import express from 'express';

/**
 * Generate a cryptographically secure random token
 */
export function generateCsrfToken(): string {
  // Generate 32 bytes (256 bits) of random data and convert to hex
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Generate a CSRF token and create a signed secret for verification
 * Returns both the token and the secret
 */
export function generateCsrfPair(): { token: string; secret: string } {
  const token = generateCsrfToken();
  const secret = generateCsrfToken(); // Separate secret for double-submit cookie pattern
  
  return { token, secret };
}

/**
 * Verify CSRF token matches the secret
 * Uses double-submit cookie pattern for stateless verification
 */
export function verifyCsrfToken(token: string, secret: string): boolean {
  if (!token || !secret) {
    return false;
  }
  
  // Simple comparison - in production, you might want to use constant-time comparison
  // For CSRF tokens, timing attacks are less of a concern, but good practice
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(secret)
  );
}

/**
 * Create a signed CSRF token (token + secret combined)
 * This allows stateless verification
 */
export function createSignedToken(token: string, secret: string): string {
  // Combine token and secret with a delimiter
  const combined = `${token}:${secret}`;
  return Buffer.from(combined).toString('base64url');
}

/**
 * Verify a signed CSRF token
 */
export function verifySignedToken(signedToken: string, cookieSecret: string): boolean {
  try {
    const decoded = Buffer.from(signedToken, 'base64url').toString('utf-8');
    const [token, secret] = decoded.split(':');
    
    if (!token || !secret) {
      return false;
    }
    
    // Verify the secret matches the cookie secret
    return verifyCsrfToken(secret, cookieSecret);
  } catch (error) {
    return false;
  }
}

/**
 * Get CSRF token from request headers or body
 */
export function getCsrfTokenFromRequest(req: any): string | null {
  // Check common locations for CSRF token
  return (
    req.headers['x-csrf-token'] ||
    req.headers['xsrf-token'] ||
    req.body?.csrf_token ||
    req.body?.csrfToken ||
    null
  );
}

/**
 * Helper function to set secure CSRF cookie
 * Detects HTTPS from X-Forwarded-Proto header (set by nginx reverse proxy)
 */
export function setCsrfCookie(res: express.Response, token: string, req?: express.Request) {
  // Check if request is over HTTPS (either directly or via reverse proxy)
  // In development, allow HTTP for local testing
  const isHttps = 
    req?.secure || // Direct HTTPS connection
    req?.headers['x-forwarded-proto'] === 'https'; // Behind reverse proxy (nginx)
  
  // Only set Secure flag if actually using HTTPS
  // Don't check NODE_ENV - check if request is actually over HTTPS
  // This allows cookies to work in development over HTTP
  const useSecure = isHttps;
  
  // Use 'lax' for better compatibility (works with HTTP in development)
  // 'lax' still prevents CSRF but allows cookies on top-level navigation
  // In production with HTTPS, you can use 'strict' if needed
  const sameSite: 'strict' | 'lax' | 'none' = isHttps ? 'strict' : 'lax';
  
  res.cookie('csrf_token', token, {
    httpOnly: true, // Prevents JavaScript from reading the cookie
    secure: useSecure, // Only send over HTTPS in production or when actually using HTTPS
    sameSite: sameSite, // Prevents CSRF attacks - 'strict' in production, 'lax' in development
    maxAge: 3600000, // 1 hour expiration
    path: '/', // Available to all routes
  });
}

/**
 * Helper function to rotate CSRF token after successful submission
 * Invalidates old token and generates a new one
 * This is a security best practice - tokens should be single-use or rotated regularly
 */
export function rotateCsrfToken(res: express.Response, req?: express.Request): string {
  // Generate new token
  const newToken = generateCsrfToken();
  
  // Set new token as cookie (replaces old one)
  setCsrfCookie(res, newToken, req);
  
  return newToken;
}

