import React, { useEffect } from 'react';
import { 
  NotificationContainer, 
  NotificationWrapper, 
  NotificationContent,
  CloseButton,
  StatusIcon 
} from './Notification.styles';
import { useNotification } from '../../../hooks/useNotification';
import { NotificationType } from '../../../context/NotificationContext';

// Constants
const NOTIFICATION_TIMEOUT = 5000;

// Status icons mapping for different notification types
const StatusIcons = {
  [NotificationType.WARNING]: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
    </svg>
  ),
  [NotificationType.SUCCESS]: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm4.59-12.42L10 14.17l-2.59-2.58L6 13l4 4 8-8z"/>
    </svg>
  ),
  [NotificationType.INFO]: (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2zm0 4h2v6h-2z"/>
    </svg>
  )
};

/**
 * Notification component that displays status messages with animations and accessibility support
 * Integrates with NotificationContext for global notification management
 */
const Notification: React.FC = () => {
  const { notification, hideNotification } = useNotification();
  
  // Auto-hide notification after timeout
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (notification.visible) {
      timeoutId = setTimeout(() => {
        hideNotification();
      }, NOTIFICATION_TIMEOUT);
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [notification.visible, hideNotification]);

  // Don't render if no notification is visible
  if (!notification.visible) {
    return null;
  }

  // Handle keyboard interaction for closing notification
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      hideNotification();
    }
  };

  // Handle touch interaction for mobile devices
  const handleTouchEnd = (event: React.TouchEvent) => {
    event.preventDefault();
    hideNotification();
  };

  return (
    <NotificationContainer
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <NotificationWrapper
        status={notification.type}
        onKeyDown={handleKeyDown}
        onTouchEnd={handleTouchEnd}
        aria-label={`${notification.type} notification`}
      >
        <NotificationContent>
          <StatusIcon aria-hidden="true">
            {StatusIcons[notification.type]}
          </StatusIcon>
          {notification.message}
        </NotificationContent>
        <CloseButton
          onClick={hideNotification}
          aria-label="Close notification"
          type="button"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </CloseButton>
      </NotificationWrapper>
    </NotificationContainer>
  );
};

// Enable component name in React DevTools
Notification.displayName = 'Notification';

export default Notification;