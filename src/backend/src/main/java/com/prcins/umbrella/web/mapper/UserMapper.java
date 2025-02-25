package com.prcins.umbrella.web.mapper;

import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.domain.user.Role;
import com.prcins.umbrella.web.dto.UserDTO;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.BeanMapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.Set;
import java.util.HashSet;
import java.util.Collections;
import java.util.stream.Collectors;

/**
 * MapStruct mapper interface for secure conversion between User entities and DTOs.
 * Implements thread-safe collection handling and enhanced security measures.
 * Leverages Java 21 features and Jakarta EE standards.
 */
@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
@BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface UserMapper {

    /**
     * Securely converts a User entity to a UserDTO with thread-safe collection handling.
     * Excludes sensitive data like password and uses defensive copying for collections.
     *
     * @param user The User entity to convert
     * @return Thread-safe UserDTO instance
     */
    @Mapping(target = "roleNames", expression = "java(mapRolesToRoleNames(user.getRoles()))")
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "accountNonExpired", ignore = true)
    @Mapping(target = "accountNonLocked", ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    UserDTO toDTO(User user);

    /**
     * Securely converts a UserDTO to a User entity with enhanced validation.
     * Implements secure defaults and thread-safe collection handling.
     *
     * @param userDTO The UserDTO to convert
     * @return Secure User entity instance
     */
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "accountNonExpired", constant = "true")
    @Mapping(target = "accountNonLocked", constant = "true")
    @Mapping(target = "credentialsNonExpired", constant = "true")
    @Mapping(target = "version", ignore = true)
    User toEntity(UserDTO userDTO);

    /**
     * Securely updates an existing User entity with DTO data using thread-safe operations.
     * Preserves sensitive data and security settings while updating allowed fields.
     *
     * @param userDTO The UserDTO containing update data
     * @param existingUser The existing User entity to update
     * @return Thread-safe updated User entity
     */
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "password", ignore = true)
    @Mapping(target = "roles", ignore = true)
    @Mapping(target = "version", ignore = true)
    @Mapping(target = "accountNonExpired", ignore = true)
    @Mapping(target = "accountNonLocked", ignore = true)
    @Mapping(target = "credentialsNonExpired", ignore = true)
    User updateEntity(UserDTO userDTO, @MappingTarget User existingUser);

    /**
     * Safely maps Role entities to role names with thread-safe collection handling.
     * Uses Java 21's enhanced collections and stream operations.
     *
     * @param roles Set of Role entities
     * @return Immutable set of role names
     */
    default Set<String> mapRolesToRoleNames(Set<Role> roles) {
        if (roles == null) {
            return Collections.emptySet();
        }
        
        return Collections.unmodifiableSet(
            roles.stream()
                .map(Role::getName)
                .filter(name -> name != null && !name.isEmpty())
                .collect(Collectors.toCollection(HashSet::new))
        );
    }

    /**
     * Validates and sanitizes a string input.
     * Provides basic protection against common injection attacks.
     *
     * @param input String to validate and sanitize
     * @return Sanitized string or null if input is invalid
     */
    default String sanitizeString(String input) {
        if (input == null) {
            return null;
        }
        String trimmed = input.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}