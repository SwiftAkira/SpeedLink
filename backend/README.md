# SpeedLink Backend

Production-ready backend services for SpeedLink MVP, featuring ultra-low-latency real-time communication (≤800ms), RESTful API, and scalable architecture.

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      BACKEND SERVICES                        │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌───────────────────────┐   ┌────────────────────────┐   │
│  │   REST API Service     │   │  Real-Time Service     │   │
│  │   (Node.js + Fastify)  │   │  (Node.js + Socket.IO) │   │
│  │   Port: 3001           │   │  Port: 3002            │   │
│  └───────────┬────────────┘   └────────┬───────────────┘   │
│              │                         │                    │
│              └─────────┬───────────────┘                    │
│                        │                                    │
│       ┌────────────────┼────────────────┐                  │
│       │                │                │                  │
│  ┌────▼─────┐    ┌─────▼──────┐  ┌─────▼─────┐           │
│  │PostgreSQL│    │   Redis    │  │   Redis   │           │
│  │  (Data)  │    │  (Cache)   │  │ (Pub/Sub) │           │
│  └──────────┘    └────────────┘  └───────────┘           │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## ✨ Features

### REST API Service
- **Authentication**: JWT-based with refresh tokens, bcrypt password hashing
- **User Management**: Registration, login, profile management, privacy controls
- **Party Operations**: Create, join, leave parties with unique 6-digit codes
- **Security**: Rate limiting, CORS, Helmet, input validation with Zod
- **Health Checks**: `/health`, `/ready`, `/live` endpoints

### Real-Time Service
- **WebSocket Communication**: Socket.IO with auto-reconnection
- **Party Rooms**: Isolated real-time channels per party
- **Location Broadcasting**: Sub-second location updates (target: ≤800ms)
- **Presence Management**: Online/offline status tracking
- **Messaging**: Real-time party chat
- **Horizontal Scaling**: Redis adapter for multi-instance deployment

### Database Layer
- **PostgreSQL 15**: ACID-compliant relational database
- **Redis 7**: In-memory caching and pub/sub
- **Connection Pooling**: Optimized for high concurrency
- **Migrations**: SQL schema with automated deployment

## 🚀 Quick Start

### Prerequisites
- Node.js 20+ LTS
- PostgreSQL 15+
- Redis 7+
- npm 10+

### Option 1: Docker (Recommended for Development)

```powershell
# Start PostgreSQL and Redis
npm run docker:up

# The services will be available at:
# PostgreSQL: localhost:5432
# Redis: localhost:6379
```

### Option 2: Local Services

Install PostgreSQL and Redis locally, then configure `.env` file.

### Installation

```powershell
# Install dependencies
npm install

# Copy environment template
cp .env.example .env

# Edit .env and update credentials (IMPORTANT: Change JWT_SECRET!)

# Run database migrations
npm run build
npm run db:migrate
```

### Development

```powershell
# Run both services concurrently
npm run dev

# Or run individually:
npm run dev:rest      # REST API on port 3001
npm run dev:realtime  # Real-Time on port 3002
```

### Production Build

```powershell
# Build TypeScript
npm run build

# Start services
npm start              # Both services
npm run start:rest     # REST API only
npm run start:realtime # Real-Time only
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config.ts                 # Environment configuration with Zod validation
│   ├── index.ts                  # Main entry point (starts both services)
│   │
│   ├── rest-api/                 # REST API Service
│   │   ├── server.ts             # Fastify server setup
│   │   ├── routes/
│   │   │   ├── auth.routes.ts    # Authentication endpoints
│   │   │   ├── user.routes.ts    # User profile endpoints
│   │   │   ├── party.routes.ts   # Party management endpoints
│   │   │   └── health.routes.ts  # Health check endpoints
│   │   └── middleware/
│   │
│   ├── realtime/                 # Real-Time Service
│   │   ├── server.ts             # Socket.IO server setup
│   │   └── events/               # WebSocket event handlers
│   │
│   ├── database/
│   │   ├── connection.ts         # PostgreSQL connection pool
│   │   ├── redis.ts              # Redis client singleton
│   │   ├── schema.sql            # Database schema
│   │   └── migrate.ts            # Migration runner
│   │
│   ├── services/
│   │   ├── auth.service.ts       # Authentication logic
│   │   └── party.service.ts      # Party management logic
│   │
│   ├── shared/
│   │   └── types.ts              # TypeScript interfaces and types
│   │
│   └── utils/
│       └── logger.ts             # Pino structured logging
│
├── config/                       # Configuration files
├── tests/                        # Test files
├── .env.example                  # Environment template
├── .env                          # Local environment (git-ignored)
├── tsconfig.json                 # TypeScript configuration
├── docker-compose.yml            # Docker services definition
└── package.json                  # Dependencies and scripts
```

## 🔌 API Endpoints

### Authentication

```
POST   /api/v1/auth/register    Register new user
POST   /api/v1/auth/login       Login
POST   /api/v1/auth/refresh     Refresh access token
```

### User Management

```
GET    /api/v1/user/profile     Get user profile (authenticated)
PUT    /api/v1/user/profile     Update user profile (authenticated)
```

### Party Management

```
POST   /api/v1/party            Create party (authenticated)
POST   /api/v1/party/join       Join party by code (authenticated)
GET    /api/v1/party/:id        Get party details (authenticated)
DELETE /api/v1/party/:id/leave  Leave party (authenticated)
GET    /api/v1/party/my/parties Get user's active parties (authenticated)
```

### Health Checks

```
GET    /api/v1/health           Full health check
GET    /api/v1/health/ready     Readiness probe
GET    /api/v1/health/live      Liveness probe
```

## 🔄 WebSocket Events

### Client → Server

```typescript
'party:create'    // Create new party
'party:join'      // Join party by code
'party:leave'     // Leave party
'party:update'    // Send location update
'party:message'   // Send chat message
```

### Server → Client

```typescript
'party:created'           // Party created successfully
'party:joined'            // Joined party successfully
'party:left'              // Left party successfully
'party:member-joined'     // Another member joined
'party:member-left'       // Another member left
'party:member-online'     // Member came online
'party:member-offline'    // Member went offline
'party:location-update'   // Location update from member
'party:message-received'  // Chat message from member
'error'                   // Error occurred
```

## 🔒 Security

- **JWT Authentication**: RS256 algorithm, 15-minute access tokens
- **Password Hashing**: bcrypt with 12 rounds
- **Rate Limiting**: 100 requests per minute per IP
- **CORS**: Configurable allowed origins
- **Input Validation**: Zod schemas for all endpoints
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Helmet middleware

## 📊 Monitoring

### Logging
Structured JSON logs using Pino:
- Request/response logging
- Error tracking with stack traces
- Performance metrics
- Connection events

### Health Checks
- Database connection status and latency
- Redis connection status and latency
- Service uptime
- Version information

## 🧪 Testing

```powershell
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- auth.service.test.ts
```

## 🐳 Docker Deployment

```powershell
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 🌐 Environment Variables

See `.env.example` for all available configuration options.

**Critical Settings:**
- `JWT_SECRET`: **MUST** be changed to a secure random string (32+ characters)
- `DATABASE_URL` or individual `DB_*` variables
- `REDIS_HOST` and `REDIS_PORT`
- `CORS_ORIGIN`: Comma-separated list of allowed origins

## 📈 Performance

### Target Metrics
- **Real-time latency**: ≤800ms (95th percentile)
- **REST API response time**: <100ms (95th percentile)
- **Concurrent parties**: 1000+
- **WebSocket connections per instance**: 10,000+

### Optimization Features
- Connection pooling (PostgreSQL)
- Redis caching for party state
- Socket.IO Redis adapter for horizontal scaling
- Efficient pub/sub architecture
- Automatic cleanup of expired data

## 🤝 Contributing

1. Follow TypeScript strict mode
2. Use Prettier for code formatting: `npm run format`
3. Run linter: `npm run lint`
4. Write tests for new features
5. Update documentation

## 📝 License

MIT

## 🙋 Support

For issues and questions, contact the SpeedLink development team.

---

**Built with ❤️ for SpeedLink MVP**  
*Last Updated: November 4, 2025*
