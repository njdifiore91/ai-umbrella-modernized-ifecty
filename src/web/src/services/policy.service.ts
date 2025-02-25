/**
 * Policy Service
 * Handles all policy-related API communications with enhanced monitoring and error handling.
 * Implements comprehensive policy lifecycle management through REST API integration.
 * @version 1.0.0
 */

import { ApiService } from './api.service';
import { Policy, PolicySearchParams, PolicyResponse, PolicyListResponse, PolicyStatus } from '../types/policy.types';
import { POLICY_ENDPOINTS } from '../constants/api.constants';
import { ValidationError } from '../types/common.types';

/**
 * Enhanced service class for managing policy-related API operations
 * with comprehensive monitoring, error handling, and type safety features
 */
export class PolicyService {
  private readonly requestTracker: Map<string, number>;
  private readonly validationRules: Map<string, (value: any) => boolean>;

  constructor(private readonly apiService: ApiService) {
    this.requestTracker = new Map();
    this.validationRules = new Map();
    this.initializeValidationRules();
  }

  /**
   * Initialize validation rules for policy data
   */
  private initializeValidationRules(): void {
    this.validationRules.set('policyNumber', (value: string) => 
      /^[A-Z0-9]{10}$/.test(value)
    );
    this.validationRules.set('status', (value: string) => 
      Object.values(PolicyStatus).includes(value as PolicyStatus)
    );
    this.validationRules.set('effectiveDate', (value: string) => 
      !isNaN(Date.parse(value))
    );
  }

  /**
   * Validates policy data against defined rules
   * @param policy - Policy data to validate
   * @throws {ValidationError[]} Array of validation errors if validation fails
   */
  private validatePolicy(policy: Partial<Policy>): ValidationError[] {
    const errors: ValidationError[] = [];

    for (const [field, validator] of this.validationRules) {
      if (policy.hasOwnProperty(field) && !validator(policy[field])) {
        errors.push({
          field,
          message: `Invalid ${field} value`,
          value: policy[field],
          constraints: {
            format: `Invalid format for ${field}`
          }
        });
      }
    }

    return errors;
  }

  /**
   * Retrieves a paginated list of policies with enhanced search capabilities
   * @param searchParams - Search and pagination parameters
   * @returns Promise with paginated policy list
   */
  public async getAllPolicies(searchParams: PolicySearchParams): Promise<PolicyListResponse> {
    const requestId = `getAll-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      const response = await this.apiService.get<PolicyListResponse>(
        POLICY_ENDPOINTS.GET_ALL,
        {
          params: {
            ...searchParams,
            timestamp: Date.now()
          }
        }
      );

      return response.data;
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Retrieves a single policy by ID with enhanced error handling
   * @param id - Policy ID
   * @returns Promise with policy data
   */
  public async getPolicyById(id: number): Promise<PolicyResponse> {
    const requestId = `getById-${id}-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      const response = await this.apiService.get<PolicyResponse>(
        POLICY_ENDPOINTS.GET_BY_ID.replace(':id', id.toString())
      );

      return response.data;
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Creates a new policy with enhanced validation and monitoring
   * @param policy - Policy data to create
   * @returns Promise with created policy data
   * @throws {ValidationError[]} If policy data validation fails
   */
  public async createPolicy(policy: Partial<Policy>): Promise<PolicyResponse> {
    const validationErrors = this.validatePolicy(policy);
    if (validationErrors.length > 0) {
      throw validationErrors;
    }

    const requestId = `create-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      const response = await this.apiService.post<PolicyResponse>(
        POLICY_ENDPOINTS.CREATE,
        policy
      );

      return response.data;
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Updates an existing policy with enhanced validation
   * @param id - Policy ID
   * @param policy - Updated policy data
   * @returns Promise with updated policy data
   * @throws {ValidationError[]} If policy data validation fails
   */
  public async updatePolicy(id: number, policy: Partial<Policy>): Promise<PolicyResponse> {
    const validationErrors = this.validatePolicy(policy);
    if (validationErrors.length > 0) {
      throw validationErrors;
    }

    const requestId = `update-${id}-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      const response = await this.apiService.put<PolicyResponse>(
        POLICY_ENDPOINTS.UPDATE.replace(':id', id.toString()),
        policy
      );

      return response.data;
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Deletes a policy with enhanced error handling
   * @param id - Policy ID to delete
   * @returns Promise indicating deletion success
   */
  public async deletePolicy(id: number): Promise<void> {
    const requestId = `delete-${id}-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      await this.apiService.delete(
        POLICY_ENDPOINTS.DELETE.replace(':id', id.toString())
      );
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Exports a policy to PolicySTAR format with monitoring
   * @param id - Policy ID to export
   * @returns Promise with policy export data as blob
   */
  public async exportPolicy(id: number): Promise<Blob> {
    const requestId = `export-${id}-${Date.now()}`;
    this.requestTracker.set(requestId, Date.now());

    try {
      const response = await this.apiService.get<Blob>(
        POLICY_ENDPOINTS.EXPORT.replace(':id', id.toString()),
        {
          responseType: 'blob',
          headers: {
            'Accept': 'application/octet-stream'
          }
        }
      );

      return response.data;
    } finally {
      this.requestTracker.delete(requestId);
    }
  }

  /**
   * Returns metrics about current policy operations
   * @returns Object containing operation metrics
   */
  public getMetrics(): Record<string, number> {
    const metrics: Record<string, number> = {};
    
    for (const [requestId, startTime] of this.requestTracker.entries()) {
      const operationType = requestId.split('-')[0];
      const duration = Date.now() - startTime;
      
      metrics[operationType] = metrics[operationType] 
        ? metrics[operationType] + duration 
        : duration;
    }

    return metrics;
  }
}