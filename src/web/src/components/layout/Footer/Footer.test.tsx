import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { render, screen, cleanup, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { ThemeProvider } from 'styled-components';
import Footer from './Footer';

// Mock theme object based on variables.ts
const mockTheme = {
  colors: {
    background: {
      default: '#ffffff'
    },
    text: {
      primary: '#212121',
      hint: '#9e9e9e'
    },
    status: {
      info: '#0288d1',
      warning: '#ed6c02',
      error: '#d32f2f',
      success: '#2e7d32'
    }
  },
  typography: {
    fontFamily: {
      primary: '"Roboto", "Helvetica", "Arial", sans-serif'
    },
    fontSize: {
      body2: '0.875rem',
      caption: '0.75rem'
    },
    fontWeight: {
      medium: 500
    },
    lineHeight: {
      normal: 1.5
    }
  },
  spacing: {
    scale: {
      xs: '0.5rem',
      sm: '1rem'
    }
  },
  zIndex: {
    layout: {
      footer: 1000
    }
  },
  breakpoints: {
    down: (size: string) => `@media (max-width: ${size === 'sm' ? '599.95px' : '0px'})`
  }
};

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations);

describe('Footer', () => {
  // Setup before each test
  beforeEach(() => {
    // Mock current year for consistent testing
    jest.spyOn(Date.prototype, 'getFullYear').mockReturnValue(2024);
  });

  // Cleanup after each test
  afterEach(() => {
    cleanup();
    jest.restoreAllMocks();
  });

  it('renders without status message', () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <Footer />
      </ThemeProvider>
    );

    // Verify footer container
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute('aria-label', 'Application footer');

    // Check default status message
    const statusMessage = screen.getByTestId('footer-status-message');
    expect(statusMessage).toHaveTextContent('System ready');
    expect(statusMessage).toHaveAttribute('aria-live', 'polite');
    expect(statusMessage).toHaveAttribute('aria-atomic', 'true');

    // Verify copyright text
    const copyright = screen.getByTestId('footer-copyright');
    expect(copyright).toHaveTextContent('© 2024 AI Umbrella Insurance. All rights reserved.');
    expect(copyright).toHaveAttribute('aria-label', 'Copyright information');

    // Check theme-based styling
    expect(container.firstChild).toHaveStyle({
      backgroundColor: mockTheme.colors.background.default,
      borderTop: `1px solid ${mockTheme.colors.text.hint}`
    });
  });

  it('renders with status message', () => {
    const testMessage = 'Processing request...';
    render(
      <ThemeProvider theme={mockTheme}>
        <Footer statusMessage={testMessage} />
      </ThemeProvider>
    );

    // Verify status message display
    const statusMessage = screen.getByTestId('footer-status-message');
    expect(statusMessage).toHaveTextContent(testMessage);
    expect(statusMessage).toHaveAttribute('aria-live', 'polite');
    expect(statusMessage).toHaveAttribute('aria-atomic', 'true');

    // Verify copyright text remains
    const copyright = screen.getByTestId('footer-copyright');
    expect(copyright).toBeInTheDocument();
  });

  it('applies theme-based styling', () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <Footer />
      </ThemeProvider>
    );

    const footer = container.firstChild;
    const statusMessage = screen.getByTestId('footer-status-message');

    // Check container styling
    expect(footer).toHaveStyle({
      backgroundColor: mockTheme.colors.background.default,
      borderTop: `1px solid ${mockTheme.colors.text.hint}`,
      padding: mockTheme.spacing.scale.sm,
      minHeight: '48px',
      position: 'fixed',
      bottom: '0',
      left: '0',
      zIndex: mockTheme.zIndex.layout.footer
    });

    // Check text styling
    expect(statusMessage).toHaveStyle({
      color: mockTheme.colors.text.primary,
      fontFamily: mockTheme.typography.fontFamily.primary,
      fontSize: mockTheme.typography.fontSize.body2,
      fontWeight: String(mockTheme.typography.fontWeight.medium),
      lineHeight: String(mockTheme.typography.lineHeight.normal)
    });
  });

  it('meets accessibility requirements', async () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <Footer statusMessage="Test status" />
      </ThemeProvider>
    );

    // Run axe accessibility tests
    const results = await axe(container);
    expect(results).toHaveNoViolations();

    // Check semantic structure
    const footer = screen.getByRole('contentinfo');
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveAttribute('aria-label', 'Application footer');

    // Verify live region for status updates
    const statusMessage = screen.getByTestId('footer-status-message');
    expect(statusMessage).toHaveAttribute('aria-live', 'polite');
    expect(statusMessage).toHaveAttribute('aria-atomic', 'true');

    // Check copyright information accessibility
    const copyright = screen.getByTestId('footer-copyright');
    expect(copyright).toHaveAttribute('aria-label', 'Copyright information');
  });

  it('handles long status messages with ellipsis', () => {
    const longMessage = 'This is a very long status message that should be truncated with ellipsis when it exceeds the available space in the footer component';
    render(
      <ThemeProvider theme={mockTheme}>
        <Footer statusMessage={longMessage} />
      </ThemeProvider>
    );

    const statusMessage = screen.getByTestId('footer-status-message');
    expect(statusMessage).toHaveStyle({
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    });
  });

  it('maintains responsive layout', () => {
    const { container } = render(
      <ThemeProvider theme={mockTheme}>
        <Footer />
      </ThemeProvider>
    );

    const footer = container.firstChild;
    expect(footer).toHaveStyle({
      width: '100%',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    });
  });
});