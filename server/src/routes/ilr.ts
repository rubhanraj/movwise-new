import express from 'express';
import { pool } from '../db/init.js';
import { z } from 'zod';

const router = express.Router();

// Validation schema
const ilrSubmissionSchema = z.object({
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  salary: z.number().optional(),
  mortgage: z.enum(['yes', 'no']).optional(),
  innovatorVisa: z.boolean().optional(),
  yearsResidence: z.number().optional(),
  englishLevel: z.string().optional(),
  volunteeringHours: z.number().optional(),
  publicService: z.enum(['yes', 'no']).optional(),
  lifeInUKPassed: z.boolean().optional(),
  benefitsUse: z.enum(['yes', 'no']).optional(),
  criminality: z.enum(['yes', 'no']).optional(),
  illegalEntry: z.enum(['yes', 'no']).optional(),
  previousBreaches: z.boolean().optional(),
  adultDependents: z.number().optional(),
  childDependents: z.number().optional(),
  contributionScore: z.number().optional(),
  residenceScore: z.number().optional(),
  integrationScore: z.number().optional(),
  characterScore: z.number().optional(),
  totalScore: z.number().optional(),
  eligibleFor3YearPathway: z.boolean().optional(),
  estimatedYearsToILR: z.number().optional(),
  newsletter: z.boolean().optional(),
  volunteeringInterest: z.boolean().optional(),
});

// POST /api/ilr/submit - Save ILR submission
router.post('/submit', async (req, res) => {
  try {
    const validatedData = ilrSubmissionSchema.parse(req.body);

    const query = `
      INSERT INTO ilr_submissions (
        full_name, email, phone,
        salary, mortgage, innovator_visa,
        years_residence,
        english_level, volunteering_hours, public_service, life_in_uk_passed,
        benefits_use, criminality, illegal_entry, previous_breaches,
        adult_dependents, child_dependents,
        contribution_score, residence_score, integration_score, character_score, total_score,
        eligible_for_3_year_pathway, estimated_years_to_ilr,
        newsletter, volunteering_interest
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26
      ) RETURNING id, created_at
    `;

    const values = [
      validatedData.fullName,
      validatedData.email,
      validatedData.phone,
      validatedData.salary || null,
      validatedData.mortgage || null,
      validatedData.innovatorVisa || false,
      validatedData.yearsResidence || null,
      validatedData.englishLevel || null,
      validatedData.volunteeringHours || null,
      validatedData.publicService || null,
      validatedData.lifeInUKPassed ?? true,
      validatedData.benefitsUse || null,
      validatedData.criminality || null,
      validatedData.illegalEntry || null,
      validatedData.previousBreaches || false,
      validatedData.adultDependents || 0,
      validatedData.childDependents || 0,
      validatedData.contributionScore || null,
      validatedData.residenceScore || null,
      validatedData.integrationScore || null,
      validatedData.characterScore || null,
      validatedData.totalScore || null,
      validatedData.eligibleFor3YearPathway || false,
      validatedData.estimatedYearsToILR || null,
      validatedData.newsletter ?? true,
      validatedData.volunteeringInterest || false,
    ];

    const result = await pool.query(query, values);

    res.status(201).json({
      success: true,
      message: 'ILR submission saved successfully',
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

    console.error('Error saving ILR submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to save ILR submission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/ilr/submissions - Get all submissions (with pagination)
router.get('/submissions', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const query = `
      SELECT 
        id, full_name, email, phone,
        total_score, estimated_years_to_ilr,
        created_at
      FROM ilr_submissions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = 'SELECT COUNT(*) FROM ilr_submissions';

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
    console.error('Error fetching submissions:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submissions',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// GET /api/ilr/submission/:id - Get a specific submission
router.get('/submission/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const query = 'SELECT * FROM ilr_submissions WHERE id = $1';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    res.json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Error fetching submission:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch submission',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export { router as ilrRoutes };

