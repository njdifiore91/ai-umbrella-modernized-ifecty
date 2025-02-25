import styled, { css } from 'styled-components'; // v5.3.10
import { lightTheme, darkTheme } from '../../styles/theme';
import { flexCenter } from '../../styles/mixins';

// Button size configurations
const buttonSizes = {
  small: {
    padding: '${({ theme }) => theme.spacing.scale.xs} ${({ theme }) => theme.spacing.scale.sm}',
    fontSize: '${({ theme }) => theme.typography.fontSize.body2}',
    height: '32px'
  },
  medium: {
    padding: '${({ theme }) => theme.spacing.scale.sm} ${({ theme }) => theme.spacing.scale.md}',
    fontSize: '${({ theme }) => theme.typography.fontSize.body1}',
    height: '40px'
  },
  large: {
    padding: '${({ theme }) => theme.spacing.scale.md} ${({ theme }) => theme.spacing.scale.lg}',
    fontSize: '${({ theme }) => theme.typography.fontSize.h4}',
    height: '48px'
  }
};

// Button variant style generator
const getButtonStyles = ({ variant = 'primary', isToolbar = false, theme, disabled = false }) => {
  const baseStyles = css`
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    font-family: ${theme.typography.fontFamily.primary};
    font-weight: ${theme.typography.fontWeight.medium};
    border-radius: 4px;
    border: 2px solid transparent;
    cursor: ${disabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease-in-out;
    outline: none;
    text-decoration: none;
    user-select: none;
    white-space: nowrap;
    
    &:focus-visible {
      box-shadow: 0 0 0 2px ${theme.colors.background.default},
                 0 0 0 4px ${theme.colors.primary.main};
    }
  `;

  const variantStyles = {
    primary: css`
      background-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.contrast};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.dark};
      }
      
      &:active:not(:disabled) {
        background-color: ${theme.colors.primary.light};
      }
    `,
    secondary: css`
      background-color: ${theme.colors.secondary.main};
      color: ${theme.colors.secondary.contrast};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.secondary.dark};
      }
      
      &:active:not(:disabled) {
        background-color: ${theme.colors.secondary.light};
      }
    `,
    outline: css`
      background-color: transparent;
      border-color: ${theme.colors.primary.main};
      color: ${theme.colors.primary.main};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.main}10;
      }
      
      &:active:not(:disabled) {
        background-color: ${theme.colors.primary.main}20;
      }
    `,
    text: css`
      background-color: transparent;
      color: ${theme.colors.primary.main};
      padding: ${theme.spacing.scale.xs};
      
      &:hover:not(:disabled) {
        background-color: ${theme.colors.primary.main}10;
      }
      
      &:active:not(:disabled) {
        background-color: ${theme.colors.primary.main}20;
      }
    `
  };

  const toolbarStyles = isToolbar && css`
    height: 36px;
    padding: ${theme.spacing.scale.xs} ${theme.spacing.scale.sm};
    border-radius: 6px;
    font-size: ${theme.typography.fontSize.body2};
    
    &:not(:last-child) {
      margin-right: ${theme.spacing.scale.xs};
    }
  `;

  const disabledStyles = disabled && css`
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  `;

  return css`
    ${baseStyles}
    ${variantStyles[variant]}
    ${toolbarStyles}
    ${disabledStyles}
  `;
};

// Main button component
export const StyledButton = styled.button`
  ${props => getButtonStyles(props)}
  
  ${({ size = 'medium' }) => css`
    padding: ${buttonSizes[size].padding};
    font-size: ${buttonSizes[size].fontSize};
    height: ${buttonSizes[size].height};
  `}

  @media ${({ theme }) => theme.breakpoints.down('sm')} {
    width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
  }
`;

// Button content wrapper for icon and text alignment
export const ButtonContent = styled.span`
  ${flexCenter}
  gap: ${({ theme }) => theme.spacing.scale.xs};

  & > svg {
    width: 1em;
    height: 1em;
  }
`;

// Loading spinner container
export const LoadingSpinner = styled.span`
  ${flexCenter}
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: inherit;
  border-radius: inherit;
`;

// Icon wrapper for consistent sizing
export const IconWrapper = styled.span`
  ${flexCenter}
  flex-shrink: 0;
  
  & > svg {
    width: 1em;
    height: 1em;
  }
`;

// Tooltip container for disabled buttons
export const TooltipContainer = styled.span`
  position: relative;
  display: inline-block;
  width: ${({ fullWidth }) => fullWidth ? '100%' : 'auto'};
`;