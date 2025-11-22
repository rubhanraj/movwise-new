# Docker Setup for MovWise

This guide explains how to run MovWise using Docker and Docker Compose.

## Prerequisites

- Docker Desktop installed and running
- Docker Compose (included with Docker Desktop)

## Quick Start

1. **Clone the repository** (if you haven't already)
   ```bash
   git clone <repository-url>
   cd movwise-new
   ```

2. **Create environment file** (optional, defaults are provided)
   ```bash
   cp .env.example .env
   # Edit .env if needed
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Access the application**
   - Frontend: http://localhost:8080
   - Backend API: http://localhost:3001
   - Database: localhost:5432

## Services

### Frontend
- **Port**: 8080 (configurable via `FRONTEND_PORT`)
- **URL**: http://localhost:8080
- Built with Vite and served via Nginx

### Backend API
- **Port**: 3001
- **URL**: http://localhost:3001
- **Health Check**: http://localhost:3001/health
- Express.js server with PostgreSQL database

### Database
- **Type**: PostgreSQL 16
- **Port**: 5432 (configurable via `DB_PORT`)
- **Database**: movwise (configurable via `DB_NAME`)
- **User**: postgres (configurable via `DB_USER`)
- **Password**: postgres (configurable via `DB_PASSWORD`)
- Data is persisted in a Docker volume

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432
FRONTEND_PORT=8080
VITE_API_URL=http://localhost:3001
```

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f postgres
```

### Rebuild services
```bash
# Rebuild all
docker-compose build

# Rebuild specific service
docker-compose build backend
docker-compose build frontend
```

### Stop and remove volumes (⚠️ deletes database data)
```bash
docker-compose down -v
```

### Access database
```bash
# Using psql
docker-compose exec postgres psql -U postgres -d movwise

# Or using docker exec
docker exec -it movwise-db psql -U postgres -d movwise
```

## Development Mode

For development, you can run services individually:

### Backend only
```bash
cd server
npm install
npm run dev
```

### Frontend only
```bash
npm install
npm run dev
```

### Database only
```bash
docker-compose up -d postgres
```

## API Endpoints

- `POST /api/ilr/submit` - Submit ILR eligibility form
- `GET /api/ilr/submissions` - Get all submissions (with pagination)
- `GET /api/ilr/submission/:id` - Get specific submission
- `GET /health` - Health check

## Troubleshooting

### Port already in use
If port 8080, 3001, or 5432 is already in use, change them in `.env`:
```env
FRONTEND_PORT=8081
DB_PORT=5433
```

### Database connection issues
1. Check if postgres container is running: `docker-compose ps`
2. Check database logs: `docker-compose logs postgres`
3. Verify environment variables in `.env`

### Frontend can't connect to backend
1. Ensure backend is running: `docker-compose ps`
2. Check backend logs: `docker-compose logs backend`
3. Verify `VITE_API_URL` in `.env` matches backend URL

### Rebuild after code changes
```bash
docker-compose up -d --build
```

## Production Deployment

For production deployment:

1. Update environment variables in `.env`
2. Use strong database passwords
3. Configure proper CORS settings
4. Set up SSL/TLS certificates
5. Use a reverse proxy (e.g., Traefik, Nginx)
6. Configure proper backup strategy for database

## Database Migrations

The database schema is automatically created on first startup. If you need to reset the database:

```bash
docker-compose down -v
docker-compose up -d
```

This will delete all data and recreate the database with fresh schema.

