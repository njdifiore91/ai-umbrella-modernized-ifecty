import React, { useEffect, useCallback, useMemo } from 'react';
import { DashboardContainer, ContentArea, WidgetContainer, StatusBar } from './Dashboard.styles';
import Button from '../../components/common/Button/Button';
import { usePolicy } from '../../hooks/usePolicy';
import { useMonitoring } from '@spring-boot/actuator-client';
import { LoadingState } from '../../types/common.types';
import { PolicyStatus } from '../../types/policy.types';

/**
 * Dashboard component that displays insurance operations overview with enhanced monitoring
 * @returns React.FC Dashboard component with real-time metrics and monitoring
 */
const Dashboard: React.FC = () => {
  // Initialize hooks
  const {
    policies,
    loading,
    error,
    fetchPolicies
  } = usePolicy();

  // Initialize Spring Boot Actuator monitoring
  const { metrics, health, loggers } = useMonitoring({
    endpoints: {
      metrics: '/actuator/metrics',
      health: '/actuator/health',
      loggers: '/actuator/loggers'
    }
  });

  // Fetch initial data with monitoring
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        await fetchPolicies({
          status: PolicyStatus.ACTIVE,
          effectiveDateRange: {
            startDate: new Date().toISOString(),
            endDate: new Date().toISOString(),
            isValid: () => true
          }
        });
      } catch (err) {
        console.error('Dashboard data fetch error:', err);
      }
    };

    fetchDashboardData();
  }, [fetchPolicies]);

  // Memoized metrics calculations
  const dashboardMetrics = useMemo(() => ({
    totalPolicies: policies.length,
    activePolicies: policies.filter(p => p.status === PolicyStatus.ACTIVE).length,
    totalPremium: policies.reduce((sum, policy) => sum + policy.totalPremium, 0),
    systemHealth: health?.status || 'UNKNOWN'
  }), [policies, health]);

  // Handle policy click with monitoring
  const handlePolicyClick = useCallback((policyId: number) => {
    metrics?.increment('dashboard.policy.click', { policyId: policyId.toString() });
    // Navigate to policy details
  }, [metrics]);

  // Render loading state
  if (loading.fetch) {
    return (
      <DashboardContainer>
        <div role="alert" aria-busy="true">Loading dashboard data...</div>
      </DashboardContainer>
    );
  }

  // Render error state
  if (error.fetch) {
    return (
      <DashboardContainer>
        <div role="alert" aria-live="assertive">
          Error loading dashboard: {error.fetch}
          <Button 
            variant="primary"
            onClick={() => fetchPolicies({
              status: PolicyStatus.ACTIVE,
              effectiveDateRange: {
                startDate: new Date().toISOString(),
                endDate: new Date().toISOString(),
                isValid: () => true
              }
            })}
            loadingState={loading.fetch ? LoadingState.LOADING : LoadingState.IDLE}
            ariaLabel="Retry loading dashboard data"
          >
            Retry
          </Button>
        </div>
      </DashboardContainer>
    );
  }

  return (
    <DashboardContainer>
      {/* Header Area */}
      <header role="banner">
        <h1>Insurance Operations Dashboard</h1>
      </header>

      {/* Main Content Area */}
      <ContentArea role="main">
        {/* Policy Management Widget */}
        <WidgetContainer>
          <h2>Policy Management</h2>
          <div>
            <p>Total Policies: {dashboardMetrics.totalPolicies}</p>
            <p>Active Policies: {dashboardMetrics.activePolicies}</p>
            <p>Total Premium: ${dashboardMetrics.totalPremium.toFixed(2)}</p>
          </div>
          <Button
            variant="primary"
            onClick={() => handlePolicyClick(-1)}
            ariaLabel="Create new policy"
          >
            Create Policy
          </Button>
        </WidgetContainer>

        {/* Claims Processing Widget */}
        <WidgetContainer>
          <h2>Claims Processing</h2>
          <div>
            <p>Active Claims: {metrics?.getValue('claims.active') || 0}</p>
            <p>Processing Time: {metrics?.getValue('claims.processing.time') || '0'}ms</p>
          </div>
          <Button
            variant="primary"
            onClick={() => metrics?.increment('dashboard.claim.create')}
            ariaLabel="Create new claim"
          >
            New Claim
          </Button>
        </WidgetContainer>

        {/* System Health Widget */}
        <WidgetContainer>
          <h2>System Health</h2>
          <div>
            <p>Status: {dashboardMetrics.systemHealth}</p>
            <p>API Response Time: {metrics?.getValue('http.server.requests') || '0'}ms</p>
            <p>Active Sessions: {metrics?.getValue('sessions.active') || 0}</p>
          </div>
        </WidgetContainer>

        {/* Performance Metrics Widget */}
        <WidgetContainer>
          <h2>Performance Metrics</h2>
          <div>
            <p>CPU Usage: {metrics?.getValue('system.cpu.usage') || '0'}%</p>
            <p>Memory Usage: {metrics?.getValue('jvm.memory.used') || '0'}MB</p>
            <p>Thread Count: {metrics?.getValue('jvm.threads.live') || 0}</p>
          </div>
        </WidgetContainer>
      </ContentArea>

      {/* Status Bar */}
      <StatusBar role="contentinfo">
        <span>System Status: {dashboardMetrics.systemHealth}</span>
        <span>Last Updated: {new Date().toLocaleTimeString()}</span>
      </StatusBar>
    </DashboardContainer>
  );
};

export default Dashboard;