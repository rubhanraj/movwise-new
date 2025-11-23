import express from 'express';
import { pool } from '../db/init.js';
import {
  validateName,
  validateEmail,
  validatePhone,
  validateNumber,
  validateBoolean,
  validateYesNo,
  validateEnumField,
  validatePagination,
  validateId,
} from '../utils/validation.js';
import { rotateCsrfToken } from '../utils/csrf.js';
import { ilrFormLimiter } from '../middleware/rateLimit.js';

const router = express.Router();

// POST /api/ilr/submit - Save ILR submission
// Rate limited: 5 requests per minute per IP
router.post('/submit', ilrFormLimiter, async (req, res) => {
  try {
    
    // Server-side validation - never trust client input
    const validatedData = {
      fullName: validateName(req.body.fullName),
      email: validateEmail(req.body.email),
      phone: validatePhone(req.body.phone),
      salary: validateNumber(req.body.salary, 0, 10000000), // 0 to 10M
      mortgage: validateYesNo(req.body.mortgage),
      innovatorVisa: req.body.innovatorVisa !== undefined ? validateBoolean(req.body.innovatorVisa) : false,
      yearsResidence: validateNumber(req.body.yearsResidence, 0, 100), // 0 to 100 years
      englishLevel: validateEnumField(req.body.englishLevel, 50),
      volunteeringHours: validateNumber(req.body.volunteeringHours, 0, 10000), // 0 to 10k hours
      publicService: validateYesNo(req.body.publicService),
      lifeInUKPassed: req.body.lifeInUKPassed !== undefined ? validateBoolean(req.body.lifeInUKPassed) : true,
      benefitsUse: validateYesNo(req.body.benefitsUse),
      criminality: validateYesNo(req.body.criminality),
      illegalEntry: validateYesNo(req.body.illegalEntry),
      previousBreaches: req.body.previousBreaches !== undefined ? validateBoolean(req.body.previousBreaches) : false,
      adultDependents: validateNumber(req.body.adultDependents, 0, 20) ?? 0, // 0 to 20
      childDependents: validateNumber(req.body.childDependents, 0, 20) ?? 0, // 0 to 20
      contributionScore: req.body.contributionScore !== undefined && req.body.contributionScore !== null 
        ? validateNumber(req.body.contributionScore, 0, 1000) 
        : null, // 0 to 1000, allow null
      residenceScore: req.body.residenceScore !== undefined && req.body.residenceScore !== null 
        ? validateNumber(req.body.residenceScore, 0, 1000) 
        : null, // 0 to 1000, allow null
      integrationScore: req.body.integrationScore !== undefined && req.body.integrationScore !== null 
        ? validateNumber(req.body.integrationScore, 0, 1000) 
        : null, // 0 to 1000, allow null
      characterScore: req.body.characterScore !== undefined && req.body.characterScore !== null 
        ? validateNumber(req.body.characterScore, 0, 1000) 
        : null, // 0 to 1000, allow null
      totalScore: req.body.totalScore !== undefined && req.body.totalScore !== null 
        ? validateNumber(req.body.totalScore, 0, 10000) 
        : null, // 0 to 10k, allow null
      eligibleFor3YearPathway: req.body.eligibleFor3YearPathway !== undefined ? validateBoolean(req.body.eligibleFor3YearPathway) : false,
      estimatedYearsToILR: validateNumber(req.body.estimatedYearsToILR, 0, 50), // 0 to 50 years
      newsletter: req.body.newsletter !== undefined ? validateBoolean(req.body.newsletter) : true,
      volunteeringInterest: req.body.volunteeringInterest !== undefined ? validateBoolean(req.body.volunteeringInterest) : false,
    };

    // SQL Injection Prevention: Using parameterized queries ($1-$26)
    // All user input is passed as parameters, never concatenated into SQL strings
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

    // Rotate CSRF token after successful submission (security best practice)
    // This invalidates the used token and generates a new one
    const newCsrfToken = rotateCsrfToken(res, req);

    res.status(201).json({
      success: true,
      message: 'ILR submission saved successfully',
      data: {
        id: result.rows[0].id,
        createdAt: result.rows[0].created_at,
      },
      // Return new CSRF token so frontend can update its cache
      csrfToken: newCsrfToken,
    });
  } catch (error) {
    // Validation errors
    if (error instanceof Error && (error.message.includes('must be') || error.message.includes('can only') || error.message.includes('Invalid') || error.message.includes('required'))) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message,
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
    // Validate pagination parameters
    const { page, limit, offset } = validatePagination(req.query.page, req.query.limit);

    // SQL Injection Prevention: Using parameterized queries for pagination
    const query = `
      SELECT 
        id, full_name, email, phone,
        total_score, estimated_years_to_ilr,
        created_at
      FROM ilr_submissions
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    // No user input in COUNT query - safe
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
    // Validate ID parameter
    const id = validateId(req.params.id);

    // SQL Injection Prevention: Using parameterized query for ID
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

