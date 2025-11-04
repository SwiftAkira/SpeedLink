/**
 * Authentication Context
 * Provides authentication state and methods throughout the app
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import type {
  UserProfile,
  LoginRequest,
  RegisterRequest,
  AuthState,
} from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  logoutAll: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    accessToken: null,
    refreshToken: null,
    tokenExpiry: null,
  });

  /**
   * Initialize authentication state on mount
   */
  useEffect(() => {
    const initAuth = async () => {
      try {
        const user = await authService.initializeAuth();
        if (user) {
          setState({
            isAuthenticated: true,
            isLoading: false,
            user,
            accessToken: null, // We don't expose tokens directly
            refreshToken: null,
            tokenExpiry: null,
          });
        } else {
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            accessToken: null,
            refreshToken: null,
            tokenExpiry: null,
          });
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          accessToken: null,
          refreshToken: null,
          tokenExpiry: null,
        });
      }
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.login(credentials);
      const user: UserProfile = {
        id: response.userId,
        email: response.email,
        display_name: response.display_name,
        vehicle_type: 'other', // Should come from response
        privacy_mode: 'visible',
        created_at: new Date().toISOString(),
      };

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Register new user
   */
  const register = useCallback(async (data: RegisterRequest) => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      const response = await authService.register(data);
      const user: UserProfile = {
        id: response.userId,
        email: response.email,
        display_name: response.display_name,
        vehicle_type: data.vehicle_type || 'other',
        privacy_mode: 'visible',
        created_at: new Date().toISOString(),
      };

      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
    } catch (error) {
      setState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
    }
  }, []);

  /**
   * Logout from all devices
   */
  const logoutAll = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    
    try {
      await authService.logoutAll();
    } catch (error) {
      console.error('Logout all error:', error);
    } finally {
      setState({
        isAuthenticated: false,
        isLoading: false,
        user: null,
        accessToken: null,
        refreshToken: null,
        tokenExpiry: null,
      });
    }
  }, []);

  /**
   * Refresh user profile
   */
  const refreshUser = useCallback(async () => {
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        setState(prev => ({ ...prev, user }));
      }
    } catch (error) {
      console.error('Refresh user error:', error);
    }
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    logoutAll,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * Hook to require authentication
 */
export function useRequireAuth(): AuthContextType {
  const auth = useAuth();
  
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      window.location.href = '/login';
    }
  }, [auth.isAuthenticated, auth.isLoading]);

  return auth;
}
