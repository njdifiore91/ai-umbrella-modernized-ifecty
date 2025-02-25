package com.prcins.umbrella.service.user;

import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.domain.user.Role;
import com.prcins.umbrella.web.dto.UserDTO;
import com.prcins.umbrella.repository.UserRepository;
import com.prcins.umbrella.exception.UserNotFoundException;
import com.prcins.umbrella.exception.DuplicateUserException;
import com.prcins.umbrella.mapper.UserMapper;

import org.springframework.stereotype.Service;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.boot.actuate.health.Health;
import org.springframework.boot.actuate.health.HealthIndicator;

import jakarta.validation.Valid;
import jakarta.validation.ValidationException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.persistence.OptimisticLockException;

import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.CompletableFuture;
import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Implementation of UserService interface providing user management operations.
 * Leverages Spring Boot 3.2.x, Jakarta EE integration, and Java 21's Virtual Threads
 * for enhanced performance and modern enterprise capabilities.
 */
@Service
@Transactional(transactionManager = "userTransactionManager")
public class UserServiceImpl implements UserService, HealthIndicator {

    private static final Logger logger = LoggerFactory.getLogger(UserServiceImpl.class);
    
    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final ExecutorService virtualThreadExecutor;

    /**
     * Constructs UserServiceImpl with required dependencies and Virtual Thread executor.
     */
    public UserServiceImpl(UserRepository userRepository, 
                         BCryptPasswordEncoder passwordEncoder,
                         UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.userMapper = userMapper;
        this.virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();
    }

    @Override
    @Transactional
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'FULL')")
    public UserDTO createUser(@Valid UserDTO userDTO) {
        logger.debug("Creating new user with username: {}", userDTO.getUsername());

        // Parallel validation using Virtual Threads
        CompletableFuture<Boolean> usernameCheck = CompletableFuture.supplyAsync(
            () -> isUsernameAvailable(userDTO.getUsername()),
            virtualThreadExecutor
        );

        CompletableFuture<Boolean> emailCheck = CompletableFuture.supplyAsync(
            () -> isEmailAvailable(userDTO.getEmail()),
            virtualThreadExecutor
        );

        // Wait for validation results
        if (!usernameCheck.join()) {
            throw new DuplicateUserException("Username already exists: " + userDTO.getUsername());
        }
        if (!emailCheck.join()) {
            throw new DuplicateUserException("Email already exists: " + userDTO.getEmail());
        }

        User user = userMapper.toEntity(userDTO);
        user.setPassword(passwordEncoder.encode(userDTO.getPassword()));
        user.setEnabled(true);
        user.setAccountNonExpired(true);
        user.setAccountNonLocked(true);
        user.setCredentialsNonExpired(true);

        try {
            User savedUser = userRepository.save(user);
            logger.info("Successfully created user with ID: {}", savedUser.getId());
            return userMapper.toDTO(savedUser);
        } catch (Exception e) {
            logger.error("Error creating user: {}", e.getMessage());
            throw new RuntimeException("Failed to create user", e);
        }
    }

    @Override
    @Transactional
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ_WRITE')")
    public UserDTO updateUser(Long userId, @Valid UserDTO userDTO) {
        logger.debug("Updating user with ID: {}", userId);

        return CompletableFuture.supplyAsync(() -> {
            User existingUser = userRepository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));

            // Verify optimistic locking
            if (!existingUser.getVersion().equals(userDTO.getVersion())) {
                throw new OptimisticLockException("User was updated by another transaction");
            }

            // Update user fields
            existingUser.setFirstName(userDTO.getFirstName());
            existingUser.setLastName(userDTO.getLastName());
            existingUser.setEmail(userDTO.getEmail());
            
            if (userDTO.getRoleNames() != null) {
                Set<Role> updatedRoles = userMapper.mapRoleNames(userDTO.getRoleNames());
                existingUser.setRoles(updatedRoles);
            }

            User updatedUser = userRepository.save(existingUser);
            logger.info("Successfully updated user with ID: {}", updatedUser.getId());
            return userMapper.toDTO(updatedUser);
        }, virtualThreadExecutor).join();
    }

    @Override
    @PreAuthorize("hasPermission('USER_MANAGEMENT', 'READ')")
    public Optional<UserDTO> getUserById(Long userId) {
        logger.debug("Retrieving user with ID: {}", userId);
        
        return CompletableFuture.supplyAsync(() -> 
            userRepository.findById(userId)
                .map(userMapper::toDTO),
            virtualThreadExecutor
        ).join();
    }

    @Override
    public boolean isUsernameAvailable(String username) {
        return !userRepository.existsByUsername(username);
    }

    @Override
    public boolean isEmailAvailable(String email) {
        return !userRepository.existsByEmail(email);
    }

    @Override
    public void recordLoginAttempt(Long userId, LocalDateTime loginTimestamp, boolean successful) {
        CompletableFuture.runAsync(() -> {
            try {
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new UserNotFoundException("User not found with ID: " + userId));
                
                if (!successful && user.isAccountNonLocked()) {
                    // Implement failed login attempt logic
                    logger.warn("Failed login attempt for user ID: {}", userId);
                }
                
                // Update last login timestamp
                userRepository.updateLastLoginTimestamp(userId, loginTimestamp);
                logger.info("Recorded {} login attempt for user ID: {}", 
                    successful ? "successful" : "failed", userId);
            } catch (Exception e) {
                logger.error("Error recording login attempt: {}", e.getMessage());
            }
        }, virtualThreadExecutor);
    }

    @Override
    public Health health() {
        try {
            long userCount = userRepository.count();
            return Health.up()
                .withDetail("userCount", userCount)
                .withDetail("virtualThreadExecutor", "active")
                .build();
        } catch (Exception e) {
            return Health.down()
                .withException(e)
                .build();
        }
    }

    /**
     * Cleanup method to shutdown the Virtual Thread executor
     */
    public void destroy() {
        if (virtualThreadExecutor != null) {
            virtualThreadExecutor.shutdown();
        }
    }
}