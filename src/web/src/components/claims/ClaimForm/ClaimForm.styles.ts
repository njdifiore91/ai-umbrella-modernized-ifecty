import styled from 'styled-components'; // v5.3.10
import { flexColumn, flexBetween } from '../../../styles/mixins';

// Main form container with column layout and consistent spacing
export const FormContainer = styled.form`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.compound.formGroup};
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 4px;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
`;

// Form section container for grouping related fields
export const FormSection = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
`;

// Row container for horizontal field layout
export const FormRow = styled.div`
  ${flexBetween};
  gap: ${({ theme }) => theme.spacing.scale.md};
  width: 100%;

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    flex-direction: column;
    align-items: stretch;
  }
`;

// Form field label with consistent typography
export const Label = styled.label`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  color: ${({ theme }) => theme.colors.text.primary};
  margin-bottom: ${({ theme }) => theme.spacing.scale.xs};
`;

// Required field indicator
export const RequiredIndicator = styled.span`
  color: ${({ theme }) => theme.colors.feedback.error.main};
  margin-left: ${({ theme }) => theme.spacing.scale.xs};
`;

// Document upload section with visual feedback
export const UploadSection = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  border: 2px dashed ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.background.paper};
  transition: border-color 0.2s ease-in-out;

  &:hover {
    border-color: ${({ theme }) => theme.colors.primary.main};
  }

  &.drag-active {
    border-color: ${({ theme }) => theme.colors.primary.main};
    background: ${({ theme }) => theme.colors.background.elevated};
  }
`;

// Document list container
export const DocumentList = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.xs};
  margin-top: ${({ theme }) => theme.spacing.scale.sm};
`;

// Individual document item
export const DocumentItem = styled.div`
  ${flexBetween};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  background: ${({ theme }) => theme.colors.background.default};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
`;

// Progress bar container
export const ProgressContainer = styled.div`
  width: 100%;
  height: 4px;
  background: ${({ theme }) => theme.colors.background.paper};
  border-radius: 2px;
  margin: ${({ theme }) => theme.spacing.scale.md} 0;
  overflow: hidden;
`;

// Progress bar indicator
export const ProgressBar = styled.div<{ progress: number }>`
  width: ${({ progress }) => progress}%;
  height: 100%;
  background: ${({ theme }) => theme.colors.primary.main};
  transition: width 0.3s ease-in-out;
`;

// Status message container
export const StatusMessage = styled.div<{ type: 'error' | 'success' | 'info' }>`
  padding: ${({ theme }) => theme.spacing.scale.sm};
  margin-top: ${({ theme }) => theme.spacing.scale.sm};
  border-radius: 4px;
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
  color: ${({ theme, type }) => theme.colors.feedback[type].contrast};
  background: ${({ theme, type }) => theme.colors.feedback[type].main};
`;

// Form action buttons container
export const ButtonContainer = styled.div`
  ${flexBetween};
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};

  @media (max-width: ${({ theme }) => theme.breakpoints.values.sm}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Helper text for form fields
export const HelperText = styled.span<{ error?: boolean }>`
  font-size: ${({ theme }) => theme.typography.fontSize.xs};
  color: ${({ theme, error }) => 
    error ? theme.colors.feedback.error.main : theme.colors.text.secondary};
  margin-top: ${({ theme }) => theme.spacing.scale.xs};
`;