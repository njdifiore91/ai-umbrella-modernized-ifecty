/**
 * @fileoverview Barrel file that exports all constants from the constants directory
 * Provides a centralized access point for API endpoints, routes, validation rules,
 * and other application constants with proper TypeScript type safety and immutability.
 */

// Import all constants from individual files
import {
  API_BASE_URL,
  API_HEADERS,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  POLICY_ENDPOINTS,
  CLAIMS_ENDPOINTS,
  INTEGRATION_ENDPOINTS
} from './api.constants';

import {
  ROUTES,
  BASE_ROUTE,
  LOGIN_ROUTE,
  DASHBOARD_ROUTE,
  POLICY_ROUTES,
  CLAIMS_ROUTES,
  TOOLS_ROUTES
} from './routes.constants';

import {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  VALIDATION_RULES
} from './validation.constants';

// Re-export all constants with proper type safety
export {
  // API-related constants
  API_BASE_URL,
  API_HEADERS,
  AUTH_ENDPOINTS,
  USER_ENDPOINTS,
  POLICY_ENDPOINTS,
  CLAIMS_ENDPOINTS,
  INTEGRATION_ENDPOINTS,

  // Route constants
  ROUTES,
  BASE_ROUTE,
  LOGIN_ROUTE,
  DASHBOARD_ROUTE,
  POLICY_ROUTES,
  CLAIMS_ROUTES,
  TOOLS_ROUTES,

  // Validation constants
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  VALIDATION_RULES
};

// Type definitions for exported constants to ensure type safety
declare const _typeCheck: {
  readonly API_BASE_URL: string;
  readonly API_HEADERS: Readonly<{
    CONTENT_TYPE: string;
    ACCEPT: string;
    AUTHORIZATION: string;
  }>;
  readonly AUTH_ENDPOINTS: Readonly<{
    LOGIN: string;
    LOGOUT: string;
    REFRESH_TOKEN: string;
    VERIFY_TOKEN: string;
  }>;
  readonly USER_ENDPOINTS: Readonly<{
    GET_PROFILE: string;
    UPDATE_PROFILE: string;
    CHANGE_PASSWORD: string;
  }>;
  readonly POLICY_ENDPOINTS: Readonly<{
    GET_ALL: string;
    GET_BY_ID: string;
    CREATE: string;
    UPDATE: string;
    DELETE: string;
    EXPORT: string;
  }>;
  readonly CLAIMS_ENDPOINTS: Readonly<{
    GET_ALL: string;
    GET_BY_ID: string;
    CREATE: string;
    UPDATE: string;
    DELETE: string;
    UPLOAD_DOCUMENT: string;
    PROCESS_PAYMENT: string;
  }>;
  readonly INTEGRATION_ENDPOINTS: Readonly<{
    RMV: string;
    CLUE_PROPERTY: string;
    SPEED_PAY: string;
    POLICY_STAR: string;
  }>;
  readonly ROUTES: Readonly<{
    BASE_ROUTE: string;
    LOGIN_ROUTE: string;
    DASHBOARD_ROUTE: string;
    POLICY_ROUTES: Readonly<{
      BASE: string;
      LIST: string;
      CREATE: string;
      EDIT: string;
      DETAILS: string;
    }>;
    CLAIMS_ROUTES: Readonly<{
      BASE: string;
      LIST: string;
      CREATE: string;
      EDIT: string;
      DETAILS: string;
    }>;
    TOOLS_ROUTES: Readonly<{
      BASE: string;
      CONFIG: string;
      REPORTS: string;
      ADMIN: string;
    }>;
  }>;
  readonly VALIDATION_PATTERNS: Readonly<{
    EMAIL: string;
    SSN: string;
    CREDIT_CARD: string;
    PHONE: string;
    ZIP_CODE: string;
    POLICY_NUMBER: string;
    CLAIM_NUMBER: string;
  }>;
  readonly VALIDATION_MESSAGES: Readonly<{
    REQUIRED: string;
    INVALID_EMAIL: string;
    INVALID_SSN: string;
    INVALID_PHONE: string;
    INVALID_CREDIT_CARD: string;
    INVALID_ZIP: string;
    INVALID_POLICY_NUMBER: string;
    INVALID_CLAIM_NUMBER: string;
  }>;
  readonly VALIDATION_RULES: Readonly<{
    MIN_PASSWORD_LENGTH: number;
    MAX_PASSWORD_LENGTH: number;
    MIN_USERNAME_LENGTH: number;
    MAX_USERNAME_LENGTH: number;
    MAX_POLICY_AMOUNT: number;
    MIN_POLICY_AMOUNT: number;
    MAX_FILE_SIZE: number;
  }>;
};