import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { ilrRoutes } from './routes/ilr.js';
import { contactRoutes } from './routes/contact.js';
import { initDb } from './db/init.js';
import { generateCsrfToken, getCsrfTokenFromRequest, setCsrfCookie } from './utils/csrf.js';
import { generalApiLimiter, csrfTokenLimiter } from './middleware/rateLimit.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Cookie parser middleware - must be before other middleware
app.use(cookieParser());

// CORS configuration - allow credentials for CSRF cookies
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // List of allowed origins
    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'http://localhost:5173',
      'http://localhost:8080',
      'http://localhost:3000',
    ].filter(Boolean);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true); // Allow all origins in development, restrict in production
    }
  },
  credentials: true, // Allow cookies to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
}));

// Security Headers - XSS Prevention
app.use((req, res, next) => {
  // Content Security Policy - prevents XSS attacks
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; " +
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
    "font-src 'self' https://fonts.gstatic.com; " +
    "img-src 'self' data: https:; " +
    "connect-src 'self' http://localhost:*; " +
    "frame-ancestors 'none';"
  );
  
  // X-Content-Type-Options - prevents MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options - prevents clickjacking
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection - legacy browser XSS protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer-Policy - controls referrer information
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  next();
});

app.use(express.json());

// Trust proxy for accurate IP detection behind nginx reverse proxy
app.set('trust proxy', 1);

// Apply general API rate limiting to all API routes
app.use('/api', generalApiLimiter);

// CSRF Token Generation Endpoint (must be before CSRF middleware)
// This endpoint provides CSRF tokens to the frontend
app.get('/api/csrf-token', csrfTokenLimiter, (req, res) => {
  // Generate a new CSRF token
  const token = generateCsrfToken();
  
  // Set CSRF token as secure HttpOnly cookie
  setCsrfCookie(res, token, req);
  
  // Also return token in response body for frontend to include in forms
  res.json({
    success: true,
    csrfToken: token,
  });
});

// CSRF Protection Middleware
// Verifies CSRF token on state-changing requests (POST, PUT, DELETE, PATCH)
const csrfProtection = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  // Skip CSRF check for CSRF token endpoint itself
  if (req.path === '/csrf-token') {
    return next();
  }
  
  // Skip CSRF check for safe methods (GET, HEAD, OPTIONS)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Get CSRF token from request (header or body)
  const tokenFromRequest = getCsrfTokenFromRequest(req);
  
  // Get CSRF token from cookie
  const tokenFromCookie = req.cookies?.csrf_token;
  
  // Verify tokens match (double-submit cookie pattern)
  if (!tokenFromRequest || !tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token missing',
      error: 'CSRF protection: Token required',
    });
  }
  
  // Verify tokens match (double-submit cookie pattern)
  // Both token from request and cookie must match
  if (tokenFromRequest !== tokenFromCookie) {
    return res.status(403).json({
      success: false,
      message: 'CSRF token mismatch',
      error: 'CSRF protection: Invalid token',
    });
  }
  
  // Token verified, proceed
  next();
};

// Apply CSRF protection to all API routes that change state
app.use('/api', csrfProtection);

// Health check (no CSRF needed)
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MovWise API is running' });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { pool } = await import('./db/init.js');
    // Using parameterized queries to prevent SQL injection
    const result = await pool.query(
      'SELECT NOW() as time, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1',
      ['public']
    );
    // Using parameterized queries even for hardcoded values (best practice)
    const tables = await pool.query(
      `SELECT table_name 
       FROM information_schema.tables 
       WHERE table_schema = $1 
       AND table_name = ANY($2::text[])`,
      ['public', ['contact_submissions', 'ilr_submissions']]
    );
    
    res.json({
      status: 'ok',
      database: 'connected',
      time: result.rows[0].time,
      tables: tables.rows.map(r => r.table_name),
      tableCount: result.rows[0].table_count
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : undefined) : undefined
    });
  }
});

// Routes
app.use('/api/ilr', ilrRoutes);
app.use('/api/contact', contactRoutes);

// Initialize database and start server
initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📍 Health check: http://localhost:${PORT}/health`);
      console.log(`📍 API endpoints: http://localhost:${PORT}/api`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to initialize database:', error);
    console.error('\n💡 Troubleshooting:');
    console.error('   1. Make sure PostgreSQL is running');
    console.error('   2. Check database credentials in .env file');
    console.error('   3. Verify database exists: psql -U postgres -l | grep movwise');
    console.error('\n   To start PostgreSQL with Docker:');
    console.error('   docker run -d --name movwise-db -e POSTGRES_DB=movwise -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine');
    process.exit(1);
  });

