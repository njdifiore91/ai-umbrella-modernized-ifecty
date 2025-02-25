/**
 * TypeScript type definitions for policy-related data structures, interfaces and enums.
 * Provides type safety for policy management features and API integration.
 */

import { ApiResponse, PaginatedResponse, DateRange } from './common.types';

/**
 * Enum representing possible policy statuses
 */
export enum PolicyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED'
}

/**
 * Interface defining the structure of policy coverage data
 */
export interface Coverage {
  id: number;
  policyId: number;
  coverageType: string;
  description: string;
  limit: number;
  deductible: number;
  premium: number;
  status: string;
  effectiveDate: string;
  expiryDate: string;
}

/**
 * Interface defining the core policy data structure
 */
export interface Policy {
  id: number;
  policyNumber: string;
  status: PolicyStatus;
  totalPremium: number;
  effectiveDate: string;
  expiryDate: string;
  coverages: Coverage[];
  createdDate: string;
  modifiedDate: string;
}

/**
 * Interface defining policy search parameters
 */
export interface PolicySearchParams {
  policyNumber: string;
  status: PolicyStatus;
  effectiveDateRange: DateRange;
  coverageType: string;
  premiumRange: {
    min: number;
    max: number;
  };
}

/**
 * Type alias for API responses containing policy data
 */
export type PolicyResponse = ApiResponse<Policy>;

/**
 * Type alias for paginated policy list responses
 */
export type PolicyListResponse = PaginatedResponse<Policy>;