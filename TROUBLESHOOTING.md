# Troubleshooting Guide - 500 Internal Server Error

If you're seeing a 500 Internal Server Error when submitting forms, follow these steps:

## Step 1: Check if Backend is Running

```bash
curl http://localhost:3001/health
```

**Expected response:**
```json
{"status":"ok","message":"MovWise API is running"}
```

**If it fails:**
- Backend is not running
- Start it: `cd server && npm run dev`

## Step 2: Check Database Connection

Run the database check script:
```bash
./check-database.sh
```

This will:
- ✅ Check if database container is running
- ✅ Test database connection
- ✅ Verify tables exist
- ✅ Create missing tables if needed

## Step 3: Check Backend Console Logs

Look at the terminal where you started the backend (`npm run dev`). You should see:

**✅ Success messages:**
```
✅ Database connected
✅ Database tables initialized
✅ All tables created successfully
🚀 Server running on port 3001
```

**❌ Error messages to look for:**
- `ECONNREFUSED` → Database not running
- `relation "contact_submissions" does not exist` → Tables not created
- `password authentication failed` → Wrong database credentials

## Step 4: Common Fixes

### Fix 1: Database Not Running

**Start PostgreSQL:**
```bash
docker run -d \
  --name movwise-db \
  -e POSTGRES_DB=movwise \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

**Or if container exists but stopped:**
```bash
docker start movwise-db
```

### Fix 2: Tables Don't Exist

**Option A: Restart backend** (tables auto-create on startup)
```bash
cd server
npm run dev
```

**Option B: Manually create tables**
```bash
./check-database.sh
```

### Fix 3: Wrong Database Credentials

Check `server/.env` file:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
```

Make sure these match your PostgreSQL setup.

### Fix 4: Backend Dependencies Not Installed

```bash
cd server
npm install
```

## Step 5: Test the API Directly

```bash
curl -X POST http://localhost:3001/api/contact/submit \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com"
  }'
```

**Expected response:**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "data": {
    "id": 1,
    "createdAt": "2025-01-XX..."
  }
}
```

**If you get an error**, check the backend console for details.

## Step 6: Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for error messages
2. **Network tab** - Click on the failed request to see response details

## Quick Fix Script

Run this to fix common issues:

```bash
# 1. Check and start database
if ! docker ps | grep -q movwise-db; then
    if docker ps -a | grep -q movwise-db; then
        docker start movwise-db
    else
        docker run -d --name movwise-db \
          -e POSTGRES_DB=movwise \
          -e POSTGRES_USER=postgres \
          -e POSTGRES_PASSWORD=postgres \
          -p 5432:5432 \
          postgres:16-alpine
        sleep 5
    fi
fi

# 2. Install backend dependencies
cd server
if [ ! -d "node_modules" ]; then
    npm install
fi

# 3. Start backend
npm run dev
```

## Still Not Working?

1. **Check backend logs** - The console will show the exact error
2. **Check database logs** - `docker logs movwise-db`
3. **Verify ports** - Make sure 3001 and 5432 are not in use by other apps
4. **Restart everything** - Stop all services and restart fresh

## Using Docker Compose (Easiest)

If manual setup is too complex, use Docker Compose:

```bash
docker-compose down
docker-compose up -d --build
```

This starts everything together and handles all setup automatically.

