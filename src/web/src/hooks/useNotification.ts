import { useContext } from 'react';
import { 
  NotificationContext, 
  useNotificationContext,
  NotificationType,
  NotificationState
} from '../context/NotificationContext';

// Constants
const NOTIFICATION_TIMEOUT = 5000;

/**
 * Custom hook that provides type-safe notification management functionality with accessibility support.
 * Consumes NotificationContext to enable components to display and manage notifications.
 * 
 * @returns {Object} Notification management functions and state
 * @throws {Error} If used outside of NotificationProvider context
 */
export const useNotification = () => {
  // Access notification context with type safety
  const context = useNotificationContext();

  // Type guard to ensure context exists
  if (!context) {
    throw new Error(
      'useNotification must be used within a NotificationProvider component'
    );
  }

  const { 
    notification,
    showNotification: show,
    hideNotification: hide,
    updateNotification: update
  } = context;

  /**
   * Shows a new notification with proper ARIA support
   * @param message - The notification message to display
   * @param type - The type of notification (warning, success, info)
   */
  const showNotification = (message: string, type: NotificationType): void => {
    // Ensure message is not empty
    if (!message.trim()) {
      return;
    }

    show(message, type);
  };

  /**
   * Hides the current notification and manages focus
   */
  const hideNotification = (): void => {
    hide();
  };

  /**
   * Updates the current notification while maintaining accessibility
   * @param message - The updated notification message
   * @param type - The updated notification type
   */
  const updateNotification = (message: string, type: NotificationType): void => {
    // Ensure message is not empty
    if (!message.trim()) {
      return;
    }

    update(message, type);
  };

  /**
   * Get the current notification state with type information
   */
  const getCurrentNotification = (): NotificationState => {
    return notification;
  };

  return {
    // State
    notification: getCurrentNotification(),
    
    // Methods
    showNotification,
    hideNotification,
    updateNotification,

    // Type helpers
    NotificationType
  };
};

// Type exports for consumers
export type { NotificationState };
export { NotificationType };