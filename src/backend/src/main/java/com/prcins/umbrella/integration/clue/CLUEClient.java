package com.prcins.umbrella.integration.clue;

import com.prcins.umbrella.domain.claims.Claim;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.retry.annotation.Retry;
import org.springframework.cache.annotation.Cacheable;
import io.micrometer.core.annotation.Timed;
import org.springframework.http.*;
import org.springframework.cache.Cache;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.Base64;
import java.nio.charset.StandardCharsets;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;

/**
 * Enhanced client implementation for CLUE Property service integration with Virtual Thread support.
 * Leverages Spring Boot 3.2.x features and modern Java 21 concurrency capabilities.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Service
@Slf4j
@ConditionalOnProperty(prefix = "clue", name = "enabled", havingValue = "true")
public class CLUEClient {

    private final RestTemplate restTemplate;
    private final CircuitBreaker circuitBreaker;
    private final Cache responseCache;

    @Value("${clue.service.url}")
    private String serviceUrl;

    @Value("${clue.service.username}")
    private String username;

    @Value("${clue.service.password}")
    private String password;

    @Value("${clue.circuit.breaker.threshold:50}")
    private int circuitBreakerThreshold;

    @Value("${clue.retry.max.attempts:3}")
    private int maxRetryAttempts;

    /**
     * Initializes the CLUE client with required dependencies and Virtual Thread executor.
     *
     * @param restTemplate RestTemplate configured with Virtual Thread executor
     * @param circuitBreakerFactory Factory for creating circuit breakers
     * @param responseCache Cache for CLUE responses
     */
    public CLUEClient(RestTemplate restTemplate, 
                     CircuitBreakerFactory circuitBreakerFactory,
                     Cache responseCache) {
        this.restTemplate = restTemplate;
        this.responseCache = responseCache;
        
        // Configure circuit breaker with threshold settings
        this.circuitBreaker = circuitBreakerFactory.create("clueService");
        
        // Configure RestTemplate with Virtual Thread executor
        this.restTemplate.setRequestFactory(request -> {
            return CompletableFuture.supplyAsync(() -> {
                return request.execute();
            }, Executors.newVirtualThreadPerTaskExecutor());
        });
    }

    /**
     * Retrieves claims history using Virtual Threads for improved performance.
     *
     * @param policyNumber The policy number to query
     * @return CompletableFuture containing the claims history response
     */
    @Timed(value = "clue.history.request", description = "Time taken to retrieve CLUE history")
    @Cacheable(cacheNames = "clueHistory")
    @Retry(maxAttempts = "${clue.retry.max.attempts}")
    public CompletableFuture<ResponseEntity<String>> getClaimHistory(String policyNumber) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.debug("Retrieving CLUE history for policy: {}", policyNumber);
                
                HttpHeaders headers = createAuthHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                String url = serviceUrl + "/history/" + policyNumber;
                
                HttpEntity<String> request = new HttpEntity<>(headers);
                
                return circuitBreaker.run(() -> 
                    restTemplate.exchange(url, HttpMethod.GET, request, String.class),
                    throwable -> handleError(throwable)
                );
            } catch (Exception e) {
                log.error("Error retrieving CLUE history: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to retrieve CLUE history", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Validates claims using Virtual Threads with enhanced error handling.
     *
     * @param claim The claim to validate
     * @return CompletableFuture containing the validation response
     */
    @Timed(value = "clue.validation.request", description = "Time taken to validate claim with CLUE")
    @Retry(maxAttempts = "${clue.retry.max.attempts}")
    public CompletableFuture<ResponseEntity<String>> validateClaim(Claim claim) {
        return CompletableFuture.supplyAsync(() -> {
            try {
                log.debug("Validating claim with CLUE: {}", claim.getClaimNumber());
                
                HttpHeaders headers = createAuthHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                
                MultiValueMap<String, String> requestBody = new LinkedMultiValueMap<>();
                requestBody.add("claimNumber", claim.getClaimNumber());
                requestBody.add("policyNumber", claim.getPolicy().getPolicyNumber());
                
                HttpEntity<MultiValueMap<String, String>> request = 
                    new HttpEntity<>(requestBody, headers);
                
                String url = serviceUrl + "/validate";
                
                return circuitBreaker.run(() ->
                    restTemplate.exchange(url, HttpMethod.POST, request, String.class),
                    throwable -> handleError(throwable)
                );
            } catch (Exception e) {
                log.error("Error validating claim with CLUE: {}", e.getMessage(), e);
                throw new RuntimeException("Failed to validate claim with CLUE", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Creates authentication headers for CLUE service requests.
     *
     * @return HttpHeaders with authentication
     */
    private HttpHeaders createAuthHeaders() {
        HttpHeaders headers = new HttpHeaders();
        String auth = username + ":" + password;
        byte[] encodedAuth = Base64.getEncoder().encode(
            auth.getBytes(StandardCharsets.UTF_8));
        String authHeader = "Basic " + new String(encodedAuth);
        headers.set("Authorization", authHeader);
        return headers;
    }

    /**
     * Handles errors from CLUE service calls with fallback behavior.
     *
     * @param throwable The error that occurred
     * @return Fallback response entity
     */
    private ResponseEntity<String> handleError(Throwable throwable) {
        log.error("CLUE service error: {}", throwable.getMessage(), throwable);
        return ResponseEntity
            .status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("{\"error\": \"CLUE service temporarily unavailable\"}");
    }
}