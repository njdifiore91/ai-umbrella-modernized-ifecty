import React, { useCallback } from 'react';
import { StyledButton, ButtonContent, LoadingSpinner, IconWrapper, TooltipContainer } from './Button.styles';
import { LoadingState } from '../../../types/common.types';

// Button variant types
export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'text';

// Button size types
export type ButtonSize = 'small' | 'medium' | 'large';

// Button props interface with enhanced TypeScript type safety
export interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loadingState?: LoadingState;
  children: React.ReactNode;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  isToolbar?: boolean;
  ariaLabel?: string;
  ariaExpanded?: boolean;
  ariaControls?: string;
  tooltipText?: string;
}

/**
 * Button component implementing the design system's button patterns with enhanced TypeScript safety and accessibility
 * @param props ButtonProps - Configuration options for the button component
 * @returns React.FC<ButtonProps> - Rendered button component
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loadingState = LoadingState.IDLE,
  children,
  startIcon,
  endIcon,
  onClick,
  type = 'button',
  className,
  fullWidth = false,
  isToolbar = false,
  ariaLabel,
  ariaExpanded,
  ariaControls,
  tooltipText,
  ...rest
}) => {
  // Determine if button is in loading state
  const isLoading = loadingState === LoadingState.LOADING;
  
  // Determine if button should be disabled
  const isDisabled = disabled || isLoading;

  /**
   * Handle button click events with loading state and disabled checks
   * @param event React.MouseEvent<HTMLButtonElement>
   */
  const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    if (isDisabled || !onClick) return;
    
    // Prevent default behavior for submit buttons
    if (type === 'submit') {
      event.preventDefault();
    }
    
    onClick(event);
  }, [isDisabled, onClick, type]);

  // Render loading spinner when in loading state
  const renderLoadingSpinner = () => {
    if (!isLoading) return null;
    
    return (
      <LoadingSpinner aria-hidden="true">
        {/* Add your loading spinner component here */}
        Loading...
      </LoadingSpinner>
    );
  };

  // Render button content with icons
  const renderContent = () => (
    <ButtonContent>
      {startIcon && <IconWrapper>{startIcon}</IconWrapper>}
      {children}
      {endIcon && <IconWrapper>{endIcon}</IconWrapper>}
    </ButtonContent>
  );

  // Render button with tooltip if disabled and tooltip text provided
  if (disabled && tooltipText) {
    return (
      <TooltipContainer fullWidth={fullWidth}>
        <StyledButton
          as="button"
          type={type}
          variant={variant}
          size={size}
          disabled={true}
          className={className}
          fullWidth={fullWidth}
          isToolbar={isToolbar}
          aria-label={ariaLabel}
          aria-expanded={ariaExpanded}
          aria-controls={ariaControls}
          aria-disabled="true"
          title={tooltipText}
          {...rest}
        >
          {renderContent()}
        </StyledButton>
      </TooltipContainer>
    );
  }

  // Render standard button
  return (
    <StyledButton
      as="button"
      type={type}
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={handleClick}
      className={className}
      fullWidth={fullWidth}
      isToolbar={isToolbar}
      aria-label={ariaLabel}
      aria-expanded={ariaExpanded}
      aria-controls={ariaControls}
      aria-busy={isLoading}
      aria-disabled={isDisabled}
      {...rest}
    >
      {renderLoadingSpinner()}
      {renderContent()}
    </StyledButton>
  );
};

export default Button;