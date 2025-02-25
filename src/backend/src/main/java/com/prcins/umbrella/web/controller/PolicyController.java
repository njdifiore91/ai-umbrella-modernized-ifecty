package com.prcins.umbrella.web.controller;

import com.prcins.umbrella.service.policy.PolicyService;
import com.prcins.umbrella.web.dto.PolicyDTO;
import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.util.DateUtils;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import jakarta.validation.Valid;

import java.time.LocalDateTime;
import java.util.concurrent.CompletableFuture;
import java.net.URI;
import java.util.Optional;

/**
 * REST controller for managing insurance policy operations.
 * Leverages Spring Boot 3.2.x features and Java 21 Virtual Threads for enhanced performance.
 * Provides endpoints for comprehensive policy lifecycle management.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@RestController
@RequestMapping("/api/v1/policies")
public class PolicyController {

    private final PolicyService policyService;

    /**
     * Constructor injection of required services.
     *
     * @param policyService The policy management service
     */
    public PolicyController(PolicyService policyService) {
        this.policyService = policyService;
    }

    /**
     * Creates a new insurance policy with comprehensive validation.
     *
     * @param policyDTO The validated policy creation data
     * @return ResponseEntity containing the created policy with location header
     */
    @PostMapping
    public ResponseEntity<PolicyDTO> createPolicy(@Valid @RequestBody PolicyDTO policyDTO) {
        Policy createdPolicy = policyService.createPolicy(policyDTO);
        
        URI location = URI.create(String.format("/api/v1/policies/%d", createdPolicy.getId()));
        
        return ResponseEntity
            .created(location)
            .body(mapToDTO(createdPolicy));
    }

    /**
     * Retrieves a policy by its unique identifier.
     *
     * @param id The policy ID to retrieve
     * @return ResponseEntity containing the policy if found
     */
    @GetMapping("/{id}")
    public ResponseEntity<PolicyDTO> getPolicyById(@PathVariable Long id) {
        return policyService.findPolicyById(id)
            .map(policy -> ResponseEntity.ok(mapToDTO(policy)))
            .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Updates an existing policy with optimistic locking support.
     *
     * @param id The ID of the policy to update
     * @param policyDTO The validated update data
     * @return ResponseEntity containing the updated policy
     */
    @PutMapping("/{id}")
    public ResponseEntity<PolicyDTO> updatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody PolicyDTO policyDTO) {
        
        if (!policyService.findPolicyById(id).isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Policy updatedPolicy = policyService.updatePolicy(id, policyDTO);
        return ResponseEntity.ok(mapToDTO(updatedPolicy));
    }

    /**
     * Exports policy to PolicySTAR system asynchronously using Virtual Threads.
     * Leverages Java 21's Virtual Thread capabilities for optimal performance.
     *
     * @param id The ID of the policy to export
     * @return CompletableFuture representing the async export operation
     */
    @PostMapping("/{id}/export")
    public CompletableFuture<ResponseEntity<Void>> exportPolicyToStar(@PathVariable Long id) {
        return policyService.findPolicyById(id)
            .map(policy -> policyService.exportPolicyToStarSystem(id)
                .thenApply(success -> success 
                    ? ResponseEntity.ok().<Void>build()
                    : ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).<Void>build()))
            .orElse(CompletableFuture.completedFuture(ResponseEntity.notFound().build()));
    }

    /**
     * Terminates an active policy with comprehensive validation.
     *
     * @param id The ID of the policy to terminate
     * @param terminationDate The effective date of termination
     * @return ResponseEntity containing the terminated policy
     */
    @PostMapping("/{id}/terminate")
    public ResponseEntity<PolicyDTO> terminatePolicy(
            @PathVariable Long id,
            @Valid @RequestBody LocalDateTime terminationDate) {
        
        Optional<Policy> policyOpt = policyService.findPolicyById(id);
        if (!policyOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        Policy policy = policyOpt.get();
        if (!"ACTIVE".equals(policy.getStatus())) {
            return ResponseEntity.badRequest().build();
        }

        if (!DateUtils.validatePolicyDates(policy.getEffectiveDate(), terminationDate)) {
            return ResponseEntity.badRequest().build();
        }

        Policy terminatedPolicy = policyService.terminatePolicy(id, terminationDate);
        return ResponseEntity.ok(mapToDTO(terminatedPolicy));
    }

    /**
     * Maps a Policy domain entity to PolicyDTO.
     * Handles null safety and proper field mapping.
     *
     * @param policy The policy entity to map
     * @return The mapped PolicyDTO
     */
    private PolicyDTO mapToDTO(Policy policy) {
        PolicyDTO dto = new PolicyDTO();
        dto.setId(policy.getId());
        dto.setPolicyNumber(policy.getPolicyNumber());
        dto.setStatus(policy.getStatus());
        dto.setTotalPremium(policy.getTotalPremium());
        dto.setEffectiveDate(policy.getEffectiveDate());
        dto.setExpiryDate(policy.getExpiryDate());
        dto.setOwnerId(policy.getOwner().getId());
        return dto;
    }
}