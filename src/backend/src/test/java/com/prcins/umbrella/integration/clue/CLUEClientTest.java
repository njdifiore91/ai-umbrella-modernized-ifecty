package com.prcins.umbrella.integration.clue;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.domain.policy.Policy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.Timeout;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cache.Cache;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.*;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Test class for CLUEClient integration functionality using Spring Boot Test framework.
 * Verifies CLUE Property service integration with Virtual Thread support.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class CLUEClientTest {

    @MockBean
    private RestTemplate restTemplate;

    @MockBean
    private CircuitBreakerFactory circuitBreakerFactory;

    @MockBean
    private Cache responseCache;

    private CLUEClient clueClient;

    private static final String TEST_SERVICE_URL = "http://test.clue.service";
    private static final String TEST_USERNAME = "testUser";
    private static final String TEST_PASSWORD = "testPass";

    @BeforeEach
    void setUp() {
        // Configure circuit breaker mock
        when(circuitBreakerFactory.create(anyString()))
            .thenReturn(new TestCircuitBreaker());

        // Initialize CLUEClient with mocked dependencies
        clueClient = new CLUEClient(restTemplate, circuitBreakerFactory, responseCache);

        // Set required properties via reflection
        ReflectionTestUtils.setField(clueClient, "serviceUrl", TEST_SERVICE_URL);
        ReflectionTestUtils.setField(clueClient, "username", TEST_USERNAME);
        ReflectionTestUtils.setField(clueClient, "password", TEST_PASSWORD);
    }

    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testGetClaimHistoryWithVirtualThread() throws Exception {
        // Arrange
        String policyNumber = "POL123";
        String expectedUrl = TEST_SERVICE_URL + "/history/" + policyNumber;
        String expectedResponse = "{\"claimHistory\": []}";

        ResponseEntity<String> mockResponse = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.exchange(
            eq(expectedUrl),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(String.class)
        )).thenReturn(mockResponse);

        // Act
        CompletableFuture<ResponseEntity<String>> future = clueClient.getClaimHistory(policyNumber);
        ResponseEntity<String> result = future.get(3, TimeUnit.SECONDS);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(expectedResponse, result.getBody());

        // Verify HTTP request
        ArgumentCaptor<HttpEntity<?>> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
            eq(expectedUrl),
            eq(HttpMethod.GET),
            requestCaptor.capture(),
            eq(String.class)
        );

        // Verify authentication headers
        HttpHeaders headers = requestCaptor.getValue().getHeaders();
        assertTrue(headers.containsKey("Authorization"));
        assertEquals(MediaType.APPLICATION_JSON, headers.getContentType());
    }

    @Test
    void testGetClaimHistoryError() throws Exception {
        // Arrange
        String policyNumber = "POL123";
        String expectedUrl = TEST_SERVICE_URL + "/history/" + policyNumber;

        when(restTemplate.exchange(
            eq(expectedUrl),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(String.class)
        )).thenThrow(new RuntimeException("Service unavailable"));

        // Act
        CompletableFuture<ResponseEntity<String>> future = clueClient.getClaimHistory(policyNumber);
        ResponseEntity<String> result = future.get(3, TimeUnit.SECONDS);

        // Assert
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, result.getStatusCode());
        assertTrue(result.getBody().contains("CLUE service temporarily unavailable"));
    }

    @Test
    @Timeout(value = 10, unit = TimeUnit.SECONDS)
    void testValidateClaimConcurrent() throws Exception {
        // Arrange
        Claim testClaim = new Claim();
        testClaim.setClaimNumber("CLM123");
        Policy policy = new Policy();
        policy.setPolicyNumber("POL123");
        testClaim.setPolicy(policy);

        String expectedUrl = TEST_SERVICE_URL + "/validate";
        String expectedResponse = "{\"validation\": \"success\"}";

        ResponseEntity<String> mockResponse = new ResponseEntity<>(expectedResponse, HttpStatus.OK);
        when(restTemplate.exchange(
            eq(expectedUrl),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(String.class)
        )).thenReturn(mockResponse);

        // Act
        CompletableFuture<ResponseEntity<String>> future = clueClient.validateClaim(testClaim);
        ResponseEntity<String> result = future.get(5, TimeUnit.SECONDS);

        // Assert
        assertNotNull(result);
        assertEquals(HttpStatus.OK, result.getStatusCode());
        assertEquals(expectedResponse, result.getBody());

        // Verify request body
        ArgumentCaptor<HttpEntity<?>> requestCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).exchange(
            eq(expectedUrl),
            eq(HttpMethod.POST),
            requestCaptor.capture(),
            eq(String.class)
        );

        MultiValueMap<String, String> requestBody = (MultiValueMap<String, String>) requestCaptor.getValue().getBody();
        assertEquals(testClaim.getClaimNumber(), requestBody.getFirst("claimNumber"));
        assertEquals(testClaim.getPolicy().getPolicyNumber(), requestBody.getFirst("policyNumber"));
    }

    @Test
    void testValidateClaimTimeout() throws Exception {
        // Arrange
        Claim testClaim = new Claim();
        testClaim.setClaimNumber("CLM123");
        Policy policy = new Policy();
        policy.setPolicyNumber("POL123");
        testClaim.setPolicy(policy);

        when(restTemplate.exchange(
            anyString(),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(String.class)
        )).thenAnswer(invocation -> {
            Thread.sleep(6000); // Simulate timeout
            return null;
        });

        // Act & Assert
        CompletableFuture<ResponseEntity<String>> future = clueClient.validateClaim(testClaim);
        assertThrows(TimeoutException.class, () -> future.get(5, TimeUnit.SECONDS));
    }

    /**
     * Test implementation of CircuitBreaker for unit testing
     */
    private static class TestCircuitBreaker implements CircuitBreaker {
        @Override
        public <T> T run(Supplier<T> toRun, Function<Throwable, T> fallback) {
            try {
                return toRun.get();
            } catch (Exception e) {
                return fallback.apply(e);
            }
        }
    }
}