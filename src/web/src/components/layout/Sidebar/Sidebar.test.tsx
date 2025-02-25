import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { renderWithAuth, mockApiCall } from '../../../utils/test.utils';
import { ROUTES } from '../../../constants/routes.constants';
import { ResourceType, AccessLevel } from '../../../types/user.types';

describe('Sidebar Component', () => {
  // Mock functions and setup
  const mockOnClose = jest.fn();
  const mockAnalytics = jest.fn();
  const mockNavigate = jest.fn();

  // Base test props
  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
  };

  // Mock permissions for testing
  const mockPermissions = [
    { resourceType: ResourceType.POLICY_DATA, accessLevel: AccessLevel.READ },
    { resourceType: ResourceType.CLAIMS_DATA, accessLevel: AccessLevel.READ },
    { resourceType: ResourceType.USER_MANAGEMENT, accessLevel: AccessLevel.READ }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock window.innerWidth for responsive tests
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024
    });
  });

  test('renders navigation items based on permissions', () => {
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    // Verify navigation items are rendered with correct accessibility attributes
    const nav = screen.getByRole('navigation', { name: /main navigation/i });
    expect(nav).toBeInTheDocument();

    const menu = screen.getByRole('menu', { name: /navigation menu/i });
    expect(menu).toBeInTheDocument();

    // Check each navigation item
    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems).toHaveLength(4); // Dashboard, Policy, Claims, Tools

    // Verify accessibility attributes
    menuItems.forEach(item => {
      expect(item).toHaveAttribute('aria-label');
      expect(item).toHaveAttribute('tabIndex', '0');
    });
  });

  test('handles navigation correctly', async () => {
    const user = userEvent.setup();
    
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    // Click Policy Management item
    const policyItem = screen.getByRole('menuitem', { name: /navigate to policy management/i });
    await user.click(policyItem);

    // Verify analytics tracking
    expect(mockAnalytics).toHaveBeenCalledWith('navigation_click', {
      from: '/',
      to: ROUTES.POLICY_ROUTES.BASE,
      item: 'policies'
    });

    // Verify active state
    expect(policyItem).toHaveAttribute('aria-current', 'page');
  });

  test('handles keyboard navigation', async () => {
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    const nav = screen.getByRole('navigation');
    nav.focus();

    // Test arrow key navigation
    fireEvent.keyDown(nav, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: /navigate to dashboard/i })).toHaveFocus();

    fireEvent.keyDown(nav, { key: 'ArrowDown' });
    expect(screen.getByRole('menuitem', { name: /navigate to policy management/i })).toHaveFocus();

    // Test Enter key selection
    fireEvent.keyDown(document.activeElement!, { key: 'Enter' });
    expect(mockAnalytics).toHaveBeenCalled();
  });

  test('handles mobile view interactions', () => {
    // Mock mobile viewport
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 480
    });

    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    // Click navigation item in mobile view
    const policyItem = screen.getByRole('menuitem', { name: /navigate to policy management/i });
    fireEvent.click(policyItem);

    // Verify sidebar closes on mobile
    expect(mockOnClose).toHaveBeenCalled();
  });

  test('handles permission-based visibility', () => {
    // Render with limited permissions
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      {
        permissions: [
          { resourceType: ResourceType.POLICY_DATA, accessLevel: AccessLevel.READ }
        ]
      }
    );

    // Verify only authorized items are shown
    expect(screen.getByText(/policy management/i)).toBeInTheDocument();
    expect(screen.queryByText(/claims processing/i)).not.toBeInTheDocument();
  });

  test('supports screen reader announcements', async () => {
    const user = userEvent.setup();
    
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    const policyItem = screen.getByRole('menuitem', { name: /navigate to policy management/i });
    await user.click(policyItem);

    // Verify screen reader announcement
    await waitFor(() => {
      const announcement = screen.getByRole('status');
      expect(announcement).toHaveTextContent(/navigated to policies/i);
    });
  });

  test('handles error states gracefully', async () => {
    const user = userEvent.setup();
    
    // Mock navigation error
    mockNavigate.mockImplementationOnce(() => {
      throw new Error('Navigation failed');
    });

    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    const policyItem = screen.getByRole('menuitem', { name: /navigate to policy management/i });
    await user.click(policyItem);

    // Verify error announcement
    await waitFor(() => {
      const errorAnnouncement = screen.getByRole('alert');
      expect(errorAnnouncement).toHaveTextContent(/navigation failed/i);
    });
  });

  test('maintains focus management', async () => {
    const user = userEvent.setup();
    
    renderWithAuth(
      <MemoryRouter>
        <Sidebar {...defaultProps} />
      </MemoryRouter>,
      { permissions: mockPermissions }
    );

    // Test focus trap in mobile view
    Object.defineProperty(window, 'innerWidth', {
      value: 480
    });

    const nav = screen.getByRole('navigation');
    await user.tab();

    // Verify focus is trapped within sidebar
    expect(nav).toContainElement(document.activeElement!);
  });
});