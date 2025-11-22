#!/bin/bash

# MovWise Docker Quick Start Script

echo "🚀 Starting MovWise with Docker Compose..."

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker Desktop and try again."
    exit 1
fi

# Check if .env exists, if not create from example
if [ ! -f .env ]; then
    echo "📝 Creating .env file from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ Created .env file. You may want to update it with your settings."
    else
        echo "⚠️  No .env.example found. Using default values."
    fi
fi

# Start services
echo "🐳 Starting Docker containers..."
docker-compose up -d --build

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Check service status
echo ""
echo "📊 Service Status:"
docker-compose ps

echo ""
echo "✅ MovWise is starting up!"
echo ""
echo "📍 Access the application:"
echo "   Frontend: http://localhost:8080"
echo "   Backend API: http://localhost:3001/health"
echo ""
echo "📝 View logs:"
echo "   docker-compose logs -f"
echo ""
echo "🛑 Stop services:"
echo "   docker-compose down"
echo ""

