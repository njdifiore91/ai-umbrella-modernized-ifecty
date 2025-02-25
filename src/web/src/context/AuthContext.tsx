/**
 * Authentication Context Provider
 * Manages global authentication state and provides secure authentication operations
 * integrated with Spring Security framework. Implements role-based access control
 * and session management capabilities.
 * @version 1.0.0
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { AuthService } from '../services/auth.service';
import { User, AuthRequest, Permission, AccessLevel, ResourceType } from '../types/user.types';

/**
 * Interface defining the authentication context state and operations
 */
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: AuthRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkPermission: (resourceType: ResourceType, requiredAccess: AccessLevel) => boolean;
  refreshToken: () => Promise<void>;
  validateSession: () => Promise<boolean>;
}

/**
 * Interface for permission cache entry with expiration
 */
interface PermissionCacheEntry {
  hasPermission: boolean;
  timestamp: number;
}

// Create authentication context with default values
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Permission cache configuration
const PERMISSION_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const permissionCache = new Map<string, PermissionCacheEntry>();

/**
 * Authentication Provider Component
 * Implements secure authentication state management and operations
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth service
  const authService = new AuthService();

  /**
   * Validates user session and token on mount and periodic intervals
   */
  useEffect(() => {
    const validateAuth = async () => {
      try {
        const isValid = await validateSession();
        if (!isValid) {
          await handleLogout();
        }
      } catch (error) {
        console.error('Session validation error:', error);
        await handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    validateAuth();

    // Set up periodic session validation
    const intervalId = setInterval(validateAuth, 5 * 60 * 1000); // Every 5 minutes

    return () => clearInterval(intervalId);
  }, []);

  /**
   * Handles user login with Spring Security integration
   */
  const handleLogin = async (credentials: AuthRequest): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      setIsAuthenticated(true);
      permissionCache.clear(); // Clear permission cache on login
    } catch (error: any) {
      setError(error.message || 'Authentication failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles user logout with proper cleanup
   */
  const handleLogout = async (): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
      permissionCache.clear();
      setIsLoading(false);
    }
  };

  /**
   * Validates user permissions with caching support
   */
  const checkPermission = useCallback(
    (resourceType: ResourceType, requiredAccess: AccessLevel): boolean => {
      if (!user || !user.roles) return false;

      const cacheKey = `${user.id}-${resourceType}-${requiredAccess}`;
      const cachedResult = permissionCache.get(cacheKey);

      if (cachedResult && Date.now() - cachedResult.timestamp < PERMISSION_CACHE_DURATION) {
        return cachedResult.hasPermission;
      }

      const hasPermission = user.roles.some(role =>
        role.permissions.some(
          (permission: Permission) =>
            permission.resourceType === resourceType &&
            getAccessLevelWeight(permission.accessLevel) >= getAccessLevelWeight(requiredAccess)
        )
      );

      permissionCache.set(cacheKey, {
        hasPermission,
        timestamp: Date.now()
      });

      return hasPermission;
    },
    [user]
  );

  /**
   * Refreshes authentication token
   */
  const handleRefreshToken = async (): Promise<void> => {
    try {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await handleLogout();
    }
  };

  /**
   * Validates current session status
   */
  const validateSession = async (): Promise<boolean> => {
    try {
      const isValid = await authService.isAuthenticated();
      setIsAuthenticated(isValid);
      return isValid;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // Context value with enhanced security features
  const contextValue: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    checkPermission,
    refreshToken: handleRefreshToken,
    validateSession
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook for consuming authentication context with type safety
 */
export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

/**
 * Helper function to compare access level weights
 */
const getAccessLevelWeight = (level: AccessLevel): number => {
  const weights: Record<AccessLevel, number> = {
    [AccessLevel.NONE]: 0,
    [AccessLevel.READ]: 1,
    [AccessLevel.READ_WRITE]: 2,
    [AccessLevel.FULL]: 3
  };
  return weights[level];
};