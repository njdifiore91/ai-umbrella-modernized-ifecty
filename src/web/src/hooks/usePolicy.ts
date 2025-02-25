/**
 * Custom React hook for managing policy-related operations and state
 * Provides comprehensive policy management functionality with enhanced error handling,
 * notifications, and TypeScript type safety
 * @version 1.0.0
 */

import { useState, useCallback } from 'react';
import { PolicyService } from '../services/policy.service';
import { Policy, PolicySearchParams } from '../types/policy.types';
import { useNotificationContext, NotificationType } from '../context/NotificationContext';
import { ValidationError } from '../types/common.types';

// Initialize policy service instance
const policyService = new PolicyService();

/**
 * Custom hook for managing policy operations and state
 * @returns Object containing policy management interface with loading states and error handling
 */
export const usePolicy = () => {
  // State management
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState<Record<string, boolean>>({
    fetch: false,
    create: false,
    update: false,
    delete: false,
    export: false
  });
  const [error, setError] = useState<Record<string, string | null>>({
    fetch: null,
    create: null,
    update: null,
    delete: null,
    export: null
  });

  // Notification context
  const { showNotification } = useNotificationContext();

  /**
   * Fetches policies based on search parameters
   * @param searchParams - Search parameters for filtering policies
   */
  const fetchPolicies = useCallback(async (searchParams: PolicySearchParams) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(prev => ({ ...prev, fetch: null }));

    try {
      const response = await policyService.getAllPolicies(searchParams);
      setPolicies(response.data.items);
      showNotification('Policies fetched successfully', NotificationType.SUCCESS);
    } catch (err) {
      const errorMessage = 'Failed to fetch policies';
      setError(prev => ({ ...prev, fetch: errorMessage }));
      showNotification(errorMessage, NotificationType.WARNING);
      console.error('Policy fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [showNotification]);

  /**
   * Fetches a single policy by ID
   * @param id - Policy ID to fetch
   */
  const fetchPolicyById = useCallback(async (id: number) => {
    setLoading(prev => ({ ...prev, fetch: true }));
    setError(prev => ({ ...prev, fetch: null }));

    try {
      const response = await policyService.getPolicyById(id);
      setSelectedPolicy(response.data);
      showNotification('Policy details retrieved', NotificationType.SUCCESS);
    } catch (err) {
      const errorMessage = `Failed to fetch policy #${id}`;
      setError(prev => ({ ...prev, fetch: errorMessage }));
      showNotification(errorMessage, NotificationType.WARNING);
      console.error('Policy fetch error:', err);
    } finally {
      setLoading(prev => ({ ...prev, fetch: false }));
    }
  }, [showNotification]);

  /**
   * Creates a new policy
   * @param policy - Policy data to create
   */
  const createPolicy = useCallback(async (policy: Partial<Policy>) => {
    setLoading(prev => ({ ...prev, create: true }));
    setError(prev => ({ ...prev, create: null }));

    try {
      const response = await policyService.createPolicy(policy);
      setPolicies(prev => [...prev, response.data]);
      showNotification('Policy created successfully', NotificationType.SUCCESS);
      return response.data;
    } catch (err) {
      const errorMessage = 'Failed to create policy';
      setError(prev => ({ ...prev, create: errorMessage }));
      
      if (Array.isArray(err) && err[0] instanceof ValidationError) {
        const validationErrors = err as ValidationError[];
        showNotification(
          `Validation failed: ${validationErrors[0].message}`,
          NotificationType.WARNING
        );
      } else {
        showNotification(errorMessage, NotificationType.WARNING);
      }
      
      console.error('Policy creation error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, create: false }));
    }
  }, [showNotification]);

  /**
   * Updates an existing policy
   * @param id - Policy ID to update
   * @param policy - Updated policy data
   */
  const updatePolicy = useCallback(async (id: number, policy: Partial<Policy>) => {
    setLoading(prev => ({ ...prev, update: true }));
    setError(prev => ({ ...prev, update: null }));

    try {
      const response = await policyService.updatePolicy(id, policy);
      setPolicies(prev => 
        prev.map(p => p.id === id ? response.data : p)
      );
      setSelectedPolicy(response.data);
      showNotification('Policy updated successfully', NotificationType.SUCCESS);
      return response.data;
    } catch (err) {
      const errorMessage = `Failed to update policy #${id}`;
      setError(prev => ({ ...prev, update: errorMessage }));
      
      if (Array.isArray(err) && err[0] instanceof ValidationError) {
        const validationErrors = err as ValidationError[];
        showNotification(
          `Validation failed: ${validationErrors[0].message}`,
          NotificationType.WARNING
        );
      } else {
        showNotification(errorMessage, NotificationType.WARNING);
      }
      
      console.error('Policy update error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, update: false }));
    }
  }, [showNotification]);

  /**
   * Deletes a policy by ID
   * @param id - Policy ID to delete
   */
  const deletePolicy = useCallback(async (id: number) => {
    setLoading(prev => ({ ...prev, delete: true }));
    setError(prev => ({ ...prev, delete: null }));

    try {
      await policyService.deletePolicy(id);
      setPolicies(prev => prev.filter(p => p.id !== id));
      if (selectedPolicy?.id === id) {
        setSelectedPolicy(null);
      }
      showNotification('Policy deleted successfully', NotificationType.SUCCESS);
    } catch (err) {
      const errorMessage = `Failed to delete policy #${id}`;
      setError(prev => ({ ...prev, delete: errorMessage }));
      showNotification(errorMessage, NotificationType.WARNING);
      console.error('Policy deletion error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, delete: false }));
    }
  }, [showNotification, selectedPolicy]);

  /**
   * Exports a policy to PolicySTAR format
   * @param id - Policy ID to export
   */
  const exportPolicy = useCallback(async (id: number) => {
    setLoading(prev => ({ ...prev, export: true }));
    setError(prev => ({ ...prev, export: null }));

    try {
      const blob = await policyService.exportPolicy(id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `policy-${id}-export.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      showNotification('Policy exported successfully', NotificationType.SUCCESS);
    } catch (err) {
      const errorMessage = `Failed to export policy #${id}`;
      setError(prev => ({ ...prev, export: errorMessage }));
      showNotification(errorMessage, NotificationType.WARNING);
      console.error('Policy export error:', err);
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, export: false }));
    }
  }, [showNotification]);

  return {
    // State
    policies,
    selectedPolicy,
    loading,
    error,
    
    // Operations
    fetchPolicies,
    fetchPolicyById,
    createPolicy,
    updatePolicy,
    deletePolicy,
    exportPolicy
  };
};