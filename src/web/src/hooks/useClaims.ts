/**
 * Custom React hook for claims management with enhanced Spring Boot error handling,
 * request tracing, and monitoring integration.
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { ClaimsService } from '../services/claims.service';
import { useNotification } from './useNotification';
import {
  Claim,
  ClaimDocument,
  Payment,
  ClaimStatus,
  CreateClaimRequest,
  UpdateClaimRequest,
  CreatePaymentRequest,
  PaginatedClaimResponse,
  PaymentApiResponse
} from '../types/claims.types';
import { ApiResponse, ErrorResponse, ValidationError } from '../types/common.types';

// Operation type mapping for loading states
type OperationType = 
  | 'getClaims'
  | 'getClaimById'
  | 'createClaim'
  | 'updateClaim'
  | 'uploadDocument'
  | 'getDocuments'
  | 'createPayment'
  | 'getPayments';

// Interface for hook state
interface ClaimsState {
  claims: Claim[];
  selectedClaim: Claim | null;
  documents: ClaimDocument[];
  payments: Payment[];
  totalItems: number;
  currentPage: number;
}

// Interface for operation states
interface OperationStates {
  loading: Record<OperationType, boolean>;
  errors: Record<OperationType, ErrorResponse | null>;
  validationErrors: Record<OperationType, ValidationError[] | null>;
}

/**
 * Custom hook for managing claims operations with enhanced error handling and monitoring
 * @param claimsService - Instance of ClaimsService for API operations
 */
export const useClaims = (claimsService: ClaimsService) => {
  // State management
  const [state, setState] = useState<ClaimsState>({
    claims: [],
    selectedClaim: null,
    documents: [],
    payments: [],
    totalItems: 0,
    currentPage: 0
  });

  // Operation states
  const [operationStates, setOperationStates] = useState<OperationStates>({
    loading: {
      getClaims: false,
      getClaimById: false,
      createClaim: false,
      updateClaim: false,
      uploadDocument: false,
      getDocuments: false,
      createPayment: false,
      getPayments: false
    },
    errors: {
      getClaims: null,
      getClaimById: null,
      createClaim: null,
      updateClaim: null,
      uploadDocument: null,
      getDocuments: null,
      createPayment: null,
      getPayments: null
    },
    validationErrors: {
      getClaims: null,
      getClaimById: null,
      createClaim: null,
      updateClaim: null,
      uploadDocument: null,
      getDocuments: null,
      createPayment: null,
      getPayments: null
    }
  });

  const { showNotification } = useNotification();

  // Helper to update operation states
  const updateOperationState = useCallback((
    operation: OperationType,
    loading: boolean,
    error: ErrorResponse | null = null,
    validationErrors: ValidationError[] | null = null
  ) => {
    setOperationStates(prev => ({
      ...prev,
      loading: { ...prev.loading, [operation]: loading },
      errors: { ...prev.errors, [operation]: error },
      validationErrors: { ...prev.validationErrors, [operation]: validationErrors }
    }));
  }, []);

  // Get claims with pagination
  const getClaims = useCallback(async (
    page: number,
    size: number,
    status?: ClaimStatus
  ): Promise<void> => {
    updateOperationState('getClaims', true);
    try {
      const response = await claimsService.getClaims({ page, size, status });
      setState(prev => ({
        ...prev,
        claims: response.data.items,
        totalItems: response.data.totalItems,
        currentPage: response.data.currentPage
      }));
      updateOperationState('getClaims', false);
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState('getClaims', false, errorResponse);
      showNotification(errorResponse.message, 'warning');
    }
  }, [claimsService, showNotification, updateOperationState]);

  // Get claim by ID
  const getClaimById = useCallback(async (claimId: number): Promise<void> => {
    updateOperationState('getClaimById', true);
    try {
      const response = await claimsService.getClaimById(claimId);
      setState(prev => ({
        ...prev,
        selectedClaim: response.data
      }));
      updateOperationState('getClaimById', false);
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState('getClaimById', false, errorResponse);
      showNotification(errorResponse.message, 'warning');
    }
  }, [claimsService, showNotification, updateOperationState]);

  // Create new claim
  const createClaim = useCallback(async (
    claimData: CreateClaimRequest
  ): Promise<ApiResponse<Claim> | null> => {
    updateOperationState('createClaim', true);
    try {
      const response = await claimsService.createClaim(claimData);
      setState(prev => ({
        ...prev,
        claims: [...prev.claims, response.data]
      }));
      updateOperationState('createClaim', false);
      showNotification('Claim created successfully', 'success');
      return response;
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState(
        'createClaim',
        false,
        errorResponse,
        errorResponse.validationErrors
      );
      showNotification(errorResponse.message, 'warning');
      return null;
    }
  }, [claimsService, showNotification, updateOperationState]);

  // Update existing claim
  const updateClaim = useCallback(async (
    claimId: number,
    updateData: UpdateClaimRequest
  ): Promise<ApiResponse<Claim> | null> => {
    updateOperationState('updateClaim', true);
    try {
      const response = await claimsService.updateClaim(claimId, updateData);
      setState(prev => ({
        ...prev,
        claims: prev.claims.map(claim => 
          claim.id === claimId ? response.data : claim
        ),
        selectedClaim: response.data
      }));
      updateOperationState('updateClaim', false);
      showNotification('Claim updated successfully', 'success');
      return response;
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState(
        'updateClaim',
        false,
        errorResponse,
        errorResponse.validationErrors
      );
      showNotification(errorResponse.message, 'warning');
      return null;
    }
  }, [claimsService, showNotification, updateOperationState]);

  // Upload document for claim
  const uploadDocument = useCallback(async (
    claimId: number,
    formData: FormData
  ): Promise<ApiResponse<ClaimDocument> | null> => {
    updateOperationState('uploadDocument', true);
    try {
      const response = await claimsService.uploadDocument(claimId, formData);
      setState(prev => ({
        ...prev,
        documents: [...prev.documents, response.data]
      }));
      updateOperationState('uploadDocument', false);
      showNotification('Document uploaded successfully', 'success');
      return response;
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState('uploadDocument', false, errorResponse);
      showNotification(errorResponse.message, 'warning');
      return null;
    }
  }, [claimsService, showNotification, updateOperationState]);

  // Create payment for claim
  const createPayment = useCallback(async (
    claimId: number,
    paymentData: CreatePaymentRequest
  ): Promise<PaymentApiResponse | null> => {
    updateOperationState('createPayment', true);
    try {
      const response = await claimsService.createPayment(claimId, paymentData);
      setState(prev => ({
        ...prev,
        payments: [...prev.payments, response.data]
      }));
      updateOperationState('createPayment', false);
      showNotification('Payment processed successfully', 'success');
      return response;
    } catch (error) {
      const errorResponse = error as ErrorResponse;
      updateOperationState(
        'createPayment',
        false,
        errorResponse,
        errorResponse.validationErrors
      );
      showNotification(errorResponse.message, 'warning');
      return null;
    }
  }, [claimsService, showNotification, updateOperationState]);

  return {
    // State
    claims: state.claims,
    selectedClaim: state.selectedClaim,
    documents: state.documents,
    payments: state.payments,
    totalItems: state.totalItems,
    currentPage: state.currentPage,

    // Loading states
    loading: operationStates.loading,
    errors: operationStates.errors,
    validationErrors: operationStates.validationErrors,

    // Operations
    getClaims,
    getClaimById,
    createClaim,
    updateClaim,
    uploadDocument,
    createPayment
  };
};

// Type exports for consumers
export type { OperationType, ClaimsState, OperationStates };