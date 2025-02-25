package com.prcins.umbrella.security;

import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.domain.user.Role;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Counter;
import org.springframework.lang.Nullable;

import java.util.Optional;

/**
 * Thread-safe utility class providing security-related helper methods.
 * Leverages Spring Security 6.1.2 with Jakarta EE standards and Virtual Thread support.
 */
@Component
public class SecurityUtils {

    private static final Logger logger = LoggerFactory.getLogger(SecurityUtils.class);
    private final MeterRegistry meterRegistry;
    private final Counter usernameAccessCounter;
    private final Counter userDetailsAccessCounter;
    private final Counter authenticationCheckCounter;
    private final Counter roleCheckCounter;

    public SecurityUtils(MeterRegistry meterRegistry) {
        this.meterRegistry = meterRegistry;
        this.usernameAccessCounter = Counter.builder("security.username.access")
            .description("Number of username access attempts")
            .register(meterRegistry);
        this.userDetailsAccessCounter = Counter.builder("security.userdetails.access")
            .description("Number of user details access attempts")
            .register(meterRegistry);
        this.authenticationCheckCounter = Counter.builder("security.authentication.check")
            .description("Number of authentication checks")
            .register(meterRegistry);
        this.roleCheckCounter = Counter.builder("security.role.check")
            .description("Number of role checks")
            .register(meterRegistry);
    }

    /**
     * Gets the username of the currently authenticated user from the security context.
     * Thread-safe implementation supporting Virtual Threads.
     *
     * @return the username of the authenticated user or null if not authenticated
     */
    @Nullable
    public String getCurrentUsername() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            usernameAccessCounter.increment();

            if (authentication != null && authentication.isAuthenticated()) {
                String username = authentication.getName();
                logger.debug("Retrieved username from security context: {}", username);
                return username;
            }

            logger.debug("No authenticated user found in security context");
            return null;
        } catch (Exception e) {
            logger.error("Error retrieving current username", e);
            return null;
        }
    }

    /**
     * Gets the current authenticated user details from the security context.
     * Thread-safe implementation with Virtual Thread support.
     *
     * @return the UserDetails of the authenticated user or null if not authenticated
     */
    @Nullable
    public UserDetails getCurrentUser() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            userDetailsAccessCounter.increment();

            if (authentication != null && authentication.isAuthenticated()) {
                Object principal = authentication.getPrincipal();
                if (principal instanceof UserDetails) {
                    logger.debug("Retrieved user details from security context for user: {}", 
                        ((UserDetails) principal).getUsername());
                    return (UserDetails) principal;
                }
            }

            logger.debug("No authenticated user details found in security context");
            return null;
        } catch (Exception e) {
            logger.error("Error retrieving current user details", e);
            return null;
        }
    }

    /**
     * Thread-safe check for current user authentication status.
     * Supports Virtual Thread execution.
     *
     * @return true if user is authenticated, false otherwise
     */
    public boolean isAuthenticated() {
        try {
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            authenticationCheckCounter.increment();

            boolean isAuthenticated = authentication != null && authentication.isAuthenticated();
            logger.debug("Authentication check result: {}", isAuthenticated);
            return isAuthenticated;
        } catch (Exception e) {
            logger.error("Error checking authentication status", e);
            return false;
        }
    }

    /**
     * Thread-safe verification of user role membership.
     * Supports Virtual Thread execution.
     *
     * @param roleName the role name to check
     * @return true if user has the role, false otherwise
     */
    public boolean hasRole(String roleName) {
        try {
            if (roleName == null || roleName.trim().isEmpty()) {
                logger.warn("Role check attempted with null or empty role name");
                return false;
            }

            roleCheckCounter.increment();
            UserDetails userDetails = getCurrentUser();

            if (userDetails instanceof User) {
                User user = (User) userDetails;
                boolean hasRole = user.getRoles().stream()
                    .map(Role::getName)
                    .anyMatch(role -> role.equals(roleName));

                logger.debug("Role check for '{}' result: {}", roleName, hasRole);
                return hasRole;
            }

            logger.debug("Role check failed - user details not of expected type");
            return false;
        } catch (Exception e) {
            logger.error("Error checking role membership for role: {}", roleName, e);
            return false;
        }
    }
}