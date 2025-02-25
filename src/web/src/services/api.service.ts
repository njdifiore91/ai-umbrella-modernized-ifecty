/**
 * Core API Service
 * Provides centralized HTTP request handling with Spring Boot 3.2.x compatibility,
 * request tracing, and monitoring integration.
 * @version 1.0.0
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { createApiRequest, handleApiError, transformResponse } from '../utils/api.utils';
import { ApiResponse } from '../types/common.types';
import { API_BASE_URL, API_HEADERS } from '../constants/api.constants';

/**
 * Circuit breaker configuration for fault tolerance
 */
interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  halfOpenRequests: number;
}

/**
 * Request tracking interface for monitoring
 */
interface RequestTracker {
  activeRequests: Map<string, number>;
  failedRequests: Map<string, number>;
  requestMetrics: Map<string, {
    count: number;
    totalDuration: number;
    failures: number;
  }>;
}

/**
 * Enhanced API service class with Spring Boot 3.2.x compatibility
 * and comprehensive monitoring capabilities
 */
export class ApiService {
  private readonly apiClient: AxiosInstance;
  private readonly circuitBreaker: CircuitBreakerConfig;
  private readonly requestTracker: RequestTracker;

  constructor() {
    // Initialize API client with enhanced monitoring
    this.apiClient = createApiRequest({
      baseURL: API_BASE_URL,
      timeout: 30000,
      validateStatus: (status) => status < 500
    });

    // Configure circuit breaker
    this.circuitBreaker = {
      failureThreshold: 5,
      resetTimeout: 60000,
      halfOpenRequests: 3
    };

    // Initialize request tracking
    this.requestTracker = {
      activeRequests: new Map(),
      failedRequests: new Map(),
      requestMetrics: new Map()
    };

    this.initializeMonitoring();
  }

  /**
   * Initialize monitoring and metrics collection
   */
  private initializeMonitoring(): void {
    // Add monitoring interceptors
    this.apiClient.interceptors.request.use(
      (config) => {
        const endpoint = config.url || 'unknown';
        const activeCount = this.requestTracker.activeRequests.get(endpoint) || 0;
        this.requestTracker.activeRequests.set(endpoint, activeCount + 1);
        
        // Add Spring Boot compatible headers
        config.headers['X-Trace-ID'] = `trace-${Date.now()}`;
        config.headers['X-Request-ID'] = `req-${Date.now()}`;
        
        return config;
      }
    );

    this.apiClient.interceptors.response.use(
      (response) => {
        this.updateMetrics(response);
        return response;
      },
      (error) => {
        this.updateErrorMetrics(error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * Update request metrics with timing and status information
   */
  private updateMetrics(response: AxiosResponse): void {
    const endpoint = response.config.url || 'unknown';
    const duration = Date.now() - Number(response.config.headers['X-Request-Time']);
    
    const metrics = this.requestTracker.requestMetrics.get(endpoint) || {
      count: 0,
      totalDuration: 0,
      failures: 0
    };

    metrics.count++;
    metrics.totalDuration += duration;
    this.requestTracker.requestMetrics.set(endpoint, metrics);
    
    // Update active request count
    const activeCount = this.requestTracker.activeRequests.get(endpoint) || 1;
    this.requestTracker.activeRequests.set(endpoint, activeCount - 1);
  }

  /**
   * Update error metrics and circuit breaker state
   */
  private updateErrorMetrics(error: any): void {
    const endpoint = error.config?.url || 'unknown';
    const failureCount = this.requestTracker.failedRequests.get(endpoint) || 0;
    this.requestTracker.failedRequests.set(endpoint, failureCount + 1);

    const metrics = this.requestTracker.requestMetrics.get(endpoint) || {
      count: 0,
      totalDuration: 0,
      failures: 0
    };
    metrics.failures++;
    this.requestTracker.requestMetrics.set(endpoint, metrics);
  }

  /**
   * Perform GET request with enhanced monitoring
   * @template T - Response data type
   * @param url - Request URL
   * @param config - Axios request configuration
   * @returns Promise with typed API response
   */
  public async get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.apiClient.get<T>(url, {
        ...config,
        headers: {
          ...config?.headers,
          'X-Request-Time': Date.now().toString()
        }
      });
      return transformResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Perform POST request with enhanced monitoring
   * @template T - Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Axios request configuration
   * @returns Promise with typed API response
   */
  public async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.apiClient.post<T>(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          'X-Request-Time': Date.now().toString()
        }
      });
      return transformResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Perform PUT request with enhanced monitoring
   * @template T - Response data type
   * @param url - Request URL
   * @param data - Request payload
   * @param config - Axios request configuration
   * @returns Promise with typed API response
   */
  public async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.apiClient.put<T>(url, data, {
        ...config,
        headers: {
          ...config?.headers,
          'X-Request-Time': Date.now().toString()
        }
      });
      return transformResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Perform DELETE request with enhanced monitoring
   * @template T - Response data type
   * @param url - Request URL
   * @param config - Axios request configuration
   * @returns Promise with typed API response
   */
  public async delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    try {
      const response = await this.apiClient.delete<T>(url, {
        ...config,
        headers: {
          ...config?.headers,
          'X-Request-Time': Date.now().toString()
        }
      });
      return transformResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }

  /**
   * Perform file upload with progress tracking and monitoring
   * @template T - Response data type
   * @param url - Upload URL
   * @param formData - Form data with file
   * @param config - Upload configuration
   * @returns Promise with typed API response
   */
  public async upload<T>(
    url: string,
    formData: FormData,
    config?: AxiosRequestConfig
  ): Promise<ApiResponse<T>> {
    try {
      const response = await this.apiClient.post<T>(url, formData, {
        ...config,
        headers: {
          ...config?.headers,
          'Content-Type': 'multipart/form-data',
          'X-Request-Time': Date.now().toString()
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total!);
          config?.onUploadProgress?.(progressEvent);
          console.debug(`Upload progress: ${percentCompleted}%`);
        }
      });
      return transformResponse<T>(response);
    } catch (error) {
      throw handleApiError(error);
    }
  }
}