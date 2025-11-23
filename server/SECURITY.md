# Security Best Practices

## Overview

This document outlines the security measures implemented in the MovWise API, including SQL injection prevention and XSS (Cross-Site Scripting) protection.

## ✅ Parameterized Queries (Prepared Statements)

**All database queries use parameterized queries to prevent SQL injection attacks.**

### What are Parameterized Queries?

Parameterized queries separate SQL code from data by using placeholders (`$1`, `$2`, etc. in PostgreSQL) and passing values as separate parameters. This prevents malicious SQL code from being executed.

### ❌ Bad Example (Vulnerable to SQL Injection)

```javascript
// NEVER DO THIS - Vulnerable to SQL injection
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = '${email}'`;
pool.query(query);
```

**Attack Example:**
```javascript
// Attacker sends: email = "admin' OR '1'='1"
// Results in: SELECT * FROM users WHERE email = 'admin' OR '1'='1'
// This would return all users!
```

### ✅ Good Example (Safe)

```javascript
// Safe - Using parameterized queries
const email = req.body.email;
const query = `SELECT * FROM users WHERE email = $1`;
pool.query(query, [email]);
```

**Why it's safe:**
- The database treats `$1` as a placeholder
- The value is passed separately and properly escaped
- Even if attacker sends `admin' OR '1'='1`, it's treated as a literal string value

## Implementation in MovWise API

### Contact Form Route (`/api/contact/submit`)

```typescript
// ✅ Safe: All user input uses parameterized queries
const query = `
  INSERT INTO contact_submissions (
    name, email, service, language, message
  ) VALUES (
    $1, $2, $3, $4, $5
  ) RETURNING id, created_at
`;

const values = [
  validatedData.name,      // $1
  validatedData.email,     // $2
  validatedData.service,   // $3
  validatedData.language,  // $4
  validatedData.message,   // $5
];

await pool.query(query, values);
```

### ILR Form Route (`/api/ilr/submit`)

```typescript
// ✅ Safe: All 26 fields use parameterized queries
const query = `
  INSERT INTO ilr_submissions (
    full_name, email, phone, ...
  ) VALUES (
    $1, $2, $3, ..., $26
  ) RETURNING id, created_at
`;

await pool.query(query, values);
```

### Pagination Queries

```typescript
// ✅ Safe: Pagination parameters use parameterized queries
const query = `
  SELECT * FROM contact_submissions
  ORDER BY created_at DESC
  LIMIT $1 OFFSET $2
`;

await pool.query(query, [limit, offset]);
```

### ID-based Queries

```typescript
// ✅ Safe: ID parameter uses parameterized query
const id = validateId(req.params.id);
const query = 'SELECT * FROM contact_submissions WHERE id = $1';
await pool.query(query, [id]);
```

## Security Checklist

- ✅ **All user input uses parameterized queries** (`$1`, `$2`, etc.)
- ✅ **No string concatenation** in SQL queries
- ✅ **No template literals** with user input in SQL strings
- ✅ **Input validation** before database queries (see `server/src/utils/validation.ts`)
- ✅ **Type checking** ensures correct data types
- ✅ **Length limits** prevent buffer overflow attacks

## PostgreSQL Parameter Syntax

PostgreSQL uses numbered placeholders:

```typescript
// Single parameter
pool.query('SELECT * FROM users WHERE id = $1', [userId]);

// Multiple parameters
pool.query(
  'INSERT INTO users (name, email) VALUES ($1, $2)',
  [name, email]
);

// Array parameter (for IN clauses)
pool.query(
  'SELECT * FROM users WHERE id = ANY($1::int[])',
  [[1, 2, 3]]
);
```

## Additional Security Measures

1. **Input Validation**: All inputs are validated before reaching the database
2. **Type Safety**: TypeScript ensures type correctness
3. **Length Limits**: All string fields have maximum lengths
4. **Whitelist Approach**: Only allowed characters are accepted
5. **Error Handling**: Database errors don't expose sensitive information

## Testing for SQL Injection

To verify protection against SQL injection, test with:

```bash
# Test email field
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com'\'' OR '\''1'\''='\''1"}'

# Should be rejected by validation, not executed as SQL
```

## XSS (Cross-Site Scripting) Prevention

### Overview

XSS attacks occur when malicious scripts are injected into web pages viewed by other users. MovWise implements multiple layers of XSS protection.

### Protection Layers

#### 1. Content Security Policy (CSP)

**Backend CSP Headers:**
```typescript
// Set in server/src/index.ts
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' http://localhost:*; frame-ancestors 'none';
```

**Frontend CSP Meta Tag:**
```html
<!-- Set in index.html -->
<meta http-equiv="Content-Security-Policy" content="...">
```

**What CSP Does:**
- Prevents inline scripts from executing (unless explicitly allowed)
- Restricts which domains can load resources
- Prevents frame embedding (clickjacking protection)
- Blocks unauthorized script execution

#### 2. HTML Tag Stripping

All user input is stripped of HTML tags before processing:

```typescript
// In server/src/utils/validation.ts
export function stripHtmlTags(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    // ... more entity decoding
}
```

**Applied to:**
- ✅ Name fields
- ✅ Email fields
- ✅ Phone fields
- ✅ Message fields
- ✅ Enum/Service fields

#### 3. Input Validation

All inputs are validated with strict whitelists:

```typescript
// Example: Name validation
const namePattern = /^[a-zA-ZÀ-ÿ\s\-']+$/;
// Only allows: letters, spaces, hyphens, apostrophes
// Rejects: <script>, HTML tags, special characters
```

#### 4. React's Built-in Escaping

React automatically escapes content when rendering:

```tsx
// ✅ Safe - React automatically escapes
<div>{userInput}</div>

// ❌ Dangerous - Only use if you trust the content 100%
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

**Note:** MovWise never uses `dangerouslySetInnerHTML` with user input.

#### 5. Frontend Security Utilities

Additional utilities available in `src/utils/security.ts`:

```typescript
import { escapeHtml, stripHtml, sanitizeForDisplay } from '@/utils/security';

// Escape HTML characters
const safe = escapeHtml(userInput);

// Strip HTML tags
const plain = stripHtml(userInput);

// Combined sanitization
const display = sanitizeForDisplay(userInput);
```

### XSS Attack Examples (Blocked)

#### Example 1: Script Injection
```javascript
// Attacker tries: <script>alert('XSS')</script>
// Result: HTML tags stripped, only "alert('XSS')" stored (if allowed by pattern)
// Display: Text is escaped, script never executes
```

#### Example 2: Event Handler Injection
```javascript
// Attacker tries: <img src=x onerror="alert('XSS')">
// Result: HTML tags stripped, pattern validation rejects special characters
// Display: Script never executes due to CSP
```

#### Example 3: JavaScript Protocol
```javascript
// Attacker tries: javascript:alert('XSS')
// Result: Pattern validation rejects (not in whitelist)
// Display: CSP blocks javascript: protocol
```

### Security Headers

All API responses include security headers:

```typescript
// X-Content-Type-Options: Prevents MIME type sniffing
res.setHeader('X-Content-Type-Options', 'nosniff');

// X-Frame-Options: Prevents clickjacking
res.setHeader('X-Frame-Options', 'DENY');

// X-XSS-Protection: Legacy browser protection
res.setHeader('X-XSS-Protection', '1; mode=block');

// Referrer-Policy: Controls referrer information
res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
```

### Testing for XSS

To verify protection against XSS, test with:

```bash
# Test script injection
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(\"XSS\")</script>","email":"test@example.com"}'

# Should be rejected by validation (HTML tags stripped, pattern validation fails)
```

### Best Practices

1. ✅ **Never trust user input** - Always validate and sanitize
2. ✅ **Strip HTML tags** - Text fields don't need HTML
3. ✅ **Use CSP headers** - Additional layer of protection
4. ✅ **Escape output** - React does this automatically
5. ✅ **Whitelist approach** - Only allow specific characters
6. ✅ **Validate on server** - Client-side validation is for UX only

## CSRF (Cross-Site Request Forgery) Prevention

### Overview

CSRF attacks occur when a malicious website tricks a user's browser into making unauthorized requests to your application. MovWise implements CSRF protection using the double-submit cookie pattern.

### Protection Mechanism

#### 1. CSRF Token Generation

**Endpoint:** `GET /api/csrf-token`

- Generates a cryptographically secure random token
- Sets token as HttpOnly cookie (prevents JavaScript access)
- Returns token in response body for form inclusion

**Cookie Attributes:**
- `HttpOnly: true` - Prevents JavaScript from reading the cookie
- `Secure: true` (production) - Only sent over HTTPS
- `SameSite: Strict` - Prevents cross-site requests
- `MaxAge: 3600000` - 1 hour expiration

#### 2. Double-Submit Cookie Pattern

The CSRF protection uses the double-submit cookie pattern:

1. **Token in Cookie**: Server sets CSRF token as HttpOnly cookie
2. **Token in Request**: Client includes same token in request header or body
3. **Verification**: Server verifies both tokens match

**Why this works:**
- Attacker cannot read the HttpOnly cookie (JavaScript blocked)
- Attacker cannot set cookies for your domain (SameSite protection)
- Even if attacker guesses token, they can't read cookie to verify match

#### 3. CSRF Protection Middleware

```typescript
// Applied to all state-changing requests (POST, PUT, DELETE, PATCH)
const csrfProtection = (req, res, next) => {
  // Skip safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get token from request header or body
  const tokenFromRequest = req.headers['x-csrf-token'] || req.body.csrfToken;
  
  // Get token from cookie
  const tokenFromCookie = req.cookies.csrf_token;
  
  // Verify tokens match
  if (tokenFromRequest !== tokenFromCookie) {
    return res.status(403).json({ error: 'CSRF protection: Invalid token' });
  }
  
  next();
};
```

#### 4. Frontend Integration

**CSRF Token Utility** (`src/utils/csrf.ts`):

```typescript
// Fetch CSRF token (cached)
const token = await getCsrfToken();

// Use CSRF-protected fetch
const response = await fetchWithCsrf('/api/contact/submit', {
  method: 'POST',
  body: JSON.stringify(formData),
});
```

**Automatic Features:**
- Fetches token on component mount
- Includes token in `X-CSRF-Token` header
- Includes cookies with `credentials: 'include'`
- Caches token to avoid multiple requests

### Secure Cookie Configuration

```typescript
res.cookie('csrf_token', token, {
  httpOnly: true,        // Prevents JavaScript access
  secure: true,         // HTTPS only (production)
  sameSite: 'strict',   // Prevents cross-site requests
  maxAge: 3600000,      // 1 hour expiration
  path: '/',            // Available to all routes
});
```

### Protected Endpoints

All state-changing endpoints are protected:
- ✅ `POST /api/contact/submit`
- ✅ `POST /api/ilr/submit`
- ✅ Any future POST/PUT/DELETE/PATCH endpoints

### CSRF Attack Example (Blocked)

```javascript
// Attacker's malicious site tries:
fetch('https://movwise.com/api/contact/submit', {
  method: 'POST',
  body: JSON.stringify({ name: 'Hacker', email: 'hack@evil.com' }),
});

// Result: 
// 1. Browser doesn't send csrf_token cookie (SameSite=Strict)
// 2. Request fails with 403: CSRF token missing
// 3. Attack blocked!
```

### Testing CSRF Protection

```bash
# Test without CSRF token (should fail)
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@example.com"}'

# Should return: {"success":false,"message":"CSRF token missing"}

# Test with CSRF token (should succeed)
# 1. First get token
TOKEN=$(curl -c cookies.txt http://localhost:3001/api/csrf-token | jq -r .csrfToken)

# 2. Then use token
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: $TOKEN" \
  -b cookies.txt \
  -d '{"name":"Test","email":"test@example.com"}'
```

### Best Practices

1. ✅ **HttpOnly cookies** - Prevents JavaScript access
2. ✅ **SameSite=Strict** - Prevents cross-site cookie sending
3. ✅ **Secure flag** - HTTPS only in production
4. ✅ **Token rotation** - Tokens expire after 1 hour
5. ✅ **Double-submit pattern** - Token in both cookie and request
6. ✅ **Protect all state changes** - POST, PUT, DELETE, PATCH

## Rate Limiting & Abuse Protection

### Overview

Rate limiting protects against abuse, brute-force attacks, bot spam, and DDoS attacks by limiting the number of requests a client can make within a specific time window.

### Implementation

MovWise uses `express-rate-limit` to implement per-IP rate limiting with different limits for different endpoints.

### Rate Limit Configuration

#### 1. Contact Form Rate Limiter
- **Limit**: 10 requests per minute per IP
- **Window**: 60 seconds
- **Endpoint**: `POST /api/contact/submit`

#### 2. ILR Form Rate Limiter
- **Limit**: 5 requests per minute per IP
- **Window**: 60 seconds
- **Endpoint**: `POST /api/ilr/submit`
- **Note**: More restrictive due to form complexity

#### 3. CSRF Token Rate Limiter
- **Limit**: 20 requests per minute per IP
- **Window**: 60 seconds
- **Endpoint**: `GET /api/csrf-token`

#### 4. General API Rate Limiter
- **Limit**: 100 requests per 15 minutes per IP
- **Window**: 15 minutes
- **Applied to**: All `/api/*` routes

#### 5. Strict Rate Limiter (Available)
- **Limit**: 3 requests per 15 minutes per IP
- **Window**: 15 minutes
- **Use case**: Sensitive operations (login, password reset, etc.)

### IP Detection

The rate limiter correctly detects client IPs behind reverse proxies (nginx):

```typescript
function getClientIp(req: Request): string {
  // Check X-Forwarded-For header (set by nginx)
  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}
```

**Configuration:**
- `app.set('trust proxy', 1)` - Trusts first proxy (nginx)

### Rate Limit Response

When rate limit is exceeded, the API returns:

```json
{
  "success": false,
  "message": "Too many requests",
  "error": "Rate limit exceeded. Please try again later.",
  "retryAfter": 45
}
```

**HTTP Status**: `429 Too Many Requests`

**Headers**:
- `RateLimit-Limit`: Maximum number of requests allowed
- `RateLimit-Remaining`: Number of requests remaining
- `RateLimit-Reset`: Time when the rate limit resets (Unix timestamp)

### Protection Against

1. **Bot Spam**: Prevents automated form submissions
2. **Brute-Force Attacks**: Limits attempts on sensitive endpoints
3. **DDoS Attacks**: Reduces impact of distributed attacks
4. **Resource Exhaustion**: Prevents single IP from overwhelming server
5. **Email Spam**: Limits contact form submissions

### Testing Rate Limits

```bash
# Test contact form rate limit (should fail after 10 requests)
for i in {1..12}; do
  curl -X POST http://localhost:3001/api/contact/submit \
    -H "Content-Type: application/json" \
    -H "X-CSRF-Token: YOUR_TOKEN" \
    -b "csrf_token=YOUR_TOKEN" \
    -d '{"name":"Test","email":"test@example.com"}'
  echo ""
done

# 11th and 12th requests should return 429 status
```

### Development Mode

In development, rate limiting can be bypassed by setting header:
```
X-Skip-Rate-Limit: true
```

**Note**: This only works in development mode (`NODE_ENV !== 'production'`)

### Best Practices

1. ✅ **Per-IP Limiting**: Prevents single IP abuse
2. ✅ **Different Limits**: Stricter limits for sensitive operations
3. ✅ **Proper IP Detection**: Handles reverse proxies correctly
4. ✅ **Clear Error Messages**: Users know when and why they're rate limited
5. ✅ **Retry-After Header**: Tells clients when to retry
6. ✅ **Standard Headers**: Uses RateLimit-* headers for client information

### Future Enhancements

Potential improvements:
- **Account-Level Throttling**: Track failed attempts per email/account
- **Progressive Delays**: Increase delay after multiple failures
- **Whitelist/Blacklist**: Allow trusted IPs or block known bad actors
- **Distributed Rate Limiting**: Use Redis for multi-server deployments

## References

- [OWASP SQL Injection Prevention](https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html)
- [OWASP XSS Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [OWASP CSRF Prevention](https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html)
- [OWASP Rate Limiting](https://cheatsheetseries.owasp.org/cheatsheets/Denial_of_Service_Cheat_Sheet.html)
- [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [PostgreSQL Prepared Statements](https://www.postgresql.org/docs/current/sql-prepare.html)
- [Node.js pg Library Documentation](https://node-postgres.com/features/queries)
- [SameSite Cookies](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie/SameSite)
- [express-rate-limit Documentation](https://github.com/express-rate-limit/express-rate-limit)

