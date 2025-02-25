import styled from 'styled-components'; // v5.3.10
import { flexColumn, flexBetween, responsiveText } from '../../../styles/mixins';
import { lightTheme } from '../../../styles/theme';

// Main form container with vertical layout and consistent spacing
export const FormContainer = styled.form`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.compound.formGroup};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: ${({ theme }) => theme.breakpoints.container.lg};
  margin: 0 auto;
`;

// Section container for grouping related form fields
export const FormSection = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;

  &:not(:last-child) {
    margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  }
`;

// Horizontal row for form field layout with responsive design
export const FormRow = styled.div`
  ${flexBetween};
  gap: ${({ theme }) => theme.spacing.scale.md};
  width: 100%;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.values.md}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// Styled label for form fields with accessibility considerations
export const FormLabel = styled.label`
  ${responsiveText({
    fontSize: {
      xs: '0.875rem',
      sm: '0.875rem',
      md: '1rem'
    },
    fontWeight: 'medium',
    accessibility: {
      minFontSize: '12px',
      maxFontSize: '16px',
      scaleRatio: 1.2
    }
  })};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.xs};

  &[data-required="true"]::after {
    content: "*";
    color: ${({ theme }) => theme.colors.feedback.error.main};
    margin-left: ${({ theme }) => theme.spacing.scale.xs};
  }
`;

// Styled input field component with states and accessibility
export const FormInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.md};
  color: ${({ theme }) => theme.colors.text.primary};
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  transition: all 0.2s ease-in-out;

  &::placeholder {
    color: ${({ theme }) => theme.colors.form.placeholder};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.form.borderFocus};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.form.borderFocus}33;
  }

  &:disabled {
    background: ${({ theme }) => theme.colors.form.disabled};
    cursor: not-allowed;
  }

  &[aria-invalid="true"] {
    border-color: ${({ theme }) => theme.colors.feedback.error.main};
  }
`;

// Container for form action buttons with responsive layout
export const FormActions = styled.div`
  ${flexBetween};
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    flex-direction: column-reverse;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Error message styling for form validation
export const FormError = styled.span`
  ${responsiveText({
    fontSize: {
      xs: '0.75rem',
      sm: '0.75rem',
      md: '0.875rem'
    },
    fontWeight: 'regular'
  })};
  color: ${({ theme }) => theme.colors.feedback.error.main};
  margin-top: ${({ theme }) => theme.spacing.scale.xs};
`;

// Helper text for form fields
export const FormHelper = styled.span`
  ${responsiveText({
    fontSize: {
      xs: '0.75rem',
      sm: '0.75rem',
      md: '0.875rem'
    },
    fontWeight: 'regular'
  })};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.scale.xs};
`;

// Required field indicator text
export const RequiredFieldText = styled.p`
  ${responsiveText({
    fontSize: {
      xs: '0.75rem',
      sm: '0.75rem',
      md: '0.875rem'
    },
    fontWeight: 'regular'
  })};
  color: ${({ theme }) => theme.colors.text.secondary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.md};
  
  &::before {
    content: "*";
    color: ${({ theme }) => theme.colors.feedback.error.main};
    margin-right: ${({ theme }) => theme.spacing.scale.xs};
  }
`;