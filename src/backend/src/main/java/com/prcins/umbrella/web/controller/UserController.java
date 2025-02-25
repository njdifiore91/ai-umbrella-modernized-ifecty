package com.prcins.umbrella.web.controller;

import com.prcins.umbrella.service.user.UserService;
import com.prcins.umbrella.web.dto.UserDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.Set;

/**
 * REST controller for user management operations with enhanced security and Virtual Thread support.
 * Leverages Spring Boot 3.2.x features and Jakarta EE standards for modern enterprise applications.
 */
@RestController
@RequestMapping("/api/v1/users")
@Tag(name = "User Management", description = "APIs for user operations with enhanced security")
public class UserController {

    private final UserService userService;

    /**
     * Constructs UserController with required dependencies
     * @param userService The user service implementation
     */
    public UserController(UserService userService) {
        this.userService = userService;
    }

    /**
     * Creates a new user with enhanced validation and security checks.
     * Executes in Virtual Thread for improved performance.
     */
    @PostMapping
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    @Operation(summary = "Create new user", description = "Creates a new user with specified details")
    @ApiResponse(responseCode = "201", description = "User created successfully")
    public ResponseEntity<UserDTO> createUser(@Valid @RequestBody UserDTO userDTO) {
        UserDTO createdUser = userService.createUser(userDTO);
        URI location = ServletUriComponentsBuilder
            .fromCurrentRequest()
            .path("/{id}")
            .buildAndExpand(createdUser.getId())
            .toUri();
        return ResponseEntity.created(location).body(createdUser);
    }

    /**
     * Updates an existing user with optimistic locking support.
     * Leverages Virtual Thread for concurrent operations.
     */
    @PutMapping("/{userId}")
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ_WRITE')")
    @Operation(summary = "Update user", description = "Updates an existing user's information")
    @ApiResponse(responseCode = "200", description = "User updated successfully")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long userId,
            @Valid @RequestBody UserDTO userDTO) {
        UserDTO updatedUser = userService.updateUser(userId, userDTO);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Retrieves user information with Virtual Thread optimization.
     * Implements container-aware caching.
     */
    @GetMapping("/{userId}")
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ')")
    @Operation(summary = "Get user", description = "Retrieves user information by ID")
    @ApiResponse(responseCode = "200", description = "User retrieved successfully")
    public ResponseEntity<UserDTO> getUser(@PathVariable Long userId) {
        return userService.getUserById(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Retrieves paginated list of users with Virtual Thread support.
     * Optimized for container deployment with connection pool awareness.
     */
    @GetMapping
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ')")
    @Operation(summary = "List users", description = "Retrieves paginated list of users")
    @ApiResponse(responseCode = "200", description = "Users retrieved successfully")
    public ResponseEntity<Page<UserDTO>> getAllUsers(
            @Parameter(description = "Pagination information") Pageable pageable) {
        Page<UserDTO> users = userService.getUsers(pageable);
        return ResponseEntity.ok(users);
    }

    /**
     * Updates user roles with atomic operations.
     * Supports container-aware security context propagation.
     */
    @PutMapping("/{userId}/roles")
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    @Operation(summary = "Update user roles", description = "Updates the roles assigned to a user")
    @ApiResponse(responseCode = "200", description = "User roles updated successfully")
    public ResponseEntity<UserDTO> updateUserRoles(
            @PathVariable Long userId,
            @RequestBody Set<Long> roleIds) {
        UserDTO updatedUser = userService.updateUserRoles(userId, roleIds);
        return ResponseEntity.ok(updatedUser);
    }

    /**
     * Deactivates a user account with audit trail.
     * Executes in Virtual Thread for improved responsiveness.
     */
    @DeleteMapping("/{userId}")
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    @Operation(summary = "Deactivate user", description = "Deactivates a user account")
    @ApiResponse(responseCode = "204", description = "User deactivated successfully")
    public ResponseEntity<Void> deactivateUser(@PathVariable Long userId) {
        userService.deactivateUser(userId);
        return ResponseEntity.noContent().build();
    }

    /**
     * Changes user password with enhanced security validation.
     * Implements rate limiting and password history checks.
     */
    @PostMapping("/{userId}/password")
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ_WRITE') or #userId == authentication.principal.id")
    @Operation(summary = "Change password", description = "Changes user password with security validation")
    @ApiResponse(responseCode = "204", description = "Password changed successfully")
    public ResponseEntity<Void> changePassword(
            @PathVariable Long userId,
            @RequestParam String currentPassword,
            @RequestParam String newPassword) {
        userService.changePassword(userId, currentPassword, newPassword);
        return ResponseEntity.noContent().build();
    }
}