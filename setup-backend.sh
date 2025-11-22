#!/bin/bash
# Quick setup script for backend

echo "🔧 Setting up MovWise Backend..."

# Install dependencies
cd server
echo "📦 Installing dependencies..."
npm install

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOL
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
EOL
fi

# Start database if using Docker
if command -v docker &> /dev/null; then
    if ! docker ps | grep -q movwise-db; then
        if docker ps -a | grep -q movwise-db; then
            echo "🔄 Starting existing database container..."
            docker start movwise-db
        else
            echo "🐳 Creating database container..."
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
    else
        echo "✅ Database container is already running"
    fi
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start the backend server, run:"
echo "  cd server && npm run dev"
echo ""
echo "Or use the helper script:"
echo "  ./start-backend.sh"
