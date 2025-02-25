import { ApiResponse } from './common.types';

/**
 * Interface representing a user in the system, aligned with Spring Security's user details
 */
export interface User {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  enabled: boolean;
  roles: Role[];
  lastLoginDate: Date | null;
  accountNonExpired: boolean;
  accountNonLocked: boolean;
}

/**
 * Interface representing a role with associated permissions,
 * supporting Spring Security's role-based access control
 */
export interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Interface representing a permission for role-based access control,
 * matching Spring Security's method security annotations
 */
export interface Permission {
  id: number;
  name: string;
  description: string;
  resourceType: ResourceType;
  accessLevel: AccessLevel;
}

/**
 * Enum defining types of resources that can be protected by permissions,
 * aligned with the Permission Management Matrix
 */
export enum ResourceType {
  POLICY_DATA = 'POLICY_DATA',
  CLAIMS_DATA = 'CLAIMS_DATA',
  USER_MANAGEMENT = 'USER_MANAGEMENT',
  REPORTS = 'REPORTS'
}

/**
 * Enum defining possible access levels for permissions,
 * matching the Permission Management Matrix
 */
export enum AccessLevel {
  NONE = 'NONE',
  READ = 'READ',
  READ_WRITE = 'READ_WRITE',
  FULL = 'FULL'
}

/**
 * Interface for authentication request payload,
 * supporting Spring Security's authentication mechanisms
 */
export interface AuthRequest {
  username: string;
  password: string;
  rememberMe: boolean;
}

/**
 * Interface for authentication response data,
 * aligned with Spring Security's token-based authentication
 */
export interface AuthResponse {
  token: string;
  user: User;
  expiresIn: number;
  tokenType: string;
}

/**
 * Interface for managing user authentication state,
 * supporting Spring Security's session management
 */
export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  token: string | null;
  tokenExpiration: Date | null;
  refreshToken: string | null;
}

/**
 * Type alias for API responses containing user data
 */
export type UserApiResponse = ApiResponse<User>;

/**
 * Type alias for API responses containing authentication data
 */
export type AuthApiResponse = ApiResponse<AuthResponse>;