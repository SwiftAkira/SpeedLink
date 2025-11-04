# SpeedLink Backend - Quick Start Guide

Get the SpeedLink backend running in under 5 minutes!

## ⚡ Super Quick Start (Docker)

```powershell
# 1. Clone and navigate to backend directory
cd backend

# 2. Install dependencies
npm install

# 3. Start PostgreSQL and Redis with Docker
npm run docker:up

# 4. Copy environment file
cp .env.example .env
# Note: The .env file is pre-configured for Docker services

# 5. Run database migrations
npm run build
npm run db:migrate

# 6. Start development servers
npm run dev
```

**That's it!** 🎉

- REST API: http://localhost:3001
- Real-Time: http://localhost:3002
- Health check: http://localhost:3001/api/v1/health

## 📋 Step-by-Step Guide

### Step 1: Install Dependencies

```powershell
npm install
```

This installs all required packages including Fastify, Socket.IO, PostgreSQL client, Redis, and TypeScript.

### Step 2: Start Database Services

**Option A: Docker (Recommended)**

```powershell
npm run docker:up
```

This starts PostgreSQL on port 5432 and Redis on port 6379.

**Option B: Local Installation**

If you have PostgreSQL and Redis installed locally:
- PostgreSQL: Ensure running on localhost:5432
- Redis: Ensure running on localhost:6379

### Step 3: Configure Environment

```powershell
# Copy the example environment file
cp .env.example .env
```

**Important:** Edit `.env` and change the `JWT_SECRET`:

```env
JWT_SECRET=your-super-secret-random-string-at-least-32-characters-long
```

### Step 4: Initialize Database

```powershell
# Build TypeScript
npm run build

# Run migrations (creates tables, indexes, seed data)
npm run db:migrate
```

This creates all database tables and adds sample data.

### Step 5: Start Services

**Development Mode (with hot reload):**

```powershell
npm run dev
```

Or start services individually:

```powershell
# Terminal 1: REST API
npm run dev:rest

# Terminal 2: Real-Time Service
npm run dev:realtime
```

**Production Mode:**

```powershell
npm run build
npm start
```

## 🧪 Test the API

### Check Health

```powershell
curl http://localhost:3001/api/v1/health
```

### Register a User

```powershell
curl -X POST http://localhost:3001/api/v1/auth/register `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123","display_name":"Test User"}'
```

### Login

```powershell
curl -X POST http://localhost:3001/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d '{"email":"test@example.com","password":"password123"}'
```

Save the `accessToken` from the response!

### Create a Party

```powershell
curl -X POST http://localhost:3001/api/v1/party `
  -H "Content-Type: application/json" `
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" `
  -d '{"name":"Test Party"}'
```

## 🔌 WebSocket Connection (Browser Console)

```javascript
// Connect to real-time server
const socket = io('http://localhost:3002', {
  auth: {
    token: 'YOUR_ACCESS_TOKEN'
  }
});

// Listen for connection
socket.on('connect', () => {
  console.log('Connected!', socket.id);
});

// Create a party
socket.emit('party:create', { name: 'My Party' });

// Listen for party created
socket.on('party:created', (data) => {
  console.log('Party created:', data);
});
```

## 📦 What's Included

After setup, you'll have:

✅ REST API server on port 3001  
✅ Real-Time WebSocket server on port 3002  
✅ PostgreSQL database with schema  
✅ Redis cache and pub/sub  
✅ Sample admin user (admin@speedlink.app / admin123)  
✅ Sample speed camera alerts  

## 🛠️ Common Commands

```powershell
# Development
npm run dev              # Start both services with hot reload
npm run dev:rest         # Start REST API only
npm run dev:realtime     # Start Real-Time only

# Production
npm run build            # Compile TypeScript
npm start                # Start both services
npm run start:rest       # Start REST API only
npm run start:realtime   # Start Real-Time only

# Database
npm run db:migrate       # Run migrations

# Docker
npm run docker:up        # Start PostgreSQL and Redis
npm run docker:down      # Stop services
npm run docker:logs      # View logs

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm test                 # Run tests
```

## 🐛 Troubleshooting

### Error: "Cannot find module"
```powershell
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Error: "Database connection failed"
```powershell
# Check if PostgreSQL is running
npm run docker:up

# Verify connection in .env file matches Docker settings
```

### Error: "Redis connection failed"
```powershell
# Check if Redis is running
npm run docker:up

# Test Redis connection
redis-cli ping  # Should return "PONG"
```

### Error: "JWT_SECRET validation failed"
```powershell
# Ensure JWT_SECRET in .env is at least 32 characters
# Example: JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0
```

### Port Already in Use
```powershell
# Change ports in .env:
REST_API_PORT=3011
REALTIME_PORT=3012
```

## 📖 Next Steps

1. **Read the Full README**: `README.md` for complete documentation
2. **Explore the API**: See all endpoints in the README
3. **Test WebSocket Events**: See event list in README
4. **Review the Code**: Start with `src/rest-api/server.ts` and `src/realtime/server.ts`
5. **Check the Architecture**: See `docs/SpeedLink-architecture.md` in parent directory

## 🎯 Default Credentials

**Admin Account** (created by migration):
- Email: `admin@speedlink.app`
- Password: `admin123`

**⚠️ Change this password in production!**

## 📊 Monitoring

While services are running, monitor logs:

```powershell
# Watch logs in development mode
npm run dev

# Check health status
curl http://localhost:3001/api/v1/health
```

## 🚀 Ready to Build!

Your backend is now running and ready for frontend integration!

- Connect your React frontend to `http://localhost:3001` (REST API)
- Connect Socket.IO client to `http://localhost:3002` (Real-Time)

Happy coding! 🎉

---

**Need Help?** Check the full README or contact the development team.
