package com.prcins.umbrella.service.user;

import com.prcins.umbrella.domain.user.Permission.AccessLevel;
import com.prcins.umbrella.domain.user.Permission.ResourceType;
import com.prcins.umbrella.domain.user.Role;
import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.repository.user.UserRepository;
import com.prcins.umbrella.web.dto.UserDTO;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ValidationException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for UserService implementation using JUnit Jupiter and Spring Boot Test.
 * Validates user management operations with modern security integration and Virtual Thread support.
 */
@SpringBootTest
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ActiveProfiles("test")
class UserServiceTest {

    @Autowired
    private UserService userService;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private BCryptPasswordEncoder passwordEncoder;

    private UserDTO testUserDTO;
    private User testUser;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        // Reset mocks
        reset(userRepository, passwordEncoder);

        // Initialize test data
        testUserDTO = new UserDTO();
        testUserDTO.setUsername("testuser");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setFirstName("Test");
        testUserDTO.setLastName("User");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setEmail("test@example.com");
        testUser.setPassword("hashedPassword");
        testUser.setEnabled(true);

        adminRole = new Role();
        adminRole.setId(1L);
        adminRole.setName("ADMIN");
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateUser_Success() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDTO result = userService.createUser(testUserDTO);

        // Assert
        assertNotNull(result);
        assertEquals(testUserDTO.getUsername(), result.getUsername());
        assertEquals(testUserDTO.getEmail(), result.getEmail());
        verify(userRepository).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateUser_DuplicateUsername() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(true);

        // Act & Assert
        assertThrows(EntityExistsException.class, () -> userService.createUser(testUserDTO));
    }

    @Test
    void testCreateUserWithVirtualThread() throws Exception {
        // Arrange
        try (ExecutorService executor = Executors.newVirtualThreadPerTaskExecutor()) {
            when(userRepository.existsByUsername(anyString())).thenReturn(false);
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            // Act
            Future<UserDTO> future = executor.submit(() -> userService.createUser(testUserDTO));
            UserDTO result = future.get();

            // Assert
            assertNotNull(result);
            assertEquals(testUserDTO.getUsername(), result.getUsername());
        }
    }

    @ParameterizedTest
    @ValueSource(strings = {"weak", "short", "noDigit"})
    void testPasswordPolicy_InvalidPasswords(String password) {
        // Arrange
        testUserDTO.setPassword(password);

        // Act & Assert
        assertThrows(ValidationException.class, () -> userService.createUser(testUserDTO));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateUserRoles() {
        // Arrange
        Set<Long> roleIds = new HashSet<>();
        roleIds.add(1L);
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // Act
        UserDTO result = userService.updateUserRoles(1L, roleIds);

        // Assert
        assertNotNull(result);
        verify(userRepository).save(any(User.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testGetUserById_Success() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));

        // Act
        Optional<UserDTO> result = userService.getUserById(1L);

        // Assert
        assertTrue(result.isPresent());
        assertEquals(testUser.getUsername(), result.get().getUsername());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateUser_Success() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        testUserDTO.setFirstName("Updated");
        testUserDTO.setLastName("Name");

        // Act
        UserDTO result = userService.updateUser(1L, testUserDTO);

        // Assert
        assertNotNull(result);
        assertEquals("Updated", result.getFirstName());
        assertEquals("Name", result.getLastName());
    }

    @Test
    void testValidateCredentials() {
        // Arrange
        when(userRepository.findByUsername(anyString())).thenReturn(Optional.of(testUser));
        when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);

        // Act
        boolean result = userService.validateCredentials("testuser", "password");

        // Assert
        assertTrue(result);
        verify(passwordEncoder).matches(anyString(), anyString());
    }

    @Test
    void testDeactivateUser() {
        // Arrange
        when(userRepository.findById(anyLong())).thenReturn(Optional.of(testUser));
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);

        // Act
        userService.deactivateUser(1L);

        // Assert
        verify(userRepository).save(userCaptor.capture());
        assertFalse(userCaptor.getValue().isEnabled());
    }

    @Test
    void testIsUsernameAvailable() {
        // Arrange
        when(userRepository.existsByUsername(anyString())).thenReturn(false);

        // Act
        boolean result = userService.isUsernameAvailable("newuser");

        // Assert
        assertTrue(result);
        verify(userRepository).existsByUsername("newuser");
    }

    @Test
    void testIsEmailAvailable() {
        // Arrange
        when(userRepository.existsByEmail(anyString())).thenReturn(false);

        // Act
        boolean result = userService.isEmailAvailable("new@example.com");

        // Assert
        assertTrue(result);
        verify(userRepository).existsByEmail("new@example.com");
    }
}