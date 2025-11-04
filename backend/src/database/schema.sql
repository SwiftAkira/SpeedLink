-- SpeedLink Database Schema
-- PostgreSQL 15+
-- Version: 1.0
-- Created: November 4, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==================== Users Table ====================

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL DEFAULT 'other' CHECK (vehicle_type IN ('motorcycle', 'car', 'truck', 'other')),
    privacy_mode VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (privacy_mode IN ('visible', 'hidden')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at DESC);

-- ==================== Refresh Tokens Table ====================

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    revoked BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_token_hash ON refresh_tokens(token_hash);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- ==================== Parties Table ====================

CREATE TABLE IF NOT EXISTS parties (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    leader_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_parties_code ON parties(code);
CREATE INDEX idx_parties_leader_id ON parties(leader_id);
CREATE INDEX idx_parties_is_active ON parties(is_active);
CREATE INDEX idx_parties_expires_at ON parties(expires_at);

-- ==================== Party Members Table ====================

CREATE TABLE IF NOT EXISTS party_members (
    id SERIAL PRIMARY KEY,
    party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT TRUE,
    UNIQUE(party_id, user_id)
);

CREATE INDEX idx_party_members_party_id ON party_members(party_id);
CREATE INDEX idx_party_members_user_id ON party_members(user_id);
CREATE INDEX idx_party_members_is_online ON party_members(is_online);

-- ==================== Reports Table ====================

CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL CHECK (type IN ('speed_camera', 'police', 'hazard', 'accident', 'road_condition')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected')),
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_user_id ON reports(user_id);
CREATE INDEX idx_reports_type ON reports(type);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- ==================== Auth Audit Log Table ====================

CREATE TABLE IF NOT EXISTS auth_audit_log (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('login', 'logout', 'register', 'password_change', 'token_refresh', 'failed_login')),
    metadata JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_auth_audit_user_id ON auth_audit_log(user_id);
CREATE INDEX idx_auth_audit_event_type ON auth_audit_log(event_type);
CREATE INDEX idx_auth_audit_created_at ON auth_audit_log(created_at DESC);

-- ==================== Alerts Table ====================

CREATE TABLE IF NOT EXISTS alerts (
    id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL CHECK (type IN ('speed_camera', 'police', 'hazard', 'accident', 'weather', 'road_condition')),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    description TEXT,
    source VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_alerts_type ON alerts(type);
CREATE INDEX idx_alerts_severity ON alerts(severity);
CREATE INDEX idx_alerts_location ON alerts(latitude, longitude);
CREATE INDEX idx_alerts_expires_at ON alerts(expires_at);
CREATE INDEX idx_alerts_verified ON alerts(verified);

-- ==================== Party Messages Table ====================

CREATE TABLE IF NOT EXISTS party_messages (
    id SERIAL PRIMARY KEY,
    party_id INTEGER NOT NULL REFERENCES parties(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_party_messages_party_id ON party_messages(party_id);
CREATE INDEX idx_party_messages_created_at ON party_messages(created_at DESC);

-- ==================== Audit Logs Table ====================

CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id INTEGER,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at DESC);

-- ==================== Functions and Triggers ====================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for reports table
CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==================== Seed Data (Optional) ====================

-- Insert default admin user (password: "admin123" - hashed with bcrypt rounds=12)
-- WARNING: Change this password in production!
INSERT INTO users (email, password_hash, display_name, vehicle_type)
VALUES (
    'admin@speedlink.app',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/Kwxz2tMqYy9.JfEyS',
    'Admin',
    'car'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample speed camera alerts
INSERT INTO alerts (type, severity, latitude, longitude, description, source, expires_at, verified)
VALUES
    ('speed_camera', 'medium', 34.0522, -118.2437, 'Fixed speed camera on I-10', 'official', NOW() + INTERVAL '1 year', true),
    ('speed_camera', 'medium', 37.7749, -122.4194, 'Speed trap area on Highway 101', 'official', NOW() + INTERVAL '1 year', true)
ON CONFLICT DO NOTHING;

-- ==================== Views ====================

-- Active parties view with member counts
CREATE OR REPLACE VIEW active_parties_view AS
SELECT 
    p.id,
    p.code,
    p.name,
    p.leader_id,
    u.display_name as leader_name,
    COUNT(pm.id) as member_count,
    p.created_at,
    p.expires_at
FROM parties p
JOIN users u ON p.leader_id = u.id
LEFT JOIN party_members pm ON p.id = pm.party_id
WHERE p.is_active = true
    AND p.expires_at > CURRENT_TIMESTAMP
GROUP BY p.id, p.code, p.name, p.leader_id, u.display_name, p.created_at, p.expires_at;

-- User statistics view
CREATE OR REPLACE VIEW user_statistics AS
SELECT 
    u.id,
    u.email,
    u.display_name,
    COUNT(DISTINCT pm.party_id) as parties_joined,
    COUNT(DISTINCT r.id) as reports_submitted,
    u.created_at
FROM users u
LEFT JOIN party_members pm ON u.id = pm.user_id
LEFT JOIN reports r ON u.id = r.user_id
GROUP BY u.id, u.email, u.display_name, u.created_at;

-- ==================== Cleanup Jobs ====================

-- Function to cleanup expired parties
CREATE OR REPLACE FUNCTION cleanup_expired_parties()
RETURNS void AS $$
BEGIN
    UPDATE parties
    SET is_active = false
    WHERE expires_at < CURRENT_TIMESTAMP
        AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired refresh tokens
CREATE OR REPLACE FUNCTION cleanup_expired_refresh_tokens()
RETURNS void AS $$
BEGIN
    DELETE FROM refresh_tokens
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Function to cleanup expired alerts
CREATE OR REPLACE FUNCTION cleanup_expired_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM alerts
    WHERE expires_at < CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;
