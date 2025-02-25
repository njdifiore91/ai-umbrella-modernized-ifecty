/**
 * ClaimDetails Component
 * Enhanced React component for displaying and managing claim details with Spring Boot integration,
 * monitoring capabilities, and accessibility features.
 * @version 1.0.0
 */

import React, { useEffect, useState, useCallback } from 'react';
import { useClaims } from '../../../hooks/useClaims';
import { useNotification } from '../../../hooks/useNotification';
import { useMonitoring } from '@monitoring/react';
import { Claim, ClaimStatus } from '../../../types/claims.types';

// Constants for accessibility
const ARIA_LABELS = {
  CLAIM_HEADER: 'Claim Details Header',
  STATUS_SELECT: 'Claim Status Selection',
  DOCUMENT_SECTION: 'Claim Documents Section',
  PAYMENT_SECTION: 'Payment Processing Section',
  UPLOAD_BUTTON: 'Upload Document Button',
  PAYMENT_BUTTON: 'Process Payment Button'
} as const;

// Component props interface
interface ClaimDetailsProps {
  claimId: number;
}

/**
 * Enhanced ClaimDetails component with monitoring and accessibility
 */
export const ClaimDetails: React.FC<ClaimDetailsProps> = React.memo(({ claimId }) => {
  // Hooks initialization
  const {
    selectedClaim,
    loading,
    errors,
    getClaimById,
    updateClaim,
    uploadDocument,
    createPayment
  } = useClaims();

  const { showNotification } = useNotification();
  const { trackOperation, recordMetric } = useMonitoring();

  // Local state
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [processingPayment, setProcessingPayment] = useState<boolean>(false);

  /**
   * Initial data fetch with monitoring
   */
  useEffect(() => {
    const fetchClaimDetails = async () => {
      const operationId = await trackOperation('fetchClaimDetails');
      try {
        await getClaimById(claimId);
        recordMetric('claim_details_loaded', { claimId });
      } catch (error) {
        showNotification('Failed to load claim details', 'warning');
        recordMetric('claim_details_error', { claimId, error: error.message });
      } finally {
        await trackOperation(operationId, 'end');
      }
    };

    fetchClaimDetails();
  }, [claimId, getClaimById, showNotification, trackOperation, recordMetric]);

  /**
   * Enhanced status update handler with monitoring
   */
  const handleStatusUpdate = useCallback(async (newStatus: ClaimStatus) => {
    const operationId = await trackOperation('updateClaimStatus');
    try {
      await updateClaim(claimId, { status: newStatus });
      showNotification('Claim status updated successfully', 'success');
      recordMetric('claim_status_updated', { claimId, status: newStatus });
    } catch (error) {
      showNotification('Failed to update claim status', 'warning');
      recordMetric('claim_status_error', { claimId, error: error.message });
    } finally {
      await trackOperation(operationId, 'end');
    }
  }, [claimId, updateClaim, showNotification, trackOperation, recordMetric]);

  /**
   * Enhanced document upload handler with progress tracking
   */
  const handleDocumentUpload = useCallback(async (file: File) => {
    const operationId = await trackOperation('uploadClaimDocument');
    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploadProgress(0);
      await uploadDocument(claimId, formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total!
          );
          setUploadProgress(progress);
          recordMetric('document_upload_progress', { claimId, progress });
        }
      });
      showNotification('Document uploaded successfully', 'success');
      recordMetric('document_upload_complete', { claimId });
    } catch (error) {
      showNotification('Failed to upload document', 'warning');
      recordMetric('document_upload_error', { claimId, error: error.message });
    } finally {
      setUploadProgress(0);
      await trackOperation(operationId, 'end');
    }
  }, [claimId, uploadDocument, showNotification, trackOperation, recordMetric]);

  /**
   * Enhanced payment processing handler with monitoring
   */
  const handlePaymentProcess = useCallback(async (amount: number) => {
    const operationId = await trackOperation('processClaimPayment');
    setProcessingPayment(true);

    try {
      await createPayment(claimId, {
        amount,
        paymentDate: new Date().toISOString(),
        paymentMethod: 'SPEEDPAY'
      });
      showNotification('Payment processed successfully', 'success');
      recordMetric('payment_processed', { claimId, amount });
    } catch (error) {
      showNotification('Failed to process payment', 'warning');
      recordMetric('payment_error', { claimId, error: error.message });
    } finally {
      setProcessingPayment(false);
      await trackOperation(operationId, 'end');
    }
  }, [claimId, createPayment, showNotification, trackOperation, recordMetric]);

  // Loading state
  if (loading.getClaimById) {
    return (
      <div role="status" aria-live="polite">
        Loading claim details...
      </div>
    );
  }

  // Error state
  if (errors.getClaimById) {
    return (
      <div role="alert" aria-live="assertive">
        Error loading claim details: {errors.getClaimById.message}
      </div>
    );
  }

  return (
    <div className="claim-details" role="main">
      {/* Claim Header */}
      <header aria-labelledby={ARIA_LABELS.CLAIM_HEADER}>
        <h1 id={ARIA_LABELS.CLAIM_HEADER}>
          Claim #{selectedClaim?.claimNumber}
        </h1>
      </header>

      {/* Status Section */}
      <section aria-labelledby={ARIA_LABELS.STATUS_SELECT}>
        <h2 id={ARIA_LABELS.STATUS_SELECT}>Claim Status</h2>
        <select
          value={selectedClaim?.status}
          onChange={(e) => handleStatusUpdate(e.target.value as ClaimStatus)}
          aria-label="Select claim status"
          disabled={loading.updateClaim}
        >
          {Object.values(ClaimStatus).map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </section>

      {/* Documents Section */}
      <section aria-labelledby={ARIA_LABELS.DOCUMENT_SECTION}>
        <h2 id={ARIA_LABELS.DOCUMENT_SECTION}>Documents</h2>
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleDocumentUpload(e.target.files[0])}
          aria-label={ARIA_LABELS.UPLOAD_BUTTON}
          disabled={loading.uploadDocument}
        />
        {uploadProgress > 0 && (
          <progress
            value={uploadProgress}
            max="100"
            aria-label="Document upload progress"
          >
            {uploadProgress}%
          </progress>
        )}
        <ul aria-label="Claim documents list">
          {selectedClaim?.documents.map((doc) => (
            <li key={doc.id}>
              {doc.fileName} - {doc.documentType}
            </li>
          ))}
        </ul>
      </section>

      {/* Payments Section */}
      <section aria-labelledby={ARIA_LABELS.PAYMENT_SECTION}>
        <h2 id={ARIA_LABELS.PAYMENT_SECTION}>Payments</h2>
        <button
          onClick={() => handlePaymentProcess(selectedClaim?.claimAmount || 0)}
          aria-label={ARIA_LABELS.PAYMENT_BUTTON}
          disabled={processingPayment || loading.createPayment}
        >
          Process Payment
        </button>
        <ul aria-label="Payment history list">
          {selectedClaim?.payments.map((payment) => (
            <li key={payment.id}>
              Amount: ${payment.amount} - Status: {payment.status}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
});

ClaimDetails.displayName = 'ClaimDetails';

export default ClaimDetails;