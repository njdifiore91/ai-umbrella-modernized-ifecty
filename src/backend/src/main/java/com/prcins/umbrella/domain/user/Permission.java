package com.prcins.umbrella.domain.user;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

/**
 * Entity class representing a permission in the system.
 * Maps to the 'permissions' table in the database and provides granular access control definitions.
 * Uses Jakarta Persistence (version 3.1.0) for modern Java enterprise applications.
 */
@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue
    @Column(name = "id", nullable = false)
    private Long id;

    @Column(name = "name", nullable = false, length = 100)
    private String name;

    @Column(name = "description", length = 255)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "resource_type", nullable = false)
    private ResourceType resourceType;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_level", nullable = false)
    private AccessLevel accessLevel;

    @Version
    @Column(name = "version")
    private Long version;

    /**
     * Default constructor required by JPA
     */
    public Permission() {
        // Initialize empty permission object
    }

    /**
     * Gets the permission ID
     * @return The permission's unique identifier
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the permission ID
     * @param id The unique identifier to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Gets the permission name
     * @return The permission name
     */
    public String getName() {
        return name;
    }

    /**
     * Sets the permission name
     * @param name The name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Gets the permission description
     * @return The permission description
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the permission description
     * @param description The description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Gets the resource type this permission applies to
     * @return The resource type enum value
     */
    public ResourceType getResourceType() {
        return resourceType;
    }

    /**
     * Sets the resource type this permission applies to
     * @param resourceType The resource type to set
     */
    public void setResourceType(ResourceType resourceType) {
        this.resourceType = resourceType;
    }

    /**
     * Gets the access level of this permission
     * @return The access level enum value
     */
    public AccessLevel getAccessLevel() {
        return accessLevel;
    }

    /**
     * Sets the access level of this permission
     * @param accessLevel The access level to set
     */
    public void setAccessLevel(AccessLevel accessLevel) {
        this.accessLevel = accessLevel;
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
     * Enum defining the types of resources that can be protected by permissions
     */
    public enum ResourceType {
        POLICY_DATA,
        CLAIMS_DATA, 
        USER_MANAGEMENT,
        REPORTS
    }

    /**
     * Enum defining the possible access levels for permissions
     */
    public enum AccessLevel {
        NONE,
        READ,
        READ_WRITE,
        FULL
    }
}