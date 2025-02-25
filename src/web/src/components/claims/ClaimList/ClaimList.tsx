import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useMetrics } from '@spring-boot/actuator-metrics'; // ^3.2.1
import { SpringBootError } from '@spring-boot/types'; // ^3.2.1
import Table from '../../common/Table/Table';
import { useClaims } from '../../../hooks/useClaims';
import { useNotification } from '../../../hooks/useNotification';
import { Claim, ClaimStatus } from '../../../types/claims.types';
import { SortDirection, SortOrder } from '../../../types/common.types';
import { trace, context, SpanStatusCode } from '@opentelemetry/api';
import styled from 'styled-components';

// Styled components for enhanced accessibility and responsive design
const ClaimListContainer = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.scale.sm};
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  align-items: center;
`;

const StatusFilter = styled.select`
  padding: ${({ theme }) => theme.spacing.scale.xs};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.body2};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary.main};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary.light}25;
  }
`;

// Table column configuration with accessibility support
const columns = [
  {
    id: 'claimNumber',
    header: 'Claim Number',
    sortable: true,
    width: '150px'
  },
  {
    id: 'status',
    header: 'Status',
    sortable: true,
    width: '120px',
    render: (value: ClaimStatus) => (
      <span role="status" aria-label={`Claim status: ${value}`}>
        {value}
      </span>
    )
  },
  {
    id: 'claimAmount',
    header: 'Amount',
    sortable: true,
    width: '120px',
    align: 'right' as const,
    render: (value: number) => (
      <span aria-label={`Claim amount: $${value.toFixed(2)}`}>
        ${value.toFixed(2)}
      </span>
    )
  },
  {
    id: 'incidentDate',
    header: 'Incident Date',
    sortable: true,
    width: '150px',
    render: (value: string) => new Date(value).toLocaleDateString()
  },
  {
    id: 'reportedDate',
    header: 'Reported Date',
    sortable: true,
    width: '150px',
    render: (value: string) => new Date(value).toLocaleDateString()
  }
];

// Component props interface
interface ClaimListProps {
  pageSize?: number;
  initialStatus?: ClaimStatus;
}

/**
 * Enhanced ClaimList component with Spring Boot integration and monitoring
 * @param props Component properties
 * @returns React component
 */
export const ClaimList: React.FC<ClaimListProps> = ({
  pageSize = 10,
  initialStatus
}) => {
  // Hooks
  const { claims, loading, getClaims, totalItems } = useClaims();
  const { showNotification } = useNotification();
  const metrics = useMetrics('claims.list');

  // Local state
  const [currentPage, setCurrentPage] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState<ClaimStatus | undefined>(
    initialStatus
  );
  const [sortOrders, setSortOrders] = useState<SortOrder[]>([]);

  // Memoized filter options
  const statusOptions = useMemo(() => Object.values(ClaimStatus), []);

  // Load claims with monitoring
  const loadClaims = useCallback(async () => {
    const tracer = trace.getTracer('claims-list');
    const span = tracer.startSpan('loadClaims');

    try {
      context.with(trace.setSpan(context.active(), span), async () => {
        metrics.increment('claims.list.load.attempt');
        await getClaims(currentPage, pageSize, selectedStatus);
        metrics.increment('claims.list.load.success');
      });
    } catch (error) {
      const springBootError = error as SpringBootError;
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: springBootError.message
      });
      metrics.increment('claims.list.load.error');
      showNotification(springBootError.message, 'warning');
    } finally {
      span.end();
    }
  }, [currentPage, pageSize, selectedStatus, getClaims, metrics, showNotification]);

  // Load claims on mount and when dependencies change
  useEffect(() => {
    loadClaims();
  }, [loadClaims]);

  // Handle status filter change
  const handleStatusChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as ClaimStatus;
    setSelectedStatus(status);
    setCurrentPage(0);
    metrics.increment('claims.list.filter.status');
  }, [metrics]);

  // Handle sort change with monitoring
  const handleSort = useCallback((columnId: string, direction: SortDirection) => {
    metrics.increment('claims.list.sort');
    setSortOrders([{ field: columnId, direction }]);
    setCurrentPage(0);
  }, [metrics]);

  // Handle page change
  const handlePageChange = useCallback((page: number) => {
    metrics.increment('claims.list.page.change');
    setCurrentPage(page);
  }, [metrics]);

  return (
    <ClaimListContainer role="region" aria-label="Claims List">
      <FilterContainer>
        <StatusFilter
          value={selectedStatus || ''}
          onChange={handleStatusChange}
          aria-label="Filter claims by status"
        >
          <option value="">All Statuses</option>
          {statusOptions.map(status => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </StatusFilter>
      </FilterContainer>

      <Table
        columns={columns}
        data={claims}
        onSort={handleSort}
        loading={loading.getClaims}
        emptyMessage="No claims found"
        enableVirtualization
        virtualizationThreshold={100}
        ariaLabel="Claims table"
        onPageChange={handlePageChange}
        pagination={{
          currentPage,
          pageSize,
          totalItems,
          siblingCount: 1
        }}
      />
    </ClaimListContainer>
  );
};

export default ClaimList;