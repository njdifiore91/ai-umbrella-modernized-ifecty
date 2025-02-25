/**
 * Core TypeScript type definitions and interfaces used across the web application.
 * Provides common data structures for API responses, pagination, error handling, and shared utility types.
 */

/**
 * Generic interface for API responses with type parameter T
 * Provides a standardized structure for all API responses
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
  timestamp: string;
}

/**
 * Generic interface for paginated responses with type parameter T
 * Used for endpoints that return paginated collections of items
 */
export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

/**
 * Interface for standardized error responses
 * Includes optional stack trace for development environments
 */
export interface ErrorResponse {
  code: string;
  message: string;
  details: Record<string, string>;
  timestamp: string;
  stackTrace?: string;
}

/**
 * Interface for field-level validation errors
 * Provides detailed validation constraints and error messages
 */
export interface ValidationError {
  field: string;
  message: string;
  value: unknown;
  constraints: Record<string, string>;
}

/**
 * Enum for sort direction in paginated queries
 * Used to specify ascending or descending order
 */
export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC'
}

/**
 * Interface for sort order specification
 * Combines field name with sort direction
 */
export interface SortOrder {
  field: string;
  direction: SortDirection;
}

/**
 * Interface for pagination parameters with optional filtering
 * Used to control page size, number, sorting, and filtering
 */
export interface PaginationParams {
  page: number;
  size: number;
  sort: SortOrder[];
  filter: Record<string, unknown>;
}

/**
 * Interface for date range queries with validation method
 * Includes a method to validate date range consistency
 */
export interface DateRange {
  startDate: string;
  endDate: string;
  isValid: () => boolean;
}

/**
 * Enum for tracking async operation states
 * Used to manage loading states in UI components
 */
export enum LoadingState {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED'
}