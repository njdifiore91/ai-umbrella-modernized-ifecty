import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClaimList } from './ClaimList';
import { useClaims } from '../../../hooks/useClaims';
import { createMockApiResponse, renderWithAuth } from '../../../utils/test.utils';
import { ClaimStatus } from '../../../types/claims.types';

// Mock useClaims hook
jest.mock('../../../hooks/useClaims');
const mockUseClaims = useClaims as jest.Mock;

// Mock Spring Boot metrics collector
const mockMetricsCollector = {
  increment: jest.fn(),
  timing: jest.fn(),
  gauge: jest.fn()
};

// Test data with performance metrics
const mockClaimsData = [
  {
    id: 1,
    claimNumber: 'CLM-2023-001',
    status: ClaimStatus.PENDING,
    claimAmount: 5000,
    incidentDate: '2023-12-01',
    reportedDate: '2023-12-02',
    metrics: {
      processingTime: 150,
      threadUtilization: 0.75,
      responseTime: 120
    }
  },
  {
    id: 2,
    claimNumber: 'CLM-2023-002',
    status: ClaimStatus.IN_REVIEW,
    claimAmount: 7500,
    incidentDate: '2023-12-03',
    reportedDate: '2023-12-04',
    metrics: {
      processingTime: 180,
      threadUtilization: 0.8,
      responseTime: 140
    }
  }
];

// Setup function for common test configuration
const setupTest = () => {
  // Mock Spring Boot monitoring context
  const monitoringContext = {
    enabled: true,
    metrics: mockMetricsCollector,
    actuatorEndpoint: '/actuator/metrics/claims.list'
  };

  // Mock claims hook with Virtual Thread support
  mockUseClaims.mockReturnValue({
    claims: mockClaimsData,
    loading: { getClaims: false },
    error: null,
    getClaims: jest.fn(),
    totalItems: mockClaimsData.length,
    currentPage: 0,
    metrics: {
      virtualThreads: {
        active: 2,
        poolSize: 4,
        queueSize: 0
      },
      responseTime: {
        mean: 135,
        p95: 175
      }
    }
  });

  return { monitoringContext };
};

// Helper function to render component with monitoring
const renderClaimList = (props = {}) => {
  const { monitoringContext } = setupTest();
  
  return renderWithAuth(
    <ClaimList {...props} />,
    {
      user: { id: 1, username: 'testuser', role: 'CLAIMS_ADJUSTER' },
      monitoring: monitoringContext
    }
  );
};

describe('ClaimList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders initial claims list with monitoring verification', async () => {
    // Arrange
    const { container } = renderClaimList();

    // Assert - Component Rendering
    expect(screen.getByRole('region', { name: /claims list/i })).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /filter claims by status/i })).toBeInTheDocument();

    // Assert - Claims Data
    expect(screen.getByText('CLM-2023-001')).toBeInTheDocument();
    expect(screen.getByText('CLM-2023-002')).toBeInTheDocument();

    // Assert - Accessibility
    expect(container).toBeAccessible();

    // Assert - Monitoring Metrics
    expect(mockMetricsCollector.increment).toHaveBeenCalledWith('claims.list.render');
    expect(mockMetricsCollector.timing).toHaveBeenCalledWith(
      'claims.list.render.duration',
      expect.any(Number)
    );
  });

  it('handles loading state with performance tracking', async () => {
    // Arrange
    mockUseClaims.mockReturnValue({
      claims: [],
      loading: { getClaims: true },
      error: null,
      getClaims: jest.fn(),
      totalItems: 0,
      currentPage: 0,
      metrics: {
        virtualThreads: {
          active: 1,
          poolSize: 4,
          queueSize: 1
        }
      }
    });

    // Act
    renderClaimList();

    // Assert
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
    expect(mockMetricsCollector.gauge).toHaveBeenCalledWith(
      'claims.list.loading.virtualThreads.active',
      1
    );
  });

  it('handles Spring Boot error state correctly', async () => {
    // Arrange
    const springBootError = {
      code: 'CLAIMS_ERROR',
      message: 'Failed to fetch claims',
      details: { cause: 'Database connection error' },
      timestamp: new Date().toISOString()
    };

    mockUseClaims.mockReturnValue({
      claims: [],
      loading: { getClaims: false },
      error: springBootError,
      getClaims: jest.fn(),
      totalItems: 0,
      currentPage: 0
    });

    // Act
    renderClaimList();

    // Assert
    expect(screen.getByText(/failed to fetch claims/i)).toBeInTheDocument();
    expect(mockMetricsCollector.increment).toHaveBeenCalledWith('claims.list.error');
  });

  it('handles sorting with performance metrics', async () => {
    // Arrange
    const user = userEvent.setup();
    renderClaimList();

    // Act
    await user.click(screen.getByRole('columnheader', { name: /claim number/i }));

    // Assert
    expect(mockMetricsCollector.increment).toHaveBeenCalledWith('claims.list.sort');
    expect(mockMetricsCollector.timing).toHaveBeenCalledWith(
      'claims.list.sort.duration',
      expect.any(Number)
    );
  });

  it('handles filtering with monitoring', async () => {
    // Arrange
    const user = userEvent.setup();
    const { container } = renderClaimList();
    const filterSelect = screen.getByRole('combobox', { name: /filter claims by status/i });

    // Act
    await user.selectOptions(filterSelect, ClaimStatus.PENDING);

    // Assert
    expect(mockUseClaims().getClaims).toHaveBeenCalledWith(0, 10, ClaimStatus.PENDING);
    expect(mockMetricsCollector.increment).toHaveBeenCalledWith('claims.list.filter.status');
  });

  it('handles pagination with Virtual Thread performance verification', async () => {
    // Arrange
    const user = userEvent.setup();
    mockUseClaims.mockReturnValue({
      ...mockUseClaims(),
      totalItems: 25,
      currentPage: 0,
      metrics: {
        virtualThreads: {
          active: 2,
          poolSize: 4,
          queueSize: 0
        },
        responseTime: {
          mean: 130,
          p95: 170
        }
      }
    });

    // Act
    renderClaimList();
    await user.click(screen.getByRole('button', { name: /next page/i }));

    // Assert
    expect(mockUseClaims().getClaims).toHaveBeenCalledWith(1, 10, undefined);
    expect(mockMetricsCollector.gauge).toHaveBeenCalledWith(
      'claims.list.pagination.virtualThreads.active',
      2
    );
  });

  it('maintains accessibility during user interactions', async () => {
    // Arrange
    const user = userEvent.setup();
    const { container } = renderClaimList();

    // Act
    await user.click(screen.getByRole('columnheader', { name: /claim number/i }));
    await user.selectOptions(
      screen.getByRole('combobox', { name: /filter claims by status/i }),
      ClaimStatus.PENDING
    );

    // Assert
    expect(container).toBeAccessible();
    expect(mockMetricsCollector.increment).toHaveBeenCalledWith('claims.list.accessibility.check');
  });
});