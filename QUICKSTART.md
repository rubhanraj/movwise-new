# Quick Start Guide - Fix "Internal Server Error"

If you're seeing "Internal Server Error" when submitting forms, follow these steps:

## Step 1: Install Backend Dependencies

```bash
cd server
npm install
```

## Step 2: Start PostgreSQL Database

**Option A: Using Docker (Recommended)**
```bash
docker run -d \
  --name movwise-db \
  -e POSTGRES_DB=movwise \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:16-alpine
```

**Option B: Check if PostgreSQL is already running**
```bash
# Check if database container exists
docker ps -a | grep movwise-db

# If it exists but stopped, start it
docker start movwise-db

# If it doesn't exist, create it (see Option A)
```

## Step 3: Create Backend .env File

```bash
cd server
cat > .env << EOF
NODE_ENV=development
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=movwise
DB_USER=postgres
DB_PASSWORD=postgres
EOF
```

## Step 4: Start Backend Server

```bash
cd server
npm run dev
```

You should see:
```
✅ Database connected
✅ Database tables initialized
🚀 Server running on port 3001
```

## Step 5: Test the Backend

In another terminal:
```bash
curl http://localhost:3001/health
```

Should return: `{"status":"ok","message":"MovWise API is running"}`

## Step 6: Test Contact Form

Now try submitting the contact form again. It should work!

## Troubleshooting

### "Cannot connect to database"
- Make sure PostgreSQL is running: `docker ps | grep postgres`
- Check database credentials match in `server/.env`
- Test connection: `psql -h localhost -U postgres -d movwise`

### "Port 3001 already in use"
- Find what's using it: `lsof -i :3001`
- Kill the process or change PORT in `server/.env`

### "Module not found" errors
- Make sure you ran `npm install` in the `server` directory
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`

### Still getting errors?
Check the backend console output - it will show detailed error messages.

