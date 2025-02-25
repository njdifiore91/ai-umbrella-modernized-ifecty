import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { debounce } from 'lodash'; // ^4.17.21
import { PolicyList } from '../../components/policy/PolicyList/PolicyList';
import { PolicyForm } from '../../components/policy/PolicyForm/PolicyForm';
import { usePolicy } from '../../hooks/usePolicy';
import { useNotification } from '../../hooks/useNotification';
import { Policy, PolicyStatus } from '../../types/policy.types';
import { LoadingState } from '../../types/common.types';

// View state enum for managing policy page views
enum PolicyView {
  LIST = 'LIST',
  CREATE = 'CREATE',
  EDIT = 'EDIT'
}

// Error fallback component with retry capability
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({
  error,
  resetErrorBoundary
}) => (
  <div role="alert" className="error-container">
    <h2>Something went wrong:</h2>
    <pre>{error.message}</pre>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);

// Main policy page component with enhanced error handling and accessibility
const PolicyPage: React.FC = React.memo(() => {
  // State management
  const [currentView, setCurrentView] = useState<PolicyView>(PolicyView.LIST);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [loadingState, setLoadingState] = useState<LoadingState>(LoadingState.IDLE);

  // Custom hooks
  const {
    policies,
    loading,
    error,
    createPolicy,
    updatePolicy,
    deletePolicy
  } = usePolicy();

  const { showNotification, NotificationType } = useNotification();

  // Memoized search parameters
  const defaultSearchParams = useMemo(() => ({
    policyNumber: '',
    status: null,
    effectiveDateRange: null,
    coverageType: '',
    premiumRange: { min: 0, max: 0 }
  }), []);

  // Debounced policy creation handler
  const handleCreatePolicy = useCallback(
    debounce(async (policyData: Partial<Policy>) => {
      try {
        setLoadingState(LoadingState.LOADING);
        await createPolicy(policyData);
        showNotification('Policy created successfully', NotificationType.SUCCESS);
        setCurrentView(PolicyView.LIST);
      } catch (err) {
        showNotification('Failed to create policy', NotificationType.WARNING);
        console.error('Policy creation error:', err);
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    }, 300),
    [createPolicy, showNotification]
  );

  // Debounced policy update handler with optimistic updates
  const handleUpdatePolicy = useCallback(
    debounce(async (policyData: Policy) => {
      try {
        setLoadingState(LoadingState.LOADING);
        await updatePolicy(policyData.id, policyData);
        showNotification('Policy updated successfully', NotificationType.SUCCESS);
        setCurrentView(PolicyView.LIST);
        setSelectedPolicy(null);
      } catch (err) {
        showNotification('Failed to update policy', NotificationType.WARNING);
        console.error('Policy update error:', err);
      } finally {
        setLoadingState(LoadingState.IDLE);
      }
    }, 300),
    [updatePolicy, showNotification]
  );

  // Policy deletion handler with confirmation
  const handleDeletePolicy = useCallback(async (policyId: number) => {
    if (!window.confirm('Are you sure you want to delete this policy?')) {
      return;
    }

    try {
      setLoadingState(LoadingState.LOADING);
      await deletePolicy(policyId);
      showNotification('Policy deleted successfully', NotificationType.SUCCESS);
    } catch (err) {
      showNotification('Failed to delete policy', NotificationType.WARNING);
      console.error('Policy deletion error:', err);
    } finally {
      setLoadingState(LoadingState.IDLE);
    }
  }, [deletePolicy, showNotification]);

  // View management handlers
  const handleCreateView = useCallback(() => {
    setCurrentView(PolicyView.CREATE);
    setSelectedPolicy(null);
  }, []);

  const handleEditView = useCallback((policy: Policy) => {
    setSelectedPolicy(policy);
    setCurrentView(PolicyView.EDIT);
  }, []);

  const handleBackToList = useCallback(() => {
    setCurrentView(PolicyView.LIST);
    setSelectedPolicy(null);
  }, []);

  // Keyboard navigation handler
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleBackToList();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleBackToList]);

  // Render appropriate view based on state
  const renderView = () => {
    switch (currentView) {
      case PolicyView.CREATE:
        return (
          <div role="region" aria-label="Create Policy">
            <h2>Create New Policy</h2>
            <PolicyForm
              onSubmit={handleCreatePolicy}
              isEdit={false}
            />
          </div>
        );

      case PolicyView.EDIT:
        return selectedPolicy ? (
          <div role="region" aria-label="Edit Policy">
            <h2>Edit Policy {selectedPolicy.policyNumber}</h2>
            <PolicyForm
              initialValues={selectedPolicy}
              onSubmit={handleUpdatePolicy}
              isEdit={true}
            />
          </div>
        ) : null;

      default:
        return (
          <div role="region" aria-label="Policy List">
            <div className="policy-actions">
              <h2>Policy Management</h2>
              <button
                onClick={handleCreateView}
                disabled={loadingState === LoadingState.LOADING}
                aria-label="Create new policy"
              >
                Create Policy
              </button>
            </div>
            <PolicyList
              policies={policies}
              onEdit={handleEditView}
              onDelete={handleDeletePolicy}
              loading={loading}
              error={error}
            />
          </div>
        );
    }
  };

  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        setCurrentView(PolicyView.LIST);
        setSelectedPolicy(null);
        setLoadingState(LoadingState.IDLE);
      }}
    >
      <main className="policy-page">
        {currentView !== PolicyView.LIST && (
          <button
            onClick={handleBackToList}
            className="back-button"
            aria-label="Back to policy list"
          >
            Back to List
          </button>
        )}
        {renderView()}
      </main>
    </ErrorBoundary>
  );
});

PolicyPage.displayName = 'PolicyPage';

export default PolicyPage;