/**
 * Authentication Service
 * Handles all authentication operations including token management and auto-refresh
 */

import axios, { AxiosInstance, AxiosError } from 'axios';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  RefreshTokenRequest,
  LogoutRequest,
  UserProfile,
  ApiResponse,
  SessionsResponse,
  RefreshTokenResponse,
} from '../types/auth.types';
import {
  TokenStorage,
  calculateTokenExpiry,
  isTokenExpired,
} from '../utils/security.utils';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

class AuthService {
  private api: AxiosInstance;
  private refreshPromise: Promise<string | null> | null = null;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Setup axios interceptors for automatic token injection and refresh
   */
  private setupInterceptors(): void {
    // Request interceptor - add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = TokenStorage.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and auto-refresh
    this.api.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as typeof error.config & { _retry?: boolean };

        // If 401 and we haven't retried yet, try to refresh token
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const newAccessToken = await this.refreshAccessToken();
            if (newAccessToken && originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, logout user
            this.handleAuthFailure();
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Register new user
   */
  async register(data: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/register', data);
      
      if (response.data.success && response.data.data) {
        this.storeAuthData(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Registration failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post<ApiResponse<AuthResponse>>('/auth/login', data);
      
      if (response.data.success && response.data.data) {
        this.storeAuthData(response.data.data);
        return response.data.data;
      }

      throw new Error(response.data.error?.message || 'Login failed');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshAccessToken(): Promise<string | null> {
    // If already refreshing, wait for that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = TokenStorage.getRefreshToken();
    if (!refreshToken) {
      return null;
    }

    this.refreshPromise = (async () => {
      try {
        const response = await this.api.post<ApiResponse<RefreshTokenResponse>>(
          '/auth/refresh',
          { refreshToken } as RefreshTokenRequest
        );

        if (response.data.success && response.data.data) {
          const { accessToken, expiresIn } = response.data.data;
          TokenStorage.setAccessToken(accessToken);
          TokenStorage.setTokenExpiry(calculateTokenExpiry(expiresIn));
          return accessToken;
        }

        return null;
      } catch (error) {
        console.error('Token refresh failed:', error);
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /**
   * Logout user
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = TokenStorage.getRefreshToken();
      if (refreshToken) {
        await this.api.post('/auth/logout', { refreshToken } as LogoutRequest);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Logout from all devices
   */
  async logoutAll(): Promise<void> {
    try {
      await this.api.post('/auth/logout-all');
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      this.clearAuthData();
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const profile = TokenStorage.getUserProfile() as UserProfile | null;
      if (profile) {
        return profile;
      }

      // If not in storage, fetch from API (if we add this endpoint)
      return null;
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  }

  /**
   * Get active sessions
   */
  async getSessions(): Promise<SessionsResponse> {
    try {
      const response = await this.api.get<ApiResponse<SessionsResponse>>('/auth/sessions');
      
      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      throw new Error('Failed to fetch sessions');
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        throw new Error(error.response.data.error.message);
      }
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    const token = TokenStorage.getAccessToken();
    const expiry = TokenStorage.getTokenExpiry();
    
    if (!token || !expiry) {
      return false;
    }

    // If token is expired, try to refresh
    if (isTokenExpired(expiry)) {
      // Trigger refresh in background
      this.refreshAccessToken().catch(() => {
        this.clearAuthData();
      });
      return false;
    }

    return true;
  }

  /**
   * Initialize auth state from storage
   */
  async initializeAuth(): Promise<UserProfile | null> {
    const token = TokenStorage.getAccessToken();
    const expiry = TokenStorage.getTokenExpiry();

    if (!token) {
      return null;
    }

    // If token is expired or about to expire (< 60 seconds), refresh it
    if (!expiry || isTokenExpired(expiry) || expiry - Date.now() < 60000) {
      const newToken = await this.refreshAccessToken();
      if (!newToken) {
        this.clearAuthData();
        return null;
      }
    }

    return this.getCurrentUser();
  }

  /**
   * Store authentication data
   */
  private storeAuthData(authData: AuthResponse): void {
    TokenStorage.setAccessToken(authData.accessToken);
    TokenStorage.setRefreshToken(authData.refreshToken);
    TokenStorage.setTokenExpiry(calculateTokenExpiry(authData.expiresIn));
    
    const profile: UserProfile = {
      id: authData.userId,
      email: authData.email,
      display_name: authData.display_name,
      vehicle_type: 'other', // Default, should be included in auth response
      privacy_mode: 'visible', // Default
      created_at: new Date().toISOString(),
    };
    
    TokenStorage.setUserProfile(profile);
  }

  /**
   * Clear authentication data
   */
  private clearAuthData(): void {
    TokenStorage.clearAll();
  }

  /**
   * Handle authentication failure
   */
  private handleAuthFailure(): void {
    this.clearAuthData();
    // Redirect to login page
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  /**
   * Setup automatic token refresh
   */
  startTokenRefreshTimer(): void {
    // Check token every minute
    setInterval(() => {
      const expiry = TokenStorage.getTokenExpiry();
      if (expiry && expiry - Date.now() < 300000) { // 5 minutes before expiry
        this.refreshAccessToken().catch(() => {
          this.handleAuthFailure();
        });
      }
    }, 60000); // Check every minute
  }
}

// Export singleton instance
export const authService = new AuthService();

// Start token refresh timer
authService.startTokenRefreshTimer();
