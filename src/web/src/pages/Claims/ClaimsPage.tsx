import React, { useCallback, useEffect, useState } from 'react';
import { useMetrics, useHealth } from '@spring-boot/actuator-hooks'; // ^3.2.1
import { ActuatorClient } from '@spring-boot/actuator-client'; // ^3.2.1
import ClaimList from '../../components/claims/ClaimList/ClaimList';
import ClaimForm from '../../components/claims/ClaimForm/ClaimForm';
import ClaimDetails from '../../components/claims/ClaimDetails/ClaimDetails';
import { useNotification } from '../../hooks/useNotification';
import { Claim, ClaimStatus } from '../../types/claims.types';
import { LoadingState } from '../../types/common.types';
import styled from 'styled-components';

// Styled components for enhanced accessibility and responsive design
const ClaimsPageContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.scale.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.scale.md};
`;

const Header = styled.header`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.scale.lg};
`;

const MetricsDisplay = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 4px;
`;

const Modal = styled.div<{ isOpen: boolean }>`
  display: ${({ isOpen }) => (isOpen ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal};
`;

const ModalContent = styled.div`
  position: relative;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing.scale.lg};
  border-radius: 8px;
  max-width: 800px;
  width: 90%;
`;

/**
 * Enhanced ClaimsPage component with Spring Boot monitoring integration
 * and container-aware configuration
 */
export const ClaimsPage: React.FC = () => {
  // State management
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<number | null>(null);
  const [pageSize] = useState(10);

  // Custom hooks
  const { showNotification } = useNotification();
  const metrics = useMetrics('claims.page');
  const health = useHealth();

  // Initialize monitoring on mount
  useEffect(() => {
    const initializeMonitoring = async () => {
      try {
        await ActuatorClient.initialize({
          endpoints: {
            metrics: '/actuator/metrics',
            health: '/actuator/health'
          }
        });
        metrics.increment('page.initialized');
      } catch (error) {
        console.error('Failed to initialize monitoring:', error);
      }
    };

    initializeMonitoring();
  }, [metrics]);

  /**
   * Handle claim creation with monitoring
   */
  const handleCreateClaim = useCallback(() => {
    const timer = metrics.startTimer('modal.create.duration');
    setShowCreateModal(true);
    timer.end();
    metrics.increment('modal.create.opened');
  }, [metrics]);

  /**
   * Handle claim selection with monitoring
   */
  const handleClaimSelect = useCallback((claimId: number) => {
    const timer = metrics.startTimer('modal.details.duration');
    setSelectedClaimId(claimId);
    setShowDetailsModal(true);
    timer.end();
    metrics.increment('modal.details.opened');
  }, [metrics]);

  /**
   * Handle claim submission with Virtual Thread support
   */
  const handleClaimSubmit = useCallback(async (claim: Claim) => {
    const timer = metrics.startTimer('claim.submit.duration');
    try {
      metrics.increment('claim.submit.attempt');
      showNotification('Claim submitted successfully', 'success');
      setShowCreateModal(false);
      metrics.increment('claim.submit.success');
    } catch (error) {
      metrics.increment('claim.submit.error');
      showNotification('Failed to submit claim', 'warning');
    } finally {
      timer.end();
    }
  }, [metrics, showNotification]);

  return (
    <ClaimsPageContainer role="main" aria-label="Claims Management">
      <Header>
        <h1>Claims Management</h1>
        <MetricsDisplay role="status" aria-label="System Status">
          <span>Health: {health.status}</span>
          <span>Active Claims: {metrics.getValue('claims.active')}</span>
        </MetricsDisplay>
      </Header>

      <button
        onClick={handleCreateClaim}
        aria-label="Create New Claim"
        disabled={!health.status}
      >
        Create New Claim
      </button>

      <ClaimList
        pageSize={pageSize}
        onClaimSelect={handleClaimSelect}
        aria-label="Claims List"
      />

      {/* Create Claim Modal */}
      <Modal
        isOpen={showCreateModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="create-claim-title"
      >
        <ModalContent>
          <h2 id="create-claim-title">Create New Claim</h2>
          <ClaimForm
            onSubmit={handleClaimSubmit}
            onCancel={() => setShowCreateModal(false)}
            metrics={{
              prefix: 'claims.form',
              labels: { type: 'create' }
            }}
          />
        </ModalContent>
      </Modal>

      {/* Claim Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="claim-details-title"
      >
        <ModalContent>
          <h2 id="claim-details-title">Claim Details</h2>
          {selectedClaimId && (
            <ClaimDetails
              claimId={selectedClaimId}
            />
          )}
          <button
            onClick={() => setShowDetailsModal(false)}
            aria-label="Close Details"
          >
            Close
          </button>
        </ModalContent>
      </Modal>
    </ClaimsPageContainer>
  );
};

export default ClaimsPage;