import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'movwise',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

export { pool };

export async function initDb() {
  try {
    // Test connection
    await pool.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Create tables if they don't exist
    await createTables();
    console.log('✅ Database tables initialized');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
}

async function createTables() {
  try {
    // Create ILR submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ilr_submissions (
        id SERIAL PRIMARY KEY,
        full_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        
        -- Contribution
        salary DECIMAL(10, 2),
        mortgage VARCHAR(10),
        innovator_visa BOOLEAN DEFAULT FALSE,
        
        -- Residence
        years_residence DECIMAL(4, 1),
        
        -- Integration
        english_level VARCHAR(20),
        volunteering_hours INTEGER,
        public_service VARCHAR(10),
        life_in_uk_passed BOOLEAN DEFAULT TRUE,
        
        -- Character
        benefits_use VARCHAR(10),
        criminality VARCHAR(10),
        illegal_entry VARCHAR(10),
        previous_breaches BOOLEAN DEFAULT FALSE,
        
        -- Dependents
        adult_dependents INTEGER DEFAULT 0,
        child_dependents INTEGER DEFAULT 0,
        
        -- Results
        contribution_score INTEGER,
        residence_score INTEGER,
        integration_score INTEGER,
        character_score INTEGER,
        total_score INTEGER,
        eligible_for_3_year_pathway BOOLEAN DEFAULT FALSE,
        estimated_years_to_ilr DECIMAL(4, 1),
        
        -- Preferences
        newsletter BOOLEAN DEFAULT TRUE,
        volunteering_interest BOOLEAN DEFAULT FALSE,
        
        -- Metadata
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ilr_submissions_email ON ilr_submissions(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_ilr_submissions_created_at ON ilr_submissions(created_at)
    `);

    // Create contact submissions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_submissions (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        service VARCHAR(50),
        language VARCHAR(50),
        message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at)
    `);

    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_contact_submissions_service ON contact_submissions(service)
    `);

    console.log('✅ All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
}

