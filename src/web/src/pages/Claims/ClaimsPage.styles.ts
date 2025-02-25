import styled from 'styled-components'; // v5.3.10
import { flexColumn, flexBetween } from '../../styles/mixins';

// Main container for the claims page
export const ClaimsPageContainer = styled.div`
  ${flexColumn};
  min-height: 100vh;
  background-color: ${({ theme }) => theme.colors.background.default};
  padding: ${({ theme }) => theme.spacing.scale.lg};

  @media ${({ theme }) => theme.breakpoints.values.sm} {
    padding: ${({ theme }) => theme.spacing.scale.xl};
  }
`;

// Header section with title and action buttons
export const ClaimsHeader = styled.header`
  ${flexBetween};
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.md};
  background-color: ${({ theme }) => theme.colors.primary.main};
  color: ${({ theme }) => theme.colors.primary.contrast};
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  h1 {
    font-size: ${({ theme }) => theme.typography.fontSize.xl};
    font-weight: ${({ theme }) => theme.typography.fontWeight.semibold};
  }

  .header-actions {
    ${flexBetween};
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Main content area
export const ClaimsContent = styled.main`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.md};
  padding: ${({ theme }) => theme.spacing.scale.lg};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  margin-top: ${({ theme }) => theme.spacing.scale.md};
`;

// Claim information section
export const ClaimInfoSection = styled.section`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;

  .claim-number {
    font-size: ${({ theme }) => theme.typography.fontSize.lg};
    color: ${({ theme }) => theme.colors.text.primary};
    font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  }
`;

// Status selection container
export const StatusContainer = styled.div`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.xs};
  margin: ${({ theme }) => theme.spacing.scale.md} 0;

  .status-label {
    font-size: ${({ theme }) => theme.typography.fontSize.md};
    color: ${({ theme }) => theme.colors.text.secondary};
  }

  .status-options {
    display: flex;
    gap: ${({ theme }) => theme.spacing.scale.md};
  }
`;

// Document management section
export const ClaimsDocumentSection = styled.section`
  ${flexColumn};
  gap: ${({ theme }) => theme.spacing.scale.sm};
  padding: ${({ theme }) => theme.spacing.scale.md};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.background.default};

  .document-header {
    ${flexBetween};
    margin-bottom: ${({ theme }) => theme.spacing.scale.sm};
  }

  .document-list {
    ${flexColumn};
    gap: ${({ theme }) => theme.spacing.scale.xs};
  }
`;

// Upload button container
export const UploadButton = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.scale.xs};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  color: ${({ theme }) => theme.colors.primary.main};
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary.dark};
  }
`;

// Progress status bar
export const ClaimsStatusBar = styled.div`
  width: 100%;
  height: 24px;
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  overflow: hidden;
  margin: ${({ theme }) => theme.spacing.scale.md} 0;

  .progress-bar {
    height: 100%;
    background-color: ${({ theme }) => theme.colors.feedback.info.main};
    transition: width 0.3s ease;
  }
`;

// Action buttons container
export const ActionButtonsContainer = styled.div`
  ${flexBetween};
  margin-top: ${({ theme }) => theme.spacing.scale.lg};
  padding-top: ${({ theme }) => theme.spacing.scale.md};
  border-top: 1px solid ${({ theme }) => theme.colors.form.border};

  .button-group {
    display: flex;
    gap: ${({ theme }) => theme.spacing.scale.sm};
  }
`;

// Status message bar
export const StatusMessageBar = styled.div`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.scale.sm};
  background-color: ${({ theme }) => theme.colors.background.paper};
  border: 1px solid ${({ theme }) => theme.colors.form.border};
  border-radius: 4px;
  margin-top: ${({ theme }) => theme.spacing.scale.md};
  text-align: center;
  color: ${({ theme }) => theme.colors.text.secondary};
  font-size: ${({ theme }) => theme.typography.fontSize.sm};
`;