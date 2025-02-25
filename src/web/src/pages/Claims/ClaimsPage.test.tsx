import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@axe-core/react';
import ClaimsPage from './ClaimsPage';
import { renderWithAuth, createMockApiResponse, mockApiCall } from '../../utils/test.utils';
import { ClaimsService } from '../../services/claims.service';
import { ClaimStatus } from '../../types/claims.types';
import { LoadingState } from '../../types/common.types';

// Mock Spring Boot Actuator hooks
jest.mock('@spring-boot/actuator-hooks', () => ({
  useMetrics: () => ({
    increment: jest.fn(),
    startTimer: () => ({ end: jest.fn() }),
    getValue: jest.fn().mockReturnValue(5)
  }),
  useHealth: () => ({
    status: 'UP'
  })
}));

// Mock ClaimsService methods
const mockGetClaims = jest.fn();
const mockGetClaimById = jest.fn();
const mockCreateClaim = jest.fn();
const mockGetClaimMetrics = jest.fn();

jest.mock('../../services/claims.service', () => ({
  ClaimsService: jest.fn().mockImplementation(() => ({
    getClaims: mockGetClaims,
    getClaimById: mockGetClaimById,
    createClaim: mockCreateClaim,
    getClaimMetrics: mockGetClaimMetrics
  }))
}));

describe('ClaimsPage', () => {
  const mockClaims = [
    {
      id: 1,
      claimNumber: 'CLM-001',
      status: ClaimStatus.PENDING,
      description: 'Test claim 1',
      claimAmount: 1000,
      incidentDate: '2023-12-01',
      reportedDate: '2023-12-02'
    },
    {
      id: 2,
      claimNumber: 'CLM-002',
      status: ClaimStatus.IN_REVIEW,
      description: 'Test claim 2',
      claimAmount: 2000,
      incidentDate: '2023-12-03',
      reportedDate: '2023-12-04'
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetClaims.mockResolvedValue(createMockApiResponse({
      items: mockClaims,
      totalItems: 2,
      currentPage: 0,
      totalPages: 1,
      pageSize: 10
    }));
    mockGetClaimMetrics.mockResolvedValue(createMockApiResponse({
      activeClaimsCount: 5,
      averageProcessingTime: 24
    }));
  });

  it('renders claims page with accessibility support', async () => {
    const { container } = renderWithAuth(<ClaimsPage />);

    // Wait for initial data load
    await waitFor(() => {
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    // Check accessibility
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Verify page structure
    expect(screen.getByRole('heading', { name: /claims management/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/health: up/i);
    expect(screen.getByRole('status')).toHaveTextContent(/active claims: 5/i);
  });

  it('displays claims list with monitoring integration', async () => {
    renderWithAuth(<ClaimsPage />);

    await waitFor(() => {
      expect(mockGetClaims).toHaveBeenCalledWith(
        expect.objectContaining({
          page: 0,
          size: 10
        })
      );
    });

    // Verify claims are rendered
    const claimsList = screen.getByRole('region', { name: /claims list/i });
    expect(within(claimsList).getAllByRole('row')).toHaveLength(3); // Header + 2 claims
  });

  it('handles create claim with Virtual Thread support', async () => {
    const user = userEvent.setup();
    mockCreateClaim.mockResolvedValue(createMockApiResponse({
      id: 3,
      claimNumber: 'CLM-003',
      status: ClaimStatus.PENDING
    }));

    renderWithAuth(<ClaimsPage />);

    // Click create button
    await user.click(screen.getByRole('button', { name: /create new claim/i }));

    // Verify modal is displayed
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/create new claim/i)).toBeInTheDocument();

    // Fill and submit form
    await user.type(screen.getByTestId('claim-description'), 'New test claim');
    await user.type(screen.getByTestId('claim-amount'), '3000');
    await user.type(screen.getByTestId('incident-date'), '2023-12-05');
    
    await user.click(screen.getByRole('button', { name: /submit claim/i }));

    // Verify submission
    await waitFor(() => {
      expect(mockCreateClaim).toHaveBeenCalledWith(
        expect.objectContaining({
          description: 'New test claim',
          claimAmount: '3000',
          incidentDate: '2023-12-05'
        })
      );
    });
  });

  it('displays claim details with monitoring integration', async () => {
    const user = userEvent.setup();
    mockGetClaimById.mockResolvedValue(createMockApiResponse(mockClaims[0]));

    renderWithAuth(<ClaimsPage />);

    // Wait for claims to load
    await waitFor(() => {
      expect(screen.getByRole('region', { name: /claims list/i })).toBeInTheDocument();
    });

    // Click on claim row
    const claimRows = screen.getAllByRole('row');
    await user.click(claimRows[1]); // First claim after header

    // Verify details modal
    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: /claim details/i })).toBeInTheDocument();
    });

    // Verify monitoring integration
    expect(mockGetClaimById).toHaveBeenCalledWith(
      1,
      expect.objectContaining({
        headers: expect.objectContaining({
          'X-Virtual-Thread': 'true'
        })
      })
    );
  });

  it('handles error states with accessibility', async () => {
    mockGetClaims.mockRejectedValue(new Error('Failed to fetch claims'));
    
    renderWithAuth(<ClaimsPage />);

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent(/failed to fetch claims/i);
    });
  });

  it('supports keyboard navigation', async () => {
    const user = userEvent.setup();
    renderWithAuth(<ClaimsPage />);

    await waitFor(() => {
      expect(screen.getByRole('region', { name: /claims list/i })).toBeInTheDocument();
    });

    // Navigate using keyboard
    await user.tab(); // Focus create button
    expect(screen.getByRole('button', { name: /create new claim/i })).toHaveFocus();

    await user.tab(); // Focus first claim row
    const claimRows = screen.getAllByRole('row');
    expect(claimRows[1]).toHaveFocus();
  });
});