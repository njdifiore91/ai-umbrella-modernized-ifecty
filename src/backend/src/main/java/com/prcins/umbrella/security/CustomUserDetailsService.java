package com.prcins.umbrella.security;

import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.domain.user.Role;
import com.prcins.umbrella.repository.user.UserRepository;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Custom implementation of Spring Security's UserDetailsService that provides user authentication
 * and authorization capabilities using modern Jakarta EE standards. Leverages Virtual Threads
 * for enhanced performance and container-aware security context management.
 *
 * @version 3.2.1 (Spring Security)
 */
@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    /**
     * Constructs CustomUserDetailsService with required dependencies and initializes security context
     * strategy optimized for Virtual Threads.
     *
     * @param userRepository repository for user data access
     */
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
        // Configure thread-local security context strategy optimized for Virtual Threads
        SecurityContextHolder.setStrategyName(SecurityContextHolder.MODE_INHERITABLETHREADLOCAL);
    }

    /**
     * Loads user details by username for Spring Security authentication with Virtual Thread support.
     * Implements the UserDetailsService contract while providing enhanced security context management.
     *
     * @param username the username to load
     * @return UserDetails implementation containing authentication and authorization information
     * @throws UsernameNotFoundException if user not found or account is disabled/locked
     */
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        if (username == null || username.trim().isEmpty()) {
            throw new UsernameNotFoundException("Username cannot be empty");
        }

        // Find user with optimized role loading
        Optional<User> userOptional = userRepository.findByUsername(username);
        User user = userOptional.orElseThrow(() -> 
            new UsernameNotFoundException("User not found with username: " + username));

        // Verify account status
        if (!user.isEnabled()) {
            throw new UsernameNotFoundException("User account is disabled: " + username);
        }

        if (!user.isAccountNonLocked()) {
            throw new UsernameNotFoundException("User account is locked: " + username);
        }

        return createUserDetails(user);
    }

    /**
     * Creates Spring Security UserDetails from domain User entity with enhanced security context.
     * Supports Virtual Thread-aware security context propagation.
     *
     * @param user the domain user entity
     * @return UserDetails with complete security context
     */
    private UserDetails createUserDetails(User user) {
        // Convert domain roles to Spring Security authorities with permission mapping
        Set<SimpleGrantedAuthority> authorities = new HashSet<>();
        
        // Add role-based authorities
        for (Role role : user.getRoles()) {
            authorities.add(new SimpleGrantedAuthority("ROLE_" + role.getName().toUpperCase()));
            
            // Add permission-based authorities
            role.getPermissions().forEach(permission -> 
                authorities.add(new SimpleGrantedAuthority(
                    permission.getResourceType() + "_" + permission.getAccessLevel()
                ))
            );
        }

        // Create immutable authority collection
        Collection<SimpleGrantedAuthority> immutableAuthorities = 
            authorities.stream().collect(Collectors.toUnmodifiableSet());

        // Build UserDetails with complete security information
        return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            user.isEnabled(),
            user.isAccountNonExpired(),
            user.isCredentialsNonExpired(),
            user.isAccountNonLocked(),
            immutableAuthorities
        );
    }
}