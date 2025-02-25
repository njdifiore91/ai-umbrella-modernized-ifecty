import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyForm } from './PolicyForm';
import { renderWithAuth, mockApiCall } from '../../../utils/test.utils';
import { PolicyService } from '../../../services/policy.service';
import { PolicyStatus } from '../../../types/policy.types';

// Mock policy service
jest.mock('../../../services/policy.service', () => ({
  createPolicy: jest.fn(),
  updatePolicy: jest.fn(),
  getMetrics: jest.fn()
}));

// Mock policy data with Spring Boot monitoring metrics
const mockPolicyData = {
  id: 1,
  policyNumber: 'POL-2024-123456',
  effectiveDate: '2024-01-01',
  expiryDate: '2025-01-01',
  totalPremium: 5000,
  status: PolicyStatus.ACTIVE,
  metrics: {
    processingTime: '100ms',
    threadType: 'virtual',
    containerInfo: {
      podName: 'umbrella-pod-1',
      namespace: 'insurance'
    }
  }
};

describe('PolicyForm Component with Spring Boot Integration', () => {
  let mockOnSubmit: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockOnSubmit = jest.fn();

    // Setup successful API responses with monitoring data
    (PolicyService.prototype.createPolicy as jest.Mock).mockResolvedValue({
      data: mockPolicyData,
      status: 200,
      message: 'Success',
      metrics: {
        processingTime: '100ms',
        threadType: 'virtual'
      }
    });

    (PolicyService.prototype.updatePolicy as jest.Mock).mockResolvedValue({
      data: mockPolicyData,
      status: 200,
      message: 'Success',
      metrics: {
        processingTime: '100ms',
        threadType: 'virtual'
      }
    });
  });

  it('renders form fields with Spring Boot validation attributes', async () => {
    renderWithAuth(<PolicyForm onSubmit={mockOnSubmit} />);

    // Verify all required form fields are present with validation attributes
    expect(screen.getByLabelText(/policy number/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/effective date/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/expiry date/i)).toHaveAttribute('required');
    expect(screen.getByLabelText(/total premium/i)).toHaveAttribute('required');

    // Verify accessibility attributes
    expect(screen.getByLabelText(/policy number/i)).toHaveAttribute('aria-required', 'true');
    expect(screen.getByRole('form')).toBeInTheDocument();
  });

  it('handles input changes with Spring Boot validation', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PolicyForm onSubmit={mockOnSubmit} />);

    const policyNumberInput = screen.getByLabelText(/policy number/i);
    await user.type(policyNumberInput, 'POL-2024-123456');

    expect(policyNumberInput).toHaveValue('POL-2024-123456');
    expect(policyNumberInput).not.toHaveAttribute('aria-invalid', 'true');
  });

  it('validates required fields with Spring Boot constraints', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PolicyForm onSubmit={mockOnSubmit} />);

    const submitButton = screen.getByRole('button', { name: /create policy/i });
    await user.click(submitButton);

    // Verify validation error messages
    await waitFor(() => {
      expect(screen.getByText(/policy number is required/i)).toBeInTheDocument();
      expect(screen.getByText(/effective date is required/i)).toBeInTheDocument();
      expect(screen.getByText(/expiry date is required/i)).toBeInTheDocument();
    });
  });

  it('handles policy creation with Spring Boot integration', async () => {
    const user = userEvent.setup();
    renderWithAuth(<PolicyForm onSubmit={mockOnSubmit} />);

    // Fill form with valid data
    await user.type(screen.getByLabelText(/policy number/i), 'POL-2024-123456');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/expiry date/i), '2025-01-01');
    await user.type(screen.getByLabelText(/total premium/i), '5000');

    // Submit form
    await user.click(screen.getByRole('button', { name: /create policy/i }));

    // Verify API call and success handling
    await waitFor(() => {
      expect(PolicyService.prototype.createPolicy).toHaveBeenCalledWith({
        policyNumber: 'POL-2024-123456',
        effectiveDate: '2024-01-01',
        expiryDate: '2025-01-01',
        totalPremium: 5000,
        status: PolicyStatus.PENDING
      });
      expect(mockOnSubmit).toHaveBeenCalledWith(mockPolicyData);
    });
  });

  it('handles policy update with enhanced monitoring', async () => {
    const user = userEvent.setup();
    renderWithAuth(
      <PolicyForm 
        onSubmit={mockOnSubmit} 
        initialValues={mockPolicyData}
        isEdit={true}
      />
    );

    // Update form data
    await user.clear(screen.getByLabelText(/total premium/i));
    await user.type(screen.getByLabelText(/total premium/i), '6000');

    // Submit update
    await user.click(screen.getByRole('button', { name: /update policy/i }));

    // Verify API call with monitoring data
    await waitFor(() => {
      expect(PolicyService.prototype.updatePolicy).toHaveBeenCalledWith(
        mockPolicyData.id,
        expect.objectContaining({
          totalPremium: 6000
        })
      );
    });
  });

  it('handles API errors with Spring Boot integration', async () => {
    const user = userEvent.setup();
    const apiError = new Error('API Error');
    (PolicyService.prototype.createPolicy as jest.Mock).mockRejectedValue(apiError);

    renderWithAuth(<PolicyForm onSubmit={mockOnSubmit} />);

    // Fill and submit form
    await user.type(screen.getByLabelText(/policy number/i), 'POL-2024-123456');
    await user.type(screen.getByLabelText(/effective date/i), '2024-01-01');
    await user.type(screen.getByLabelText(/expiry date/i), '2025-01-01');
    await user.type(screen.getByLabelText(/total premium/i), '5000');

    await user.click(screen.getByRole('button', { name: /create policy/i }));

    // Verify error handling
    await waitFor(() => {
      expect(screen.getByText(/error processing policy/i)).toBeInTheDocument();
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });
});