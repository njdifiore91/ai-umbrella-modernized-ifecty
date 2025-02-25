package com.prcins.umbrella.domain.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.FetchType;
import jakarta.persistence.CascadeType;

import java.util.Collections;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

import com.prcins.umbrella.domain.user.Permission.AccessLevel;
import com.prcins.umbrella.domain.user.Permission.ResourceType;

/**
 * Entity class representing a role in the system for role-based access control.
 * Maps to the 'roles' table in the database and manages role-permission associations.
 * Uses Jakarta Persistence (version 3.1.0) for modern Java enterprise applications.
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 50, unique = true)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Version
    @Column(name = "version")
    private Long version;

    @ManyToMany(fetch = FetchType.LAZY, cascade = {CascadeType.PERSIST, CascadeType.MERGE})
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;

    /**
     * Default constructor required by JPA.
     * Initializes an empty role with a new permissions set.
     */
    public Role() {
        this.permissions = new HashSet<>();
    }

    /**
     * Gets the role's unique identifier
     * @return The role's unique identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the role's unique identifier
     * @param id The unique identifier to set
     */
    public void setId(Long id) {
        this.id = Objects.requireNonNull(id, "Role ID cannot be null");
    }

    /**
     * Gets the role name
     * @return The role name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the role name
     * @param name The name to set
     * @throws IllegalArgumentException if name is null or empty
     */
    public void setName(String name) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Role name cannot be null or empty");
        }
        this.name = name.trim();
    }

    /**
     * Gets the role description
     * @return The role description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the role description
     * @param description The description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the version number for optimistic locking
     * @return The version number
     */
    public Long getVersion() {
        return version;
    }

    /**
     * Sets the version number for optimistic locking
     * @param version The version number to set
     */
    public void setVersion(Long version) {
        this.version = version;
    }

    /**
     * Gets the set of permissions assigned to this role
     * @return An unmodifiable view of the permissions set
     */
    public Set<Permission> getPermissions() {
        return Collections.unmodifiableSet(permissions);
    }

    /**
     * Sets the permissions for this role
     * @param permissions The set of permissions to assign
     * @throws IllegalArgumentException if permissions set is null
     */
    public void setPermissions(Set<Permission> permissions) {
        if (permissions == null) {
            throw new IllegalArgumentException("Permissions set cannot be null");
        }
        this.permissions = new HashSet<>(permissions);
    }

    /**
     * Adds a permission to this role
     * @param permission The permission to add
     * @throws IllegalArgumentException if permission is null or invalid
     */
    public void addPermission(Permission permission) {
        if (permission == null) {
            throw new IllegalArgumentException("Permission cannot be null");
        }
        if (permission.getResourceType() == null) {
            throw new IllegalArgumentException("Permission must have a valid resource type");
        }
        if (permission.getAccessLevel() == null) {
            throw new IllegalArgumentException("Permission must have a valid access level");
        }
        permissions.add(permission);
    }

    /**
     * Removes a permission from this role
     * @param permission The permission to remove
     * @throws IllegalArgumentException if permission is null
     */
    public void removePermission(Permission permission) {
        if (permission == null) {
            throw new IllegalArgumentException("Permission cannot be null");
        }
        permissions.remove(permission);
    }

    /**
     * Checks if this role has a specific permission
     * @param resourceType The resource type to check
     * @param accessLevel The minimum access level required
     * @return true if the role has the required permission, false otherwise
     */
    public boolean hasPermission(ResourceType resourceType, AccessLevel accessLevel) {
        return permissions.stream()
            .anyMatch(p -> p.getResourceType() == resourceType && 
                         p.getAccessLevel().ordinal() >= accessLevel.ordinal());
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Role)) return false;
        Role role = (Role) o;
        return Objects.equals(getId(), role.getId()) &&
               Objects.equals(getName(), role.getName());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getName());
    }

    @Override
    public String toString() {
        return "Role{" +
               "id=" + id +
               ", name='" + name + '\'' +
               ", description='" + description + '\'' +
               ", permissions=" + permissions.size() +
               '}';
    }
}