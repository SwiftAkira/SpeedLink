/**
 * Authentication Types
 * TypeScript types for authentication flows
 */

export type VehicleType = 'motorcycle' | 'car' | 'truck' | 'other';
export type PrivacyMode = 'visible' | 'hidden';

// User Profile
export interface UserProfile {
  id: number;
  email: string;
  display_name: string;
  vehicle_type: VehicleType;
  privacy_mode: PrivacyMode;
  created_at: string;
}

// Authentication Requests
export interface RegisterRequest {
  email: string;
  password: string;
  display_name?: string;
  vehicle_type?: VehicleType;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken: string;
}

// Authentication Responses
export interface AuthResponse {
  userId: number;
  email: string;
  display_name: string;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  timestamp: string;
}

// Authentication State
export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: UserProfile | null;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: number | null;
}

// Password Strength
export interface PasswordStrength {
  score: number; // 0-4
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  feedback: string[];
  meetsMinimum: boolean;
}

// Session Info
export interface SessionInfo {
  id: number;
  created_at: string;
  expires_at: string;
  is_current?: boolean;
}

export interface SessionsResponse {
  sessions: SessionInfo[];
  count: number;
}
