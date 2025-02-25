package com.prcins.umbrella.service.policy;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.repository.policy.PolicyRepository;
import com.prcins.umbrella.integration.policystar.PolicyStarClient;
import com.prcins.umbrella.integration.policystar.PolicyStarClient.ExportStatus;
import com.prcins.umbrella.web.dto.PolicyDTO;
import com.prcins.umbrella.util.DateUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.ThreadFactory;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Comprehensive test suite for PolicyServiceImpl using JUnit Jupiter and Spring Boot Test.
 * Leverages Virtual Threads and Jakarta EE validation for enhanced testing capabilities.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class PolicyServiceTest {

    @Mock
    private PolicyRepository policyRepository;

    @Mock
    private PolicyStarClient policyStarClient;

    private PolicyService policyService;
    private Validator validator;
    private ThreadFactory virtualThreadFactory;

    @BeforeEach
    void setUp() {
        // Initialize Jakarta validation
        try (ValidatorFactory factory = Validation.buildDefaultValidatorFactory()) {
            validator = factory.getValidator();
        }

        // Configure Virtual Thread factory
        virtualThreadFactory = Thread.ofVirtual().factory();

        // Initialize service with mocks
        policyService = new PolicyServiceImpl(policyRepository, policyStarClient);
    }

    @Test
    @DisplayName("Should create policy successfully with Virtual Thread support")
    void testCreatePolicyWithVirtualThread() {
        // Arrange
        PolicyDTO policyDTO = createValidPolicyDTO();
        Policy expectedPolicy = createValidPolicy();

        when(policyRepository.save(any(Policy.class))).thenReturn(expectedPolicy);

        // Act
        Thread.startVirtualThread(() -> {
            Policy createdPolicy = policyService.createPolicy(policyDTO);

            // Assert
            assertNotNull(createdPolicy);
            assertEquals(expectedPolicy.getPolicyNumber(), createdPolicy.getPolicyNumber());
            assertEquals("DRAFT", createdPolicy.getStatus());
            assertTrue(DateUtils.validatePolicyDates(
                createdPolicy.getEffectiveDate(), 
                createdPolicy.getExpiryDate()
            ));
        }).join();

        verify(policyRepository).save(any(Policy.class));
    }

    @Test
    @DisplayName("Should throw exception when creating policy with invalid dates")
    void testCreatePolicyWithInvalidDates() {
        // Arrange
        PolicyDTO policyDTO = createValidPolicyDTO();
        policyDTO.setEffectiveDate(LocalDateTime.now().plusYears(2));
        policyDTO.setExpiryDate(LocalDateTime.now().plusYears(1));

        // Act & Assert
        assertThrows(IllegalArgumentException.class, () -> {
            policyService.createPolicy(policyDTO);
        });

        verify(policyRepository, never()).save(any(Policy.class));
    }

    @Test
    @DisplayName("Should find policy by ID successfully")
    void testFindPolicyById() {
        // Arrange
        Long policyId = 1L;
        Policy expectedPolicy = createValidPolicy();
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(expectedPolicy));

        // Act
        Optional<Policy> foundPolicy = policyService.findPolicyById(policyId);

        // Assert
        assertTrue(foundPolicy.isPresent());
        assertEquals(expectedPolicy.getPolicyNumber(), foundPolicy.get().getPolicyNumber());
        verify(policyRepository).findById(policyId);
    }

    @Test
    @DisplayName("Should update policy successfully")
    void testUpdatePolicy() {
        // Arrange
        Long policyId = 1L;
        PolicyDTO updateDTO = createValidPolicyDTO();
        Policy existingPolicy = createValidPolicy();
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(existingPolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(existingPolicy);

        // Act
        Policy updatedPolicy = policyService.updatePolicy(policyId, updateDTO);

        // Assert
        assertNotNull(updatedPolicy);
        assertEquals(updateDTO.getPolicyNumber(), updatedPolicy.getPolicyNumber());
        verify(policyRepository).save(any(Policy.class));
    }

    @Test
    @DisplayName("Should throw exception when updating terminated policy")
    void testUpdateTerminatedPolicy() {
        // Arrange
        Long policyId = 1L;
        PolicyDTO updateDTO = createValidPolicyDTO();
        Policy terminatedPolicy = createValidPolicy();
        terminatedPolicy.setStatus("TERMINATED");
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(terminatedPolicy));

        // Act & Assert
        assertThrows(IllegalStateException.class, () -> {
            policyService.updatePolicy(policyId, updateDTO);
        });
    }

    @Test
    @DisplayName("Should export policy to PolicySTAR successfully using Virtual Threads")
    void testAsyncPolicyExport() throws ExecutionException, InterruptedException {
        // Arrange
        Long policyId = 1L;
        Policy policy = createValidPolicy();
        policy.setStatus("ACTIVE");
        String exportRef = "EXP123";

        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));
        when(policyStarClient.exportPolicy(policy))
            .thenReturn(CompletableFuture.completedFuture(exportRef));
        when(policyStarClient.checkExportStatus(exportRef))
            .thenReturn(CompletableFuture.completedFuture(ExportStatus.COMPLETED));

        // Act
        CompletableFuture<Boolean> exportResult = policyService.exportPolicyToStarSystem(policyId);

        // Assert
        assertTrue(exportResult.get());
        verify(policyStarClient).exportPolicy(policy);
        verify(policyStarClient).checkExportStatus(exportRef);
    }

    @ParameterizedTest
    @DisplayName("Should validate policy status before export")
    @ValueSource(strings = {"DRAFT", "TERMINATED", "PENDING"})
    void testExportPolicyWithInvalidStatus(String status) {
        // Arrange
        Long policyId = 1L;
        Policy policy = createValidPolicy();
        policy.setStatus(status);
        when(policyRepository.findById(policyId)).thenReturn(Optional.of(policy));

        // Act & Assert
        CompletableFuture<Boolean> exportResult = policyService.exportPolicyToStarSystem(policyId);
        assertThrows(IllegalStateException.class, exportResult::join);
    }

    @Test
    @DisplayName("Should terminate policy successfully")
    void testTerminatePolicy() {
        // Arrange
        Long policyId = 1L;
        Policy activePolicy = createValidPolicy();
        activePolicy.setStatus("ACTIVE");
        LocalDateTime terminationDate = LocalDateTime.now().plusMonths(1);

        when(policyRepository.findById(policyId)).thenReturn(Optional.of(activePolicy));
        when(policyRepository.save(any(Policy.class))).thenReturn(activePolicy);

        // Act
        Policy terminatedPolicy = policyService.terminatePolicy(policyId, terminationDate);

        // Assert
        assertNotNull(terminatedPolicy);
        assertEquals("TERMINATED", terminatedPolicy.getStatus());
        assertEquals(terminationDate, terminatedPolicy.getExpiryDate());
        verify(policyRepository).save(any(Policy.class));
    }

    // Helper methods

    private PolicyDTO createValidPolicyDTO() {
        PolicyDTO dto = new PolicyDTO();
        dto.setPolicyNumber("POL-2023-001");
        dto.setStatus("DRAFT");
        dto.setTotalPremium(BigDecimal.valueOf(1000.00));
        dto.setEffectiveDate(LocalDateTime.now().plusDays(1));
        dto.setExpiryDate(LocalDateTime.now().plusMonths(12));
        dto.setOwnerId(1L);
        return dto;
    }

    private Policy createValidPolicy() {
        Policy policy = new Policy();
        policy.setId(1L);
        policy.setPolicyNumber("POL-2023-001");
        policy.setStatus("DRAFT");
        policy.setEffectiveDate(LocalDateTime.now().plusDays(1));
        policy.setExpiryDate(LocalDateTime.now().plusMonths(12));
        
        User owner = new User();
        owner.setId(1L);
        policy.setOwner(owner);
        
        return policy;
    }
}