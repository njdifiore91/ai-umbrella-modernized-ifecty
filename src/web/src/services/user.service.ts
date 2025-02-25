/**
 * User Management Service
 * Provides user management operations with Spring Boot 3.2.x security integration
 * and Virtual Thread support for enhanced performance.
 * @version 1.0.0
 */

import { ApiService } from './api.service';
import { 
  User, 
  Role, 
  Permission, 
  AccessLevel, 
  ResourceType,
  UserApiResponse,
  AuthResponse,
  AuthRequest 
} from '../types/user.types';
import { PaginationParams, ApiResponse, PaginatedResponse } from '../types/common.types';
import { USER_ENDPOINTS, AUTH_ENDPOINTS } from '../constants/api.constants';

/**
 * Interface for creating new users with Spring Security validation
 */
interface CreateUserDto {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  password: string;
  roles: number[];
}

/**
 * Interface for updating user details
 */
interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  roles?: number[];
  enabled?: boolean;
}

/**
 * Service class for user management with Spring Security integration
 * and Virtual Thread support for enhanced performance
 */
export class UserService {
  private readonly baseUrl: string = '/users';

  constructor(private readonly apiService: ApiService) {}

  /**
   * Retrieves paginated list of users with Spring Security filtering
   * @param params Pagination and filtering parameters
   * @returns Promise with paginated user list
   */
  public async getUsers(params: PaginationParams): Promise<ApiResponse<PaginatedResponse<User>>> {
    const queryParams = new URLSearchParams({
      page: params.page.toString(),
      size: params.size.toString(),
      sort: params.sort.map(s => `${s.field},${s.direction}`).join(',')
    });

    if (params.filter) {
      Object.entries(params.filter).forEach(([key, value]) => {
        queryParams.append(`filter[${key}]`, String(value));
      });
    }

    return this.apiService.get<PaginatedResponse<User>>(
      `${this.baseUrl}?${queryParams.toString()}`
    );
  }

  /**
   * Creates new user with Spring Security validation
   * @param userData User creation data
   * @returns Promise with created user details
   */
  public async createUser(userData: CreateUserDto): Promise<UserApiResponse> {
    return this.apiService.post<User>(this.baseUrl, userData);
  }

  /**
   * Updates existing user with role validation
   * @param userId User ID
   * @param userData Update data
   * @returns Promise with updated user details
   */
  public async updateUser(userId: number, userData: UpdateUserDto): Promise<UserApiResponse> {
    return this.apiService.put<User>(`${this.baseUrl}/${userId}`, userData);
  }

  /**
   * Deletes user with permission check
   * @param userId User ID
   * @returns Promise with deletion status
   */
  public async deleteUser(userId: number): Promise<ApiResponse<void>> {
    return this.apiService.delete(`${this.baseUrl}/${userId}`);
  }

  /**
   * Authenticates user with Spring Security
   * @param credentials Login credentials
   * @returns Promise with authentication response
   */
  public async login(credentials: AuthRequest): Promise<ApiResponse<AuthResponse>> {
    return this.apiService.post<AuthResponse>(AUTH_ENDPOINTS.LOGIN, credentials);
  }

  /**
   * Logs out current user and invalidates session
   * @returns Promise with logout status
   */
  public async logout(): Promise<ApiResponse<void>> {
    return this.apiService.post(AUTH_ENDPOINTS.LOGOUT);
  }

  /**
   * Retrieves current user profile
   * @returns Promise with user profile data
   */
  public async getCurrentUser(): Promise<UserApiResponse> {
    return this.apiService.get<User>(USER_ENDPOINTS.GET_PROFILE);
  }

  /**
   * Updates current user's password with security validation
   * @param currentPassword Current password
   * @param newPassword New password
   * @returns Promise with update status
   */
  public async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<ApiResponse<void>> {
    return this.apiService.post(USER_ENDPOINTS.CHANGE_PASSWORD, {
      currentPassword,
      newPassword
    });
  }

  /**
   * Checks if user has specific permission using Spring Security's @PreAuthorize
   * @param userId User ID
   * @param permission Permission to check
   * @param resourceType Resource type for permission
   * @returns Promise with permission check result
   */
  public async hasPermission(
    userId: number,
    permission: Permission,
    resourceType: ResourceType
  ): Promise<boolean> {
    try {
      const response = await this.apiService.get<{ hasPermission: boolean }>(
        `${this.baseUrl}/${userId}/permissions/check`,
        {
          params: {
            permission: permission.name,
            resourceType
          }
        }
      );
      return response.data.hasPermission;
    } catch (error) {
      console.error('Permission check failed:', error);
      return false;
    }
  }

  /**
   * Assigns roles to user with validation
   * @param userId User ID
   * @param roleIds Role IDs to assign
   * @returns Promise with updated user details
   */
  public async assignRoles(userId: number, roleIds: number[]): Promise<UserApiResponse> {
    return this.apiService.post<User>(`${this.baseUrl}/${userId}/roles`, { roleIds });
  }

  /**
   * Retrieves user's effective permissions across all roles
   * @param userId User ID
   * @returns Promise with list of effective permissions
   */
  public async getEffectivePermissions(userId: number): Promise<ApiResponse<Permission[]>> {
    return this.apiService.get<Permission[]>(`${this.baseUrl}/${userId}/permissions`);
  }

  /**
   * Validates user's access level for specific resource
   * @param userId User ID
   * @param resourceType Resource type
   * @returns Promise with access level
   */
  public async getResourceAccessLevel(
    userId: number,
    resourceType: ResourceType
  ): Promise<ApiResponse<AccessLevel>> {
    return this.apiService.get<AccessLevel>(
      `${this.baseUrl}/${userId}/access-level/${resourceType}`
    );
  }
}