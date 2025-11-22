# Development Setup Guide

This guide explains how to run MovWise in development mode (without Docker).

## Prerequisites

- Node.js 20+ and npm
- PostgreSQL 16+ (or use Docker for database only)

## Quick Start

### Option 1: Full Docker Setup (Recommended)

```bash
docker-compose up -d
```

This starts frontend, backend, and database all together.

### Option 2: Local Development

#### 1. Start PostgreSQL Database

**Option A: Using Docker (easiest)**
```bash
docker run -d \
  --name movwise-db \
  -e POSTGRES_DB=movwise \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B: Local PostgreSQL**
Make sure PostgreSQL is running and create a database:
```bash
createdb movwise
```

#### 2. Start Backend API

```bash
# Install dependencies
cd server
npm install

# Create .env file (if it doesn't exist)
cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
EOF

# Start backend server
npm run dev
```

The backend will be available at http://localhost:3001

#### 3. Start Frontend

In a new terminal:

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev
```

The frontend will be available at http://localhost:8080

## Troubleshooting

### "Load failed" or "Cannot connect to server" Error

This means the backend API is not running. To fix:

1. **Check if backend is running:**
   ```bash
   curl http://localhost:3001/health
   ```
   Should return: `{"status":"ok","message":"MovWise API is running"}`

2. **Start the backend:**
   ```bash
   cd server
   npm run dev
   ```

3. **Check database connection:**
   - Make sure PostgreSQL is running
   - Verify database credentials in `server/.env`
   - Test connection:
     ```bash
     psql -h localhost -U postgres -d movwise
     ```

### CORS Errors

The backend has CORS enabled, but if you see CORS errors:
- Make sure you're using the Vite proxy (development mode)
- Or ensure `VITE_API_URL` is set correctly in your `.env` file

### Database Connection Errors

1. **Check PostgreSQL is running:**
   ```bash
   # Docker
   docker ps | grep postgres
   
   # Local
   pg_isready
   ```

2. **Verify database exists:**
   ```bash
   psql -U postgres -l | grep movwise
   ```

3. **Check connection settings in `server/.env`**

### Port Already in Use

If port 3001 or 8080 is already in use:

**Backend:**
- Change `PORT` in `server/.env`

**Frontend:**
- Change port in `vite.config.ts`:
  ```typescript
  server: {
    port: 8081, // Change this
  }
  ```

## Development Workflow

1. **Backend changes:** The server auto-reloads with `npm run dev` (using tsx watch)
2. **Frontend changes:** Vite hot-reloads automatically
3. **Database changes:** Restart backend to run migrations

## API Endpoints

- `GET /health` - Health check
- `POST /api/ilr/submit` - Submit ILR form
- `GET /api/ilr/submissions` - Get ILR submissions
- `POST /api/contact/submit` - Submit contact form
- `GET /api/contact/submissions` - Get contact submissions

## Environment Variables

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3001
```

### Backend (server/.env)
```env
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
```

## Testing the Setup

1. **Test backend:**
   ```bash
   curl http://localhost:3001/health
   ```

2. **Test frontend:**
   - Open http://localhost:8080
   - Try submitting the contact form
   - Try submitting the ILR estimator form

3. **Test database:**
   ```bash
   psql -U postgres -d movwise -c "SELECT COUNT(*) FROM contact_submissions;"
   psql -U postgres -d movwise -c "SELECT COUNT(*) FROM ilr_submissions;"
   ```

