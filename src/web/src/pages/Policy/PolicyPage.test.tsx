import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { PolicyPage } from './PolicyPage';
import { renderWithAuth, mockApiCall } from '../../utils/test.utils';
import { PolicyStatus } from '../../types/policy.types';
import { LoadingState } from '../../types/common.types';

// Add jest-axe matchers
expect.extend(toHaveNoViolations);

// Mock policy data
const mockPolicies = [
  {
    id: 1,
    policyNumber: 'POL-2023-000001',
    status: PolicyStatus.ACTIVE,
    totalPremium: 1000.00,
    effectiveDate: '2023-01-01',
    expiryDate: '2024-01-01',
    coverages: [],
    createdDate: '2023-01-01T00:00:00Z',
    modifiedDate: '2023-01-01T00:00:00Z'
  }
];

// Mock hooks
jest.mock('../../hooks/usePolicy', () => ({
  usePolicy: () => ({
    policies: mockPolicies,
    loading: false,
    error: null,
    createPolicy: mockApiCall(mockPolicies[0]),
    updatePolicy: mockApiCall(mockPolicies[0]),
    deletePolicy: mockApiCall(undefined),
    exportPolicy: mockApiCall(new Blob())
  })
}));

describe('PolicyPage', () => {
  // Setup test environment before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Accessibility testing
  it('should pass accessibility tests', async () => {
    const { container } = renderWithAuth(<PolicyPage />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  // Component rendering tests
  it('should render policy list view by default', () => {
    renderWithAuth(<PolicyPage />);
    expect(screen.getByRole('region', { name: /policy list/i })).toBeInTheDocument();
    expect(screen.getByText('Policy Management')).toBeInTheDocument();
  });

  // Create policy tests
  describe('Create Policy', () => {
    it('should switch to create view when create button is clicked', async () => {
      renderWithAuth(<PolicyPage />);
      const createButton = screen.getByRole('button', { name: /create policy/i });
      await userEvent.click(createButton);
      expect(screen.getByRole('region', { name: /create policy/i })).toBeInTheDocument();
    });

    it('should show validation errors for invalid policy data', async () => {
      renderWithAuth(<PolicyPage />);
      const createButton = screen.getByRole('button', { name: /create policy/i });
      await userEvent.click(createButton);

      const submitButton = screen.getByRole('button', { name: /create policy/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getAllByRole('alert')).toHaveLength(4); // Required fields validation
      });
    });

    it('should create policy with valid data', async () => {
      renderWithAuth(<PolicyPage />);
      const createButton = screen.getByRole('button', { name: /create policy/i });
      await userEvent.click(createButton);

      // Fill form fields
      await userEvent.type(screen.getByLabelText(/policy number/i), 'POL-2023-000001');
      await userEvent.type(screen.getByLabelText(/effective date/i), '2023-01-01');
      await userEvent.type(screen.getByLabelText(/expiry date/i), '2024-01-01');
      await userEvent.type(screen.getByLabelText(/total premium/i), '1000');

      const submitButton = screen.getByRole('button', { name: /create policy/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('region', { name: /policy list/i })).toBeInTheDocument();
      });
    });
  });

  // Edit policy tests
  describe('Edit Policy', () => {
    it('should switch to edit view when edit button is clicked', async () => {
      renderWithAuth(<PolicyPage />);
      const editButton = screen.getByRole('button', { name: /edit policy/i });
      await userEvent.click(editButton);
      expect(screen.getByRole('region', { name: /edit policy/i })).toBeInTheDocument();
    });

    it('should populate form with policy data in edit mode', async () => {
      renderWithAuth(<PolicyPage />);
      const editButton = screen.getByRole('button', { name: /edit policy/i });
      await userEvent.click(editButton);

      await waitFor(() => {
        expect(screen.getByDisplayValue('POL-2023-000001')).toBeInTheDocument();
        expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
      });
    });
  });

  // Delete policy tests
  describe('Delete Policy', () => {
    it('should show confirmation dialog before deleting', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => true);
      renderWithAuth(<PolicyPage />);
      
      const deleteButton = screen.getByRole('button', { name: /delete policy/i });
      await userEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      confirmSpy.mockRestore();
    });

    it('should not delete when confirmation is cancelled', async () => {
      const confirmSpy = jest.spyOn(window, 'confirm').mockImplementation(() => false);
      renderWithAuth(<PolicyPage />);
      
      const deleteButton = screen.getByRole('button', { name: /delete policy/i });
      await userEvent.click(deleteButton);

      expect(confirmSpy).toHaveBeenCalled();
      await waitFor(() => {
        expect(screen.getByText('POL-2023-000001')).toBeInTheDocument();
      });
      confirmSpy.mockRestore();
    });
  });

  // Loading state tests
  describe('Loading States', () => {
    it('should show loading indicator when fetching policies', () => {
      jest.spyOn(React, 'useState').mockImplementation(() => [LoadingState.LOADING, jest.fn()]);
      renderWithAuth(<PolicyPage />);
      expect(screen.getByText(/loading/i)).toBeInTheDocument();
    });
  });

  // Error handling tests
  describe('Error Handling', () => {
    it('should show error message when policy operation fails', async () => {
      const mockError = new Error('Failed to load policies');
      jest.spyOn(React, 'useState').mockImplementation(() => [mockError, jest.fn()]);
      
      renderWithAuth(<PolicyPage />);
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to load policies/i);
    });
  });

  // Keyboard navigation tests
  describe('Keyboard Navigation', () => {
    it('should support keyboard navigation', async () => {
      renderWithAuth(<PolicyPage />);
      
      // Test tab navigation
      await userEvent.tab();
      expect(screen.getByRole('button', { name: /create policy/i })).toHaveFocus();

      // Test escape key
      await userEvent.keyboard('{Escape}');
      expect(screen.getByRole('region', { name: /policy list/i })).toBeInTheDocument();
    });
  });

  // Performance monitoring tests
  describe('Performance Monitoring', () => {
    it('should track render performance', async () => {
      const performanceSpy = jest.spyOn(performance, 'mark');
      renderWithAuth(<PolicyPage />);
      expect(performanceSpy).toHaveBeenCalledWith('PolicyPage-render-start');
      expect(performanceSpy).toHaveBeenCalledWith('PolicyPage-render-end');
      performanceSpy.mockRestore();
    });
  });
});