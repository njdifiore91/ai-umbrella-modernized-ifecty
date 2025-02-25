/**
 * Test suite for ClaimDetails component with enhanced Spring Boot integration,
 * monitoring capabilities, and accessibility testing.
 * @version 1.0.0
 */

import React from 'react';
import { render, within, waitFor, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { mockSpringActuator } from '@testing-library/react-spring-boot';
import { mockVirtualThreadPerformance } from '@testing-library/performance';
import { ClaimDetails } from './ClaimDetails';
import { renderWithAuth } from '../../../utils/test.utils';
import { useClaims } from '../../../hooks/useClaims';
import { ClaimStatus, DocumentType, PaymentStatus } from '../../../types/claims.types';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Mock hooks and services
jest.mock('../../../hooks/useClaims');
jest.mock('../../../hooks/useNotification');

// Mock data
const mockClaim = {
  id: 1,
  claimNumber: 'CLM-2023-001',
  status: ClaimStatus.PENDING,
  description: 'Test claim',
  claimAmount: 1000,
  paidAmount: 0,
  incidentDate: '2023-01-01',
  reportedDate: '2023-01-02',
  createdDate: '2023-01-02',
  modifiedDate: '2023-01-02',
  documents: [
    {
      id: 1,
      claimId: 1,
      fileName: 'test.pdf',
      fileType: 'application/pdf',
      documentType: DocumentType.CLAIM_FORM,
      fileSize: 1024,
      uploadedAt: '2023-01-02',
      uploadedBy: 'testuser'
    }
  ],
  payments: [
    {
      id: 1,
      transactionId: 'TXN-001',
      amount: 500,
      status: PaymentStatus.COMPLETED,
      paymentDate: '2023-01-03',
      createdDate: '2023-01-03',
      modifiedDate: '2023-01-03'
    }
  ]
};

describe('ClaimDetails component', () => {
  // Set up Spring Boot test environment
  beforeAll(() => {
    mockSpringActuator.setup({
      endpoints: {
        health: true,
        metrics: true,
        trace: true
      }
    });
  });

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Mock useClaims hook implementation
    (useClaims as jest.Mock).mockReturnValue({
      selectedClaim: mockClaim,
      loading: {
        getClaimById: false,
        updateClaim: false,
        uploadDocument: false,
        createPayment: false
      },
      errors: {
        getClaimById: null,
        updateClaim: null,
        uploadDocument: null,
        createPayment: null
      },
      getClaimById: jest.fn(),
      updateClaim: jest.fn(),
      uploadDocument: jest.fn(),
      createPayment: jest.fn()
    });
  });

  it('should render claim details correctly', async () => {
    const { getByText, getByLabelText } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    await waitFor(() => {
      expect(getByText(`Claim #${mockClaim.claimNumber}`)).toBeInTheDocument();
      expect(getByLabelText('Select claim status')).toHaveValue(mockClaim.status);
    });

    // Verify Spring Boot metrics were recorded
    expect(mockSpringActuator.getMetricValue('claim_details_loaded')).toBe(1);
  });

  it('should handle status updates with monitoring', async () => {
    const { getByLabelText } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    const statusSelect = getByLabelText('Select claim status');
    fireEvent.change(statusSelect, { target: { value: ClaimStatus.IN_REVIEW } });

    await waitFor(() => {
      expect(useClaims().updateClaim).toHaveBeenCalledWith(1, {
        status: ClaimStatus.IN_REVIEW
      });
    });

    // Verify Spring Boot metrics
    expect(mockSpringActuator.getMetricValue('claim_status_updated')).toBe(1);
  });

  it('should handle document upload with progress tracking', async () => {
    const { getByLabelText } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = getByLabelText('Upload Document Button');

    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });

    fireEvent.change(fileInput);

    await waitFor(() => {
      expect(useClaims().uploadDocument).toHaveBeenCalledWith(1, expect.any(FormData));
    });

    // Verify upload progress metrics
    expect(mockSpringActuator.getMetricValue('document_upload_progress')).toBeDefined();
  });

  it('should process payments with Virtual Thread performance monitoring', async () => {
    const { getByLabelText } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    // Mock Virtual Thread performance monitoring
    mockVirtualThreadPerformance.enable();

    const paymentButton = getByLabelText('Process Payment Button');
    fireEvent.click(paymentButton);

    await waitFor(() => {
      expect(useClaims().createPayment).toHaveBeenCalledWith(1, expect.any(Object));
    });

    // Verify Virtual Thread metrics
    expect(mockVirtualThreadPerformance.getMetrics()).toMatchObject({
      threadCount: expect.any(Number),
      processingTime: expect.any(Number)
    });
  });

  it('should handle loading states correctly', async () => {
    (useClaims as jest.Mock).mockReturnValue({
      ...useClaims(),
      loading: {
        getClaimById: true
      }
    });

    const { getByRole } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    expect(getByRole('status')).toHaveTextContent('Loading claim details...');
  });

  it('should handle error states with proper messaging', async () => {
    const errorMessage = 'Failed to load claim';
    (useClaims as jest.Mock).mockReturnValue({
      ...useClaims(),
      errors: {
        getClaimById: { message: errorMessage }
      }
    });

    const { getByRole } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    expect(getByRole('alert')).toHaveTextContent(errorMessage);
  });

  it('should verify accessibility compliance', async () => {
    const { container } = renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    // Run accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Verify ARIA attributes
    expect(screen.getByLabelText('Claim Details Header')).toBeInTheDocument();
    expect(screen.getByLabelText('Claim Status Selection')).toBeInTheDocument();
    expect(screen.getByLabelText('Claim Documents Section')).toBeInTheDocument();
    expect(screen.getByLabelText('Payment Processing Section')).toBeInTheDocument();
  });

  it('should monitor performance metrics', async () => {
    renderWithAuth(
      <ClaimDetails claimId={1} />
    );

    await waitFor(() => {
      // Verify Spring Boot Actuator metrics
      expect(mockSpringActuator.getMetricValue('http.server.requests')).toBeDefined();
      expect(mockSpringActuator.getMetricValue('claim.details.loaded')).toBeDefined();
      expect(mockSpringActuator.getMetricValue('virtual.thread.active')).toBeDefined();
    });
  });
});