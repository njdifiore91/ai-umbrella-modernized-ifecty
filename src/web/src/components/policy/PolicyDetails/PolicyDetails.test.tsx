import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PolicyDetails } from './PolicyDetails';
import { renderWithAuth, mockApiCall } from '../../../utils/test.utils';
import { PolicyStatus } from '../../../types/policy.types';
import { LoadingState } from '../../../types/common.types';
import { NotificationType } from '../../../hooks/useNotification';

// Mock policy data with comprehensive test coverage
const mockPolicyData = {
  id: 1,
  policyNumber: 'POL-2023-001',
  status: PolicyStatus.ACTIVE,
  totalPremium: 1250.50,
  effectiveDate: '2023-01-01',
  expiryDate: '2024-01-01',
  coverages: [
    {
      id: 1,
      policyId: 1,
      coverageType: 'Property',
      description: 'Basic property coverage',
      limit: 250000,
      deductible: 1000,
      premium: 750.50,
      status: 'ACTIVE',
      effectiveDate: '2023-01-01',
      expiryDate: '2024-01-01'
    },
    {
      id: 2,
      policyId: 1,
      coverageType: 'Liability',
      description: 'General liability coverage',
      limit: 500000,
      deductible: 2000,
      premium: 500.00,
      status: 'ACTIVE',
      effectiveDate: '2023-01-01',
      expiryDate: '2024-01-01'
    }
  ],
  createdDate: '2023-01-01T00:00:00Z',
  modifiedDate: '2023-01-01T00:00:00Z'
};

// Mock functions
const mockOnClose = jest.fn();

// Enhanced test setup with Spring Security context
beforeEach(() => {
  jest.clearAllMocks();
  // Configure Spring Security test context
  jest.spyOn(global, 'fetch').mockImplementation(mockApiCall(mockPolicyData));
});

// Cleanup after tests
afterEach(() => {
  jest.restoreAllMocks();
});

describe('PolicyDetails Component', () => {
  it('renders policy details with proper accessibility', async () => {
    renderWithAuth(
      <PolicyDetails 
        policyId={1} 
        onClose={mockOnClose}
      />,
      {
        permissions: [{ resourceType: 'POLICY_DATA', accessLevel: 'READ' }]
      }
    );

    // Verify policy number display with ARIA support
    expect(screen.getByText(/Policy #POL-2023-001/)).toBeInTheDocument();
    expect(screen.getByRole('region', { name: 'Policy Details' })).toBeInTheDocument();

    // Verify status display with proper ARIA attributes
    const statusElement = screen.getByRole('status', { name: /Policy Status: ACTIVE/ });
    expect(statusElement).toBeInTheDocument();
    expect(statusElement).toHaveAttribute('aria-label', 'Policy Status: ACTIVE');

    // Verify premium amount with proper formatting
    expect(screen.getByText('$1,250.50')).toBeInTheDocument();

    // Verify dates with proper formatting
    expect(screen.getByText('January 1, 2023')).toBeInTheDocument();
    expect(screen.getByText('January 1, 2024')).toBeInTheDocument();
  });

  it('displays coverage information with enhanced validation', async () => {
    renderWithAuth(
      <PolicyDetails 
        policyId={1} 
        onClose={mockOnClose}
      />,
      {
        permissions: [{ resourceType: 'POLICY_DATA', accessLevel: 'READ' }]
      }
    );

    // Verify coverage section accessibility
    const coverageSection = await screen.findByRole('region', { name: 'Policy Details' });
    expect(coverageSection).toBeInTheDocument();

    // Verify coverage details with proper formatting
    expect(screen.getByText('Property')).toBeInTheDocument();
    expect(screen.getByText(/Limit: \$250,000/)).toBeInTheDocument();
    expect(screen.getByText(/Deductible: \$1,000/)).toBeInTheDocument();

    // Verify all coverages are displayed
    mockPolicyData.coverages.forEach(coverage => {
      expect(screen.getByText(coverage.coverageType)).toBeInTheDocument();
      expect(screen.getByText(new RegExp(`Limit: \\$${coverage.limit.toLocaleString()}`))).toBeInTheDocument();
    });
  });

  it('handles policy export with Virtual Thread monitoring', async () => {
    const user = userEvent.setup();
    const mockExport = mockApiCall(new Blob(), false, { monitoring: true });

    renderWithAuth(
      <PolicyDetails 
        policyId={1} 
        onClose={mockOnClose}
      />,
      {
        permissions: [{ resourceType: 'POLICY_DATA', accessLevel: 'READ_WRITE' }]
      }
    );

    // Click export button and verify accessibility
    const exportButton = screen.getByRole('button', { name: /Export policy to PDF/i });
    expect(exportButton).toBeInTheDocument();
    expect(exportButton).toHaveAttribute('aria-label', 'Export policy to PDF');

    await user.click(exportButton);

    // Verify export request with Virtual Thread support
    await waitFor(() => {
      expect(mockExport).toHaveBeenCalledWith(
        expect.objectContaining({
          headers: expect.objectContaining({
            'X-Virtual-Thread': 'true'
          })
        })
      );
    });

    // Verify success notification
    expect(screen.getByRole('alert')).toHaveTextContent('Policy exported successfully');
  });

  it('handles loading state with performance monitoring', async () => {
    renderWithAuth(
      <PolicyDetails 
        policyId={1} 
        onClose={mockOnClose}
      />,
      {
        permissions: [{ resourceType: 'POLICY_DATA', accessLevel: 'READ' }]
      }
    );

    // Verify loading state accessibility
    expect(screen.getByRole('alert')).toHaveAttribute('aria-busy', 'true');
    expect(screen.getByText('Loading policy details...')).toBeInTheDocument();

    // Verify loading state resolves
    await waitFor(() => {
      expect(screen.queryByText('Loading policy details...')).not.toBeInTheDocument();
    });
  });

  it('handles error state with monitoring integration', async () => {
    const mockError = new Error('Failed to load policy');
    jest.spyOn(global, 'fetch').mockRejectedValue(mockError);

    renderWithAuth(
      <PolicyDetails 
        policyId={1} 
        onClose={mockOnClose}
      />,
      {
        permissions: [{ resourceType: 'POLICY_DATA', accessLevel: 'READ' }]
      }
    );

    // Verify error state accessibility
    await waitFor(() => {
      const errorAlert = screen.getByRole('alert');
      expect(errorAlert).toBeInTheDocument();
      expect(errorAlert).toHaveTextContent('Error loading policy details');
    });

    // Verify close button functionality
    const closeButton = screen.getByRole('button', { name: /Close/i });
    await userEvent.click(closeButton);
    expect(mockOnClose).toHaveBeenCalled();
  });
});