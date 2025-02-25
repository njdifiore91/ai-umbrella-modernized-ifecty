import React, { forwardRef, useCallback, useEffect, useState } from 'react';
import { InputContainer, StyledInput, InputLabel, ErrorMessage } from './Input.styles';

// Custom props interface extending HTML input attributes
interface InputCustomProps {
  label?: string;
  error?: string;
  className?: string;
  ariaLabel?: string;
  testId?: string;
  animationDuration?: number;
  theme?: 'light' | 'dark';
}

// Combined props type with HTML input attributes
type InputProps = React.InputHTMLAttributes<HTMLInputElement> & InputCustomProps;

/**
 * Enhanced Input component with accessibility features, animations, and validation
 * 
 * @component
 * @example
 * <Input
 *   label="Email"
 *   required
 *   error="Please enter a valid email"
 *   onChange={handleChange}
 *   ariaLabel="Email input field"
 * />
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  className,
  disabled = false,
  required = false,
  id,
  ariaLabel,
  testId = 'input-field',
  animationDuration = 200,
  onChange,
  onBlur,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  // State for error animation and validation
  const [isErrorVisible, setIsErrorVisible] = useState(false);
  const [inputValue, setInputValue] = useState(props.value || props.defaultValue || '');
  const [uniqueId] = useState(() => id || `input-${Math.random().toString(36).substr(2, 9)}`);
  const errorId = `${uniqueId}-error`;

  // Handle input change with debouncing
  const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setInputValue(value);

    // Debounce onChange callback
    const timeoutId = setTimeout(() => {
      if (onChange) {
        onChange(event);
      }
    }, 150);

    return () => clearTimeout(timeoutId);
  }, [onChange]);

  // Handle input blur with validation
  const handleBlur = useCallback((event: React.FocusEvent<HTMLInputElement>) => {
    // Show error message with animation if present
    setIsErrorVisible(!!error);

    if (onBlur) {
      onBlur(event);
    }
  }, [error, onBlur]);

  // Update error visibility when error prop changes
  useEffect(() => {
    setIsErrorVisible(!!error);
  }, [error]);

  // Update input value when value prop changes
  useEffect(() => {
    if (props.value !== undefined) {
      setInputValue(props.value);
    }
  }, [props.value]);

  return (
    <InputContainer 
      className={className}
      role="group"
      aria-labelledby={label ? uniqueId : undefined}
      data-testid={`${testId}-container`}
    >
      {label && (
        <InputLabel
          htmlFor={uniqueId}
          id={`${uniqueId}-label`}
          data-required={required}
          data-testid={`${testId}-label`}
        >
          {label}
        </InputLabel>
      )}

      <StyledInput
        {...props}
        ref={ref}
        id={uniqueId}
        disabled={disabled}
        required={required}
        aria-label={ariaLabel || label}
        aria-invalid={!!error}
        aria-describedby={error ? errorId : ariaDescribedBy}
        aria-required={required}
        data-testid={testId}
        onChange={handleChange}
        onBlur={handleBlur}
        value={inputValue}
        error={!!error}
      />

      {error && (
        <ErrorMessage
          id={errorId}
          role="alert"
          aria-live="polite"
          data-visible={isErrorVisible}
          data-testid={`${testId}-error`}
          style={{ 
            '--animation-duration': `${animationDuration}ms`
          } as React.CSSProperties}
        >
          {error}
        </ErrorMessage>
      )}
    </InputContainer>
  );
});

// Display name for debugging
Input.displayName = 'Input';

// Default export
export default Input;