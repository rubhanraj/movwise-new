#!/bin/bash

# Start Backend API Server

echo "🚀 Starting MovWise Backend API..."

cd server || exit 1

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
EOF
    echo "✅ Created .env file. You may want to update it with your database settings."
fi

# Check if PostgreSQL is running
echo "🔍 Checking database connection..."
if command -v docker &> /dev/null; then
    if docker ps | grep -q movwise-db; then
        echo "✅ Database container is running"
    elif docker ps -a | grep -q movwise-db; then
        echo "⚠️  Database container exists but is stopped. Starting it..."
        docker start movwise-db
        sleep 2
    else
        echo "⚠️  Database container not found. Starting PostgreSQL..."
        docker run -d \
          --name movwise-db \
          -e POSTGRES_DB=movwise \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -p 5432:5432 \
          postgres:16-alpine
        echo "⏳ Waiting for database to be ready..."
        sleep 5
    fi
fi

echo "🔧 Starting backend server..."
npm run dev

