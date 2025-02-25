package com.prcins.umbrella.service.user;

import com.prcins.umbrella.web.dto.UserDTO;
import java.util.Optional;
import java.util.Set;
import java.time.LocalDateTime;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;

/**
 * Service interface for user management operations with enhanced security features,
 * Virtual Thread support, and container-aware capabilities.
 * Leverages Spring Boot 3.2.x and Jakarta EE standards for modern enterprise applications.
 */
public interface UserService {

    /**
     * Creates a new user with enhanced security validation.
     * Executes in a Virtual Thread for improved performance under high load.
     *
     * @param userDTO The user data transfer object containing user information
     * @return The created user DTO with security metadata
     * @throws jakarta.validation.ValidationException if validation fails
     * @throws jakarta.persistence.EntityExistsException if username/email already exists
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    UserDTO createUser(UserDTO userDTO);

    /**
     * Updates existing user information with optimistic locking.
     * Supports container-aware transaction management.
     *
     * @param userId The ID of the user to update
     * @param userDTO The updated user information
     * @return The updated user DTO with refreshed security context
     * @throws jakarta.persistence.EntityNotFoundException if user not found
     * @throws jakarta.persistence.OptimisticLockException if concurrent modification detected
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ_WRITE')")
    UserDTO updateUser(Long userId, UserDTO userDTO);

    /**
     * Retrieves a user by their unique identifier.
     * Leverages Virtual Thread for non-blocking database operations.
     *
     * @param userId The ID of the user to retrieve
     * @return Optional containing the user if found
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ')")
    Optional<UserDTO> getUserById(Long userId);

    /**
     * Retrieves a paginated list of users with Virtual Thread support.
     * Optimized for container deployment with connection pool awareness.
     *
     * @param pageable Pagination information
     * @return Page of user DTOs
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ')")
    Page<UserDTO> getUsers(Pageable pageable);

    /**
     * Changes user password with enhanced security validation.
     * Implements rate limiting and password history checks.
     *
     * @param userId The ID of the user
     * @param currentPassword The current password
     * @param newPassword The new password
     * @throws jakarta.security.auth.AuthenticationException if current password is invalid
     * @throws jakarta.validation.ValidationException if password requirements not met
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ_WRITE') or #userId == authentication.principal.id")
    void changePassword(Long userId, String currentPassword, String newPassword);

    /**
     * Updates user roles with atomic operations.
     * Supports container-aware security context propagation.
     *
     * @param userId The ID of the user
     * @param roleIds Set of role IDs to assign
     * @return Updated user DTO with new role assignments
     * @throws jakarta.persistence.EntityNotFoundException if user or roles not found
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    UserDTO updateUserRoles(Long userId, Set<Long> roleIds);

    /**
     * Deactivates a user account.
     * Maintains audit trail for compliance requirements.
     *
     * @param userId The ID of the user to deactivate
     * @throws jakarta.persistence.EntityNotFoundException if user not found
     */
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    void deactivateUser(Long userId);

    /**
     * Records user login attempt with security metadata.
     * Supports distributed session management in containerized environments.
     *
     * @param userId The ID of the user
     * @param loginTimestamp The timestamp of the login attempt
     * @param successful Whether the login attempt was successful
     */
    void recordLoginAttempt(Long userId, LocalDateTime loginTimestamp, boolean successful);

    /**
     * Validates user credentials with rate limiting.
     * Optimized for Virtual Thread execution.
     *
     * @param username The username to validate
     * @param password The password to validate
     * @return true if credentials are valid
     */
    boolean validateCredentials(String username, String password);

    /**
     * Checks if a username is available.
     * Executes in Virtual Thread for improved responsiveness.
     *
     * @param username The username to check
     * @return true if username is available
     */
    boolean isUsernameAvailable(String username);

    /**
     * Checks if an email address is available.
     * Supports container-aware caching.
     *
     * @param email The email to check
     * @return true if email is available
     */
    boolean isEmailAvailable(String email);
}