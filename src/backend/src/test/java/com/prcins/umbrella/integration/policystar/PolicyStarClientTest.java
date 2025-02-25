package com.prcins.umbrella.integration.policystar;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.integration.policystar.PolicyStarClient.ExportStatus;
import com.prcins.umbrella.integration.policystar.PolicyStarClient.PolicyStarExportException;
import com.prcins.umbrella.util.DateUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.Timeout;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.times;

/**
 * Integration tests for PolicyStarClient using Spring Boot Test framework with Virtual Thread support.
 * Tests policy export functionality and integration with the PolicySTAR Export system.
 *
 * @version 2.0
 * @since Spring Boot 3.2.1
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class PolicyStarClientTest {

    @Autowired
    private PolicyStarClient policyStarClient;

    @MockBean
    private RestTemplate restTemplate;

    private Policy testPolicy;
    private static final String TEST_EXPORT_REF = "EXP-2023-001";
    private static final String EXPORT_ENDPOINT = "/export";
    private static final String STATUS_ENDPOINT = "/status/";

    @BeforeEach
    void setUp() {
        // Initialize test policy with required data
        testPolicy = new Policy();
        testPolicy.setId(1L);
        testPolicy.setPolicyNumber("POL-2023-001");
        testPolicy.setStatus("ACTIVE");
        testPolicy.setTotalPremium(BigDecimal.valueOf(1000.00));
        testPolicy.setEffectiveDate(DateUtils.getCurrentDateTime().plusDays(1));
        testPolicy.setExpiryDate(DateUtils.getCurrentDateTime().plusDays(365));
    }

    /**
     * Tests successful async policy export to PolicySTAR using Virtual Threads.
     * Verifies export reference ID is returned and proper async execution.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testExportPolicy() {
        // Mock REST template response for successful export
        when(restTemplate.postForObject(
            anyString(),
            any(HttpEntity.class),
            eq(String.class)
        )).thenReturn(TEST_EXPORT_REF);

        // Execute export with Virtual Thread and verify result
        CompletableFuture<String> exportFuture = policyStarClient.exportPolicy(testPolicy);
        
        String exportRef = assertDoesNotThrow(() -> exportFuture.get(5, TimeUnit.SECONDS));
        
        assertAll(
            () -> assertNotNull(exportRef, "Export reference should not be null"),
            () -> assertEquals(TEST_EXPORT_REF, exportRef, "Export reference should match expected value"),
            () -> verify(restTemplate, times(1)).postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(String.class)
            )
        );
    }

    /**
     * Tests async policy export failure scenarios with Virtual Thread execution.
     * Verifies proper error handling and exception propagation.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testExportPolicyFailure() {
        // Mock REST template to throw exception
        when(restTemplate.postForObject(
            anyString(),
            any(HttpEntity.class),
            eq(String.class)
        )).thenThrow(new RuntimeException("Export failed"));

        // Execute export and verify exception handling
        CompletableFuture<String> exportFuture = policyStarClient.exportPolicy(testPolicy);
        
        Exception exception = assertThrows(
            Exception.class,
            () -> exportFuture.get(5, TimeUnit.SECONDS)
        );
        
        assertAll(
            () -> assertTrue(exception.getCause() instanceof PolicyStarExportException),
            () -> assertTrue(exception.getCause().getMessage().contains("Failed to export policy")),
            () -> verify(restTemplate, times(1)).postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(String.class)
            )
        );
    }

    /**
     * Tests async export status check functionality with Virtual Thread support.
     * Verifies status updates are properly retrieved and processed.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testCheckExportStatus() {
        // Mock REST template response for status check
        when(restTemplate.getForObject(
            anyString(),
            eq(ExportStatus.class),
            any(HttpEntity.class)
        )).thenReturn(ExportStatus.COMPLETED);

        // Execute status check and verify result
        CompletableFuture<ExportStatus> statusFuture = 
            policyStarClient.checkExportStatus(TEST_EXPORT_REF);
        
        ExportStatus status = assertDoesNotThrow(() -> statusFuture.get(5, TimeUnit.SECONDS));
        
        assertAll(
            () -> assertNotNull(status, "Status should not be null"),
            () -> assertEquals(ExportStatus.COMPLETED, status, "Status should be COMPLETED"),
            () -> verify(restTemplate, times(1)).getForObject(
                anyString(),
                eq(ExportStatus.class),
                any(HttpEntity.class)
            )
        );
    }

    /**
     * Tests validation of policy data before export.
     * Verifies proper handling of invalid policy data.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testExportPolicyValidation() {
        // Create invalid policy
        Policy invalidPolicy = new Policy();
        
        // Attempt export and verify validation
        CompletableFuture<String> exportFuture = policyStarClient.exportPolicy(invalidPolicy);
        
        Exception exception = assertThrows(
            Exception.class,
            () -> exportFuture.get(5, TimeUnit.SECONDS)
        );
        
        assertTrue(exception.getCause() instanceof IllegalArgumentException);
    }

    /**
     * Tests retry mechanism for failed export attempts.
     * Verifies proper retry behavior and eventual success.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testExportPolicyRetry() {
        // Mock REST template to fail twice then succeed
        when(restTemplate.postForObject(
            anyString(),
            any(HttpEntity.class),
            eq(String.class)
        ))
        .thenThrow(new RuntimeException("First attempt"))
        .thenThrow(new RuntimeException("Second attempt"))
        .thenReturn(TEST_EXPORT_REF);

        // Execute export and verify retry behavior
        CompletableFuture<String> exportFuture = policyStarClient.exportPolicy(testPolicy);
        
        String exportRef = assertDoesNotThrow(() -> exportFuture.get(5, TimeUnit.SECONDS));
        
        assertAll(
            () -> assertNotNull(exportRef, "Export reference should not be null"),
            () -> assertEquals(TEST_EXPORT_REF, exportRef, "Export reference should match expected value"),
            () -> verify(restTemplate, times(3)).postForObject(
                anyString(),
                any(HttpEntity.class),
                eq(String.class)
            )
        );
    }
}