import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { axe } from '@axe-core/react';
import { Header } from './Header';
import { renderWithAuth, mockApiCall, mockNotificationContext, mockPerformanceMonitor } from '../../../utils/test.utils';
import { ResourceType, AccessLevel } from '../../../types/user.types';
import { NotificationType } from '../../../context/NotificationContext';

describe('Header Component', () => {
  const mockNavigate = vi.fn();
  const mockUser = {
    id: 1,
    firstName: 'John',
    lastName: 'Smith',
    roles: [{ name: 'Admin', permissions: [] }]
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockPerformanceMonitor.start('header-render');
    vi.mock('react-router-dom', () => ({
      useNavigate: () => mockNavigate
    }));
  });

  afterEach(() => {
    mockPerformanceMonitor.stop('header-render');
  });

  describe('Layout and Accessibility', () => {
    it('renders header with logo and proper accessibility attributes', async () => {
      const { container } = renderWithAuth(<Header />);
      
      // Logo verification
      const logo = screen.getByAltText('AI Umbrella Insurance Logo');
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveStyle({ cursor: 'pointer' });

      // Accessibility structure
      expect(screen.getByRole('banner')).toHaveAttribute('aria-label', 'Application header');
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Main navigation');

      // Run accessibility audit
      const results = await axe(container);
      expect(results.violations).toHaveLength(0);
    });

    it('maintains responsive layout across breakpoints', async () => {
      const { rerender } = renderWithAuth(<Header />);

      // Test mobile layout
      window.innerWidth = 375;
      window.dispatchEvent(new Event('resize'));
      rerender(<Header />);
      
      const headerContainer = screen.getByRole('banner');
      expect(headerContainer).toHaveStyle({
        padding: '1.5rem'
      });

      // Test desktop layout
      window.innerWidth = 1024;
      window.dispatchEvent(new Event('resize'));
      rerender(<Header />);
      
      expect(headerContainer).toHaveStyle({
        padding: '1.5rem'
      });
    });
  });

  describe('User Information Display', () => {
    it('displays user information when authenticated', () => {
      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true
      });

      const userSection = screen.getByRole('status', { name: 'User information' });
      expect(userSection).toHaveTextContent('John Smith');
      expect(userSection).toHaveTextContent('Admin');
    });

    it('hides user information when not authenticated', () => {
      renderWithAuth(<Header />, {
        isAuthenticated: false
      });

      expect(screen.queryByRole('status', { name: 'User information' })).not.toBeInTheDocument();
    });
  });

  describe('Navigation and Permissions', () => {
    it('renders navigation links based on user permissions', () => {
      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true,
        permissions: [
          { resourceType: ResourceType.POLICY_DATA, accessLevel: AccessLevel.READ },
          { resourceType: ResourceType.CLAIMS_DATA, accessLevel: AccessLevel.READ }
        ]
      });

      expect(screen.getByText('Policies')).toBeInTheDocument();
      expect(screen.getByText('Claims')).toBeInTheDocument();
    });

    it('handles logo click navigation', async () => {
      renderWithAuth(<Header />, {
        isAuthenticated: true
      });

      const logo = screen.getByAltText('AI Umbrella Insurance Logo');
      await userEvent.click(logo);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('handles settings navigation with proper permissions', async () => {
      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true,
        permissions: [
          { resourceType: ResourceType.USER_MANAGEMENT, accessLevel: AccessLevel.READ }
        ]
      });

      const settingsButton = screen.getByRole('button', { name: /settings/i });
      await userEvent.click(settingsButton);

      expect(mockNavigate).toHaveBeenCalledWith('/settings');
    });
  });

  describe('Authentication Actions', () => {
    it('handles logout process', async () => {
      const mockLogout = vi.fn();
      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true,
        logout: mockLogout
      });

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      await userEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('handles logout errors gracefully', async () => {
      const mockLogout = vi.fn().mockRejectedValue(new Error('Logout failed'));
      const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true,
        logout: mockLogout
      });

      const logoutButton = screen.getByRole('button', { name: /log out/i });
      await userEvent.click(logoutButton);

      expect(mockConsoleError).toHaveBeenCalledWith('Logout failed:', expect.any(Error));
      mockConsoleError.mockRestore();
    });
  });

  describe('Notification System', () => {
    it('displays notifications with correct styling', () => {
      const { rerender } = renderWithAuth(
        <Header />,
        {
          user: mockUser,
          isAuthenticated: true
        }
      );

      const notification = {
        message: 'Test notification',
        type: NotificationType.SUCCESS,
        visible: true
      };

      mockNotificationContext.setNotification(notification);
      rerender(<Header />);

      const notificationElement = screen.getByRole('alert');
      expect(notificationElement).toHaveTextContent('Test notification');
      expect(notificationElement).toHaveClass('success');
    });

    it('auto-hides notifications after timeout', async () => {
      const { rerender } = renderWithAuth(
        <Header />,
        {
          user: mockUser,
          isAuthenticated: true
        }
      );

      const notification = {
        message: 'Test notification',
        type: NotificationType.INFO,
        visible: true
      };

      mockNotificationContext.setNotification(notification);
      rerender(<Header />);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      }, { timeout: 5500 }); // 5000ms timeout + buffer
    });
  });

  describe('Performance Monitoring', () => {
    it('monitors render performance', async () => {
      const startTime = performance.now();
      
      renderWithAuth(<Header />, {
        user: mockUser,
        isAuthenticated: true
      });

      const renderTime = performance.now() - startTime;
      expect(renderTime).toBeLessThan(100); // 100ms threshold

      const metrics = mockPerformanceMonitor.getMetrics('header-render');
      expect(metrics.duration).toBeDefined();
      expect(metrics.duration).toBeLessThan(100);
    });
  });
});