/**
 * Central export point for all TypeScript type definitions used across the web application.
 * Aggregates and re-exports types from common, claims, policy, and user domains.
 * Includes type guards and utility types for enhanced type safety and runtime validation.
 */

// Re-export all types from domain-specific files
export * from './common.types';
export * from './claims.types';
export * from './policy.types';
export * from './user.types';

// Type guards for runtime validation of enums and types

/**
 * Type guard for validating SortDirection enum values
 */
export function isValidSortDirection(value: unknown): value is SortDirection {
  return typeof value === 'string' && Object.values(SortDirection).includes(value as SortDirection);
}

/**
 * Type guard for validating LoadingState enum values
 */
export function isValidLoadingState(value: unknown): value is LoadingState {
  return typeof value === 'string' && Object.values(LoadingState).includes(value as LoadingState);
}

/**
 * Type guard for validating ClaimStatus enum values
 */
export function isValidClaimStatus(value: unknown): value is ClaimStatus {
  return typeof value === 'string' && Object.values(ClaimStatus).includes(value as ClaimStatus);
}

/**
 * Type guard for validating PaymentStatus enum values
 */
export function isValidPaymentStatus(value: unknown): value is PaymentStatus {
  return typeof value === 'string' && Object.values(PaymentStatus).includes(value as PaymentStatus);
}

/**
 * Type guard for validating DocumentType enum values
 */
export function isValidDocumentType(value: unknown): value is DocumentType {
  return typeof value === 'string' && Object.values(DocumentType).includes(value as DocumentType);
}

/**
 * Type guard for validating PolicyStatus enum values
 */
export function isValidPolicyStatus(value: unknown): value is PolicyStatus {
  return typeof value === 'string' && Object.values(PolicyStatus).includes(value as PolicyStatus);
}

/**
 * Type guard for validating ResourceType enum values
 */
export function isValidResourceType(value: unknown): value is ResourceType {
  return typeof value === 'string' && Object.values(ResourceType).includes(value as ResourceType);
}

/**
 * Type guard for validating AccessLevel enum values
 */
export function isValidAccessLevel(value: unknown): value is AccessLevel {
  return typeof value === 'string' && Object.values(AccessLevel).includes(value as AccessLevel);
}

/**
 * Utility type for creating a readonly version of any type
 */
export type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

/**
 * Utility type for making all properties in a type required
 */
export type Required<T> = {
  [P in keyof T]-?: T[P];
};

/**
 * Utility type for making all properties in a type optional
 */
export type Partial<T> = {
  [P in keyof T]?: T[P];
};

/**
 * Utility type for extracting the type of an array element
 */
export type ArrayElement<T extends readonly unknown[]> = T extends readonly (infer ElementType)[]
  ? ElementType
  : never;

/**
 * Utility type for creating a type with only the specified keys
 */
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};

/**
 * Utility type for creating a type without the specified keys
 */
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

/**
 * Utility type for creating a type with all properties nullable
 */
export type Nullable<T> = {
  [P in keyof T]: T[P] | null;
};

/**
 * Utility type for deep partial objects
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

/**
 * Utility type for API response with pagination
 */
export type PaginatedApiResponse<T> = ApiResponse<PaginatedResponse<T>>;

/**
 * Utility type for API error handling
 */
export type ApiErrorResponse = ApiResponse<ErrorResponse>;

/**
 * Utility type for validation error handling
 */
export type ValidationErrorResponse = ApiResponse<ValidationError[]>;