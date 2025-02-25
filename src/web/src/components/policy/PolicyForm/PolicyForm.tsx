import React, { useCallback, useEffect } from 'react';
import styled from 'styled-components';
import Input from '../../common/Input/Input';
import { useForm } from '../../../hooks/useForm';
import { PolicyService } from '../../../services/policy.service';
import { Policy, PolicyStatus } from '../../../types/policy.types';
import { useNotificationContext } from '../../../context/NotificationContext';
import { VALIDATION_PATTERNS, VALIDATION_MESSAGES } from '../../../constants/validation.constants';

// Styled components for form layout
const FormContainer = styled.form`
  ${({ theme }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.scale.md};
    width: 100%;
    max-width: 800px;
    margin: 0 auto;
    padding: ${theme.spacing.scale.lg};
  `}
`;

const FormSection = styled.div`
  ${({ theme }) => `
    display: flex;
    flex-direction: column;
    gap: ${theme.spacing.scale.sm};
    padding: ${theme.spacing.scale.md};
    background: ${theme.colors.background.paper};
    border-radius: 4px;
    box-shadow: 0 2px 4px ${theme.colors.text.disabled}20;
  `}
`;

const ButtonGroup = styled.div`
  ${({ theme }) => `
    display: flex;
    gap: ${theme.spacing.scale.sm};
    justify-content: flex-end;
    margin-top: ${theme.spacing.scale.md};
  `}
`;

const SubmitButton = styled.button`
  ${({ theme }) => `
    padding: ${theme.spacing.scale.sm} ${theme.spacing.scale.lg};
    background: ${theme.colors.primary.main};
    color: ${theme.colors.primary.contrast};
    border: none;
    border-radius: 4px;
    font-weight: ${theme.typography.fontWeight.medium};
    cursor: pointer;
    transition: all 0.2s ease-in-out;

    &:hover:not(:disabled) {
      background: ${theme.colors.primary.dark};
    }

    &:disabled {
      background: ${theme.colors.text.disabled};
      cursor: not-allowed;
    }
  `}
`;

// Validation rules for policy form fields
const validationRules = {
  policyNumber: {
    required: true,
    pattern: VALIDATION_PATTERNS.POLICY_NUMBER,
    custom: (value: string) => value.length === 10
  },
  effectiveDate: {
    required: true,
    custom: (value: string) => {
      const date = new Date(value);
      return date >= new Date();
    }
  },
  expiryDate: {
    required: true,
    custom: (value: string, formValues: any) => {
      const effectiveDate = new Date(formValues.effectiveDate);
      const expiryDate = new Date(value);
      return expiryDate > effectiveDate;
    }
  },
  totalPremium: {
    required: true,
    custom: (value: number) => value > 0 && value <= 10000000
  }
};

interface PolicyFormProps {
  initialValues?: Partial<Policy>;
  onSubmit?: (policy: Policy) => void;
  isEdit?: boolean;
}

export const PolicyForm: React.FC<PolicyFormProps> = ({
  initialValues = {},
  onSubmit,
  isEdit = false
}) => {
  const policyService = new PolicyService();
  const { showNotification } = useNotificationContext();

  // Initialize form with validation and monitoring
  const {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm
  } = useForm<Partial<Policy>>(
    {
      policyNumber: '',
      status: PolicyStatus.PENDING,
      totalPremium: 0,
      effectiveDate: '',
      expiryDate: '',
      ...initialValues
    },
    validationRules,
    async (formValues) => {
      try {
        const response = isEdit
          ? await policyService.updatePolicy(formValues.id!, formValues as Policy)
          : await policyService.createPolicy(formValues as Policy);

        showNotification(
          `Policy successfully ${isEdit ? 'updated' : 'created'}`,
          'success'
        );

        if (onSubmit) {
          onSubmit(response.data);
        }
      } catch (error) {
        showNotification(
          'Error processing policy. Please try again.',
          'warning'
        );
        throw error;
      }
    }
  );

  // Reset form when initialValues change
  useEffect(() => {
    resetForm();
  }, [initialValues, resetForm]);

  // Form submission handler with validation
  const onFormSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      await handleSubmit(e);
    },
    [handleSubmit]
  );

  return (
    <FormContainer onSubmit={onFormSubmit} noValidate>
      <FormSection>
        <Input
          label="Policy Number"
          name="policyNumber"
          value={values.policyNumber}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.policyNumber ? errors.policyNumber : ''}
          disabled={isEdit}
          required
          placeholder="POL-YYYY-XXXXXX"
          ariaLabel="Policy number input"
        />

        <Input
          label="Effective Date"
          name="effectiveDate"
          type="date"
          value={values.effectiveDate}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.effectiveDate ? errors.effectiveDate : ''}
          required
          ariaLabel="Policy effective date input"
        />

        <Input
          label="Expiry Date"
          name="expiryDate"
          type="date"
          value={values.expiryDate}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.expiryDate ? errors.expiryDate : ''}
          required
          ariaLabel="Policy expiry date input"
        />

        <Input
          label="Total Premium"
          name="totalPremium"
          type="number"
          value={values.totalPremium}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.totalPremium ? errors.totalPremium : ''}
          required
          min={0}
          max={10000000}
          step={0.01}
          ariaLabel="Policy total premium input"
        />
      </FormSection>

      <ButtonGroup>
        <SubmitButton
          type="submit"
          disabled={isSubmitting || Object.keys(errors).length > 0}
          aria-label={`${isEdit ? 'Update' : 'Create'} policy`}
        >
          {isSubmitting ? 'Processing...' : isEdit ? 'Update Policy' : 'Create Policy'}
        </SubmitButton>
      </ButtonGroup>
    </FormContainer>
  );
};

export default PolicyForm;