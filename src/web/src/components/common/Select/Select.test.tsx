import React from 'react';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@emotion/styled';
import { Select } from './Select';
import { colors, typography, spacing, breakpoints, zIndex } from '../../../styles/variables';

// Mock theme for testing
const theme = {
  colors,
  typography,
  spacing,
  breakpoints,
  zIndex
};

// Mock ResizeObserver for testing
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver for testing
class IntersectionObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.IntersectionObserver = IntersectionObserverMock;

// Mock performance metrics for Virtual Thread testing
const mockPerformanceMetrics = {
  mark: jest.fn(),
  measure: jest.fn(),
  clearMarks: jest.fn(),
  clearMeasures: jest.fn()
};
global.performance = { ...global.performance, ...mockPerformanceMetrics };

// Test setup helper with enhanced configuration
interface SetupTestProps {
  isMobile?: boolean;
  virtualThreadEnabled?: boolean;
}

const setupTest = (props: SetupTestProps = {}) => {
  const containerRef = React.createRef<HTMLDivElement>();
  const options = [
    { id: 1, label: 'Option 1' },
    { id: 2, label: 'Option 2' },
    { id: 3, label: 'Option 3' }
  ];
  const onChange = jest.fn();

  // Configure viewport for mobile testing
  if (props.isMobile) {
    global.innerWidth = 375;
    global.dispatchEvent(new Event('resize'));
  }

  const renderUtils = render(
    <ThemeProvider theme={theme}>
      <div ref={containerRef}>
        <Select
          options={options}
          value={null}
          onChange={onChange}
          getOptionLabel={(option) => option.label}
          getOptionValue={(option) => option.id}
          virtualThreadEnabled={props.virtualThreadEnabled}
          containerRef={containerRef}
          ariaLabel="Test select"
        />
      </div>
    </ThemeProvider>
  );

  return {
    ...renderUtils,
    containerRef,
    options,
    onChange
  };
};

describe('Select Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.innerWidth = 1024;
    global.dispatchEvent(new Event('resize'));
  });

  describe('Rendering and Styling', () => {
    it('renders with theme-based styling', () => {
      const { container } = setupTest();
      const trigger = screen.getByRole('button');
      
      expect(trigger).toHaveStyle({
        backgroundColor: theme.colors.background.default,
        fontFamily: theme.typography.fontFamily.primary,
        fontSize: theme.typography.fontSize.body1
      });
    });

    it('applies error state styling', () => {
      render(
        <ThemeProvider theme={theme}>
          <Select
            options={[]}
            value={null}
            onChange={() => {}}
            getOptionLabel={(o) => o}
            getOptionValue={(o) => o}
            error={true}
          />
        </ThemeProvider>
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toHaveStyle({
        borderColor: theme.colors.status.error
      });
    });
  });

  describe('Accessibility', () => {
    it('implements ARIA attributes correctly', () => {
      setupTest();
      const trigger = screen.getByRole('button');
      
      expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).toHaveAttribute('aria-label', 'Test select');
    });

    it('manages focus correctly during keyboard navigation', async () => {
      const { options } = setupTest();
      const trigger = screen.getByRole('button');
      
      await userEvent.tab();
      expect(trigger).toHaveFocus();
      
      await userEvent.keyboard('{Enter}');
      const listbox = screen.getByRole('listbox');
      expect(listbox).toBeInTheDocument();
      
      await userEvent.keyboard('{ArrowDown}');
      const firstOption = within(listbox).getByText(options[0].label);
      expect(firstOption).toHaveAttribute('aria-selected', 'false');
    });
  });

  describe('Virtual Thread Performance', () => {
    it('optimizes keyboard navigation with Virtual Threads', async () => {
      const { onChange } = setupTest({ virtualThreadEnabled: true });
      const trigger = screen.getByRole('button');
      
      // Start performance measurement
      performance.mark('keyboardNav-start');
      
      await userEvent.click(trigger);
      await userEvent.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      
      // End performance measurement
      performance.mark('keyboardNav-end');
      performance.measure('keyboardNav', 'keyboardNav-start', 'keyboardNav-end');
      
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(mockPerformanceMetrics.measure).toHaveBeenCalled();
    });

    it('handles concurrent operations efficiently', async () => {
      const { onChange } = setupTest({ virtualThreadEnabled: true });
      
      // Simulate multiple concurrent operations
      const trigger = screen.getByRole('button');
      await Promise.all([
        userEvent.click(trigger),
        userEvent.keyboard('{ArrowDown}'),
        userEvent.keyboard('{Enter}')
      ]);
      
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  describe('Mobile Optimization', () => {
    it('adapts to mobile viewport', () => {
      const { container } = setupTest({ isMobile: true });
      const trigger = screen.getByRole('button');
      
      fireEvent.click(trigger);
      const dropdown = screen.getByRole('listbox');
      
      expect(dropdown).toHaveStyle({
        position: 'fixed',
        bottom: '0',
        borderRadius: '12px 12px 0 0'
      });
    });

    it('handles touch interactions correctly', async () => {
      const { onChange, options } = setupTest({ isMobile: true });
      const trigger = screen.getByRole('button');
      
      await userEvent.click(trigger);
      const option = screen.getByText(options[0].label);
      await userEvent.click(option);
      
      expect(onChange).toHaveBeenCalledWith(options[0]);
    });
  });

  describe('Event Handling', () => {
    it('handles click outside correctly', async () => {
      setupTest();
      const trigger = screen.getByRole('button');
      
      await userEvent.click(trigger);
      expect(screen.getByRole('listbox')).toBeInTheDocument();
      
      await userEvent.click(document.body);
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });

    it('manages disabled state correctly', () => {
      render(
        <ThemeProvider theme={theme}>
          <Select
            options={[]}
            value={null}
            onChange={() => {}}
            getOptionLabel={(o) => o}
            getOptionValue={(o) => o}
            disabled={true}
          />
        </ThemeProvider>
      );
      
      const trigger = screen.getByRole('button');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveStyle({
        cursor: 'not-allowed',
        opacity: '0.7'
      });
    });
  });
});