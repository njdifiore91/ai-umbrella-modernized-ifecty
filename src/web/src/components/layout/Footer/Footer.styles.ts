import styled from 'styled-components'; // v5.3.10
import { flexBetween } from '../../styles/mixins';

/**
 * Main footer container component with fixed positioning and theme integration.
 * Implements the footer section of the main application template with consistent styling.
 */
export const FooterContainer = styled.footer`
  ${flexBetween};
  padding: ${({ theme }) => theme.spacing.scale.sm};
  background-color: ${({ theme }) => theme.colors.background.default};
  border-top: 1px solid ${({ theme }) => theme.colors.text.hint};
  min-height: 48px;
  width: 100%;
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: ${({ theme }) => theme.zIndex.layout.footer};
  box-shadow: 0 -2px 4px rgba(0, 0, 0, 0.05);
`;

/**
 * Styled component for status messages with theme-based typography and color styling.
 * Supports different status types (info, warning, error, success) through props.
 */
export const StatusMessage = styled.span<{ status?: 'info' | 'warning' | 'error' | 'success' }>`
  color: ${({ theme, status }) => 
    status ? theme.colors.status[status] : theme.colors.text.primary};
  font-family: ${({ theme }) => theme.typography.fontFamily.primary};
  font-size: ${({ theme }) => theme.typography.fontSize.body2};
  font-weight: ${({ theme }) => theme.typography.fontWeight.medium};
  line-height: ${({ theme }) => theme.typography.lineHeight.normal};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.scale.xs};

  /* Ensure text remains readable when truncated */
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  /* Responsive adjustments */
  ${({ theme }) => theme.breakpoints.down('sm')} {
    font-size: ${({ theme }) => theme.typography.fontSize.caption};
  }
`;