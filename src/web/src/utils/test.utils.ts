/**
 * Test Utility Functions
 * Provides comprehensive testing utilities for React components and services,
 * supporting modern testing patterns with enhanced type safety and monitoring.
 * @version 1.0.0
 */

import { render, RenderOptions, RenderResult } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApiResponse, ErrorResponse } from '../types/common.types';
import { AuthContext } from '../context/AuthContext';
import { User, ResourceType, AccessLevel } from '../types/user.types';

/**
 * Interface for mock API response options with monitoring
 */
interface MockApiOptions {
  timestamp?: string;
  requestId?: string;
  duration?: number;
  monitoring?: boolean;
}

/**
 * Interface for render with auth options
 */
interface RenderWithAuthOptions extends RenderOptions {
  user?: Partial<User>;
  isAuthenticated?: boolean;
  permissions?: Array<{
    resourceType: ResourceType;
    accessLevel: AccessLevel;
  }>;
}

/**
 * Creates a type-safe mock API response with validation and monitoring
 * @template T - Response data type
 * @param data - Response payload
 * @param status - HTTP status code
 * @param message - Response message
 * @param options - Additional response options
 * @returns Validated mock API response
 */
export const createMockApiResponse = <T>(
  data: T,
  status: number = 200,
  message: string = 'Success',
  options: MockApiOptions = {}
): ApiResponse<T> => {
  const timestamp = options.timestamp || new Date().toISOString();
  const requestId = options.requestId || `test-${Date.now()}`;

  const response: ApiResponse<T> = {
    data,
    status,
    message,
    timestamp
  };

  // Add monitoring data if enabled
  if (options.monitoring) {
    Object.assign(response, {
      requestId,
      duration: options.duration || 0,
      metrics: {
        startTime: Date.now() - (options.duration || 0),
        endTime: Date.now()
      }
    });
  }

  return response;
};

/**
 * Creates a detailed mock error response with validation
 * @param code - Error code
 * @param message - Error message
 * @param details - Additional error details
 * @returns Validated error response
 */
export const createMockErrorResponse = (
  code: string,
  message: string,
  details: Record<string, unknown> = {}
): ErrorResponse => {
  return {
    code,
    message,
    details,
    timestamp: new Date().toISOString()
  };
};

/**
 * Renders a component with authentication context for testing
 * @param component - React component to render
 * @param options - Auth context and render options
 * @returns Rendered component with testing utilities
 */
export const renderWithAuth = (
  component: React.ReactNode,
  options: RenderWithAuthOptions = {}
): RenderResult => {
  const {
    user = null,
    isAuthenticated = false,
    permissions = [],
    ...renderOptions
  } = options;

  // Create mock auth context value
  const authContextValue = {
    user: user as User | null,
    isAuthenticated,
    isLoading: false,
    error: null,
    checkPermission: (resourceType: ResourceType, requiredAccess: AccessLevel) => {
      return permissions.some(
        (p) =>
          p.resourceType === resourceType && p.accessLevel === requiredAccess
      );
    },
    login: jest.fn(),
    logout: jest.fn(),
    refreshToken: jest.fn(),
    validateSession: jest.fn().mockResolvedValue(true)
  };

  return render(
    <AuthContext.Provider value={authContextValue}>
      {component}
    </AuthContext.Provider>,
    renderOptions
  );
};

/**
 * Creates a monitored mock implementation for API service calls
 * @template T - Response data type
 * @param responseData - Mock response data
 * @param shouldFail - Whether the mock should simulate failure
 * @param options - Additional mock options
 * @returns Monitored mock API function
 */
export const mockApiCall = <T>(
  responseData: T,
  shouldFail: boolean = false,
  options: MockApiOptions = {}
): jest.Mock => {
  return jest.fn().mockImplementation(() => {
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (shouldFail) {
          reject(
            createMockErrorResponse(
              'API_ERROR',
              'API call failed',
              { originalError: 'Mock API failure' }
            )
          );
        } else {
          resolve(
            createMockApiResponse(
              responseData,
              200,
              'Success',
              {
                ...options,
                duration: Date.now() - startTime,
                monitoring: true
              }
            )
          );
        }
      }, options.duration || 0);
    });
  });
};

/**
 * Creates a user event instance for simulating user interactions
 * @returns User event instance with enhanced capabilities
 */
export const createUserEvent = () => userEvent.setup();

/**
 * Type guard for checking if a response is an error
 * @param response - API response to check
 * @returns Type predicate for error responses
 */
export const isErrorResponse = (
  response: ApiResponse<unknown> | ErrorResponse
): response is ErrorResponse => {
  return 'code' in response && 'details' in response;
};

/**
 * Waits for component updates with timeout
 * @param callback - Assertion callback
 * @param timeout - Maximum wait time
 */
export const waitForComponent = async (
  callback: () => void | Promise<void>,
  timeout: number = 1000
): Promise<void> => {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    try {
      await callback();
      return;
    } catch (error) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  await callback();
};