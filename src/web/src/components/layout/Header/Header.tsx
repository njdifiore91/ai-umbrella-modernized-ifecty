import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  HeaderContainer, 
  LogoSection, 
  UserSection, 
  NavigationSection,
  NotificationBar,
  GlobalActionsSection 
} from './Header.styles';
import { useAuthContext } from '../../../context/AuthContext';
import { useNotificationContext } from '../../../context/NotificationContext';
import Button from '../../common/Button/Button';
import Logo from '../../../assets/images/logo.svg';
import { ResourceType, AccessLevel } from '../../../types/user.types';

/**
 * Main header component implementing the application's header layout
 * with enhanced accessibility and notification support
 */
const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout, checkPermission } = useAuthContext();
  const { notification, hideNotification } = useNotificationContext();

  /**
   * Handles user logout with error handling
   */
  const handleLogout = useCallback(async () => {
    try {
      await logout();
      navigate('/login');
      hideNotification();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, navigate, hideNotification]);

  /**
   * Handles navigation to settings page with permission check
   */
  const handleSettings = useCallback(() => {
    if (checkPermission(ResourceType.USER_MANAGEMENT, AccessLevel.READ)) {
      navigate('/settings');
    }
  }, [navigate, checkPermission]);

  return (
    <HeaderContainer role="banner" aria-label="Application header">
      <LogoSection>
        <img 
          src={Logo} 
          alt="AI Umbrella Insurance Logo" 
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        />
      </LogoSection>

      <NavigationSection role="navigation" aria-label="Main navigation">
        {/* Add navigation links based on user permissions */}
        {checkPermission(ResourceType.POLICY_DATA, AccessLevel.READ) && (
          <a href="/policies" aria-current={location.pathname === '/policies'}>
            Policies
          </a>
        )}
        {checkPermission(ResourceType.CLAIMS_DATA, AccessLevel.READ) && (
          <a href="/claims" aria-current={location.pathname === '/claims'}>
            Claims
          </a>
        )}
      </NavigationSection>

      <GlobalActionsSection>
        {user && (
          <>
            <Button
              variant="text"
              size="small"
              onClick={handleSettings}
              aria-label="Open settings"
              startIcon={
                <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/>
                </svg>
              }
            >
              Settings
            </Button>

            <Button
              variant="text"
              size="small"
              onClick={handleLogout}
              aria-label="Log out"
              startIcon={
                <svg aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z"/>
                </svg>
              }
            >
              Logout
            </Button>
          </>
        )}
      </GlobalActionsSection>

      <UserSection>
        {user && (
          <div role="status" aria-label="User information">
            <span>{`${user.firstName} ${user.lastName}`}</span>
            <span aria-label="User role">{user.roles[0]?.name}</span>
          </div>
        )}
      </UserSection>

      {notification.visible && (
        <NotificationBar 
          role="alert" 
          aria-live="polite"
          className={notification.type}
        >
          {notification.message}
        </NotificationBar>
      )}
    </HeaderContainer>
  );
};

export default Header;