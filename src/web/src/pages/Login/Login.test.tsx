/**
 * Test suite for Login component
 * Verifies authentication functionality, form validation, error handling, and user feedback
 * Implements modern testing patterns with JUnit Jupiter and Spring Boot Test integration
 * @version 1.0.0
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi } from 'vitest';
import Login from './Login';
import { renderWithAuth, createMockApiResponse, createMockErrorResponse, mockApiCall } from '../../utils/test.utils';
import { NotificationType } from '../../hooks/useNotification';
import { ResourceType, AccessLevel } from '../../types/user.types';

// Mock hooks and navigation
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
  useLocation: () => ({ state: { from: { pathname: '/dashboard' } } })
}));

// Mock notification hook
const mockShowNotification = vi.fn();
vi.mock('../../hooks/useNotification', () => ({
  useNotification: () => ({
    showNotification: mockShowNotification,
    NotificationType
  })
}));

describe('Login Component', () => {
  const mockUser = {
    id: 1,
    username: 'test@example.com',
    firstName: 'Test',
    lastName: 'User',
    enabled: true,
    roles: [
      {
        id: 1,
        name: 'USER',
        permissions: [
          {
            resourceType: ResourceType.POLICY_DATA,
            accessLevel: AccessLevel.READ
          }
        ]
      }
    ]
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form with proper accessibility attributes', () => {
    renderWithAuth(<Login />);

    // Verify form elements and accessibility
    const form = screen.getByRole('form', { name: /sign in/i });
    expect(form).toHaveAttribute('novalidate');
    expect(form).toHaveAttribute('aria-labelledby', 'login-title');

    // Verify input fields with accessibility
    const usernameInput = screen.getByLabelText(/username/i);
    expect(usernameInput).toHaveAttribute('type', 'email');
    expect(usernameInput).toHaveAttribute('required');
    expect(usernameInput).toHaveAttribute('aria-invalid', 'false');

    const passwordInput = screen.getByLabelText(/password/i);
    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(passwordInput).toHaveAttribute('required');
    expect(passwordInput).toHaveAttribute('aria-invalid', 'false');

    // Verify submit button
    const submitButton = screen.getByRole('button', { name: /sign in/i });
    expect(submitButton).toBeEnabled();
  });

  it('handles successful login with proper validation and navigation', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    const { container } = renderWithAuth(<Login />, {
      isAuthenticated: false
    });

    const user = userEvent.setup();

    // Fill in form with valid credentials
    await user.type(screen.getByLabelText(/username/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify form submission and success handling
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        'Login successful',
        NotificationType.SUCCESS
      );
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true });
    });

    // Verify form state after submission
    expect(container.querySelector('form')).toHaveFormValues({
      username: 'test@example.com',
      password: 'Password123!'
    });
  });

  it('handles login failure with proper error display', async () => {
    const mockError = createMockErrorResponse(
      'AUTHENTICATION_FAILED',
      'Invalid credentials',
      { field: 'password' }
    );

    renderWithAuth(<Login />, {
      isAuthenticated: false
    });

    const user = userEvent.setup();

    // Submit form with invalid credentials
    await user.type(screen.getByLabelText(/username/i), 'invalid@example.com');
    await user.type(screen.getByLabelText(/password/i), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify error handling
    await waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(
        'Invalid credentials',
        NotificationType.WARNING
      );
    });

    // Verify error messages are accessible
    const errorMessage = screen.getByRole('alert');
    expect(errorMessage).toBeInTheDocument();
  });

  it('validates required fields with proper error messages', async () => {
    renderWithAuth(<Login />);

    const user = userEvent.setup();

    // Submit empty form
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify validation messages
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('aria-invalid', 'true');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
    });

    // Verify error messages are accessible
    const errors = screen.getAllByRole('alert');
    expect(errors).toHaveLength(2);
    expect(errors[0]).toHaveTextContent(/required/i);
  });

  it('maintains form state during validation and submission', async () => {
    renderWithAuth(<Login />);

    const user = userEvent.setup();

    // Fill form partially
    await user.type(screen.getByLabelText(/username/i), 'test@example.com');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify field states
    await waitFor(() => {
      expect(screen.getByLabelText(/username/i)).toHaveValue('test@example.com');
      expect(screen.getByLabelText(/username/i)).toHaveAttribute('aria-invalid', 'false');
      expect(screen.getByLabelText(/password/i)).toHaveAttribute('aria-invalid', 'true');
    });
  });

  it('handles remember me functionality correctly', async () => {
    renderWithAuth(<Login />);

    const user = userEvent.setup();

    // Toggle remember me checkbox
    const rememberMeCheckbox = screen.getByRole('checkbox', { name: /remember me/i });
    await user.click(rememberMeCheckbox);

    expect(rememberMeCheckbox).toBeChecked();

    // Submit form with remember me checked
    await user.type(screen.getByLabelText(/username/i), 'test@example.com');
    await user.type(screen.getByLabelText(/password/i), 'Password123!');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    // Verify remember me state is maintained
    await waitFor(() => {
      expect(rememberMeCheckbox).toBeChecked();
    });
  });

  it('navigates to forgot password page', async () => {
    const mockNavigate = vi.fn();
    vi.mocked(useNavigate).mockReturnValue(mockNavigate);

    renderWithAuth(<Login />);

    const user = userEvent.setup();

    // Click forgot password link
    await user.click(screen.getByText(/forgot password/i));

    expect(mockNavigate).toHaveBeenCalledWith('/forgot-password');
  });
});