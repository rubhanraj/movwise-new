import express from 'express';
import { pool } from '../db/init.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const contactSubmissionSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  service: z.string().optional(),
  language: z.string().optional(),
  message: z.string().optional(),
});

// POST /api/contact/submit - Save contact form submission
router.post('/submit', async (req, res) => {
  try {
    console.log('Received contact form submission:', req.body);
    
    const validatedData = contactSubmissionSchema.parse(req.body);
    console.log('Validated data:', validatedData);

    const query = `
      INSERT INTO contact_submissions (
        name, email, service, language, message
      ) VALUES (
        $1, $2, $3, $4, $5
      ) RETURNING id, created_at
    `;

    const values = [
      validatedData.name,
      validatedData.email,
      validatedData.service || null,
      validatedData.language || null,
      validatedData.message || null,
    ];

    console.log('Executing query with values:', values);
    
    // Test database connection first
    try {
      await pool.query('SELECT 1');
    } catch (dbError) {
      console.error('❌ Database connection test failed:', dbError);
      throw new Error(`Database connection failed: ${dbError instanceof Error ? dbError.message : 'Unknown error'}`);
    }
    
    const result = await pool.query(query, values);
    console.log('✅ Query successful, inserted ID:', result.rows[0].id);

    res.status(201).json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    console.error('❌ Error saving contact submission:', error);
    
    // More detailed error logging
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      // Check for common database errors
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('💡 Database table does not exist! Run database migrations.');
      }
      if (error.message.includes('ECONNREFUSED') || error.message.includes('connection')) {
        console.error('💡 Database connection failed! Check if PostgreSQL is running.');
      }
    }
    
    res.status(500).json({
      success: false,
      message: 'Failed to submit contact form',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: process.env.NODE_ENV === 'development' 
        ? (error instanceof Error ? error.stack : undefined)
        : undefined,
    });
  }
});

// GET /api/contact/submissions - Get all contact submissions (with pagination)
router.get('/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        id, name, email, service, language, message, created_at
      FROM contact_submissions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM contact_submissions';

    const [results, countResult] = await Promise.all([
      pool.query(query, [limit, offset]),
      pool.query(countQuery),
    ]);

    const total = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      data: results.rows,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    });
  } catch (error) {
    console.error('Error fetching contact submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/contact/submission/:id - Get a specific contact submission
router.get('/submission/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const query = 'SELECT * FROM contact_submissions WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Contact submission not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching contact submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch contact submission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as contactRoutes };

