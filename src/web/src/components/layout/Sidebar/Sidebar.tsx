import React, { useCallback, useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Analytics } from '@analytics/react';
import { SidebarContainer, SidebarNav, SidebarItem } from './Sidebar.styles';
import { ROUTES } from '../../../constants/routes.constants';
import { useAuth } from '../../../hooks/useAuth';
import { ResourceType, AccessLevel } from '../../../types/user.types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Main navigation sidebar component with enhanced accessibility and security features.
 * Implements keyboard navigation, role-based access control, and analytics tracking.
 */
export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkPermission } = useAuth();
  const [activeItem, setActiveItem] = useState<string>('');
  const sidebarRef = useRef<HTMLElement>(null);
  const analytics = Analytics();

  // Navigation items with permission requirements and accessibility attributes
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      route: ROUTES.DASHBOARD_ROUTE,
      permission: { type: ResourceType.POLICY_DATA, level: AccessLevel.READ },
      ariaLabel: 'Navigate to Dashboard',
      shortcutKey: 'Alt+D'
    },
    {
      id: 'policies',
      label: 'Policy Management',
      route: ROUTES.POLICY_ROUTES.BASE,
      permission: { type: ResourceType.POLICY_DATA, level: AccessLevel.READ },
      ariaLabel: 'Navigate to Policy Management',
      shortcutKey: 'Alt+P'
    },
    {
      id: 'claims',
      label: 'Claims Processing',
      route: ROUTES.CLAIMS_ROUTES.BASE,
      permission: { type: ResourceType.CLAIMS_DATA, level: AccessLevel.READ },
      ariaLabel: 'Navigate to Claims Processing',
      shortcutKey: 'Alt+C'
    },
    {
      id: 'tools',
      label: 'Tools',
      route: ROUTES.TOOLS_ROUTES.BASE,
      permission: { type: ResourceType.USER_MANAGEMENT, level: AccessLevel.READ },
      ariaLabel: 'Navigate to Tools',
      shortcutKey: 'Alt+T'
    }
  ];

  /**
   * Handles navigation with analytics tracking and accessibility announcements
   */
  const handleNavigation = useCallback(
    async (route: string, itemId: string) => {
      try {
        // Track navigation start
        analytics.track('navigation_click', {
          from: location.pathname,
          to: route,
          item: itemId
        });

        // Perform navigation
        navigate(route);
        setActiveItem(itemId);

        // Close sidebar on mobile devices
        if (window.innerWidth < 768) {
          onClose();
        }

        // Announce navigation for screen readers
        const announcement = document.createElement('div');
        announcement.setAttribute('role', 'status');
        announcement.setAttribute('aria-live', 'polite');
        announcement.textContent = `Navigated to ${itemId}`;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);

      } catch (error) {
        console.error('Navigation error:', error);
        // Announce error for screen readers
        const errorAnnouncement = document.createElement('div');
        errorAnnouncement.setAttribute('role', 'alert');
        errorAnnouncement.textContent = 'Navigation failed. Please try again.';
        document.body.appendChild(errorAnnouncement);
        setTimeout(() => document.body.removeChild(errorAnnouncement), 1000);
      }
    },
    [navigate, location.pathname, onClose, analytics]
  );

  /**
   * Handles keyboard navigation within the sidebar
   */
  const handleKeyboardNavigation = useCallback(
    (event: KeyboardEvent) => {
      const focusableItems = Array.from(
        sidebarRef.current?.querySelectorAll('[role="menuitem"]') || []
      );
      const currentIndex = focusableItems.findIndex(
        item => item === document.activeElement
      );

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          const nextIndex = (currentIndex + 1) % focusableItems.length;
          (focusableItems[nextIndex] as HTMLElement).focus();
          break;

        case 'ArrowUp':
          event.preventDefault();
          const prevIndex =
            (currentIndex - 1 + focusableItems.length) % focusableItems.length;
          (focusableItems[prevIndex] as HTMLElement).focus();
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          const currentItem = document.activeElement as HTMLElement;
          const route = currentItem.getAttribute('data-route');
          const itemId = currentItem.getAttribute('data-id');
          if (route && itemId) {
            handleNavigation(route, itemId);
          }
          break;
      }
    },
    [handleNavigation]
  );

  // Set up keyboard navigation and cleanup
  useEffect(() => {
    const sidebar = sidebarRef.current;
    if (sidebar) {
      sidebar.addEventListener('keydown', handleKeyboardNavigation);
      return () => {
        sidebar.removeEventListener('keydown', handleKeyboardNavigation);
      };
    }
  }, [handleKeyboardNavigation]);

  // Set active item based on current route
  useEffect(() => {
    const currentRoute = location.pathname;
    const activeNavItem = navigationItems.find(
      item => currentRoute.startsWith(item.route)
    );
    if (activeNavItem) {
      setActiveItem(activeNavItem.id);
    }
  }, [location.pathname]);

  return (
    <SidebarContainer
      ref={sidebarRef}
      isOpen={isOpen}
      role="navigation"
      aria-label="Main navigation"
      tabIndex={-1}
    >
      <SidebarNav role="menu" aria-label="Navigation menu">
        {navigationItems.map(item => {
          const hasPermission = checkPermission(
            item.permission.type,
            item.permission.level
          );

          if (!hasPermission) return null;

          return (
            <SidebarItem
              key={item.id}
              role="menuitem"
              tabIndex={0}
              isActive={activeItem === item.id}
              onClick={() => handleNavigation(item.route, item.id)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  handleNavigation(item.route, item.id);
                }
              }}
              data-route={item.route}
              data-id={item.id}
              aria-label={item.ariaLabel}
              aria-current={activeItem === item.id ? 'page' : undefined}
              title={`${item.label} (${item.shortcutKey})`}
            >
              {item.label}
            </SidebarItem>
          );
        })}
      </SidebarNav>
    </SidebarContainer>
  );
};