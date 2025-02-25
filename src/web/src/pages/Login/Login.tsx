/**
 * Enhanced Login component with Spring Security integration and Virtual Thread support
 * Implements secure authentication with comprehensive validation and accessibility features
 * @version 1.0.0
 */

import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useForm } from '../../hooks/useForm';
import { useNotification, NotificationType } from '../../hooks/useNotification';
import {
  LoginContainer,
  LoginForm,
  LoginTitle,
  LoginButton,
  FormGroup,
  FormLabel,
  FormInput,
  ErrorMessage,
  ForgotPasswordLink
} from './Login.styles';

// Validation rules for login form
const loginValidationRules = {
  username: {
    required: true,
    pattern: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
    custom: (value: string) => value.length >= 3 && value.length <= 50
  },
  password: {
    required: true,
    custom: (value: string) => value.length >= 8 && value.length <= 32
  }
};

// Initial form values
const initialValues = {
  username: '',
  password: '',
  rememberMe: false
};

/**
 * Enhanced Login component with Spring Security integration
 * Supports Virtual Thread processing and container-aware session management
 */
const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const { showNotification } = useNotification();

  // Initialize form with enhanced validation
  const {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    resetForm
  } = useForm(initialValues, loginValidationRules, handleLoginSubmit);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      const redirectPath = location.state?.from?.pathname || '/dashboard';
      navigate(redirectPath, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  /**
   * Handles form submission with Spring Security authentication
   * Leverages Virtual Thread processing for enhanced performance
   */
  async function handleLoginSubmit(formValues: typeof initialValues): Promise<void> {
    try {
      await login({
        username: formValues.username,
        password: formValues.password,
        rememberMe: formValues.rememberMe
      });

      showNotification('Login successful', NotificationType.SUCCESS);
    } catch (error) {
      showNotification(
        error.message || 'Authentication failed. Please try again.',
        NotificationType.WARNING
      );
      resetForm();
    }
  }

  return (
    <LoginContainer>
      <LoginForm 
        onSubmit={handleSubmit}
        aria-labelledby="login-title"
        noValidate
      >
        <LoginTitle id="login-title">Sign In</LoginTitle>

        <FormGroup>
          <FormLabel htmlFor="username">
            Username
            <span aria-hidden="true">*</span>
          </FormLabel>
          <FormInput
            id="username"
            name="username"
            type="email"
            value={values.username}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.username && errors.username ? 'true' : 'false'}
            aria-describedby={errors.username ? 'username-error' : undefined}
            disabled={isSubmitting}
            autoComplete="username"
            required
          />
          {touched.username && errors.username && (
            <ErrorMessage id="username-error" role="alert">
              {errors.username}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <FormLabel htmlFor="password">
            Password
            <span aria-hidden="true">*</span>
          </FormLabel>
          <FormInput
            id="password"
            name="password"
            type="password"
            value={values.password}
            onChange={handleChange}
            onBlur={handleBlur}
            aria-invalid={touched.password && errors.password ? 'true' : 'false'}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={isSubmitting}
            autoComplete="current-password"
            required
          />
          {touched.password && errors.password && (
            <ErrorMessage id="password-error" role="alert">
              {errors.password}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <label>
            <input
              type="checkbox"
              name="rememberMe"
              checked={values.rememberMe}
              onChange={handleChange}
              disabled={isSubmitting}
            />
            Remember me
          </label>
        </FormGroup>

        <LoginButton
          type="submit"
          disabled={isSubmitting || isLoading}
          aria-busy={isSubmitting || isLoading}
        >
          {isSubmitting || isLoading ? 'Signing in...' : 'Sign In'}
        </LoginButton>

        <ForgotPasswordLink
          href="/forgot-password"
          onClick={(e) => {
            e.preventDefault();
            navigate('/forgot-password');
          }}
        >
          Forgot password?
        </ForgotPasswordLink>
      </LoginForm>
    </LoginContainer>
  );
};

export default Login;