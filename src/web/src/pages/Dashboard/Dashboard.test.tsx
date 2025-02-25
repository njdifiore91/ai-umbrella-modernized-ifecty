import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { jest } from '@jest/globals';
import { renderWithAuth, createMockApiResponse, mockApiCall, mockActuatorEndpoint } from '../../utils/test.utils';
import Dashboard from './Dashboard';
import { usePolicy } from '../../hooks/usePolicy';
import { useHealth } from '@spring-boot/actuator-react';
import { PolicyStatus } from '../../types/policy.types';
import { LoadingState } from '../../types/common.types';

// Mock hooks and services
jest.mock('../../hooks/usePolicy');
jest.mock('@spring-boot/actuator-react');

describe('Dashboard Component', () => {
  // Setup test environment with mocked data and monitoring
  const setupTest = () => {
    const mockPolicies = [
      {
        id: 1,
        policyNumber: 'POL123456',
        status: PolicyStatus.ACTIVE,
        totalPremium: 1200.50,
        effectiveDate: '2024-01-01',
        expiryDate: '2024-12-31'
      }
    ];

    const mockHealth = {
      status: 'UP',
      components: {
        db: { status: 'UP' },
        diskSpace: { status: 'UP' },
        ping: { status: 'UP' }
      }
    };

    const mockMetrics = {
      'claims.active': 5,
      'claims.processing.time': 250,
      'http.server.requests': 150,
      'sessions.active': 25,
      'system.cpu.usage': 45.5,
      'jvm.memory.used': 512,
      'jvm.threads.live': 50
    };

    // Mock usePolicy hook
    (usePolicy as jest.Mock).mockReturnValue({
      policies: mockPolicies,
      loading: { fetch: false },
      error: { fetch: null },
      fetchPolicies: jest.fn()
    });

    // Mock useHealth hook with Spring Boot Actuator integration
    (useHealth as jest.Mock).mockReturnValue({
      health: mockHealth,
      metrics: {
        getValue: (key: string) => mockMetrics[key],
        increment: jest.fn()
      },
      loggers: {
        getLevels: jest.fn(),
        setLevel: jest.fn()
      }
    });

    return {
      mockPolicies,
      mockHealth,
      mockMetrics,
      user: userEvent.setup()
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Layout and Rendering', () => {
    it('should render the dashboard layout with all required sections', () => {
      const { mockPolicies } = setupTest();
      renderWithAuth(<Dashboard />);

      // Verify header
      expect(screen.getByRole('banner')).toBeInTheDocument();
      expect(screen.getByText('Insurance Operations Dashboard')).toBeInTheDocument();

      // Verify main content area
      expect(screen.getByRole('main')).toBeInTheDocument();

      // Verify policy management widget
      expect(screen.getByText('Policy Management')).toBeInTheDocument();
      expect(screen.getByText(`Total Policies: ${mockPolicies.length}`)).toBeInTheDocument();

      // Verify claims processing widget
      expect(screen.getByText('Claims Processing')).toBeInTheDocument();

      // Verify status bar
      expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    });

    it('should display loading state while fetching data', () => {
      (usePolicy as jest.Mock).mockReturnValue({
        policies: [],
        loading: { fetch: true },
        error: { fetch: null },
        fetchPolicies: jest.fn()
      });

      renderWithAuth(<Dashboard />);
      expect(screen.getByRole('alert')).toHaveTextContent('Loading dashboard data...');
    });
  });

  describe('Policy Management Integration', () => {
    it('should display policy statistics with monitoring', async () => {
      const { mockPolicies, user } = setupTest();
      renderWithAuth(<Dashboard />);

      // Verify policy statistics
      expect(screen.getByText(`Total Policies: ${mockPolicies.length}`)).toBeInTheDocument();
      expect(screen.getByText(`Active Policies: ${mockPolicies.length}`)).toBeInTheDocument();
      expect(screen.getByText(`Total Premium: $${mockPolicies[0].totalPremium.toFixed(2)}`)).toBeInTheDocument();

      // Test create policy button with metrics
      const createButton = screen.getByRole('button', { name: /create policy/i });
      await user.click(createButton);
      expect(useHealth().metrics.increment).toHaveBeenCalledWith('dashboard.policy.click', { policyId: '-1' });
    });

    it('should handle policy fetch errors gracefully', () => {
      (usePolicy as jest.Mock).mockReturnValue({
        policies: [],
        loading: { fetch: false },
        error: { fetch: 'Failed to fetch policies' },
        fetchPolicies: jest.fn()
      });

      renderWithAuth(<Dashboard />);
      expect(screen.getByText(/Failed to fetch policies/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
    });
  });

  describe('Claims Processing Integration', () => {
    it('should display claims metrics with monitoring', async () => {
      const { mockMetrics, user } = setupTest();
      renderWithAuth(<Dashboard />);

      // Verify claims metrics
      expect(screen.getByText(`Active Claims: ${mockMetrics['claims.active']}`)).toBeInTheDocument();
      expect(screen.getByText(`Processing Time: ${mockMetrics['claims.processing.time']}ms`)).toBeInTheDocument();

      // Test new claim button with metrics
      const newClaimButton = screen.getByRole('button', { name: /new claim/i });
      await user.click(newClaimButton);
      expect(useHealth().metrics.increment).toHaveBeenCalledWith('dashboard.claim.create');
    });
  });

  describe('System Health Monitoring', () => {
    it('should display system health status from Spring Boot Actuator', () => {
      const { mockHealth, mockMetrics } = setupTest();
      renderWithAuth(<Dashboard />);

      // Verify health status
      expect(screen.getByText(`Status: ${mockHealth.status}`)).toBeInTheDocument();

      // Verify performance metrics
      expect(screen.getByText(`API Response Time: ${mockMetrics['http.server.requests']}ms`)).toBeInTheDocument();
      expect(screen.getByText(`Active Sessions: ${mockMetrics['sessions.active']}`)).toBeInTheDocument();
    });

    it('should display performance metrics from Spring Boot Actuator', () => {
      const { mockMetrics } = setupTest();
      renderWithAuth(<Dashboard />);

      // Verify system metrics
      expect(screen.getByText(`CPU Usage: ${mockMetrics['system.cpu.usage']}%`)).toBeInTheDocument();
      expect(screen.getByText(`Memory Usage: ${mockMetrics['jvm.memory.used']}MB`)).toBeInTheDocument();
      expect(screen.getByText(`Thread Count: ${mockMetrics['jvm.threads.live']}`)).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    it('should handle health check failures gracefully', () => {
      (useHealth as jest.Mock).mockReturnValue({
        health: { status: 'DOWN' },
        metrics: { getValue: () => 0, increment: jest.fn() },
        loggers: { getLevels: jest.fn(), setLevel: jest.fn() }
      });

      renderWithAuth(<Dashboard />);
      expect(screen.getByText('Status: DOWN')).toBeInTheDocument();
    });

    it('should retry loading dashboard data on error', async () => {
      const mockFetchPolicies = jest.fn();
      (usePolicy as jest.Mock).mockReturnValue({
        policies: [],
        loading: { fetch: false },
        error: { fetch: 'Failed to fetch policies' },
        fetchPolicies: mockFetchPolicies
      });

      const { user } = setupTest();
      renderWithAuth(<Dashboard />);

      const retryButton = screen.getByRole('button', { name: /retry/i });
      await user.click(retryButton);

      expect(mockFetchPolicies).toHaveBeenCalledWith({
        status: PolicyStatus.ACTIVE,
        effectiveDateRange: expect.any(Object)
      });
    });
  });
});