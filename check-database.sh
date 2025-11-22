#!/bin/bash

# Check Database Setup

echo "🔍 Checking MovWise Database Setup..."
echo ""

# Check if database container is running
if command -v docker &> /dev/null; then
    echo "1. Checking Docker database container..."
    if docker ps | grep -q movwise-db; then
        echo "   ✅ Database container is running"
        
        # Check if we can connect
        echo ""
        echo "2. Testing database connection..."
        if docker exec movwise-db psql -U postgres -d movwise -c "SELECT NOW();" > /dev/null 2>&1; then
            echo "   ✅ Database connection successful"
        else
            echo "   ❌ Cannot connect to database"
            exit 1
        fi
        
        # Check if tables exist
        echo ""
        echo "3. Checking database tables..."
        TABLES=$(docker exec movwise-db psql -U postgres -d movwise -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('contact_submissions', 'ilr_submissions');" 2>/dev/null | tr -d ' ')
        
        if [ "$TABLES" = "2" ]; then
            echo "   ✅ Both tables exist (contact_submissions, ilr_submissions)"
        else
            echo "   ⚠️  Tables missing or incomplete (found $TABLES/2 tables)"
            echo ""
            echo "   Creating missing tables..."
            docker exec movwise-db psql -U postgres -d movwise << 'EOF'
CREATE TABLE IF NOT EXISTS contact_submissions (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  service VARCHAR(50),
  language VARCHAR(50),
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS ilr_submissions (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  salary DECIMAL(10, 2),
  mortgage VARCHAR(10),
  innovator_visa BOOLEAN DEFAULT FALSE,
  years_residence DECIMAL(4, 1),
  english_level VARCHAR(20),
  volunteering_hours INTEGER,
  public_service VARCHAR(10),
  life_in_uk_passed BOOLEAN DEFAULT TRUE,
  benefits_use VARCHAR(10),
  criminality VARCHAR(10),
  illegal_entry VARCHAR(10),
  previous_breaches BOOLEAN DEFAULT FALSE,
  adult_dependents INTEGER DEFAULT 0,
  child_dependents INTEGER DEFAULT 0,
  contribution_score INTEGER,
  residence_score INTEGER,
  integration_score INTEGER,
  character_score INTEGER,
  total_score INTEGER,
  eligible_for_3_year_pathway BOOLEAN DEFAULT FALSE,
  estimated_years_to_ilr DECIMAL(4, 1),
  newsletter BOOLEAN DEFAULT TRUE,
  volunteering_interest BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
EOF
            echo "   ✅ Tables created"
        fi
        
        # Check table structure
        echo ""
        echo "4. Verifying contact_submissions table structure..."
        docker exec movwise-db psql -U postgres -d movwise -c "\d contact_submissions" 2>/dev/null | head -15
        
    else
        echo "   ❌ Database container is not running"
        echo ""
        echo "   To start it:"
        echo "   docker run -d --name movwise-db -e POSTGRES_DB=movwise -e POSTGRES_USER=postgres -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine"
        exit 1
    fi
else
    echo "   ⚠️  Docker not found. Skipping container checks."
    echo "   Please verify PostgreSQL is running and accessible."
fi

echo ""
echo "✅ Database check complete!"

