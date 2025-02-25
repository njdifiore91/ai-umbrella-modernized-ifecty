package com.prcins.umbrella.util;

import com.prcins.umbrella.domain.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.authority.GrantedAuthority;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Optional;
import java.util.Collection;
import java.util.Objects;

/**
 * Thread-safe utility class providing security-related helper methods for authentication,
 * authorization and security context management using Spring Security with Jakarta EE compatibility
 * and Virtual Thread support.
 */
public final class SecurityUtils {

    private static final Logger logger = LoggerFactory.getLogger(SecurityUtils.class);

    private SecurityUtils() {
        // Private constructor to prevent instantiation
        throw new UnsupportedOperationException("Utility class cannot be instantiated");
    }

    /**
     * Retrieves the currently authenticated user from the security context with thread-safe implementation.
     * Optimized for Virtual Thread support through Spring Security's thread-local handling.
     *
     * @return Optional containing the current user if authenticated, empty otherwise
     */
    public static Optional<User> getCurrentUser() {
        try {
            SecurityContext context = SecurityContextHolder.getContext();
            if (context == null) {
                logger.debug("Security context is null");
                return Optional.empty();
            }

            Authentication authentication = context.getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.debug("No authenticated principal found in security context");
                return Optional.empty();
            }

            Object principal = authentication.getPrincipal();
            if (principal instanceof User) {
                logger.debug("Retrieved user {} from security context", ((User) principal).getUsername());
                return Optional.of((User) principal);
            } else if (principal instanceof UserDetails) {
                logger.debug("Converting UserDetails to User for {}", ((UserDetails) principal).getUsername());
                // Handle UserDetails to User conversion if needed
                return Optional.empty(); // Implement conversion logic if required
            }

            logger.debug("Principal is of unexpected type: {}", principal.getClass());
            return Optional.empty();

        } catch (Exception e) {
            logger.error("Error retrieving current user from security context", e);
            return Optional.empty();
        }
    }

    /**
     * Gets the username of the currently authenticated user with enhanced error handling.
     *
     * @return Optional containing the username if authenticated, empty otherwise
     */
    public static Optional<String> getCurrentUsername() {
        try {
            return getCurrentUser()
                .map(User::getUsername)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(username -> !username.isEmpty());
        } catch (Exception e) {
            logger.error("Error retrieving current username", e);
            return Optional.empty();
        }
    }

    /**
     * Thread-safe check if the current user has the specified role.
     *
     * @param role the role to check
     * @return true if user has the role, false otherwise
     * @throws IllegalArgumentException if role parameter is null or empty
     */
    public static boolean hasRole(String role) {
        if (role == null || role.trim().isEmpty()) {
            throw new IllegalArgumentException("Role parameter cannot be null or empty");
        }

        try {
            SecurityContext context = SecurityContextHolder.getContext();
            if (context == null) {
                logger.debug("Security context is null when checking role: {}", role);
                return false;
            }

            Authentication authentication = context.getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.debug("No authenticated principal found when checking role: {}", role);
                return false;
            }

            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            if (authorities == null) {
                logger.debug("No authorities found for authenticated principal");
                return false;
            }

            boolean hasRole = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> authority.equals("ROLE_" + role.toUpperCase()));

            logger.debug("Role check result for {}: {}", role, hasRole);
            return hasRole;

        } catch (Exception e) {
            logger.error("Error checking role: {}", role, e);
            return false;
        }
    }

    /**
     * Thread-safe check if the current user has any of the specified roles.
     *
     * @param roles array of roles to check
     * @return true if user has any of the roles, false otherwise
     * @throws IllegalArgumentException if roles array is null or empty
     */
    public static boolean hasAnyRole(String... roles) {
        if (roles == null || roles.length == 0) {
            throw new IllegalArgumentException("Roles array cannot be null or empty");
        }

        try {
            SecurityContext context = SecurityContextHolder.getContext();
            if (context == null) {
                logger.debug("Security context is null when checking roles");
                return false;
            }

            Authentication authentication = context.getAuthentication();
            if (authentication == null || !authentication.isAuthenticated()) {
                logger.debug("No authenticated principal found when checking roles");
                return false;
            }

            Collection<? extends GrantedAuthority> authorities = authentication.getAuthorities();
            if (authorities == null) {
                logger.debug("No authorities found for authenticated principal");
                return false;
            }

            boolean hasAnyRole = authorities.stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(authority -> {
                    for (String role : roles) {
                        if (authority.equals("ROLE_" + role.toUpperCase())) {
                            return true;
                        }
                    }
                    return false;
                });

            logger.debug("Role check result for multiple roles: {}", hasAnyRole);
            return hasAnyRole;

        } catch (Exception e) {
            logger.error("Error checking roles", e);
            return false;
        }
    }

    /**
     * Thread-safe check if there is an authenticated user.
     *
     * @return true if there is an authenticated user, false otherwise
     */
    public static boolean isAuthenticated() {
        try {
            SecurityContext context = SecurityContextHolder.getContext();
            if (context == null) {
                logger.debug("Security context is null when checking authentication");
                return false;
            }

            Authentication authentication = context.getAuthentication();
            boolean isAuthenticated = authentication != null && 
                                    authentication.isAuthenticated();

            logger.debug("Authentication check result: {}", isAuthenticated);
            return isAuthenticated;

        } catch (Exception e) {
            logger.error("Error checking authentication status", e);
            return false;
        }
    }
}