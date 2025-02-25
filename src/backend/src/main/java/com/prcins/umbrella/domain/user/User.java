package com.prcins.umbrella.domain.user;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.JoinTable;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;

import java.util.Set;
import java.util.HashSet;
import java.util.Collections;
import java.util.Objects;

/**
 * Entity class representing a user in the system.
 * Provides user authentication and authorization through role-based access control.
 * Maps to the 'users' table in the database.
 * Uses Jakarta Persistence (version 3.1.0) for modern Java enterprise applications.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    private Long id;

    @Version
    @Column(name = "version")
    private Long version;

    @Column(name = "username", nullable = false, unique = true, length = 50)
    private String username;

    @Column(name = "password", nullable = false, length = 100)
    private String password;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "first_name", length = 50)
    private String firstName;

    @Column(name = "last_name", length = 50)
    private String lastName;

    @Column(name = "enabled", nullable = false)
    private boolean enabled;

    @Column(name = "account_non_expired", nullable = false)
    private boolean accountNonExpired;

    @Column(name = "account_non_locked", nullable = false)
    private boolean accountNonLocked;

    @Column(name = "credentials_non_expired", nullable = false)
    private boolean credentialsNonExpired;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    /**
     * Default constructor required by JPA.
     * Initializes an empty user with default values and an empty roles set.
     */
    public User() {
        this.roles = new HashSet<>();
        this.enabled = true;
        this.accountNonExpired = true;
        this.accountNonLocked = true;
        this.credentialsNonExpired = true;
    }

    /**
     * Gets the user's unique identifier
     * @return The user's ID
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the user's unique identifier
     * @param id The ID to set
     * @throws IllegalArgumentException if id is null
     */
    public void setId(Long id) {
        this.id = Objects.requireNonNull(id, "User ID cannot be null");
    }

    /**
     * Gets the entity version for optimistic locking
     * @return The version number
     */
    public Long getVersion() {
        return version;
    }

    /**
     * Sets the entity version
     * @param version The version number to set
     */
    public void setVersion(Long version) {
        this.version = version;
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
     * Gets the hashed password
     * @return The hashed password
     */
    public String getPassword() {
        return password;
    }

    /**
     * Sets the hashed password
     * @param password The hashed password to set
     * @throws IllegalArgumentException if password is null or empty
     */
    public void setPassword(String password) {
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("Password cannot be null or empty");
        }
        this.password = password;
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
     * Checks if the account is enabled
     * @return true if enabled, false otherwise
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
     * Checks if the account is non-expired
     * @return true if non-expired, false if expired
     */
    public boolean isAccountNonExpired() {
        return accountNonExpired;
    }

    /**
     * Sets the account expiration status
     * @param accountNonExpired The expiration status to set
     */
    public void setAccountNonExpired(boolean accountNonExpired) {
        this.accountNonExpired = accountNonExpired;
    }

    /**
     * Checks if the account is non-locked
     * @return true if non-locked, false if locked
     */
    public boolean isAccountNonLocked() {
        return accountNonLocked;
    }

    /**
     * Sets the account lock status
     * @param accountNonLocked The lock status to set
     */
    public void setAccountNonLocked(boolean accountNonLocked) {
        this.accountNonLocked = accountNonLocked;
    }

    /**
     * Checks if the credentials are non-expired
     * @return true if non-expired, false if expired
     */
    public boolean isCredentialsNonExpired() {
        return credentialsNonExpired;
    }

    /**
     * Sets the credentials expiration status
     * @param credentialsNonExpired The expiration status to set
     */
    public void setCredentialsNonExpired(boolean credentialsNonExpired) {
        this.credentialsNonExpired = credentialsNonExpired;
    }

    /**
     * Gets the set of roles assigned to this user
     * @return An unmodifiable view of the roles set
     */
    public Set<Role> getRoles() {
        return Collections.unmodifiableSet(roles);
    }

    /**
     * Sets the roles for this user
     * @param roles The set of roles to assign
     * @throws IllegalArgumentException if roles set is null
     */
    public void setRoles(Set<Role> roles) {
        if (roles == null) {
            throw new IllegalArgumentException("Roles set cannot be null");
        }
        this.roles = new HashSet<>(roles);
    }

    /**
     * Adds a role to this user
     * @param role The role to add
     * @throws IllegalArgumentException if role is null
     */
    public void addRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        roles.add(role);
    }

    /**
     * Removes a role from this user
     * @param role The role to remove
     * @throws IllegalArgumentException if role is null
     */
    public void removeRole(Role role) {
        if (role == null) {
            throw new IllegalArgumentException("Role cannot be null");
        }
        roles.remove(role);
    }

    /**
     * Checks if the user has a specific role
     * @param roleName The name of the role to check
     * @return true if the user has the role, false otherwise
     */
    public boolean hasRole(String roleName) {
        return roles.stream()
            .anyMatch(role -> role.getName().equals(roleName));
    }

    /**
     * JPA lifecycle callback before persisting
     * Validates required fields and initializes default values
     */
    @PrePersist
    protected void prePersist() {
        if (username == null || username.trim().isEmpty()) {
            throw new IllegalStateException("Username is required");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalStateException("Password is required");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalStateException("Email is required");
        }
    }

    /**
     * JPA lifecycle callback before updating
     * Validates required fields
     */
    @PreUpdate
    protected void preUpdate() {
        prePersist();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        User user = (User) o;
        return Objects.equals(getId(), user.getId()) &&
               Objects.equals(getUsername(), user.getUsername()) &&
               Objects.equals(getEmail(), user.getEmail());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getUsername(), getEmail());
    }

    @Override
    public String toString() {
        return "User{" +
               "id=" + id +
               ", username='" + username + '\'' +
               ", email='" + email + '\'' +
               ", firstName='" + firstName + '\'' +
               ", lastName='" + lastName + '\'' +
               ", enabled=" + enabled +
               ", roles=" + roles.size() +
               '}';
    }
}