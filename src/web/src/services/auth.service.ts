/**
 * Authentication Service
 * Handles user authentication, session management, and token operations using Spring Security's
 * token-based authentication with Spring Boot 3.2.x integration. Provides enhanced monitoring
 * through Spring Boot Actuator and supports Virtual Thread processing.
 * @version 1.0.0
 */

import { ApiService } from './api.service';
import { User, AuthRequest, AuthResponse } from '../types/user.types';
import { AUTH_ENDPOINTS } from '../constants/api.constants';

/**
 * Authentication service class with Spring Boot 3.2.x integration and Actuator monitoring
 */
export class AuthService {
  private readonly TOKEN_KEY = 'authToken';
  private readonly USER_KEY = 'currentUser';
  private readonly ACTUATOR_METRICS_ENDPOINT = '/actuator/metrics/security.authentication';

  constructor(private readonly apiService: ApiService) {}

  /**
   * Authenticates user credentials using Spring Security and manages token/session
   * @param credentials - User authentication request
   * @returns Promise resolving to authentication response with token and user data
   */
  public async login(credentials: AuthRequest): Promise<AuthResponse> {
    try {
      const response = await this.apiService.post<AuthResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials,
        {
          headers: {
            'X-Virtual-Thread': 'true', // Enable Virtual Thread processing
            'X-Monitoring': 'true' // Enable enhanced monitoring
          }
        }
      );

      if (response.data) {
        // Store authentication data
        localStorage.setItem(this.TOKEN_KEY, response.data.token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(response.data.user));

        // Record authentication metrics via Actuator
        await this.recordAuthenticationMetrics('login.success', response.data.user.username);

        return response.data;
      }

      throw new Error('Authentication failed');
    } catch (error) {
      // Record failed authentication attempt
      await this.recordAuthenticationMetrics('login.failure', credentials.username);
      throw error;
    }
  }

  /**
   * Terminates user session and cleans up stored data with Spring Security
   * @returns Promise confirming logout completion
   */
  public async logout(): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (token) {
        // Notify Spring Security of session termination
        await this.apiService.post(
          AUTH_ENDPOINTS.LOGOUT,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'X-Virtual-Thread': 'true'
            }
          }
        );

        // Record logout metrics
        const currentUser = this.getCurrentUser();
        if (currentUser) {
          await this.recordAuthenticationMetrics('logout.success', currentUser.username);
        }
      }
    } finally {
      // Clean up stored data
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
    }
  }

  /**
   * Retrieves current authenticated user data with role information
   * @returns Current user data with Spring Security roles or null if not authenticated
   */
  public getCurrentUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    if (userData) {
      try {
        const user = JSON.parse(userData) as User;
        // Record user access metrics
        this.recordAuthenticationMetrics('user.access', user.username).catch(console.error);
        return user;
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Checks if user is currently authenticated with valid Spring Security token
   * @returns Authentication status
   */
  public async isAuthenticated(): Promise<boolean> {
    const token = this.getAuthToken();
    if (!token) {
      return false;
    }

    try {
      // Verify token with Spring Security
      const response = await this.apiService.post(
        AUTH_ENDPOINTS.VERIFY_TOKEN,
        { token },
        {
          headers: {
            'X-Virtual-Thread': 'true'
          }
        }
      );

      // Record authentication check metrics
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        await this.recordAuthenticationMetrics('token.verify.success', currentUser.username);
      }

      return response.status === 200;
    } catch (error) {
      // Record failed verification
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        await this.recordAuthenticationMetrics('token.verify.failure', currentUser.username);
      }
      return false;
    }
  }

  /**
   * Retrieves current Spring Security authentication token
   * @returns Current Spring Security token or null
   */
  public getAuthToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Records authentication-related metrics using Spring Boot Actuator
   * @param event - Authentication event type
   * @param username - Username associated with the event
   */
  private async recordAuthenticationMetrics(event: string, username: string): Promise<void> {
    try {
      await this.apiService.post(
        this.ACTUATOR_METRICS_ENDPOINT,
        {
          event,
          username,
          timestamp: new Date().toISOString()
        },
        {
          headers: {
            'X-Virtual-Thread': 'true'
          }
        }
      );
    } catch (error) {
      console.error('Error recording authentication metrics:', error);
    }
  }
}