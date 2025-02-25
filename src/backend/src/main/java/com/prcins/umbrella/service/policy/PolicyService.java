package com.prcins.umbrella.service.policy;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.web.dto.PolicyDTO;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;

/**
 * Service interface defining core policy management operations for the insurance system.
 * Leverages Java 21 Virtual Threads and Spring Boot 3.2.x features for enhanced performance
 * and modern enterprise standards. Provides comprehensive policy lifecycle management with
 * async export capabilities.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
public interface PolicyService {

    /**
     * Creates a new insurance policy with comprehensive validation.
     * Leverages Jakarta validation constraints from PolicyDTO.
     *
     * @param policyDTO The validated policy creation data
     * @return The newly created and persisted policy entity
     * @throws jakarta.validation.ValidationException if validation fails
     * @throws IllegalArgumentException if policy data is invalid
     */
    Policy createPolicy(PolicyDTO policyDTO);

    /**
     * Retrieves a policy by its unique identifier with null safety.
     * Uses Optional for improved null handling.
     *
     * @param id The policy ID to retrieve
     * @return Optional containing the policy if found
     */
    Optional<Policy> findPolicyById(Long id);

    /**
     * Updates an existing policy with optimistic locking support.
     * Validates update data using Jakarta validation constraints.
     *
     * @param id The ID of the policy to update
     * @param policyDTO The validated update data
     * @return The updated policy entity
     * @throws jakarta.persistence.OptimisticLockException if concurrent modification detected
     * @throws IllegalStateException if policy is terminated
     */
    Policy updatePolicy(Long id, PolicyDTO policyDTO);

    /**
     * Exports policy data to PolicySTAR system asynchronously using Virtual Threads.
     * Leverages Java 21's Virtual Thread capabilities for optimal performance under load.
     *
     * @param policyId The ID of the policy to export
     * @return CompletableFuture representing the async export operation
     * @throws IllegalArgumentException if policy ID is invalid
     */
    CompletableFuture<Boolean> exportPolicyToStarSystem(Long policyId);

    /**
     * Terminates an active policy with comprehensive validation and audit logging.
     * Ensures proper date validation using DateUtils.
     *
     * @param id The ID of the policy to terminate
     * @param terminationDate The effective date of termination
     * @return The terminated policy entity
     * @throws IllegalStateException if policy is already terminated
     * @throws IllegalArgumentException if termination date is invalid
     */
    Policy terminatePolicy(Long id, LocalDateTime terminationDate);
}