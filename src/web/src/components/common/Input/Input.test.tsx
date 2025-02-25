import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ThemeProvider } from 'styled-components';
import { lightTheme, darkTheme } from '../../../styles/theme';
import Input from './Input';

// Helper function to render Input with theme
const renderInput = (props = {}) => {
  const user = userEvent.setup();
  const utils = render(
    <ThemeProvider theme={lightTheme}>
      <Input {...props} />
    </ThemeProvider>
  );
  return { ...utils, user };
};

describe('Input Component', () => {
  // Mock functions
  const mockOnChange = jest.fn();
  const mockOnBlur = jest.fn();
  const mockOnFocus = jest.fn();

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders input element with label correctly', () => {
      const { getByTestId, getByLabelText } = renderInput({
        label: 'Test Label',
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      const label = getByLabelText('Test Label');

      expect(input).toBeInTheDocument();
      expect(label).toBeInTheDocument();
      expect(input).toHaveAttribute('aria-label', 'Test Label');
    });

    it('renders required label with asterisk', () => {
      const { getByTestId } = renderInput({
        label: 'Required Field',
        required: true,
        testId: 'test-input'
      });

      const label = getByTestId('test-input-label');
      expect(label).toHaveAttribute('data-required', 'true');
    });

    it('applies custom className to container', () => {
      const { container } = renderInput({
        className: 'custom-class'
      });

      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('User Interactions', () => {
    it('handles user input with debounce', async () => {
      const { getByTestId, user } = renderInput({
        onChange: mockOnChange,
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      await user.type(input, 'test value');

      // Fast-forward debounce timer
      jest.advanceTimersByTime(150);

      expect(mockOnChange).toHaveBeenCalledWith(expect.any(Object));
      expect(input).toHaveValue('test value');
    });

    it('handles blur events with validation', async () => {
      const { getByTestId } = renderInput({
        onBlur: mockOnBlur,
        error: 'Error message',
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      fireEvent.blur(input);

      expect(mockOnBlur).toHaveBeenCalled();
      expect(input).toHaveAttribute('aria-invalid', 'true');
    });

    it('handles focus events', async () => {
      const { getByTestId, user } = renderInput({
        onFocus: mockOnFocus,
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      await user.click(input);

      expect(mockOnFocus).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    it('displays error message with animation', async () => {
      const { getByTestId } = renderInput({
        error: 'Test error message',
        testId: 'test-input',
        animationDuration: 200
      });

      const errorMessage = getByTestId('test-input-error');

      // Initial state
      expect(errorMessage).toHaveAttribute('data-visible', 'true');
      expect(errorMessage).toHaveStyle('--animation-duration: 200ms');

      // Wait for animation
      await waitFor(() => {
        expect(errorMessage).toHaveAttribute('role', 'alert');
        expect(errorMessage).toHaveAttribute('aria-live', 'polite');
      });
    });

    it('updates error visibility when error prop changes', () => {
      const { rerender, getByTestId } = render(
        <ThemeProvider theme={lightTheme}>
          <Input testId="test-input" error="Initial error" />
        </ThemeProvider>
      );

      const errorMessage = getByTestId('test-input-error');
      expect(errorMessage).toBeInTheDocument();

      // Update error prop
      rerender(
        <ThemeProvider theme={lightTheme}>
          <Input testId="test-input" error="Updated error" />
        </ThemeProvider>
      );

      expect(errorMessage).toHaveTextContent('Updated error');
    });
  });

  describe('Theme Support', () => {
    it('applies light theme styles correctly', () => {
      const { getByTestId } = renderInput({
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      expect(input).toHaveStyle({
        backgroundColor: lightTheme.colors.background.default,
        color: lightTheme.colors.text.primary
      });
    });

    it('applies dark theme styles correctly', () => {
      const { getByTestId } = render(
        <ThemeProvider theme={darkTheme}>
          <Input testId="test-input" />
        </ThemeProvider>
      );

      const input = getByTestId('test-input');
      expect(input).toHaveStyle({
        backgroundColor: darkTheme.colors.background.paper,
        color: darkTheme.colors.text.primary
      });
    });

    it('handles disabled state styling', () => {
      const { getByTestId } = renderInput({
        disabled: true,
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      expect(input).toBeDisabled();
      expect(input).toHaveStyle({
        backgroundColor: lightTheme.colors.background.disabled,
        cursor: 'not-allowed'
      });
    });
  });

  describe('Accessibility', () => {
    it('supports keyboard navigation', async () => {
      const { getByTestId, user } = renderInput({
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      await user.tab();
      expect(input).toHaveFocus();
    });

    it('provides appropriate ARIA attributes', () => {
      const { getByTestId } = renderInput({
        label: 'Test Label',
        required: true,
        error: 'Error message',
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      expect(input).toHaveAttribute('aria-required', 'true');
      expect(input).toHaveAttribute('aria-invalid', 'true');
      expect(input).toHaveAttribute('aria-describedby');
    });

    it('maintains focus state styles', async () => {
      const { getByTestId, user } = renderInput({
        testId: 'test-input'
      });

      const input = getByTestId('test-input');
      await user.tab();
      expect(input).toHaveFocus();
      expect(input).toHaveStyle({
        borderColor: lightTheme.colors.primary.main
      });
    });
  });
});