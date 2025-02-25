/**
 * API Utility Functions
 * Provides standardized request creation, error handling, and response transformation
 * for HTTP communication with Spring Boot backend services.
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosError, AxiosResponse, AxiosRequestConfig } from 'axios';
import { ApiResponse, ErrorResponse, ValidationError } from '../types/common.types';
import { API_BASE_URL, API_HEADERS } from '../constants/api.constants';

/**
 * Request timing metadata interface for performance monitoring
 */
interface RequestTiming {
  startTime: number;
  endTime?: number;
  duration?: number;
}

/**
 * Request tracking map for monitoring concurrent requests
 */
const requestTimings = new Map<string, RequestTiming>();

/**
 * Generates a unique request ID for tracing
 * @returns {string} Unique request identifier
 */
const generateRequestId = (): string => {
  return `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Creates and configures an axios instance with enhanced monitoring capabilities
 * @param {AxiosRequestConfig} config - Axios configuration options
 * @returns {AxiosInstance} Configured axios instance
 */
export const createApiRequest = (config?: AxiosRequestConfig): AxiosInstance => {
  const instance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      [API_HEADERS.CONTENT_TYPE]: 'application/json',
      [API_HEADERS.ACCEPT]: 'application/json'
    },
    ...config
  });

  // Request interceptor for authentication and tracing
  instance.interceptors.request.use(
    (config) => {
      const requestId = generateRequestId();
      config.headers['X-Request-ID'] = requestId;
      
      // Track request timing
      requestTimings.set(requestId, { startTime: Date.now() });

      // Add auth token if available
      const token = localStorage.getItem('authToken');
      if (token) {
        config.headers.Authorization = `${API_HEADERS.AUTHORIZATION}${token}`;
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // Response interceptor for error handling and performance monitoring
  instance.interceptors.response.use(
    (response) => {
      const requestId = response.config.headers['X-Request-ID'];
      if (requestId && requestTimings.has(requestId)) {
        const timing = requestTimings.get(requestId)!;
        timing.endTime = Date.now();
        timing.duration = timing.endTime - timing.startTime;
        
        // Log performance metrics
        console.debug(`Request ${requestId} completed in ${timing.duration}ms`);
        requestTimings.delete(requestId);
      }
      
      return transformResponse(response);
    },
    (error) => Promise.reject(handleApiError(error))
  );

  return instance;
};

/**
 * Transforms API responses with enhanced type safety and monitoring
 * @param {AxiosResponse<T>} response - Axios response object
 * @returns {ApiResponse<T>} Standardized API response
 */
export const transformResponse = <T>(response: AxiosResponse<T>): ApiResponse<T> => {
  const requestId = response.config.headers['X-Request-ID'];
  const timing = requestTimings.get(requestId as string);

  return {
    data: response.data,
    status: response.status,
    message: response.statusText,
    timestamp: new Date().toISOString(),
    requestId: requestId as string,
    ...(timing?.duration && { duration: timing.duration })
  };
};

/**
 * Enhanced error handler with validation support and detailed error classification
 * @param {AxiosError} error - Axios error object
 * @returns {ErrorResponse} Standardized error response
 */
export const handleApiError = (error: AxiosError): ErrorResponse => {
  const requestId = error.config?.headers?.['X-Request-ID'] as string;
  const timing = requestTimings.get(requestId);
  
  // Clean up timing tracking
  if (requestId) {
    requestTimings.delete(requestId);
  }

  const baseError: ErrorResponse = {
    code: 'UNKNOWN_ERROR',
    message: 'An unexpected error occurred',
    details: {},
    timestamp: new Date().toISOString(),
    requestId
  };

  if (!error.response) {
    return {
      ...baseError,
      code: 'NETWORK_ERROR',
      message: 'Network error occurred',
      details: {
        error: error.message
      }
    };
  }

  const { status, data } = error.response;

  // Handle validation errors
  if (status === 400 && data?.validationErrors) {
    return {
      ...baseError,
      code: 'VALIDATION_ERROR',
      message: 'Validation failed',
      details: data.details || {},
      validationErrors: data.validationErrors as ValidationError[]
    };
  }

  // Handle authentication errors
  if (status === 401) {
    return {
      ...baseError,
      code: 'UNAUTHORIZED',
      message: 'Authentication required',
      details: {
        error: 'Please log in to continue'
      }
    };
  }

  // Handle forbidden errors
  if (status === 403) {
    return {
      ...baseError,
      code: 'FORBIDDEN',
      message: 'Access denied',
      details: {
        error: 'Insufficient permissions'
      }
    };
  }

  // Handle not found errors
  if (status === 404) {
    return {
      ...baseError,
      code: 'NOT_FOUND',
      message: 'Resource not found',
      details: {
        error: 'The requested resource does not exist'
      }
    };
  }

  // Handle server errors
  if (status >= 500) {
    return {
      ...baseError,
      code: 'SERVER_ERROR',
      message: 'Internal server error',
      details: {
        error: data?.message || 'A server error occurred'
      }
    };
  }

  return {
    ...baseError,
    code: `ERROR_${status}`,
    message: data?.message || error.message,
    details: data?.details || {}
  };
};