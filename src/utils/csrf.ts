/**
 * Frontend CSRF token management
 * Fetches and manages CSRF tokens for form submissions
 */

let csrfToken: string | null = null;
let tokenPromise: Promise<string> | null = null;

/**
 * Fetch CSRF token from the backend
 * Uses caching to avoid multiple requests
 */
export async function getCsrfToken(): Promise<string> {
  // Return cached token if available
  if (csrfToken) {
    return csrfToken;
  }

  // Return existing promise if already fetching
  if (tokenPromise) {
    return tokenPromise;
  }

  // Fetch new token
  const apiUrl = import.meta.env.PROD 
    ? (import.meta.env.VITE_API_URL || 'http://localhost:3001')
    : '/api'; // Use relative path to leverage Vite proxy in dev

  tokenPromise = fetch(`${apiUrl}/csrf-token`, {
    method: 'GET',
    credentials: 'include', // Important: Include cookies
  })
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }
      const data = await response.json();
      csrfToken = data.csrfToken;
      return csrfToken!;
    })
    .catch((error) => {
      tokenPromise = null; // Reset promise on error
      throw error;
    });

  return tokenPromise;
}

/**
 * Clear cached CSRF token (useful after logout or token rotation)
 */
export function clearCsrfToken(): void {
  csrfToken = null;
  tokenPromise = null;
}

/**
 * Fetch with CSRF protection
 * Automatically includes CSRF token in headers
 */
export async function fetchWithCsrf(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Get CSRF token
  const token = await getCsrfToken();

  // Merge headers
  const headers = new Headers(options.headers);
  headers.set('X-CSRF-Token', token);
  if (!headers.has('Content-Type') && options.body) {
    headers.set('Content-Type', 'application/json');
  }

  // Make request with credentials to include cookies
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Important: Include cookies for CSRF cookie
  });

  // If response includes a new CSRF token (after token rotation), update cache
  if (response.ok) {
    try {
      const data = await response.clone().json();
      if (data.csrfToken) {
        csrfToken = data.csrfToken;
      }
    } catch {
      // Not JSON or no csrfToken field, ignore
    }
  }

  return response;
}

