import React from 'react';
import { render, screen, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from '@axe-core/react';
import { PolicyList } from './PolicyList';
import { Policy, PolicyStatus } from '../../../types/policy.types';
import { renderWithAuth, createMockApiResponse } from '../../../utils/test.utils';
import { SortDirection } from '../../../types/common.types';

// Mock usePolicy hook
jest.mock('../../../hooks/usePolicy', () => ({
  usePolicy: jest.fn(() => ({
    policies: mockPolicies,
    loading: false,
    error: null,
    fetchPolicies: jest.fn(),
    deletePolicy: jest.fn(),
    exportPolicy: jest.fn(),
    metrics: mockActuatorMetrics
  }))
}));

// Mock useMonitoring hook
jest.mock('@monitoring/react', () => ({
  useMonitoring: () => ({
    trackMetric: jest.fn(),
    trackError: jest.fn()
  })
}));

// Test data
const mockPolicies: Policy[] = [
  {
    id: 1,
    policyNumber: 'POL-001',
    status: PolicyStatus.ACTIVE,
    totalPremium: 1000,
    effectiveDate: '2023-12-01',
    expiryDate: '2024-12-01',
    coverages: [],
    createdDate: '2023-12-01',
    modifiedDate: '2023-12-01'
  },
  {
    id: 2,
    policyNumber: 'POL-002',
    status: PolicyStatus.PENDING,
    totalPremium: 2000,
    effectiveDate: '2023-12-02',
    expiryDate: '2024-12-02',
    coverages: [],
    createdDate: '2023-12-02',
    modifiedDate: '2023-12-02'
  }
];

// Mock Spring Boot Actuator metrics
const mockActuatorMetrics = {
  name: 'http.server.requests',
  measurements: [{ statistic: 'COUNT', value: 10 }],
  availableTags: []
};

describe('PolicyList Component', () => {
  // Reset all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders policy list with correct data', async () => {
    renderWithAuth(<PolicyList />);

    // Verify table headers
    expect(screen.getByRole('columnheader', { name: /policy number/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /status/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /premium/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /effective date/i })).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: /actions/i })).toBeInTheDocument();

    // Verify policy data
    mockPolicies.forEach(policy => {
      const row = screen.getByRole('row', { name: new RegExp(policy.policyNumber, 'i') });
      expect(within(row).getByText(policy.policyNumber)).toBeInTheDocument();
      expect(within(row).getByText(policy.status)).toBeInTheDocument();
      expect(within(row).getByText(`$${policy.totalPremium.toLocaleString()}`)).toBeInTheDocument();
      expect(within(row).getByText(new Date(policy.effectiveDate).toLocaleDateString())).toBeInTheDocument();
    });
  });

  it('handles sorting functionality with Spring Boot integration', async () => {
    const { usePolicy } = require('../../../hooks/usePolicy');
    const mockFetchPolicies = jest.fn();
    usePolicy.mockImplementation(() => ({
      policies: mockPolicies,
      loading: false,
      error: null,
      fetchPolicies: mockFetchPolicies,
      metrics: mockActuatorMetrics
    }));

    renderWithAuth(<PolicyList />);

    // Click policy number header to sort
    const policyNumberHeader = screen.getByRole('columnheader', { name: /policy number/i });
    await userEvent.click(policyNumberHeader);

    // Verify sort direction
    expect(policyNumberHeader).toHaveAttribute('aria-sort', SortDirection.ASC.toLowerCase());

    // Click again to reverse sort
    await userEvent.click(policyNumberHeader);
    expect(policyNumberHeader).toHaveAttribute('aria-sort', SortDirection.DESC.toLowerCase());
  });

  it('handles Spring Boot error states correctly', async () => {
    const { usePolicy } = require('../../../hooks/usePolicy');
    const mockError = createMockApiResponse(
      { message: 'Failed to fetch policies' },
      500,
      'Internal Server Error'
    );

    usePolicy.mockImplementation(() => ({
      policies: [],
      loading: false,
      error: mockError,
      fetchPolicies: jest.fn(),
      metrics: null
    }));

    renderWithAuth(<PolicyList />);

    expect(screen.getByText(/error loading policies/i)).toBeInTheDocument();
  });

  it('integrates with Spring Boot Actuator metrics', async () => {
    const { useMonitoring } = require('@monitoring/react');
    const mockTrackMetric = jest.fn();
    useMonitoring.mockImplementation(() => ({
      trackMetric: mockTrackMetric,
      trackError: jest.fn()
    }));

    renderWithAuth(<PolicyList />);

    // Verify metrics are tracked on mount
    expect(mockTrackMetric).toHaveBeenCalledWith('policy.list.mounted', expect.any(Object));
  });

  it('handles policy actions with monitoring', async () => {
    const { usePolicy } = require('../../../hooks/usePolicy');
    const mockDeletePolicy = jest.fn();
    const mockExportPolicy = jest.fn();

    usePolicy.mockImplementation(() => ({
      policies: mockPolicies,
      loading: false,
      error: null,
      deletePolicy: mockDeletePolicy,
      exportPolicy: mockExportPolicy,
      metrics: mockActuatorMetrics
    }));

    renderWithAuth(<PolicyList />);

    // Test delete action
    const deleteButton = screen.getAllByRole('button', { name: /delete policy/i })[0];
    await userEvent.click(deleteButton);
    expect(mockDeletePolicy).toHaveBeenCalledWith(mockPolicies[0].id);

    // Test export action
    const exportButton = screen.getAllByRole('button', { name: /export policy/i })[0];
    await userEvent.click(exportButton);
    expect(mockExportPolicy).toHaveBeenCalledWith(mockPolicies[0].id);
  });

  it('verifies accessibility compliance', async () => {
    const { container } = renderWithAuth(<PolicyList />);
    
    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Verify ARIA attributes
    expect(screen.getByRole('region')).toHaveAttribute('aria-label', 'Policy List');
    expect(screen.getAllByRole('columnheader')).toHaveLength(5);
  });

  it('handles loading state correctly', async () => {
    const { usePolicy } = require('../../../hooks/usePolicy');
    usePolicy.mockImplementation(() => ({
      policies: [],
      loading: true,
      error: null,
      fetchPolicies: jest.fn(),
      metrics: mockActuatorMetrics
    }));

    renderWithAuth(<PolicyList />);

    expect(screen.getByText(/loading policies/i)).toBeInTheDocument();
  });

  it('displays empty state when no policies exist', async () => {
    const { usePolicy } = require('../../../hooks/usePolicy');
    usePolicy.mockImplementation(() => ({
      policies: [],
      loading: false,
      error: null,
      fetchPolicies: jest.fn(),
      metrics: mockActuatorMetrics
    }));

    renderWithAuth(<PolicyList />);

    expect(screen.getByText(/no policies found/i)).toBeInTheDocument();
  });
});