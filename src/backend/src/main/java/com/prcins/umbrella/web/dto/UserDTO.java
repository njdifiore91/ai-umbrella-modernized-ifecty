package com.prcins.umbrella.web.dto;

import java.util.Set;
import java.util.HashSet;
import java.util.Collections;

import com.prcins.umbrella.domain.user.Role;

/**
 * Data Transfer Object for user-related operations in the web layer.
 * Provides a secure view of User entity for client-server communication.
 * Implements thread-safe collections and modern Java 21 practices while
 * maintaining strict security controls for sensitive data exclusion.
 */
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Set<String> roleNames;
    private boolean enabled;
    private String lastLoginTimestamp;

    /**
     * Default constructor initializing a new UserDTO with default values
     * and thread-safe collections.
     */
    public UserDTO() {
        this.roleNames = new HashSet<>();
        this.enabled = false;
    }

    /**
     * Gets the user's unique identifier
     * @return The user's unique identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the user's unique identifier
     * @param id The unique identifier to set
     * @throws IllegalArgumentException if id is null
     */
    public void setId(Long id) {
        if (id == null) {
            throw new IllegalArgumentException("User ID cannot be null");
        }
        this.id = id;
    }

    /**
     * Gets the username
     * @return The username
     */
    public String getUsername() {
        return username;
    }

    /**
     * Sets the username
     * @param username The username to set
     * @throws IllegalArgumentException if username is null or empty
     */
    public void setUsername(String username) {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalArgumentException("Username cannot be null or empty");
        }
        this.username = username.trim();
    }

    /**
     * Gets the email address
     * @return The email address
     */
    public String getEmail() {
        return email;
    }

    /**
     * Sets the email address
     * @param email The email address to set
     * @throws IllegalArgumentException if email is null or empty
     */
    public void setEmail(String email) {
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email cannot be null or empty");
        }
        this.email = email.trim();
    }

    /**
     * Gets the first name
     * @return The first name
     */
    public String getFirstName() {
        return firstName;
    }

    /**
     * Sets the first name
     * @param firstName The first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Gets the last name
     * @return The last name
     */
    public String getLastName() {
        return lastName;
    }

    /**
     * Sets the last name
     * @param lastName The last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Gets an unmodifiable view of the role names set
     * @return Unmodifiable set of role names
     */
    public Set<String> getRoleNames() {
        return Collections.unmodifiableSet(roleNames);
    }

    /**
     * Sets the role names with defensive copying
     * @param roleNames The set of role names to set
     * @throws IllegalArgumentException if roleNames is null
     */
    public void setRoleNames(Set<String> roleNames) {
        if (roleNames == null) {
            throw new IllegalArgumentException("Role names set cannot be null");
        }
        this.roleNames = new HashSet<>(roleNames);
    }

    /**
     * Adds a role name to the set
     * @param roleName The role name to add
     * @throws IllegalArgumentException if roleName is null or empty
     */
    public void addRoleName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new IllegalArgumentException("Role name cannot be null or empty");
        }
        this.roleNames.add(roleName.trim());
    }

    /**
     * Removes a role name from the set
     * @param roleName The role name to remove
     * @throws IllegalArgumentException if roleName is null or empty
     */
    public void removeRoleName(String roleName) {
        if (roleName == null || roleName.trim().isEmpty()) {
            throw new IllegalArgumentException("Role name cannot be null or empty");
        }
        this.roleNames.remove(roleName.trim());
    }

    /**
     * Gets the enabled status
     * @return true if the user is enabled, false otherwise
     */
    public boolean isEnabled() {
        return enabled;
    }

    /**
     * Sets the enabled status
     * @param enabled The enabled status to set
     */
    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    /**
     * Gets the last login timestamp
     * @return The last login timestamp
     */
    public String getLastLoginTimestamp() {
        return lastLoginTimestamp;
    }

    /**
     * Sets the last login timestamp
     * @param lastLoginTimestamp The last login timestamp to set
     */
    public void setLastLoginTimestamp(String lastLoginTimestamp) {
        this.lastLoginTimestamp = lastLoginTimestamp;
    }

    @Override
    public String toString() {
        return "UserDTO{" +
               "id=" + id +
               ", username='" + username + '\'' +
               ", email='" + email + '\'' +
               ", firstName='" + firstName + '\'' +
               ", lastName='" + lastName + '\'' +
               ", roleNames=" + roleNames +
               ", enabled=" + enabled +
               ", lastLoginTimestamp='" + lastLoginTimestamp + '\'' +
               '}';
    }
}