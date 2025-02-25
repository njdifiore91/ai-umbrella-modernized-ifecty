import React from 'react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, within, fireEvent } from '../../utils/test.utils';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/extend-expect';
import 'jest-styled-components';
import { ThemeProvider } from 'styled-components';
import { lightTheme } from '../../../styles/theme';
import Modal from './Modal';

// Mock IntersectionObserver
const mockIntersectionObserver = jest.fn();
mockIntersectionObserver.mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
}));
window.IntersectionObserver = mockIntersectionObserver;

// Mock ResizeObserver
const mockResizeObserver = jest.fn();
mockResizeObserver.mockImplementation(() => ({
  observe: () => null,
  unobserve: () => null,
  disconnect: () => null
}));
window.ResizeObserver = mockResizeObserver;

// Helper function to render Modal with theme
const renderModal = (props = {}) => {
  const defaultProps = {
    isOpen: true,
    onClose: jest.fn(),
    title: 'Test Modal',
    children: <div>Modal Content</div>,
    closeOnOverlayClick: true,
    closeOnEscape: true,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <Modal {...defaultProps} {...props} />
    </ThemeProvider>
  );
};

describe('Modal Component', () => {
  // Basic Rendering Tests
  describe('Rendering', () => {
    it('renders modal when isOpen is true', () => {
      renderModal();
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('does not render modal when isOpen is false', () => {
      renderModal({ isOpen: false });
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('renders with correct structure and styling', () => {
      renderModal();
      const modal = screen.getByRole('dialog');
      
      expect(modal).toHaveStyle({
        backgroundColor: lightTheme.colors.background.paper,
        borderRadius: lightTheme.spacing.scale.sm
      });
      
      expect(within(modal).getByRole('heading')).toHaveTextContent('Test Modal');
      expect(within(modal).getByText('Modal Content')).toBeInTheDocument();
    });
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('implements correct ARIA attributes', () => {
      const { container } = renderModal({
        ariaLabel: 'Test Dialog',
        ariaDescribedby: 'modal-desc'
      });
      
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
      expect(dialog).toHaveAttribute('aria-label', 'Test Dialog');
      expect(dialog).toHaveAttribute('aria-describedby');
    });

    it('manages focus correctly', async () => {
      const user = userEvent.setup();
      renderModal();
      
      const dialog = screen.getByRole('dialog');
      const closeButton = within(dialog).getByRole('button', { name: /close modal/i });
      
      // Initial focus should be on modal
      expect(dialog).toHaveFocus();
      
      // Tab should cycle through focusable elements
      await user.tab();
      expect(closeButton).toHaveFocus();
      
      // Shift+Tab should cycle backwards
      await user.keyboard('{Shift>}{Tab}{/Shift}');
      expect(closeButton).toHaveFocus();
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();
      renderModal();
      
      // Tab through all focusable elements
      await user.tab();
      await user.tab();
      await user.tab();
      
      // Focus should stay within modal
      const dialog = screen.getByRole('dialog');
      const focusedElement = document.activeElement;
      expect(dialog).toContain(focusedElement);
    });
  });

  // Interaction Tests
  describe('Interaction', () => {
    it('calls onClose when close button is clicked', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      
      renderModal({ onClose });
      const closeButton = screen.getByRole('button', { name: /close modal/i });
      
      await user.click(closeButton);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked if closeOnOverlayClick is true', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      
      renderModal({ onClose, closeOnOverlayClick: true });
      const overlay = screen.getByTestId('modal-overlay');
      
      await user.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when overlay is clicked if closeOnOverlayClick is false', async () => {
      const onClose = jest.fn();
      const user = userEvent.setup();
      
      renderModal({ onClose, closeOnOverlayClick: false });
      const overlay = screen.getByTestId('modal-overlay');
      
      await user.click(overlay);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('calls onClose when Escape key is pressed if closeOnEscape is true', () => {
      const onClose = jest.fn();
      renderModal({ onClose, closeOnEscape: true });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does not call onClose when Escape key is pressed if closeOnEscape is false', () => {
      const onClose = jest.fn();
      renderModal({ onClose, closeOnEscape: false });
      
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  // Animation Tests
  describe('Animation', () => {
    it('applies correct animation classes on mount', () => {
      renderModal();
      const overlay = screen.getByTestId('modal-overlay');
      
      expect(overlay).toHaveStyle({
        opacity: 1,
        transition: 'opacity 0.2s ease-in-out'
      });
    });

    it('handles animation cleanup on unmount', () => {
      const { unmount } = renderModal();
      unmount();
      
      // Verify cleanup
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('handles missing required props gracefully', () => {
      // @ts-expect-error - Testing missing required props
      expect(() => renderModal({ title: undefined })).toThrow();
    });

    it('handles invalid children gracefully', () => {
      expect(() => renderModal({ children: null })).not.toThrow();
    });
  });

  // Cleanup
  afterEach(() => {
    jest.clearAllMocks();
  });
});