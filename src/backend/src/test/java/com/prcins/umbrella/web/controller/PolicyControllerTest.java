package com.prcins.umbrella.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.service.policy.PolicyService;
import com.prcins.umbrella.web.dto.PolicyDTO;
import com.prcins.umbrella.util.DateUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.result.MockMvcResultMatchers;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for PolicyController using Spring Boot Test and JUnit Jupiter with Virtual Thread support.
 * Tests policy management REST endpoints including creation, retrieval, updates, termination and PolicySTAR export.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PolicyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private PolicyService policyService;

    private ObjectMapper objectMapper;

    private static final String BASE_URL = "/api/v1/policies";
    private static final Long TEST_POLICY_ID = 1L;

    @BeforeEach
    void setUp() {
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        reset(policyService);
    }

    @Test
    @DisplayName("Should create new policy successfully")
    void testCreatePolicy() throws Exception {
        // Arrange
        PolicyDTO policyDTO = createTestPolicyDTO();
        Policy createdPolicy = createTestPolicy();
        
        when(policyService.createPolicy(any(PolicyDTO.class))).thenReturn(createdPolicy);

        // Act & Assert
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(policyDTO)))
                .andExpect(status().isCreated())
                .andExpect(header().string("Location", "/api/v1/policies/" + TEST_POLICY_ID))
                .andExpect(jsonPath("$.id").value(TEST_POLICY_ID))
                .andExpect(jsonPath("$.policyNumber").value(policyDTO.getPolicyNumber()))
                .andExpect(jsonPath("$.status").value(policyDTO.getStatus()));

        verify(policyService, times(1)).createPolicy(any(PolicyDTO.class));
    }

    @Test
    @DisplayName("Should retrieve policy by ID")
    void testGetPolicyById() throws Exception {
        // Arrange
        Policy policy = createTestPolicy();
        when(policyService.findPolicyById(TEST_POLICY_ID)).thenReturn(Optional.of(policy));

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/{id}", TEST_POLICY_ID))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.id").value(TEST_POLICY_ID))
                .andExpect(jsonPath("$.policyNumber").value(policy.getPolicyNumber()))
                .andExpect(jsonPath("$.status").value(policy.getStatus()));

        verify(policyService, times(1)).findPolicyById(TEST_POLICY_ID);
    }

    @Test
    @DisplayName("Should return 404 when policy not found")
    void testGetPolicyByIdNotFound() throws Exception {
        // Arrange
        when(policyService.findPolicyById(TEST_POLICY_ID)).thenReturn(Optional.empty());

        // Act & Assert
        mockMvc.perform(get(BASE_URL + "/{id}", TEST_POLICY_ID))
                .andExpect(status().isNotFound());

        verify(policyService, times(1)).findPolicyById(TEST_POLICY_ID);
    }

    @Test
    @DisplayName("Should update existing policy")
    void testUpdatePolicy() throws Exception {
        // Arrange
        PolicyDTO updateDTO = createTestPolicyDTO();
        Policy updatedPolicy = createTestPolicy();
        
        when(policyService.findPolicyById(TEST_POLICY_ID)).thenReturn(Optional.of(updatedPolicy));
        when(policyService.updatePolicy(eq(TEST_POLICY_ID), any(PolicyDTO.class))).thenReturn(updatedPolicy);

        // Act & Assert
        mockMvc.perform(put(BASE_URL + "/{id}", TEST_POLICY_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(TEST_POLICY_ID))
                .andExpect(jsonPath("$.version").value(updatedPolicy.getVersion()));

        verify(policyService, times(1)).updatePolicy(eq(TEST_POLICY_ID), any(PolicyDTO.class));
    }

    @Test
    @DisplayName("Should export policy to PolicySTAR asynchronously")
    void testExportPolicyToStar() throws Exception {
        // Arrange
        Policy policy = createTestPolicy();
        when(policyService.findPolicyById(TEST_POLICY_ID)).thenReturn(Optional.of(policy));
        when(policyService.exportPolicyToStarSystem(TEST_POLICY_ID))
                .thenReturn(CompletableFuture.completedFuture(true));

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{id}/export", TEST_POLICY_ID))
                .andExpect(status().isOk());

        verify(policyService, times(1)).exportPolicyToStarSystem(TEST_POLICY_ID);
    }

    @Test
    @DisplayName("Should terminate policy with valid termination date")
    void testTerminatePolicy() throws Exception {
        // Arrange
        Policy policy = createTestPolicy();
        policy.setStatus("ACTIVE");
        LocalDateTime terminationDate = DateUtils.getCurrentDateTime().plusDays(1);
        
        when(policyService.findPolicyById(TEST_POLICY_ID)).thenReturn(Optional.of(policy));
        when(policyService.terminatePolicy(eq(TEST_POLICY_ID), any(LocalDateTime.class)))
                .thenReturn(policy);

        // Act & Assert
        mockMvc.perform(post(BASE_URL + "/{id}/terminate", TEST_POLICY_ID)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(terminationDate)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TERMINATED"));

        verify(policyService, times(1)).terminatePolicy(eq(TEST_POLICY_ID), any(LocalDateTime.class));
    }

    @Test
    @DisplayName("Should validate policy creation request")
    void testCreatePolicyValidation() throws Exception {
        // Arrange
        PolicyDTO invalidDTO = new PolicyDTO(); // Missing required fields

        // Act & Assert
        mockMvc.perform(post(BASE_URL)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidDTO)))
                .andExpect(status().isBadRequest());

        verify(policyService, never()).createPolicy(any(PolicyDTO.class));
    }

    // Helper methods

    private PolicyDTO createTestPolicyDTO() {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(TEST_POLICY_ID);
        dto.setPolicyNumber("POL-2023-001");
        dto.setStatus("DRAFT");
        dto.setTotalPremium(new BigDecimal("1000.00"));
        dto.setEffectiveDate(DateUtils.getCurrentDateTime().plusDays(1));
        dto.setExpiryDate(DateUtils.getCurrentDateTime().plusDays(365));
        dto.setOwnerId(1L);
        return dto;
    }

    private Policy createTestPolicy() {
        Policy policy = new Policy();
        policy.setId(TEST_POLICY_ID);
        policy.setPolicyNumber("POL-2023-001");
        policy.setStatus("DRAFT");
        policy.setTotalPremium(new BigDecimal("1000.00"));
        policy.setEffectiveDate(DateUtils.getCurrentDateTime().plusDays(1));
        policy.setExpiryDate(DateUtils.getCurrentDateTime().plusDays(365));
        return policy;
    }
}