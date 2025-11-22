import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { ilrRoutes } from './routes/ilr.js';
import { contactRoutes } from './routes/contact.js';
import { initDb } from './db/init.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'MovWise API is running' });
});

// Database test endpoint
app.get('/test-db', async (req, res) => {
  try {
    const { pool } = await import('./db/init.js');
    const result = await pool.query('SELECT NOW() as time, COUNT(*) as table_count FROM information_schema.tables WHERE table_schema = $1', ['public']);
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('contact_submissions', 'ilr_submissions')
    `);
    
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

