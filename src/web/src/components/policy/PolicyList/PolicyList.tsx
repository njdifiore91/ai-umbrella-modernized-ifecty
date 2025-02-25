import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useMonitoring } from '@monitoring/react';
import { Policy } from '../../../types/policy.types';
import { usePolicy } from '../../../hooks/usePolicy';
import { useNotificationContext, NotificationType } from '../../../context/NotificationContext';
import { SortDirection } from '../../../types/common.types';
import {
  PolicyListContainer,
  PolicyTable,
  TableHeader,
  TableRow,
  TableCell,
  StatusCell,
  ActionCell,
  EmptyState
} from './PolicyList.styles';

// Enhanced monitoring decorator for Spring Boot integration
const withMonitoring = (Component: React.FC) => {
  return function MonitoredComponent(props: any) {
    const { trackMetric } = useMonitoring();
    
    useEffect(() => {
      trackMetric('policy.list.mounted', { timestamp: Date.now() });
      return () => {
        trackMetric('policy.list.unmounted', { timestamp: Date.now() });
      };
    }, [trackMetric]);

    return <Component {...props} />;
  };
};

interface SortConfig {
  field: keyof Policy;
  direction: SortDirection;
}

const PolicyList: React.FC = () => {
  // Enhanced hooks with Spring Boot integration
  const {
    policies,
    loading,
    error,
    fetchPolicies,
    deletePolicy,
    exportPolicy
  } = usePolicy();

  const { showNotification } = useNotificationContext();
  const { trackMetric, trackError } = useMonitoring();

  // State management
  const [sortConfig, setSortConfig] = useState<SortConfig>({
    field: 'policyNumber',
    direction: SortDirection.ASC
  });

  // Load policies with monitoring
  useEffect(() => {
    const loadPolicies = async () => {
      try {
        trackMetric('policy.list.fetch.started', { timestamp: Date.now() });
        await fetchPolicies({
          policyNumber: '',
          status: null,
          effectiveDateRange: null,
          coverageType: '',
          premiumRange: { min: 0, max: 0 }
        });
        trackMetric('policy.list.fetch.completed', { timestamp: Date.now() });
      } catch (err) {
        trackError('policy.list.fetch.failed', err);
      }
    };
    loadPolicies();
  }, [fetchPolicies, trackMetric, trackError]);

  // Enhanced sorting with performance tracking
  const handleSort = useCallback((field: keyof Policy) => {
    trackMetric('policy.list.sort', { field });
    setSortConfig(prevConfig => ({
      field,
      direction: prevConfig.field === field && prevConfig.direction === SortDirection.ASC
        ? SortDirection.DESC
        : SortDirection.ASC
    }));
  }, [trackMetric]);

  // Memoized sorted policies
  const sortedPolicies = useMemo(() => {
    if (!policies.length) return [];

    return [...policies].sort((a, b) => {
      const aValue = a[sortConfig.field];
      const bValue = b[sortConfig.field];

      if (sortConfig.direction === SortDirection.ASC) {
        return aValue > bValue ? 1 : -1;
      }
      return aValue < bValue ? 1 : -1;
    });
  }, [policies, sortConfig]);

  // Enhanced delete handler with monitoring
  const handleDelete = useCallback(async (id: number) => {
    try {
      trackMetric('policy.delete.started', { policyId: id });
      await deletePolicy(id);
      showNotification('Policy deleted successfully', NotificationType.SUCCESS);
      trackMetric('policy.delete.completed', { policyId: id });
    } catch (err) {
      trackError('policy.delete.failed', err);
      showNotification('Failed to delete policy', NotificationType.WARNING);
    }
  }, [deletePolicy, showNotification, trackMetric, trackError]);

  // Enhanced export handler with monitoring
  const handleExport = useCallback(async (id: number) => {
    try {
      trackMetric('policy.export.started', { policyId: id });
      await exportPolicy(id);
      showNotification('Policy exported successfully', NotificationType.SUCCESS);
      trackMetric('policy.export.completed', { policyId: id });
    } catch (err) {
      trackError('policy.export.failed', err);
      showNotification('Failed to export policy', NotificationType.WARNING);
    }
  }, [exportPolicy, showNotification, trackMetric, trackError]);

  if (error) {
    return (
      <EmptyState>
        <p>Error loading policies. Please try again later.</p>
      </EmptyState>
    );
  }

  return (
    <PolicyListContainer role="region" aria-label="Policy List">
      <PolicyTable>
        <thead>
          <TableRow>
            <TableHeader
              onClick={() => handleSort('policyNumber')}
              role="columnheader"
              aria-sort={sortConfig.field === 'policyNumber' ? sortConfig.direction.toLowerCase() : 'none'}
            >
              Policy Number
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('status')}
              role="columnheader"
              aria-sort={sortConfig.field === 'status' ? sortConfig.direction.toLowerCase() : 'none'}
            >
              Status
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('totalPremium')}
              role="columnheader"
              aria-sort={sortConfig.field === 'totalPremium' ? sortConfig.direction.toLowerCase() : 'none'}
            >
              Premium
            </TableHeader>
            <TableHeader
              onClick={() => handleSort('effectiveDate')}
              role="columnheader"
              aria-sort={sortConfig.field === 'effectiveDate' ? sortConfig.direction.toLowerCase() : 'none'}
            >
              Effective Date
            </TableHeader>
            <TableHeader role="columnheader">Actions</TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                Loading policies...
              </TableCell>
            </TableRow>
          ) : sortedPolicies.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} align="center">
                No policies found
              </TableCell>
            </TableRow>
          ) : (
            sortedPolicies.map((policy) => (
              <TableRow key={policy.id}>
                <TableCell>{policy.policyNumber}</TableCell>
                <StatusCell status={policy.status.toLowerCase()}>
                  {policy.status}
                </StatusCell>
                <TableCell>
                  ${policy.totalPremium.toLocaleString()}
                </TableCell>
                <TableCell>
                  {new Date(policy.effectiveDate).toLocaleDateString()}
                </TableCell>
                <ActionCell>
                  <button
                    onClick={() => handleExport(policy.id)}
                    aria-label={`Export policy ${policy.policyNumber}`}
                  >
                    Export
                  </button>
                  <button
                    onClick={() => handleDelete(policy.id)}
                    aria-label={`Delete policy ${policy.policyNumber}`}
                  >
                    Delete
                  </button>
                </ActionCell>
              </TableRow>
            ))
          )}
        </tbody>
      </PolicyTable>
    </PolicyListContainer>
  );
};

// Export enhanced component with monitoring
export default withMonitoring(React.memo(PolicyList));