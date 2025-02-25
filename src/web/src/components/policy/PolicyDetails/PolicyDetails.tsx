import React, { useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { Policy, PolicyStatus } from '../../../types/policy.types';
import { usePolicy } from '../../../hooks/usePolicy';
import { useNotification, NotificationType } from '../../../hooks/useNotification';
import { Button } from '../../common/Button/Button';
import { LoadingState } from '../../../types/common.types';
import { flexColumn, flexBetween, responsiveText } from '../../../styles/mixins';

// Styled components with enhanced accessibility
const PolicyContainer = styled.section`
  ${flexColumn}
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.scale.lg};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PolicyHeader = styled.div`
  ${flexBetween}
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
`;

const PolicyTitle = styled.h2`
  ${responsiveText({
    fontSize: {
      xs: '1.25rem',
      sm: '1.5rem',
      md: '1.75rem'
    },
    fontWeight: 'semibold'
  })}
  color: ${({ theme }) => theme.colors.text.primary};
`;

const PolicyStatus = styled.span<{ status: PolicyStatus }>`
  padding: ${({ theme }) => theme.spacing.scale.xs} ${({ theme }) => theme.spacing.scale.sm};
  border-radius: 4px;
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  background: ${({ status, theme }) => {
    switch (status) {
      case PolicyStatus.ACTIVE:
        return theme.colors.feedback.success.main;
      case PolicyStatus.PENDING:
        return theme.colors.feedback.warning.main;
      case PolicyStatus.EXPIRED:
        return theme.colors.feedback.error.main;
      default:
        return theme.colors.secondary.main;
    }
  }};
  color: ${({ theme }) => theme.colors.background.default};
`;

const PolicyInfo = styled.div`
  ${flexColumn}
  gap: ${({ theme }) => theme.spacing.scale.sm};
`;

const InfoRow = styled.div`
  ${flexBetween}
  padding: ${({ theme }) => theme.spacing.scale.sm} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.form.border};
`;

const Label = styled.span`
  color: ${({ theme }) => theme.colors.text.secondary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
`;

const Value = styled.span`
  color: ${({ theme }) => theme.colors.text.primary};
  font-weight: ${({ theme }) => theme.typography.fontWeight.regular};
`;

const CoverageSection = styled.section`
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
`;

const CoverageTitle = styled.h3`
  ${responsiveText({
    fontSize: {
      xs: '1rem',
      sm: '1.25rem'
    },
    fontWeight: 'medium'
  })}
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
`;

const ActionBar = styled.div`
  ${flexBetween}
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};
`;

interface PolicyDetailsProps {
  policyId: number;
  onClose: () => void;
}

export const PolicyDetails: React.FC<PolicyDetailsProps> = ({ policyId, onClose }) => {
  const { selectedPolicy, loading, error, exportPolicy } = usePolicy();
  const { showNotification } = useNotification();

  // Format currency with proper accessibility
  const formatCurrency = useCallback((amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }, []);

  // Format date with proper accessibility
  const formatDate = useCallback((date: string): string => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(date));
  }, []);

  // Handle policy export with error handling
  const handleExport = useCallback(async () => {
    if (!selectedPolicy) return;

    try {
      await exportPolicy(selectedPolicy.id);
      showNotification('Policy exported successfully', NotificationType.SUCCESS);
    } catch (err) {
      showNotification('Failed to export policy', NotificationType.WARNING);
    }
  }, [selectedPolicy, exportPolicy, showNotification]);

  // Memoized coverage rendering for performance
  const renderCoverages = useMemo(() => {
    if (!selectedPolicy?.coverages?.length) return null;

    return (
      <CoverageSection>
        <CoverageTitle>Coverages</CoverageTitle>
        {selectedPolicy.coverages.map((coverage) => (
          <InfoRow key={coverage.id}>
            <Label>{coverage.coverageType}</Label>
            <Value>
              {`Limit: ${formatCurrency(coverage.limit)} | 
                Deductible: ${formatCurrency(coverage.deductible)} | 
                Premium: ${formatCurrency(coverage.premium)}`}
            </Value>
          </InfoRow>
        ))}
      </CoverageSection>
    );
  }, [selectedPolicy?.coverages, formatCurrency]);

  if (loading.fetch) {
    return (
      <PolicyContainer role="alert" aria-busy="true">
        Loading policy details...
      </PolicyContainer>
    );
  }

  if (error.fetch) {
    return (
      <PolicyContainer role="alert" aria-live="polite">
        <div>Error loading policy details: {error.fetch}</div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </PolicyContainer>
    );
  }

  if (!selectedPolicy) {
    return (
      <PolicyContainer role="alert" aria-live="polite">
        <div>No policy found</div>
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      </PolicyContainer>
    );
  }

  return (
    <PolicyContainer role="region" aria-label="Policy Details">
      <PolicyHeader>
        <PolicyTitle>
          Policy #{selectedPolicy.policyNumber}
        </PolicyTitle>
        <PolicyStatus 
          status={selectedPolicy.status}
          role="status"
          aria-label={`Policy Status: ${selectedPolicy.status}`}
        >
          {selectedPolicy.status}
        </PolicyStatus>
      </PolicyHeader>

      <PolicyInfo role="list">
        <InfoRow role="listitem">
          <Label>Effective Date</Label>
          <Value>{formatDate(selectedPolicy.effectiveDate)}</Value>
        </InfoRow>
        <InfoRow role="listitem">
          <Label>Expiry Date</Label>
          <Value>{formatDate(selectedPolicy.expiryDate)}</Value>
        </InfoRow>
        <InfoRow role="listitem">
          <Label>Total Premium</Label>
          <Value>{formatCurrency(selectedPolicy.totalPremium)}</Value>
        </InfoRow>
      </PolicyInfo>

      {renderCoverages}

      <ActionBar>
        <Button
          variant="secondary"
          onClick={onClose}
          ariaLabel="Close policy details"
        >
          Close
        </Button>
        <Button
          variant="primary"
          onClick={handleExport}
          disabled={loading.export}
          loadingState={loading.export ? LoadingState.LOADING : LoadingState.IDLE}
          ariaLabel="Export policy to PDF"
        >
          Export Policy
        </Button>
      </ActionBar>
    </PolicyContainer>
  );
};

export default PolicyDetails;