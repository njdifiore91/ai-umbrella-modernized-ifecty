/**
 * Claims Service
 * Enhanced service class for managing claims operations with Spring Boot 3.2.x compatibility,
 * improved monitoring capabilities, and Virtual Thread support.
 * @version 1.0.0
 */

import { ApiService } from './api.service';
import { 
  Claim, 
  ClaimDocument, 
  ClaimStatus, 
  PaginatedClaimResponse, 
  ClaimApiResponse 
} from '../types/claims.types';
import { ApiResponse, PaginatedResponse } from '../types/common.types';
import { CLAIMS_ENDPOINTS } from '../constants/api.constants';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';

/**
 * Interface for claims service configuration
 */
interface ClaimsServiceConfig {
  maxFileSize: number;
  allowedFileTypes: string[];
  maxConcurrentUploads: number;
}

/**
 * Enhanced service class for managing claims operations
 * Provides integration with Spring Boot 3.2.x backend services
 */
export class ClaimsService {
  private readonly config: ClaimsServiceConfig = {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
    maxConcurrentUploads: 5
  };

  constructor(private readonly apiService: ApiService) {
    this.initializeService();
  }

  /**
   * Initialize service with monitoring and configuration
   */
  private initializeService(): void {
    // Configure request tracing
    this.apiService.setRequestTracing({
      serviceName: 'ClaimsService',
      version: '1.0.0'
    });

    // Initialize metrics collector
    this.apiService.setMetricsCollector({
      prefix: 'claims_service',
      labels: ['operation', 'status']
    });
  }

  /**
   * Retrieve claims with enhanced monitoring and Virtual Thread support
   * @param params Query parameters for claims retrieval
   * @returns Promise with paginated claims response
   */
  public async getClaims(params: {
    page: number;
    size: number;
    status?: ClaimStatus;
    traceId?: string;
  }): Promise<ApiResponse<PaginatedResponse<Claim>>> {
    const tracer = trace.getTracer('claims-service');
    const span = tracer.startSpan('getClaims');

    try {
      context.with(trace.setSpan(context.active(), span), async () => {
        const queryParams = new URLSearchParams({
          page: params.page.toString(),
          size: params.size.toString(),
          ...(params.status && { status: params.status })
        });

        const response = await this.apiService.get<PaginatedClaimResponse>(
          `${CLAIMS_ENDPOINTS.GET_ALL}?${queryParams}`,
          {
            headers: {
              'X-Trace-ID': params.traceId || span.spanContext().traceId
            }
          }
        );

        span.setStatus({ code: SpanStatusCode.OK });
        return response;
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Upload claim document with improved error handling and monitoring
   * @param claimId Claim identifier
   * @param formData Form data containing file
   * @returns Promise with upload response
   */
  public async uploadDocument(
    claimId: number,
    formData: FormData
  ): Promise<ApiResponse<ClaimDocument>> {
    const tracer = trace.getTracer('claims-service');
    const span = tracer.startSpan('uploadDocument');

    try {
      context.with(trace.setSpan(context.active(), span), async () => {
        const file = formData.get('file') as File;
        
        // Validate file
        if (!this.validateFile(file)) {
          throw new Error('Invalid file type or size');
        }

        const response = await this.apiService.upload<ClaimDocument>(
          CLAIMS_ENDPOINTS.UPLOAD_DOCUMENT.replace(':id', claimId.toString()),
          formData,
          {
            headers: {
              'X-Trace-ID': span.spanContext().traceId,
              'X-Upload-Type': 'claim-document'
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total!
              );
              span.addEvent('upload_progress', { percentCompleted });
            }
          }
        );

        span.setStatus({ code: SpanStatusCode.OK });
        return response;
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Get claim by ID with enhanced error handling
   * @param claimId Claim identifier
   * @returns Promise with claim response
   */
  public async getClaimById(claimId: number): Promise<ApiResponse<Claim>> {
    const tracer = trace.getTracer('claims-service');
    const span = tracer.startSpan('getClaimById');

    try {
      context.with(trace.setSpan(context.active(), span), async () => {
        const response = await this.apiService.get<Claim>(
          CLAIMS_ENDPOINTS.GET_BY_ID.replace(':id', claimId.toString()),
          {
            headers: {
              'X-Trace-ID': span.spanContext().traceId
            }
          }
        );

        span.setStatus({ code: SpanStatusCode.OK });
        return response;
      });
    } catch (error) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error.message
      });
      throw error;
    } finally {
      span.end();
    }
  }

  /**
   * Validate file before upload
   * @param file File to validate
   * @returns boolean indicating if file is valid
   */
  private validateFile(file: File): boolean {
    if (!file) return false;

    const isValidSize = file.size <= this.config.maxFileSize;
    const isValidType = this.config.allowedFileTypes.includes(file.type);

    return isValidSize && isValidType;
  }
}