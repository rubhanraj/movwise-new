#!/bin/bash

# Debug Backend Issues

echo "🔍 Debugging MovWise Backend..."
echo ""

# Check if backend is running
echo "1. Checking if backend is running..."
if curl -s http://localhost:3001/health > /dev/null 2>&1; then
    echo "   ✅ Backend is running"
    curl -s http://localhost:3001/health | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/health
else
    echo "   ❌ Backend is NOT running"
    echo "   Start it with: cd server && npm run dev"
    exit 1
fi

echo ""
echo "2. Testing database connection..."
curl -s http://localhost:3001/test-db | python3 -m json.tool 2>/dev/null || curl -s http://localhost:3001/test-db

echo ""
echo "3. Testing contact form submission..."
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Debug Test","email":"debug@test.com"}' \
  -w "\nHTTP Status: %{http_code}\n" \
  | python3 -m json.tool 2>/dev/null || curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{"name":"Debug Test","email":"debug@test.com"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "✅ Debug complete!"
echo ""
echo "💡 Check the backend console for detailed error messages"

