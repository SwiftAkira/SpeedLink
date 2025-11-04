# Authentication Integration Guide

## Quick Start

### 1. Backend Setup

```bash
# Install dependencies (if not already done)
cd backend
npm install

# Start PostgreSQL and Redis (via Docker)
npm run docker:up

# Run database migrations (apply schema)
npm run db:migrate

# Start backend services
npm run dev:rest     # REST API on port 3001
npm run dev:realtime # WebSocket server on port 3002
```

### 2. Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_BASE_URL=http://localhost:3001/api/v1" > .env

# Start frontend
npm run dev  # Runs on port 5173
```

### 3. Integrate AuthProvider in App

Update `frontend/src/main.tsx`:

```typescript
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
```

### 4. Update App Routes

Update `frontend/src/App.tsx`:

```typescript
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Home from './pages/Home';
// ... other imports

function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />
      <Route path="/register" element={
        isAuthenticated ? <Navigate to="/" /> : <Register />
      } />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Home />
        </ProtectedRoute>
      } />
      <Route path="/map" element={
        <ProtectedRoute>
          <Map />
        </ProtectedRoute>
      } />
      <Route path="/party" element={
        <ProtectedRoute>
          <Party />
        </ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      
      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
```

### 5. Use Authentication in Components

```typescript
import { useAuth } from '../contexts/AuthContext';

function MyComponent() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <div>Please log in</div>;
  }

  return (
    <div>
      <h1>Welcome, {user?.display_name}!</h1>
      <p>Email: {user?.email}</p>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### 6. Make Authenticated API Calls

The `authService` automatically adds tokens to all requests:

```typescript
import axios from 'axios';

// This will automatically include the auth token
const response = await axios.get('http://localhost:3001/api/v1/user/profile');
```

Or use the authService directly:

```typescript
import { authService } from '../services/auth.service';

// All methods already authenticated
const sessions = await authService.getSessions();
await authService.logout();
await authService.logoutAll();
```

## Environment Variables

### Backend `.env`

```env
NODE_ENV=development

# Server Configuration
REST_API_PORT=3001
REST_API_HOST=0.0.0.0
REALTIME_PORT=3002
REALTIME_HOST=0.0.0.0

# CORS
CORS_ORIGIN=http://localhost:5173

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=speedlink_db
DB_USER=speedlink_user
DB_PASSWORD=speedlink_password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars-long-change-in-production
JWT_ACCESS_TOKEN_EXPIRY=15m
JWT_REFRESH_TOKEN_EXPIRY=7d

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_MAX=100
RATE_LIMIT_TIME_WINDOW=60000

# Logging
LOG_LEVEL=info
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_WS_URL=ws://localhost:3002
```

## Testing Authentication

### 1. Register a New User

```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "display_name": "Test User",
    "vehicle_type": "motorcycle"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:3001/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "userId": 1,
    "email": "test@example.com",
    "display_name": "Test User",
    "accessToken": "eyJhbGc...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 900
  }
}
```

### 3. Access Protected Endpoint

```bash
curl -X GET http://localhost:3001/api/v1/auth/sessions \
  -H "Authorization: Bearer eyJhbGc..."
```

### 4. Logout

```bash
curl -X POST http://localhost:3001/api/v1/auth/logout \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "refresh_token_here"
  }'
```

## Troubleshooting

### Issue: "CORS Error"

**Solution:** Ensure `CORS_ORIGIN` in backend `.env` matches your frontend URL.

### Issue: "Token Expired"

**Solution:** The frontend should auto-refresh. If not, logout and login again.

### Issue: "Account Locked"

**Solution:** Wait 15 minutes or clear Redis: `redis-cli FLUSHALL`

### Issue: "Invalid Token"

**Solution:** 
1. Check JWT_SECRET is set correctly
2. Ensure token isn't blacklisted
3. Check token hasn't expired

### Issue: "Database Connection Error"

**Solution:**
```bash
cd backend
npm run docker:up  # Start PostgreSQL
npm run db:migrate # Run migrations
```

## Security Checklist

- [ ] Change JWT_SECRET in production
- [ ] Use HTTPS in production
- [ ] Set secure cookies for tokens (httpOnly, secure, sameSite)
- [ ] Enable rate limiting on production
- [ ] Use environment-specific CORS origins
- [ ] Monitor auth_audit_log for suspicious activity
- [ ] Set up alerts for failed login attempts
- [ ] Regular security audits
- [ ] Keep dependencies updated

## Next Steps

1. ✅ Authentication implemented
2. ⏭️ Implement Party/Group Creation (Story 3.2)
3. ⏭️ Integrate with WebSocket for real-time features
4. ⏭️ Add user profile management endpoints
5. ⏭️ Implement password reset flow
6. ⏭️ Add email verification

---

**Status:** 🟢 Ready for Development

All authentication infrastructure is in place and ready for integration with the rest of the application.
