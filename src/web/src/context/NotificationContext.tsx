import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';

// Constants
const NOTIFICATION_TIMEOUT = 5000;

// Types
export enum NotificationType {
  WARNING = 'warning',
  SUCCESS = 'success',
  INFO = 'info'
}

interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

interface NotificationContextValue {
  notification: NotificationState;
  showNotification: (message: string, type: NotificationType) => void;
  hideNotification: () => void;
  updateNotification: (message: string, type: NotificationType) => void;
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

// Initial state
const initialNotificationState: NotificationState = {
  message: '',
  type: NotificationType.INFO,
  visible: false
};

// Create context with type safety
export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined);

// Memoized provider component
export const NotificationProvider: React.FC<NotificationProviderProps> = React.memo(({ children }) => {
  // State management
  const [notification, setNotification] = useState<NotificationState>(initialNotificationState);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show notification handler
  const showNotification = useCallback((message: string, type: NotificationType) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification({
      message,
      type,
      visible: true
    });

    timeoutRef.current = setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        visible: false
      }));
    }, NOTIFICATION_TIMEOUT);
  }, []);

  // Hide notification handler
  const hideNotification = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification(prev => ({
      ...prev,
      visible: false
    }));
  }, []);

  // Update notification handler
  const updateNotification = useCallback((message: string, type: NotificationType) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setNotification(prev => ({
      ...prev,
      message,
      type,
      visible: true
    }));

    timeoutRef.current = setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        visible: false
      }));
    }, NOTIFICATION_TIMEOUT);
  }, []);

  // Context value with type safety
  const value: NotificationContextValue = {
    notification,
    showNotification,
    hideNotification,
    updateNotification
  };

  // Return provider with accessibility attributes
  return (
    <NotificationContext.Provider value={value}>
      <div
        role="alert"
        aria-live="polite"
        aria-atomic="true"
        className={`notification-container ${notification.visible ? 'visible' : ''}`}
      >
        {children}
      </div>
    </NotificationContext.Provider>
  );
});

NotificationProvider.displayName = 'NotificationProvider';

// Custom hook for consuming notification context with type safety
export const useNotificationContext = (): NotificationContextValue => {
  const context = useContext(NotificationContext);
  
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }

  return context;
};

// Type exports for consumers
export type { NotificationState, NotificationContextValue, NotificationProviderProps };