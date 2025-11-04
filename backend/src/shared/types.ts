/**
 * SpeedLink Shared Types
 * Core TypeScript interfaces and types used across the backend
 */

// ==================== User Types ====================

export interface User {
  id: number;
  email: string;
  password_hash: string;
  display_name: string;
  vehicle_type: VehicleType;
  privacy_mode: PrivacyMode;
  created_at: Date;
  updated_at: Date;
}

export type VehicleType = 'motorcycle' | 'car' | 'truck' | 'other';
export type PrivacyMode = 'visible' | 'hidden';

export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  vehicle_type: VehicleType;
  privacy_mode: PrivacyMode;
  created_at: Date;
}

export interface CreateUserDto {
  email: string;
  password: string;
  display_name?: string;
  vehicle_type?: VehicleType;
}

export interface UpdateUserDto {
  display_name?: string;
  vehicle_type?: VehicleType;
  privacy_mode?: PrivacyMode;
}

// ==================== Authentication Types ====================

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthResponse {
  userId: number;
  email: string;
  display_name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface JWTPayload {
  sub: string; // user id
  email: string;
  iat: number;
  exp: number;
  iss: string;
  aud: string;
}

export interface RefreshToken {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked: boolean;
}

// ==================== Party Types ====================

export interface Party {
  id: number;
  code: string;
  name: string;
  leader_id: number;
  created_at: Date;
  expires_at: Date;
  is_active: boolean;
}

export interface PartyMember {
  id: number;
  party_id: number;
  user_id: number;
  joined_at: Date;
  last_seen_at: Date;
  is_online: boolean;
}

export interface PartyState {
  id: number;
  code: string;
  name: string;
  leader_id: number;
  members: PartyMemberState[];
  created_at: Date;
  expires_at: Date;
}

export interface PartyMemberState {
  userId: number;
  displayName: string;
  vehicleType: VehicleType;
  isOnline: boolean;
  location?: LocationUpdate;
  joinedAt: Date;
  lastSeenAt: Date;
}

export interface CreatePartyDto {
  name?: string;
}

export interface JoinPartyDto {
  code: string;
}

// ==================== Location Types ====================

export interface LocationUpdate {
  userId: number;
  partyId: number;
  latitude: number;
  longitude: number;
  speed: number; // km/h
  heading: number; // degrees (0-360)
  accuracy: number; // meters
  timestamp: Date;
}

export interface LocationBroadcast {
  userId: number;
  displayName: string;
  latitude: number;
  longitude: number;
  speed: number;
  heading: number;
  accuracy: number;
  timestamp: string;
}

// ==================== Message Types ====================

export interface PartyMessage {
  id: number;
  party_id: number;
  user_id: number;
  message: string;
  created_at: Date;
}

export interface MessageBroadcast {
  messageId: number;
  userId: number;
  displayName: string;
  message: string;
  timestamp: string;
}

// ==================== Alert Types ====================

export type AlertType = 'speed_camera' | 'police' | 'hazard' | 'accident' | 'weather' | 'road_condition';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface Alert {
  id: number;
  type: AlertType;
  severity: AlertSeverity;
  latitude: number;
  longitude: number;
  description: string;
  source: string;
  created_at: Date;
  expires_at: Date;
  verified: boolean;
}

export interface AlertBroadcast {
  alertId: number;
  type: AlertType;
  severity: AlertSeverity;
  latitude: number;
  longitude: number;
  description: string;
  distance: number; // meters from user
  timestamp: string;
}

// ==================== Report Types ====================

export type ReportType = 'speed_camera' | 'police' | 'hazard' | 'accident' | 'road_condition';
export type ReportStatus = 'pending' | 'verified' | 'rejected';

export interface Report {
  id: number;
  user_id: number;
  type: ReportType;
  latitude: number;
  longitude: number;
  description: string;
  status: ReportStatus;
  upvotes: number;
  downvotes: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreateReportDto {
  type: ReportType;
  latitude: number;
  longitude: number;
  description: string;
}

// ==================== WebSocket Event Types ====================

export interface SocketAuthPayload {
  token: string;
}

export interface PartyCreateEvent {
  name?: string;
}

export interface PartyJoinEvent {
  code: string;
}

export interface PartyLeaveEvent {
  partyId: number;
}

export interface PartyUpdateEvent {
  partyId: number;
  location: {
    latitude: number;
    longitude: number;
    speed: number;
    heading: number;
    accuracy: number;
  };
}

export interface PartyMessageEvent {
  partyId: number;
  message: string;
}

// ==================== API Response Types ====================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Health Check Types ====================

export interface HealthCheck {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  services: {
    database: ServiceHealth;
    redis: ServiceHealth;
  };
  uptime: number;
  version: string;
}

export interface ServiceHealth {
  status: 'up' | 'down';
  latency?: number;
  error?: string;
}

// ==================== Utility Types ====================

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type Timestamp = Date | string;
