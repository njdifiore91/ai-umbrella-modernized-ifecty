package com.prcins.umbrella.repository.user;

import com.prcins.umbrella.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

/**
 * Repository interface for User entity operations providing data access and persistence capabilities.
 * Implements Spring Data JPA with Jakarta Persistence for modern Java enterprise applications.
 * Supports user authentication, role management, and security operations.
 * 
 * @version 3.2.1 (Spring Data JPA)
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Finds a user by their username using case-insensitive matching.
     * Used for authentication and user lookup operations.
     *
     * @param username the username to search for
     * @return Optional containing the user if found, empty otherwise
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    Optional<User> findByUsername(@Param("username") String username);

    /**
     * Finds a user by their email address using case-insensitive matching.
     * Used for user verification and password reset operations.
     *
     * @param email the email address to search for
     * @return Optional containing the user if found, empty otherwise
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    Optional<User> findByEmail(@Param("email") String email);

    /**
     * Finds a user by either username or email using case-insensitive matching.
     * Supports flexible user lookup for authentication flows.
     *
     * @param username the username to search for
     * @param email the email address to search for
     * @return Optional containing the user if found, empty otherwise
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.username) = LOWER(:username) OR LOWER(u.email) = LOWER(:email)")
    Optional<User> findByUsernameOrEmail(@Param("username") String username, @Param("email") String email);

    /**
     * Finds all enabled users with pagination support.
     * Used for user management and administrative operations.
     *
     * @param pageable pagination parameters
     * @return Page of enabled users
     */
    Page<User> findByEnabledTrue(Pageable pageable);

    /**
     * Checks if a user exists with the given username using case-insensitive matching.
     * Used for user registration validation.
     *
     * @param username the username to check
     * @return true if user exists, false otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.username) = LOWER(:username)")
    boolean existsByUsername(@Param("username") String username);

    /**
     * Checks if a user exists with the given email using case-insensitive matching.
     * Used for user registration validation.
     *
     * @param email the email to check
     * @return true if user exists, false otherwise
     */
    @Query("SELECT COUNT(u) > 0 FROM User u WHERE LOWER(u.email) = LOWER(:email)")
    boolean existsByEmail(@Param("email") String email);

    /**
     * Finds users by role name with pagination support.
     * Used for role-based user management operations.
     *
     * @param roleName the role name to search for
     * @param pageable pagination parameters
     * @return Page of users with the specified role
     */
    @Query("SELECT u FROM User u JOIN u.roles r WHERE LOWER(r.name) = LOWER(:roleName)")
    Page<User> findByRoleName(@Param("roleName") String roleName, Pageable pageable);

    /**
     * Finds users by account status with pagination support.
     * Used for account management and monitoring.
     *
     * @param enabled the enabled status to filter by
     * @param accountNonLocked the non-locked status to filter by
     * @param pageable pagination parameters
     * @return Page of users matching the specified account status
     */
    @Query("SELECT u FROM User u WHERE u.enabled = :enabled AND u.accountNonLocked = :accountNonLocked")
    Page<User> findByAccountStatus(
        @Param("enabled") boolean enabled,
        @Param("accountNonLocked") boolean accountNonLocked,
        Pageable pageable
    );
}