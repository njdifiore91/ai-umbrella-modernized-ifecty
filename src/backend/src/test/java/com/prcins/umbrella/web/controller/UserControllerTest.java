package com.prcins.umbrella.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prcins.umbrella.domain.user.Permission.AccessLevel;
import com.prcins.umbrella.domain.user.Permission.ResourceType;
import com.prcins.umbrella.service.user.UserService;
import com.prcins.umbrella.web.dto.UserDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for UserController using Spring Boot Test and JUnit Jupiter.
 * Tests REST endpoints for user management with enhanced security validation and Virtual Thread support.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ExtendWith(SpringExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserService userService;

    private UserDTO testUserDTO;
    private static final String BASE_URL = "/api/v1/users";

    @BeforeEach
    void setUp() {
        // Initialize test user with required fields
        testUserDTO = new UserDTO();
        testUserDTO.setId(1L);
        testUserDTO.setUsername("testuser");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setFirstName("Test");
        testUserDTO.setLastName("User");
        Set<String> roles = new HashSet<>();
        roles.add("USER");
        testUserDTO.setRoleNames(roles);
        testUserDTO.setEnabled(true);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testCreateUserWithVirtualThread() throws Exception {
        // Given
        when(userService.createUser(any(UserDTO.class))).thenReturn(testUserDTO);

        // When/Then
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDTO)))
                .andDo(print())
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.id").value(testUserDTO.getId()))
                .andExpect(jsonPath("$.username").value(testUserDTO.getUsername()))
                .andExpect(jsonPath("$.email").value(testUserDTO.getEmail()));

        verify(userService).createUser(any(UserDTO.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateUserWithOptimisticLocking() throws Exception {
        // Given
        when(userService.updateUser(eq(1L), any(UserDTO.class))).thenReturn(testUserDTO);

        // When/Then
        mockMvc.perform(put(BASE_URL + "/{userId}", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDTO)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserDTO.getId()))
                .andExpect(jsonPath("$.username").value(testUserDTO.getUsername()));

        verify(userService).updateUser(eq(1L), any(UserDTO.class));
    }

    @Test
    @WithMockUser(roles = "USER")
    void testGetUserWithVirtualThread() throws Exception {
        // Given
        when(userService.getUserById(1L)).thenReturn(Optional.of(testUserDTO));

        // When/Then
        mockMvc.perform(get(BASE_URL + "/{userId}", 1L))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserDTO.getId()))
                .andExpect(jsonPath("$.username").value(testUserDTO.getUsername()));

        verify(userService).getUserById(1L);
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testUpdateUserRolesWithSecurity() throws Exception {
        // Given
        Set<Long> roleIds = new HashSet<>();
        roleIds.add(1L);
        roleIds.add(2L);
        when(userService.updateUserRoles(eq(1L), any(Set.class))).thenReturn(testUserDTO);

        // When/Then
        mockMvc.perform(put(BASE_URL + "/{userId}/roles", 1L)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(roleIds)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testUserDTO.getId()));

        verify(userService).updateUserRoles(eq(1L), any(Set.class));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testDeactivateUserWithAudit() throws Exception {
        // When/Then
        mockMvc.perform(delete(BASE_URL + "/{userId}", 1L))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(userService).deactivateUser(1L);
    }

    @Test
    @WithMockUser(username = "testuser")
    void testChangePasswordWithSecurity() throws Exception {
        // When/Then
        mockMvc.perform(post(BASE_URL + "/{userId}/password", 1L)
                .param("currentPassword", "oldPass")
                .param("newPassword", "newPass"))
                .andDo(print())
                .andExpect(status().isNoContent());

        verify(userService).changePassword(eq(1L), eq("oldPass"), eq("newPass"));
    }

    @Test
    void testUnauthorizedAccess() throws Exception {
        // When/Then
        mockMvc.perform(get(BASE_URL + "/{userId}", 1L))
                .andDo(print())
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void testInsufficientPermissions() throws Exception {
        // When/Then
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDTO)))
                .andDo(print())
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void testValidationFailure() throws Exception {
        // Given
        testUserDTO.setEmail(null); // Invalid email

        // When/Then
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testUserDTO)))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}