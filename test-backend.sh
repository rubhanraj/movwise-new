#!/bin/bash

# Test Backend API

echo "🧪 Testing MovWise Backend API..."
echo ""

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s http://localhost:3001/health | jq '.' || curl -s http://localhost:3001/health
echo ""
echo ""

# Test contact form submission
echo "2. Testing contact form submission..."
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "immigration",
    "language": "english",
    "message": "This is a test message"
  }' | jq '.' || curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "service": "immigration",
    "language": "english",
    "message": "This is a test message"
  }'
echo ""
echo ""

# Check database
echo "3. Checking database connection..."
if command -v docker &> /dev/null && docker ps | grep -q movwise-db; then
    echo "Database container is running"
    docker exec movwise-db psql -U postgres -d movwise -c "SELECT COUNT(*) FROM contact_submissions;" 2>/dev/null || echo "Could not query database"
else
    echo "Database container not found or not running"
fi

echo ""
echo "✅ Tests complete!"

