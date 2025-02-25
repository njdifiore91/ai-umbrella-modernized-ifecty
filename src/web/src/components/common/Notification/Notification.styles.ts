import styled, { keyframes } from 'styled-components'; // v5.3.10
import { flexCenter, flexBetween } from '../../../styles/mixins';

// Animation keyframes for notification entrance and exit
export const slideIn = keyframes`
  from {
    transform: translateY(-100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const slideOut = keyframes`
  from {
    transform: translateY(0);
    opacity: 1;
  }
  to {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

// Helper function to get status-based colors with proper contrast
const getStatusColor = (status: 'error' | 'warning' | 'info' | 'success') => {
  return ({ theme }) => {
    const statusColors = {
      error: theme.colors.status.error,
      warning: theme.colors.status.warning,
      info: theme.colors.status.info,
      success: theme.colors.status.success
    };
    return statusColors[status];
  };
};

// Fixed position container for notifications
export const NotificationContainer = styled.div`
  position: fixed;
  top: ${({ theme }) => theme.spacing.scale.lg};
  right: ${({ theme }) => theme.spacing.scale.lg};
  z-index: ${({ theme }) => theme.zIndex.overlay.snackbar};
  max-width: 400px;
  width: calc(100% - ${({ theme }) => theme.spacing.scale.lg} * 2);
  
  /* Ensure notifications stack properly */
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.scale.xs};
  
  /* Accessibility attributes */
  role: 'alert';
  aria-live: 'polite';
`;

// Individual notification wrapper with status-based styling
export const NotificationWrapper = styled.div<{
  status: 'error' | 'warning' | 'info' | 'success';
  isExiting?: boolean;
}>`
  ${flexBetween};
  background-color: ${({ status }) => getStatusColor(status)};
  color: ${({ theme }) => theme.colors.background.default};
  border-radius: ${({ theme }) => theme.spacing.scale.xxs};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  padding: ${({ theme }) => theme.spacing.scale.sm};
  
  /* Animation handling */
  animation: ${({ isExiting }) => isExiting ? slideOut : slideIn} 0.3s ease-in-out;
  
  /* Accessibility enhancements */
  role: 'status';
  aria-label: ${({ status }) => `${status} notification`};
  
  /* Ensure proper contrast for text */
  * {
    color: inherit;
  }
  
  /* Responsive adjustments */
  ${({ theme }) => theme.breakpoints.down('sm')} {
    padding: ${({ theme }) => theme.spacing.scale.xs};
  }
`;

// Content layout for notification message
export const NotificationContent = styled.div`
  ${flexCenter};
  flex: 1;
  padding-right: ${({ theme }) => theme.spacing.scale.sm};
  
  /* Typography styling */
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  
  /* Text overflow handling */
  overflow-wrap: break-word;
  word-break: break-word;
`;

// Close button styling
export const CloseButton = styled.button`
  ${flexCenter};
  background: none;
  border: none;
  padding: ${({ theme }) => theme.spacing.scale.xxs};
  cursor: pointer;
  opacity: 0.8;
  transition: opacity 0.2s ease-in-out;
  
  /* Accessibility focus styles */
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.background.default};
    outline-offset: 2px;
    opacity: 1;
  }
  
  /* Hover state */
  &:hover {
    opacity: 1;
  }
  
  /* Icon sizing */
  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;

// Icon container for status icons
export const StatusIcon = styled.span`
  ${flexCenter};
  margin-right: ${({ theme }) => theme.spacing.scale.xs};
  
  svg {
    width: 20px;
    height: 20px;
    fill: currentColor;
  }
`;