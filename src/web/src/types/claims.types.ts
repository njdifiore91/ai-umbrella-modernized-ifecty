/**
 * TypeScript type definitions and interfaces for the claims management domain.
 * Includes type definitions for claims, documents, and payment processing.
 */

import { ApiResponse, PaginatedResponse } from './common.types';

/**
 * Enum defining possible claim statuses
 */
export enum ClaimStatus {
  PENDING = 'PENDING',
  IN_REVIEW = 'IN_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CLOSED = 'CLOSED'
}

/**
 * Enum defining possible payment statuses for SpeedPay integration
 */
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

/**
 * Enum defining types of claim documents
 */
export enum DocumentType {
  POLICY = 'POLICY',
  CLAIM_FORM = 'CLAIM_FORM',
  EVIDENCE = 'EVIDENCE',
  INVOICE = 'INVOICE',
  OTHER = 'OTHER'
}

/**
 * Interface representing a claim entity
 * Includes core claim data, documents, and payment information
 */
export interface Claim {
  id: number;
  claimNumber: string;
  status: ClaimStatus;
  description: string;
  claimAmount: number;
  paidAmount: number;
  incidentDate: string;
  reportedDate: string;
  createdDate: string;
  modifiedDate: string;
  documents: ClaimDocument[];
  payments: Payment[];
}

/**
 * Interface representing a claim document
 * Supports document upload and management requirements
 */
export interface ClaimDocument {
  id: number;
  claimId: number;
  fileName: string;
  fileType: string;
  documentType: DocumentType;
  fileSize: number;
  uploadedAt: string;
  uploadedBy: string;
}

/**
 * Interface representing a claim payment
 * Integrates with SpeedPay for payment processing
 */
export interface Payment {
  id: number;
  transactionId: string;
  amount: number;
  status: PaymentStatus;
  paymentDate: string;
  createdDate: string;
  modifiedDate: string;
}

/**
 * Interface for claim creation request payload
 */
export interface CreateClaimRequest {
  description: string;
  claimAmount: number;
  incidentDate: string;
}

/**
 * Interface for claim update request payload
 */
export interface UpdateClaimRequest {
  status?: ClaimStatus;
  description?: string;
  claimAmount?: number;
}

/**
 * Interface for payment creation request payload
 * Used for SpeedPay integration
 */
export interface CreatePaymentRequest {
  amount: number;
  paymentDate: string;
  paymentMethod: string;
}

/**
 * Type definition for paginated claim response
 */
export type PaginatedClaimResponse = PaginatedResponse<Claim>;

/**
 * Type definition for claim API response
 */
export type ClaimApiResponse = ApiResponse<Claim>;

/**
 * Type definition for paginated claim document response
 */
export type PaginatedDocumentResponse = PaginatedResponse<ClaimDocument>;

/**
 * Type definition for payment API response
 */
export type PaymentApiResponse = ApiResponse<Payment>;