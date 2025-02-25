/**
 * API Constants
 * Centralized configuration for API endpoints and related constants
 * Used for making HTTP requests to backend services
 */

/**
 * Base URL for all API endpoints
 * @constant {string}
 */
export const API_BASE_URL: Readonly<string> = 'https://apimstest.prcins.net/umbrellacore/api/v1';

/**
 * Standard HTTP headers used in API requests
 * @constant {Object}
 */
export const API_HEADERS: Readonly<{
  CONTENT_TYPE: string;
  ACCEPT: string;
  AUTHORIZATION: string;
}> = {
  CONTENT_TYPE: 'application/json',
  ACCEPT: 'application/json',
  AUTHORIZATION: 'Bearer '
} as const;

/**
 * Authentication endpoint constants
 * @constant {Object}
 */
export const AUTH_ENDPOINTS: Readonly<{
  LOGIN: string;
  LOGOUT: string;
  REFRESH_TOKEN: string;
  VERIFY_TOKEN: string;
}> = {
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh',
  VERIFY_TOKEN: '/auth/verify'
} as const;

/**
 * User management endpoint constants
 * @constant {Object}
 */
export const USER_ENDPOINTS: Readonly<{
  GET_PROFILE: string;
  UPDATE_PROFILE: string;
  CHANGE_PASSWORD: string;
}> = {
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  CHANGE_PASSWORD: '/users/password'
} as const;

/**
 * Policy management endpoint constants
 * @constant {Object}
 */
export const POLICY_ENDPOINTS: Readonly<{
  GET_ALL: string;
  GET_BY_ID: string;
  CREATE: string;
  UPDATE: string;
  DELETE: string;
  EXPORT: string;
}> = {
  GET_ALL: '/policies',
  GET_BY_ID: '/policies/:id',
  CREATE: '/policies',
  UPDATE: '/policies/:id',
  DELETE: '/policies/:id',
  EXPORT: '/policies/:id/export'
} as const;

/**
 * Claims processing endpoint constants
 * @constant {Object}
 */
export const CLAIMS_ENDPOINTS: Readonly<{
  GET_ALL: string;
  GET_BY_ID: string;
  CREATE: string;
  UPDATE: string;
  DELETE: string;
  UPLOAD_DOCUMENT: string;
  PROCESS_PAYMENT: string;
}> = {
  GET_ALL: '/claims',
  GET_BY_ID: '/claims/:id',
  CREATE: '/claims',
  UPDATE: '/claims/:id',
  DELETE: '/claims/:id',
  UPLOAD_DOCUMENT: '/claims/:id/documents',
  PROCESS_PAYMENT: '/claims/:id/payments'
} as const;

/**
 * External system integration endpoint constants
 * @constant {Object}
 */
export const INTEGRATION_ENDPOINTS: Readonly<{
  RMV: string;
  CLUE_PROPERTY: string;
  SPEED_PAY: string;
  POLICY_STAR: string;
}> = {
  RMV: '/integrations/rmv',
  CLUE_PROPERTY: '/integrations/clue',
  SPEED_PAY: '/integrations/speedpay',
  POLICY_STAR: '/integrations/policystar'
} as const;