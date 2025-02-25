import { render, screen, waitFor, within, act } from '@testing-library/react';
import { Notification } from './Notification';
import { NotificationContext, NotificationType } from '../../../context/NotificationContext';
import { renderWithAuth } from '../../../utils/test.utils';

describe('Notification Component', () => {
  // Mock timers for testing auto-hide functionality
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  // Mock ResizeObserver for responsive testing
  const mockResizeObserver = jest.fn();
  mockResizeObserver.mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
  }));
  window.ResizeObserver = mockResizeObserver;

  it('should not render when no notification is active', () => {
    const mockContext = {
      notification: {
        message: '',
        type: NotificationType.INFO,
        visible: false
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('should render success notification with correct styling and accessibility', () => {
    const mockContext = {
      notification: {
        message: 'Operation successful',
        type: NotificationType.SUCCESS,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const notification = screen.getByRole('alert');
    expect(notification).toBeInTheDocument();
    expect(notification).toHaveAttribute('aria-live', 'polite');
    expect(notification).toHaveAttribute('aria-atomic', 'true');

    const wrapper = within(notification).getByLabelText('success notification');
    expect(wrapper).toHaveStyle({
      backgroundColor: expect.stringContaining(NotificationType.SUCCESS)
    });

    const message = screen.getByText('Operation successful');
    expect(message).toBeInTheDocument();

    const closeButton = screen.getByLabelText('Close notification');
    expect(closeButton).toBeInTheDocument();
    expect(closeButton).toHaveFocus();
  });

  it('should render warning notification with correct styling and accessibility', () => {
    const mockContext = {
      notification: {
        message: 'Warning message',
        type: NotificationType.WARNING,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const notification = screen.getByRole('alert');
    const wrapper = within(notification).getByLabelText('warning notification');
    expect(wrapper).toHaveStyle({
      backgroundColor: expect.stringContaining(NotificationType.WARNING)
    });

    const message = screen.getByText('Warning message');
    expect(message).toBeInTheDocument();
  });

  it('should render info notification with correct styling and accessibility', () => {
    const mockContext = {
      notification: {
        message: 'Info message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const notification = screen.getByRole('alert');
    const wrapper = within(notification).getByLabelText('info notification');
    expect(wrapper).toHaveStyle({
      backgroundColor: expect.stringContaining(NotificationType.INFO)
    });

    const message = screen.getByText('Info message');
    expect(message).toBeInTheDocument();
  });

  it('should auto-hide notification after timeout with proper cleanup', async () => {
    const hideNotification = jest.fn();
    const mockContext = {
      notification: {
        message: 'Test message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification,
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();

    // Fast-forward timeout
    act(() => {
      jest.advanceTimersByTime(5000);
    });

    await waitFor(() => {
      expect(hideNotification).toHaveBeenCalledTimes(1);
    });
  });

  it('should handle multiple notifications in queue', async () => {
    const mockContext = {
      notification: {
        message: 'First message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    const { rerender } = render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    expect(screen.getByText('First message')).toBeInTheDocument();

    // Update with second notification
    mockContext.notification = {
      message: 'Second message',
      type: NotificationType.SUCCESS,
      visible: true
    };

    rerender(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('should be responsive across different viewport sizes', () => {
    const mockContext = {
      notification: {
        message: 'Test message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification: jest.fn(),
      updateNotification: jest.fn()
    };

    // Mock window resize
    const originalInnerWidth = window.innerWidth;
    window.innerWidth = 400; // Mobile viewport

    const { rerender } = render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const notification = screen.getByRole('alert');
    expect(notification).toHaveStyle({
      maxWidth: '400px',
      width: expect.stringContaining('calc(100% -')
    });

    // Test larger viewport
    window.innerWidth = 1024;
    window.dispatchEvent(new Event('resize'));

    rerender(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    expect(notification).toHaveStyle({
      maxWidth: '400px'
    });

    // Restore original window width
    window.innerWidth = originalInnerWidth;
  });

  it('should handle keyboard interactions for accessibility', () => {
    const hideNotification = jest.fn();
    const mockContext = {
      notification: {
        message: 'Test message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification,
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const wrapper = screen.getByLabelText('info notification');
    wrapper.focus();
    fireEvent.keyDown(wrapper, { key: 'Escape' });

    expect(hideNotification).toHaveBeenCalledTimes(1);
  });

  it('should handle touch interactions for mobile devices', () => {
    const hideNotification = jest.fn();
    const mockContext = {
      notification: {
        message: 'Test message',
        type: NotificationType.INFO,
        visible: true
      },
      showNotification: jest.fn(),
      hideNotification,
      updateNotification: jest.fn()
    };

    render(
      <NotificationContext.Provider value={mockContext}>
        <Notification />
      </NotificationContext.Provider>
    );

    const wrapper = screen.getByLabelText('info notification');
    fireEvent.touchEnd(wrapper);

    expect(hideNotification).toHaveBeenCalledTimes(1);
  });
});