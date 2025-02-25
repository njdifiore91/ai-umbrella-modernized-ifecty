import React, { useCallback, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { useMetrics } from '@spring-boot/metrics';
import Input from '../../common/Input/Input';
import Button from '../../common/Button/Button';
import { useClaims } from '../../../hooks/useClaims';
import { useNotification } from '../../../hooks/useNotification';
import { 
  Claim, 
  ClaimDocument, 
  ClaimStatus, 
  DocumentType 
} from '../../../types/claims.types';
import { LoadingState } from '../../../types/common.types';

// Validation schema with enhanced error messages
const validationSchema = yup.object().shape({
  description: yup
    .string()
    .required('Description is required')
    .min(10, 'Description must be at least 10 characters'),
  claimAmount: yup
    .number()
    .required('Claim amount is required')
    .min(0, 'Amount must be greater than 0'),
  incidentDate: yup
    .date()
    .required('Incident date is required')
    .max(new Date(), 'Incident date cannot be in the future'),
  documents: yup.array().of(
    yup.object().shape({
      fileType: yup.string().required('File type is required'),
      size: yup.number().max(10000000, 'File size must be less than 10MB')
    })
  )
});

// Props interface with monitoring configuration
interface ClaimFormProps {
  initialData?: Claim;
  onSubmit?: (data: Claim) => void;
  onCancel?: () => void;
  isEdit?: boolean;
  metrics?: {
    prefix: string;
    labels: Record<string, string>;
  };
}

/**
 * Enhanced claim form component with Spring Boot monitoring and Virtual Thread support
 * @component
 */
export const ClaimForm: React.FC<ClaimFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isEdit = false,
  metrics = {
    prefix: 'claim_form',
    labels: { component: 'ClaimForm' }
  }
}) => {
  // Form state management with validation
  const { register, handleSubmit: validateSubmit, formState: { errors }, reset } = useForm({
    defaultValues: initialData,
    resolver: yup.resolver(validationSchema)
  });

  // Custom hooks
  const { createClaim, updateClaim, uploadDocument, loading } = useClaims();
  const { showNotification } = useNotification();
  const { recordMetric, startTimer } = useMetrics(metrics.prefix);

  // Local state
  const [documents, setDocuments] = useState<File[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number>(0);

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  /**
   * Enhanced form submission handler with monitoring and error tracking
   */
  const handleSubmit = useCallback(async (data: any) => {
    const timer = startTimer('submit_duration');
    
    try {
      recordMetric('submit_attempt', 1);

      const formData = {
        ...data,
        status: isEdit ? data.status : ClaimStatus.PENDING,
        documents: documents.map(file => ({
          fileName: file.name,
          fileType: file.type,
          size: file.size
        }))
      };

      const response = isEdit
        ? await updateClaim(initialData!.id, formData)
        : await createClaim(formData);

      if (response) {
        // Upload documents using Virtual Thread support
        if (documents.length > 0) {
          const uploadPromises = documents.map(file => {
            const formData = new FormData();
            formData.append('file', file);
            return uploadDocument(response.data.id, formData);
          });

          await Promise.all(uploadPromises);
        }

        recordMetric('submit_success', 1);
        showNotification('Claim saved successfully', 'success');
        onSubmit?.(response.data);
      }
    } catch (error) {
      recordMetric('submit_error', 1);
      showNotification('Error saving claim', 'warning');
      console.error('Claim submission error:', error);
    } finally {
      timer.end();
    }
  }, [
    isEdit,
    initialData,
    documents,
    createClaim,
    updateClaim,
    uploadDocument,
    showNotification,
    recordMetric,
    startTimer,
    onSubmit
  ]);

  /**
   * Document upload handler with Virtual Thread support and monitoring
   */
  const handleDocumentUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const timer = startTimer('upload_duration');
    const files = Array.from(event.target.files || []);

    try {
      recordMetric('upload_attempt', files.length);

      // Validate files
      const validFiles = files.filter(file => {
        const isValidSize = file.size <= 10000000; // 10MB
        const isValidType = ['application/pdf', 'image/jpeg', 'image/png'].includes(file.type);
        return isValidSize && isValidType;
      });

      if (validFiles.length !== files.length) {
        showNotification('Some files were rejected due to size or type restrictions', 'warning');
      }

      setDocuments(prev => [...prev, ...validFiles]);
      recordMetric('upload_success', validFiles.length);
    } catch (error) {
      recordMetric('upload_error', 1);
      showNotification('Error uploading documents', 'warning');
      console.error('Document upload error:', error);
    } finally {
      timer.end();
    }
  }, [recordMetric, showNotification, startTimer]);

  return (
    <form 
      onSubmit={validateSubmit(handleSubmit)}
      className="claim-form"
      aria-label={isEdit ? 'Edit Claim Form' : 'New Claim Form'}
    >
      <Input
        label="Description"
        error={errors.description?.message}
        {...register('description')}
        aria-describedby="description-error"
        data-testid="claim-description"
      />

      <Input
        label="Claim Amount"
        type="number"
        error={errors.claimAmount?.message}
        {...register('claimAmount')}
        aria-describedby="amount-error"
        data-testid="claim-amount"
      />

      <Input
        label="Incident Date"
        type="date"
        error={errors.incidentDate?.message}
        {...register('incidentDate')}
        aria-describedby="date-error"
        data-testid="incident-date"
      />

      <div className="document-upload">
        <input
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleDocumentUpload}
          aria-label="Upload Documents"
          data-testid="document-upload"
        />
        {documents.length > 0 && (
          <ul aria-label="Uploaded Documents">
            {documents.map((file, index) => (
              <li key={index}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="form-actions">
        <Button
          type="submit"
          variant="primary"
          loadingState={loading.createClaim || loading.updateClaim ? LoadingState.LOADING : LoadingState.IDLE}
          disabled={loading.createClaim || loading.updateClaim}
          data-testid="submit-button"
        >
          {isEdit ? 'Update Claim' : 'Submit Claim'}
        </Button>

        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={loading.createClaim || loading.updateClaim}
          data-testid="cancel-button"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default ClaimForm;