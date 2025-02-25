package com.prcins.umbrella.integration.policystar;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.web.dto.PolicyDTO;
import org.springframework.web.client.RestTemplate;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.retry.annotation.Retry;
import org.springframework.retry.annotation.Backoff;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.annotation.Timed;

import java.time.Duration;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.Objects;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.Logger;

/**
 * Client implementation for integrating with the PolicySTAR Export system.
 * Leverages Java 21 Virtual Threads and Spring Boot 3.2.x features for efficient policy export operations.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Service
@CircuitBreaker(name = "policyStarExport")
public class PolicyStarClient {

    private static final Logger logger = Logger.getLogger(PolicyStarClient.class.getName());
    private static final String METRIC_PREFIX = "policystar.";

    private final RestTemplate restTemplate;
    private final MeterRegistry meterRegistry;
    private final ConcurrentHashMap<String, ExportStatus> exportStatusCache;

    @Value("${policystar.api.baseUrl}")
    private String policyStarBaseUrl;

    @Value("${policystar.api.key}")
    private String policyStarApiKey;

    @Value("${policystar.api.timeout:30}")
    private Duration timeout;

    @Value("${policystar.api.maxRetries:3}")
    private Integer maxRetries;

    /**
     * Constructs PolicyStarClient with required dependencies and configures metrics.
     *
     * @param restTemplate RestTemplate configured with Virtual Thread executor
     * @param meterRegistry Metrics registry for monitoring
     */
    public PolicyStarClient(RestTemplate restTemplate, MeterRegistry meterRegistry) {
        this.restTemplate = Objects.requireNonNull(restTemplate, "RestTemplate cannot be null");
        this.meterRegistry = Objects.requireNonNull(meterRegistry, "MeterRegistry cannot be null");
        this.exportStatusCache = new ConcurrentHashMap<>();

        // Initialize metrics collectors
        meterRegistry.gauge(METRIC_PREFIX + "active_exports", exportStatusCache, ConcurrentHashMap::size);
    }

    /**
     * Exports a policy to PolicySTAR system asynchronously using Virtual Threads.
     *
     * @param policy The policy to export
     * @return CompletableFuture containing the export reference ID
     * @throws IllegalArgumentException if policy is invalid
     */
    @Async
    @Timed(value = "policystar.export.time", description = "Time taken to export policy")
    @Retry(maxAttempts = 3, backoff = @Backoff(delay = 1000))
    public CompletableFuture<String> exportPolicy(Policy policy) {
        Objects.requireNonNull(policy, "Policy cannot be null");
        validatePolicy(policy);

        return CompletableFuture.supplyAsync(() -> {
            try {
                meterRegistry.counter(METRIC_PREFIX + "export.attempts").increment();

                PolicyStarRequest request = buildPolicyStarRequest(policy);
                HttpEntity<PolicyStarRequest> requestEntity = createRequestEntity(request);

                String exportRef = restTemplate.postForObject(
                    policyStarBaseUrl + "/export",
                    requestEntity,
                    String.class
                );

                exportStatusCache.put(exportRef, ExportStatus.IN_PROGRESS);
                meterRegistry.counter(METRIC_PREFIX + "export.success").increment();

                return exportRef;
            } catch (Exception e) {
                meterRegistry.counter(METRIC_PREFIX + "export.failures").increment();
                logger.severe("Failed to export policy: " + e.getMessage());
                throw new PolicyStarExportException("Failed to export policy", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Checks the status of a policy export operation with resilience patterns.
     *
     * @param exportReferenceId The export reference ID
     * @return CompletableFuture containing the export status
     */
    @Async
    @Timed(value = "policystar.status.check.time")
    public CompletableFuture<ExportStatus> checkExportStatus(String exportReferenceId) {
        Objects.requireNonNull(exportReferenceId, "Export reference ID cannot be null");

        return CompletableFuture.supplyAsync(() -> {
            try {
                HttpEntity<?> requestEntity = createRequestEntity(null);
                
                ExportStatus status = restTemplate.getForObject(
                    policyStarBaseUrl + "/status/" + exportReferenceId,
                    ExportStatus.class,
                    requestEntity
                );

                exportStatusCache.put(exportReferenceId, status);
                meterRegistry.counter(METRIC_PREFIX + "status.check.success").increment();

                return status;
            } catch (Exception e) {
                meterRegistry.counter(METRIC_PREFIX + "status.check.failures").increment();
                logger.severe("Failed to check export status: " + e.getMessage());
                throw new PolicyStarExportException("Failed to check export status", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Builds a PolicySTAR-compatible request from a policy with validation.
     *
     * @param policy The source policy
     * @return The formatted request object
     */
    private PolicyStarRequest buildPolicyStarRequest(Policy policy) {
        PolicyStarRequest request = new PolicyStarRequest();
        request.setPolicyId(policy.getId());
        request.setPolicyNumber(policy.getPolicyNumber());
        request.setEffectiveDate(policy.getEffectiveDate());
        request.setExpiryDate(policy.getExpiryDate());
        request.setTotalPremium(policy.getTotalPremium());
        request.setStatus(policy.getStatus());
        
        // Add coverages
        policy.getCoverages().forEach(coverage -> 
            request.addCoverage(coverage.getId().orElseThrow(), coverage.getCoverageType())
        );

        // Add endorsements
        policy.getEndorsements().forEach(endorsement ->
            request.addEndorsement(endorsement.getId(), endorsement.getEffectiveDate())
        );

        return request;
    }

    /**
     * Creates an HTTP request entity with required headers.
     *
     * @param body The request body (optional)
     * @return Configured HttpEntity
     */
    private <T> HttpEntity<T> createRequestEntity(T body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", policyStarApiKey);
        headers.set("X-Client-Version", "2.0");
        return new HttpEntity<>(body, headers);
    }

    /**
     * Validates policy data before export.
     *
     * @param policy The policy to validate
     * @throws IllegalArgumentException if policy is invalid
     */
    private void validatePolicy(Policy policy) {
        if (policy.getId() == null) {
            throw new IllegalArgumentException("Policy ID is required");
        }
        if (policy.getPolicyNumber() == null || policy.getPolicyNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Policy number is required");
        }
        if (policy.getEffectiveDate() == null || policy.getExpiryDate() == null) {
            throw new IllegalArgumentException("Policy dates are required");
        }
    }

    /**
     * Represents the status of a policy export operation.
     */
    public enum ExportStatus {
        PENDING,
        IN_PROGRESS,
        COMPLETED,
        FAILED
    }

    /**
     * Custom exception for PolicySTAR export operations.
     */
    public static class PolicyStarExportException extends RuntimeException {
        public PolicyStarExportException(String message, Throwable cause) {
            super(message, cause);
        }
    }
}