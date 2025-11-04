# SpeedLink Database Schema Planning

## 1. Entity-Relationship Diagram (ERD) Overview

**Entities:**
- User
- Party
- PartyMember
- Report
- Alert

**Relationships:**
- A User can join many Parties (via PartyMember)
- A Party can have many PartyMembers
- A User can submit many Reports
- A Report can be associated with a Party or global
- Alerts can be generated from Reports or external sources

## 2. SQL Table Definitions (PostgreSQL)

### User
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(100),
  vehicle_type VARCHAR(50),
  preferences JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Party
```sql
CREATE TABLE parties (
  id SERIAL PRIMARY KEY,
  leader_id INTEGER REFERENCES users(id),
  name VARCHAR(100),
  invite_code VARCHAR(16) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
);
```

### PartyMember
```sql
CREATE TABLE party_members (
  id SERIAL PRIMARY KEY,
  party_id INTEGER REFERENCES parties(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  joined_at TIMESTAMP DEFAULT NOW(),
  last_location GEOGRAPHY(POINT, 4326),
  last_speed REAL,
  status VARCHAR(50)
);
```

### Report
```sql
CREATE TABLE reports (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  party_id INTEGER REFERENCES parties(id),
  type VARCHAR(50),
  location GEOGRAPHY(POINT, 4326),
  description TEXT,
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Alert
```sql
CREATE TABLE alerts (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50),
  location GEOGRAPHY(POINT, 4326),
  description TEXT,
  source VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);
```

## 3. Indexing & Performance
- Index on `party_members.last_location` for fast geo-queries
- Index on `reports.location` and `alerts.location` for spatial lookups
- Index on `party_id` and `user_id` in `party_members` for quick joins

## 4. Notes
- Use PostGIS extension for spatial data (location fields)
- Consider partitioning `alerts` and `reports` tables for high volume
- All timestamps in UTC

---
_Prepared for Orion, November 2025_