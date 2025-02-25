import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import Button from './Button';
import { StyledButton, ButtonContent, LoadingSpinner } from './Button.styles';
import { LoadingState } from '../../../types/common.types';
import { lightTheme, darkTheme } from '../../../styles/theme';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// Test setup helper to render button with theme
const renderWithTheme = (ui: React.ReactNode, theme = lightTheme) => {
  return render(
    <ThemeProvider theme={theme}>
      {ui}
    </ThemeProvider>
  );
};

describe('Button component', () => {
  // Rendering tests
  describe('Rendering', () => {
    test('renders with default props', () => {
      renderWithTheme(<Button>Click me</Button>);
      const button = screen.getByRole('button', { name: /click me/i });
      
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute('type', 'button');
      expect(button).not.toBeDisabled();
    });

    test('renders different variants correctly', () => {
      const { rerender } = renderWithTheme(
        <Button variant="primary">Primary</Button>
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveStyle(`
        background-color: ${lightTheme.colors.primary.main}
      `);

      rerender(
        <ThemeProvider theme={lightTheme}>
          <Button variant="secondary">Secondary</Button>
        </ThemeProvider>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveStyle(`
        background-color: ${lightTheme.colors.secondary.main}
      `);
    });

    test('renders different sizes correctly', () => {
      const { rerender } = renderWithTheme(
        <Button size="small">Small</Button>
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 32px');

      rerender(
        <ThemeProvider theme={lightTheme}>
          <Button size="large">Large</Button>
        </ThemeProvider>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveStyle('height: 48px');
    });

    test('renders with icons correctly', () => {
      const startIcon = <span data-testid="start-icon">Start</span>;
      const endIcon = <span data-testid="end-icon">End</span>;

      renderWithTheme(
        <Button startIcon={startIcon} endIcon={endIcon}>
          With Icons
        </Button>
      );

      expect(screen.getByTestId('start-icon')).toBeInTheDocument();
      expect(screen.getByTestId('end-icon')).toBeInTheDocument();
    });
  });

  // Interaction tests
  describe('Interactions', () => {
    test('handles click events correctly', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Click me</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('prevents click when disabled', async () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <Button onClick={handleClick} disabled>
          Disabled
        </Button>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toBeDisabled();
    });

    test('handles keyboard navigation', async () => {
      const handleClick = jest.fn();
      renderWithTheme(<Button onClick={handleClick}>Press me</Button>);
      
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
      
      fireEvent.keyDown(button, { key: 'Enter' });
      expect(handleClick).toHaveBeenCalledTimes(1);
      
      fireEvent.keyDown(button, { key: 'Space' });
      expect(handleClick).toHaveBeenCalledTimes(2);
    });
  });

  // Loading state tests
  describe('Loading State', () => {
    test('displays loading spinner when loading', () => {
      renderWithTheme(
        <Button loadingState={LoadingState.LOADING}>
          Loading
        </Button>
      );
      
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.getByRole('button')).toHaveAttribute('aria-busy', 'true');
    });

    test('disables button during loading state', async () => {
      const handleClick = jest.fn();
      renderWithTheme(
        <Button 
          onClick={handleClick}
          loadingState={LoadingState.LOADING}
        >
          Loading
        </Button>
      );
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).not.toHaveBeenCalled();
      expect(button).toHaveAttribute('aria-disabled', 'true');
    });
  });

  // Accessibility tests
  describe('Accessibility', () => {
    test('meets accessibility guidelines', async () => {
      const { container } = renderWithTheme(
        <Button aria-label="Accessible button">
          Click me
        </Button>
      );
      
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    test('supports custom aria attributes', () => {
      renderWithTheme(
        <Button
          ariaLabel="Custom label"
          ariaExpanded={true}
          ariaControls="menu-1"
        >
          Accessible
        </Button>
      );
      
      const button = screen.getByRole('button');
      expect(button).toHaveAttribute('aria-label', 'Custom label');
      expect(button).toHaveAttribute('aria-expanded', 'true');
      expect(button).toHaveAttribute('aria-controls', 'menu-1');
    });

    test('handles focus management correctly', () => {
      renderWithTheme(
        <>
          <Button>First</Button>
          <Button>Second</Button>
        </>
      );
      
      const [firstButton, secondButton] = screen.getAllByRole('button');
      
      firstButton.focus();
      expect(firstButton).toHaveFocus();
      
      userEvent.tab();
      expect(secondButton).toHaveFocus();
    });
  });

  // Theme integration tests
  describe('Theme Integration', () => {
    test('adapts to theme changes', () => {
      const { rerender } = renderWithTheme(
        <Button variant="primary">Theme Test</Button>
      );
      
      let button = screen.getByRole('button');
      expect(button).toHaveStyle(`
        background-color: ${lightTheme.colors.primary.main}
      `);

      rerender(
        <ThemeProvider theme={darkTheme}>
          <Button variant="primary">Theme Test</Button>
        </ThemeProvider>
      );
      
      button = screen.getByRole('button');
      expect(button).toHaveStyle(`
        background-color: ${darkTheme.colors.primary.main}
      `);
    });

    test('applies hover styles correctly', async () => {
      renderWithTheme(<Button>Hover me</Button>);
      
      const button = screen.getByRole('button');
      
      await userEvent.hover(button);
      expect(button).toHaveStyleRule('background-color', lightTheme.colors.primary.dark, {
        modifier: ':hover:not(:disabled)'
      });
    });
  });
});