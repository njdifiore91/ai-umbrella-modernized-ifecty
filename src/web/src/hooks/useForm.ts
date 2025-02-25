/**
 * @fileoverview Advanced React hook for secure form state management and validation
 * Implements comprehensive form field handling, validation, and submission functionality
 * with enhanced security features and performance optimizations.
 * @version 1.0.0
 */

import { useState, useCallback } from 'react'; // ^18.2.0
import { validateField, validateForm } from '../utils/validation.utils';
import { useNotificationContext } from '../context/NotificationContext';
import { VALIDATION_MESSAGES } from '../constants/validation.constants';

// Types for form management
interface ValidationRule {
  required?: boolean;
  pattern?: string;
  custom?: (value: any) => boolean | Promise<boolean>;
}

interface ValidationErrors {
  [key: string]: string;
}

interface ValidationMetrics {
  lastValidated: number;
  validationCount: number;
  averageValidationTime: number;
}

interface SecurityContext {
  sessionId: string;
  requestCount: number;
  lastRequestTime: number;
}

interface FormState<T> {
  values: T;
  errors: ValidationErrors;
  touched: Record<string, boolean>;
  isSubmitting: boolean;
  isValid: boolean;
  validationMetrics: ValidationMetrics;
  securityContext: SecurityContext;
}

type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
type BlurHandler = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
type SubmitHandler = (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
type ResetHandler = () => void;
type FormSubmitHandler<T> = (values: T) => Promise<void>;

/**
 * Advanced hook for managing secure form state, validation, and submission
 * with performance optimization and security features
 */
export function useForm<T extends Record<string, any>>(
  initialValues: T,
  validationRules: Record<string, ValidationRule>,
  onSubmit: FormSubmitHandler<T>
) {
  // Initialize form state with validation cache
  const [formState, setFormState] = useState<FormState<T>>({
    values: initialValues,
    errors: {},
    touched: {},
    isSubmitting: false,
    isValid: true,
    validationMetrics: {
      lastValidated: Date.now(),
      validationCount: 0,
      averageValidationTime: 0
    },
    securityContext: {
      sessionId: crypto.randomUUID(),
      requestCount: 0,
      lastRequestTime: Date.now()
    }
  });

  // Access notification context for displaying validation messages
  const { showNotification } = useNotificationContext();

  // Validation rate limiting configuration
  const VALIDATION_THROTTLE = 100; // ms between validations
  const MAX_REQUESTS_PER_MINUTE = 60;

  /**
   * Security check for request rate limiting
   */
  const checkSecurityThrottling = useCallback(() => {
    const now = Date.now();
    const oneMinuteAgo = now - 60000;

    if (formState.securityContext.lastRequestTime > oneMinuteAgo) {
      if (formState.securityContext.requestCount >= MAX_REQUESTS_PER_MINUTE) {
        throw new Error('Too many validation requests. Please try again later.');
      }
    }

    return {
      ...formState.securityContext,
      requestCount: formState.securityContext.lastRequestTime > oneMinuteAgo ? 
        formState.securityContext.requestCount + 1 : 1,
      lastRequestTime: now
    };
  }, [formState.securityContext]);

  /**
   * Update validation metrics
   */
  const updateValidationMetrics = useCallback((validationTime: number) => {
    const { validationCount, averageValidationTime } = formState.validationMetrics;
    const newCount = validationCount + 1;
    const newAverage = ((averageValidationTime * validationCount) + validationTime) / newCount;

    return {
      lastValidated: Date.now(),
      validationCount: newCount,
      averageValidationTime: newAverage
    };
  }, [formState.validationMetrics]);

  /**
   * Memoized change handler with validation
   */
  const handleChange = useCallback<ChangeHandler>(async (e) => {
    const { name, value } = e.target;
    const startTime = Date.now();

    try {
      const newSecurityContext = checkSecurityThrottling();

      // Update form state with new value
      setFormState(prev => ({
        ...prev,
        values: { ...prev.values, [name]: value },
        touched: { ...prev.touched, [name]: true },
        securityContext: newSecurityContext
      }));

      // Validate field if rules exist
      if (validationRules[name]) {
        const validationContext = {
          userId: 'current-user', // Should be from auth context
          sessionId: formState.securityContext.sessionId,
          requestId: crypto.randomUUID(),
          timestamp: Date.now()
        };

        const result = await validateField(value, validationRules[name], validationContext);
        const validationTime = Date.now() - startTime;

        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: result.isValid ? '' : (result.errorMessage || VALIDATION_MESSAGES.REQUIRED)
          },
          validationMetrics: updateValidationMetrics(validationTime)
        }));
      }
    } catch (error) {
      showNotification(error.message, 'warning');
    }
  }, [validationRules, checkSecurityThrottling, updateValidationMetrics, showNotification]);

  /**
   * Memoized blur handler with validation
   */
  const handleBlur = useCallback<BlurHandler>(async (e) => {
    const { name } = e.target;
    
    try {
      const newSecurityContext = checkSecurityThrottling();

      setFormState(prev => ({
        ...prev,
        touched: { ...prev.touched, [name]: true },
        securityContext: newSecurityContext
      }));

      if (validationRules[name]) {
        const validationContext = {
          userId: 'current-user',
          sessionId: formState.securityContext.sessionId,
          requestId: crypto.randomUUID(),
          timestamp: Date.now()
        };

        const result = await validateField(
          formState.values[name],
          validationRules[name],
          validationContext
        );

        setFormState(prev => ({
          ...prev,
          errors: {
            ...prev.errors,
            [name]: result.isValid ? '' : (result.errorMessage || VALIDATION_MESSAGES.REQUIRED)
          }
        }));
      }
    } catch (error) {
      showNotification(error.message, 'warning');
    }
  }, [validationRules, formState.values, formState.securityContext.sessionId, checkSecurityThrottling, showNotification]);

  /**
   * Memoized submit handler with parallel validation
   */
  const handleSubmit = useCallback<SubmitHandler>(async (e) => {
    e.preventDefault();
    const startTime = Date.now();

    try {
      const newSecurityContext = checkSecurityThrottling();

      setFormState(prev => ({
        ...prev,
        isSubmitting: true,
        securityContext: newSecurityContext
      }));

      const validationContext = {
        userId: 'current-user',
        sessionId: formState.securityContext.sessionId,
        requestId: crypto.randomUUID(),
        timestamp: Date.now()
      };

      // Validate all fields in parallel
      const validationResult = await validateForm(
        formState.values,
        validationRules,
        validationContext
      );

      if (validationResult.isValid) {
        await onSubmit(formState.values);
        showNotification('Form submitted successfully', 'success');
      } else {
        setFormState(prev => ({
          ...prev,
          errors: validationResult.fieldErrors,
          isValid: false,
          validationMetrics: updateValidationMetrics(Date.now() - startTime)
        }));
        showNotification('Please correct the errors before submitting', 'warning');
      }
    } catch (error) {
      showNotification(error.message, 'warning');
    } finally {
      setFormState(prev => ({
        ...prev,
        isSubmitting: false
      }));
    }
  }, [formState.values, formState.securityContext.sessionId, validationRules, onSubmit, checkSecurityThrottling, updateValidationMetrics, showNotification]);

  /**
   * Memoized reset handler with state cleanup
   */
  const resetForm = useCallback<ResetHandler>(() => {
    setFormState({
      values: initialValues,
      errors: {},
      touched: {},
      isSubmitting: false,
      isValid: true,
      validationMetrics: {
        lastValidated: Date.now(),
        validationCount: 0,
        averageValidationTime: 0
      },
      securityContext: {
        sessionId: crypto.randomUUID(),
        requestCount: 0,
        lastRequestTime: Date.now()
      }
    });
  }, [initialValues]);

  return {
    values: formState.values,
    errors: formState.errors,
    touched: formState.touched,
    isSubmitting: formState.isSubmitting,
    isValid: formState.isValid,
    validationMetrics: formState.validationMetrics,
    securityContext: formState.securityContext,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  };
}