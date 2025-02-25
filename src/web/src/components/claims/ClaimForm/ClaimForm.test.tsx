import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithAuth } from '../../../utils/test.utils';
import { ClaimForm } from './ClaimForm';
import { ClaimStatus } from '../../../types/claims.types';
import { LoadingState } from '../../../types/common.types';
import { mockActuatorEndpoint } from '@spring-boot/actuator-mock';

// Mock Spring Boot Actuator endpoints
jest.mock('@spring-boot/metrics', () => ({
  useMetrics: () => ({
    recordMetric: jest.fn(),
    startTimer: jest.fn(() => ({
      end: jest.fn()
    }))
  })
}));

// Mock services and hooks
jest.mock('../../../hooks/useClaims', () => ({
  useClaims: () => ({
    createClaim: jest.fn().mockResolvedValue({
      data: { id: 1, status: ClaimStatus.PENDING }
    }),
    updateClaim: jest.fn().mockResolvedValue({
      data: { id: 1, status: ClaimStatus.IN_REVIEW }
    }),
    uploadDocument: jest.fn().mockResolvedValue({
      data: { id: 1, fileName: 'test.pdf' }
    }),
    loading: {
      createClaim: false,
      updateClaim: false,
      uploadDocument: false
    }
  })
}));

jest.mock('../../../hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: jest.fn()
  })
}));

describe('ClaimForm Component', () => {
  // Test setup with monitoring configuration
  const setup = () => {
    const user = userEvent.setup();
    const mockMetrics = mockActuatorEndpoint('/actuator/metrics/claims.form');
    const onSubmit = jest.fn();
    const onCancel = jest.fn();

    const initialData = {
      id: 1,
      description: 'Test Claim',
      claimAmount: 1000,
      incidentDate: '2023-01-01',
      status: ClaimStatus.DRAFT
    };

    const renderResult = renderWithAuth(
      <ClaimForm
        initialData={initialData}
        onSubmit={onSubmit}
        onCancel={onCancel}
        isEdit={false}
        metrics={{
          prefix: 'claims.form',
          labels: { component: 'ClaimForm' }
        }}
      />
    );

    return {
      user,
      mockMetrics,
      onSubmit,
      onCancel,
      ...renderResult
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders form fields correctly with monitoring integration', async () => {
    const { mockMetrics } = setup();

    // Verify form fields
    expect(screen.getByTestId('claim-description')).toBeInTheDocument();
    expect(screen.getByTestId('claim-amount')).toBeInTheDocument();
    expect(screen.getByTestId('incident-date')).toBeInTheDocument();
    expect(screen.getByTestId('document-upload')).toBeInTheDocument();

    // Verify monitoring initialization
    expect(mockMetrics.getMetricValue('form.render')).toBe(1);
  });

  it('handles form submission with valid data and performance tracking', async () => {
    const { user, onSubmit, mockMetrics } = setup();

    // Fill form fields
    await user.type(screen.getByTestId('claim-description'), 'Updated claim description');
    await user.type(screen.getByTestId('claim-amount'), '2000');
    await user.type(screen.getByTestId('incident-date'), '2024-01-15');

    // Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Verify submission and monitoring
    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({
        description: 'Updated claim description',
        claimAmount: 2000,
        incidentDate: '2024-01-15'
      }));
      expect(mockMetrics.getMetricValue('form.submit.success')).toBe(1);
    });
  });

  it('validates required fields with error tracking', async () => {
    const { user, mockMetrics } = setup();

    // Submit empty form
    await user.click(screen.getByTestId('submit-button'));

    // Verify validation errors
    await waitFor(() => {
      expect(screen.getByText('Description is required')).toBeInTheDocument();
      expect(screen.getByText('Claim amount is required')).toBeInTheDocument();
      expect(screen.getByText('Incident date is required')).toBeInTheDocument();
      expect(mockMetrics.getMetricValue('form.validation.error')).toBe(1);
    });
  });

  it('handles document upload with Virtual Thread support', async () => {
    const { user, mockMetrics } = setup();

    // Create test file
    const file = new File(['test content'], 'test.pdf', { type: 'application/pdf' });

    // Upload file
    const input = screen.getByTestId('document-upload');
    await user.upload(input, file);

    // Verify upload handling and monitoring
    await waitFor(() => {
      expect(screen.getByText('test.pdf')).toBeInTheDocument();
      expect(mockMetrics.getMetricValue('document.upload.success')).toBe(1);
    });
  });

  it('handles form cancellation with state cleanup', async () => {
    const { user, onCancel, mockMetrics } = setup();

    // Click cancel button
    await user.click(screen.getByTestId('cancel-button'));

    // Verify cancellation and monitoring
    expect(onCancel).toHaveBeenCalled();
    expect(mockMetrics.getMetricValue('form.cancel')).toBe(1);
  });

  it('displays loading state during submission', async () => {
    const { user } = setup();

    // Mock loading state
    jest.spyOn(React, 'useState').mockImplementation(() => [
      { createClaim: true },
      jest.fn()
    ]);

    // Submit form
    await user.click(screen.getByTestId('submit-button'));

    // Verify loading state
    expect(screen.getByTestId('submit-button')).toHaveAttribute(
      'data-loading',
      LoadingState.LOADING
    );
  });

  it('validates accessibility compliance', async () => {
    setup();

    // Verify ARIA attributes
    expect(screen.getByRole('form')).toHaveAttribute('aria-label', 'New Claim Form');
    expect(screen.getByTestId('claim-description')).toHaveAttribute('aria-describedby');
    expect(screen.getByTestId('document-upload')).toHaveAttribute('aria-label', 'Upload Documents');
  });

  it('integrates with Spring Boot monitoring endpoints', async () => {
    const { mockMetrics } = setup();

    // Verify metrics initialization
    expect(mockMetrics.hasEndpoint('/actuator/metrics/claims.form')).toBe(true);
    expect(mockMetrics.hasMetric('form.render')).toBe(true);
    expect(mockMetrics.hasMetric('form.submit')).toBe(true);
    expect(mockMetrics.hasMetric('document.upload')).toBe(true);
  });
});