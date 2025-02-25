/**
 * Custom React hook for authentication management with Spring Security integration
 * Provides secure authentication workflows with Virtual Thread processing support
 * and container-aware session management capabilities.
 * @version 1.0.0
 */

import { useCallback, useEffect } from 'react';
import { useAuthContext } from '../context/AuthContext';
import type { User, AuthRequest, ResourceType, AccessLevel } from '../types/user.types';

/**
 * Interface for authentication hook return value
 */
interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (resourceType: ResourceType, requiredAccess: AccessLevel) => boolean;
  refreshSession: () => Promise<void>;
  validateToken: () => Promise<boolean>;
}

/**
 * Custom hook that provides authentication functionality with Spring Security integration
 * and Virtual Thread processing support
 * @returns {UseAuthReturn} Authentication state and methods
 */
export const useAuth = (): UseAuthReturn => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: contextLogin,
    logout: contextLogout,
    checkPermission: contextCheckPermission,
    refreshToken,
    validateSession
  } = useAuthContext();

  /**
   * Handles user login with Spring Security token generation
   * Leverages Virtual Thread processing for enhanced performance
   */
  const handleLogin = useCallback(
    async (credentials: AuthRequest): Promise<void> => {
      try {
        await contextLogin(credentials);
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },
    [contextLogin]
  );

  /**
   * Handles user logout with Spring Security session termination
   * Ensures proper cleanup of authentication state
   */
  const handleLogout = useCallback(
    async (): Promise<void> => {
      try {
        await contextLogout();
      } catch (error) {
        console.error('Logout error:', error);
        throw error;
      }
    },
    [contextLogout]
  );

  /**
   * Validates user permissions with caching support
   * Integrates with Spring Security's role-based access control
   */
  const checkPermission = useCallback(
    (resourceType: ResourceType, requiredAccess: AccessLevel): boolean => {
      return contextCheckPermission(resourceType, requiredAccess);
    },
    [contextCheckPermission]
  );

  /**
   * Refreshes authentication session with token renewal
   * Supports container-aware session management
   */
  const refreshSession = useCallback(
    async (): Promise<void> => {
      try {
        await refreshToken();
      } catch (error) {
        console.error('Session refresh error:', error);
        throw error;
      }
    },
    [refreshToken]
  );

  /**
   * Validates current authentication token
   * Integrates with Spring Security's token validation
   */
  const validateToken = useCallback(
    async (): Promise<boolean> => {
      try {
        return await validateSession();
      } catch (error) {
        console.error('Token validation error:', error);
        return false;
      }
    },
    [validateSession]
  );

  /**
   * Setup automatic token refresh and session validation
   * Ensures continuous session validity with Spring Security
   */
  useEffect(() => {
    if (isAuthenticated) {
      // Refresh token every 15 minutes
      const tokenRefreshInterval = setInterval(() => {
        refreshSession().catch(console.error);
      }, 15 * 60 * 1000);

      // Validate session every 5 minutes
      const sessionValidationInterval = setInterval(() => {
        validateToken().catch(console.error);
      }, 5 * 60 * 1000);

      return () => {
        clearInterval(tokenRefreshInterval);
        clearInterval(sessionValidationInterval);
      };
    }
  }, [isAuthenticated, refreshSession, validateToken]);

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkPermission,
    refreshSession,
    validateToken
  };
};