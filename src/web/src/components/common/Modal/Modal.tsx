import React, { useEffect, useCallback, useRef } from 'react';
import ReactDOM from 'react-dom';
import { 
  ModalOverlay, 
  ModalContainer, 
  ModalHeader, 
  ModalContent, 
  ModalFooter,
  CloseButton 
} from './Modal.styles';
import Button from '../Button/Button';

// Modal Props Interface
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
  ariaLabel?: string;
  ariaDescribedby?: string;
}

/**
 * Modal component implementing the design system's modal patterns with accessibility and responsive design
 * @param props ModalProps - Configuration options for the modal component
 * @returns React.FC<ModalProps> - Rendered modal component
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
  ariaLabel,
  ariaDescribedby
}) => {
  // Refs for managing focus and modal content
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const contentId = useRef<string>(`modal-content-${Math.random().toString(36).substr(2, 9)}`);

  /**
   * Handles modal close events with proper cleanup and focus restoration
   * @param event MouseEvent or KeyboardEvent
   */
  const handleClose = useCallback((event?: React.MouseEvent | KeyboardEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Restore focus to previously focused element
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
    }

    onClose();
  }, [onClose]);

  /**
   * Handles clicks on modal overlay with proper event delegation
   * @param event MouseEvent
   */
  const handleOverlayClick = useCallback((event: React.MouseEvent) => {
    if (closeOnOverlayClick && event.target === event.currentTarget) {
      handleClose(event);
    }
  }, [closeOnOverlayClick, handleClose]);

  /**
   * Handles keyboard events for modal dismissal and focus management
   * @param event KeyboardEvent
   */
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Handle escape key press
    if (event.key === 'Escape' && closeOnEscape) {
      handleClose(event);
      return;
    }

    // Handle tab key for focus trap
    if (event.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements?.length) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: Move focus to last element if focus is on first element
        if (document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: Move focus to first element if focus is on last element
        if (document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    }
  }, [closeOnEscape, handleClose]);

  // Set up event listeners and manage focus when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      // Store currently focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Add event listeners
      document.addEventListener('keydown', handleKeyDown);
      
      // Set initial focus to modal
      modalRef.current?.focus();
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
    }

    return () => {
      if (isOpen) {
        // Remove event listeners
        document.removeEventListener('keydown', handleKeyDown);
        
        // Restore body scroll
        document.body.style.overflow = '';
      }
    };
  }, [isOpen, handleKeyDown]);

  // Don't render if modal is not open
  if (!isOpen) return null;

  // Render modal in portal
  return ReactDOM.createPortal(
    <ModalOverlay onClick={handleOverlayClick}>
      <ModalContainer
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel || title}
        aria-describedby={ariaDescribedby || contentId.current}
        className={className}
        tabIndex={-1}
      >
        <ModalHeader>
          <h2>{title}</h2>
          <CloseButton
            onClick={handleClose}
            aria-label="Close modal"
          >
            <span aria-hidden="true">&times;</span>
          </CloseButton>
        </ModalHeader>

        <ModalContent id={contentId.current}>
          {children}
        </ModalContent>

        {footer && (
          <ModalFooter>
            {footer}
          </ModalFooter>
        )}
      </ModalContainer>
    </ModalOverlay>,
    document.body
  );
};

export default Modal;