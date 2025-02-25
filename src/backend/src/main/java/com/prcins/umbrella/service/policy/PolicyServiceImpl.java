package com.prcins.umbrella.service.policy;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.repository.policy.PolicyRepository;
import com.prcins.umbrella.integration.policystar.PolicyStarClient;
import com.prcins.umbrella.web.dto.PolicyDTO;
import com.prcins.umbrella.util.DateUtils;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.scheduling.annotation.Async;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.Objects;
import java.util.logging.Logger;

/**
 * Implementation of PolicyService providing comprehensive policy management operations.
 * Leverages Java 21 Virtual Threads and Spring Boot 3.2.x features for enhanced performance
 * and modern enterprise standards.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Service
@Transactional
public class PolicyServiceImpl implements PolicyService {

    private static final Logger logger = Logger.getLogger(PolicyServiceImpl.class.getName());

    private final PolicyRepository policyRepository;
    private final PolicyStarClient policyStarClient;

    /**
     * Constructs PolicyServiceImpl with required dependencies.
     *
     * @param policyRepository Repository for policy data access
     * @param policyStarClient Client for PolicySTAR integration
     */
    public PolicyServiceImpl(PolicyRepository policyRepository, PolicyStarClient policyStarClient) {
        this.policyRepository = Objects.requireNonNull(policyRepository, "PolicyRepository cannot be null");
        this.policyStarClient = Objects.requireNonNull(policyStarClient, "PolicyStarClient cannot be null");
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public Policy createPolicy(PolicyDTO policyDTO) {
        Objects.requireNonNull(policyDTO, "PolicyDTO cannot be null");
        validatePolicyDTO(policyDTO);

        Policy policy = new Policy();
        mapDTOToPolicy(policyDTO, policy);
        policy.setStatus("DRAFT");

        // Validate policy dates
        if (!DateUtils.validatePolicyDates(policy.getEffectiveDate(), policy.getExpiryDate())) {
            throw new IllegalArgumentException("Invalid policy dates");
        }

        logger.info("Creating new policy with number: " + policyDTO.getPolicyNumber());
        return policyRepository.save(policy);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional(readOnly = true)
    public Optional<Policy> findPolicyById(Long id) {
        Objects.requireNonNull(id, "Policy ID cannot be null");
        logger.info("Retrieving policy with ID: " + id);
        return policyRepository.findById(id);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public Policy updatePolicy(Long id, PolicyDTO policyDTO) {
        Objects.requireNonNull(id, "Policy ID cannot be null");
        Objects.requireNonNull(policyDTO, "PolicyDTO cannot be null");

        Policy existingPolicy = policyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + id));

        if ("TERMINATED".equals(existingPolicy.getStatus())) {
            throw new IllegalStateException("Cannot update terminated policy");
        }

        validatePolicyDTO(policyDTO);
        mapDTOToPolicy(policyDTO, existingPolicy);

        logger.info("Updating policy with ID: " + id);
        return policyRepository.save(existingPolicy);
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Boolean> exportPolicyToStarSystem(Long policyId) {
        Objects.requireNonNull(policyId, "Policy ID cannot be null");

        return CompletableFuture.supplyAsync(() -> {
            try {
                Policy policy = policyRepository.findById(policyId)
                    .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + policyId));

                if (!"ACTIVE".equals(policy.getStatus())) {
                    throw new IllegalStateException("Only active policies can be exported");
                }

                logger.info("Exporting policy to PolicySTAR: " + policyId);
                CompletableFuture<String> exportFuture = policyStarClient.exportPolicy(policy);
                String exportRef = exportFuture.join();

                // Monitor export status
                CompletableFuture<PolicyStarClient.ExportStatus> statusFuture = 
                    policyStarClient.checkExportStatus(exportRef);
                PolicyStarClient.ExportStatus status = statusFuture.join();

                return PolicyStarClient.ExportStatus.COMPLETED.equals(status);
            } catch (Exception e) {
                logger.severe("Failed to export policy: " + e.getMessage());
                throw new RuntimeException("Policy export failed", e);
            }
        });
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Transactional
    public Policy terminatePolicy(Long id, LocalDateTime terminationDate) {
        Objects.requireNonNull(id, "Policy ID cannot be null");
        Objects.requireNonNull(terminationDate, "Termination date cannot be null");

        Policy policy = policyRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Policy not found with ID: " + id));

        if (!"ACTIVE".equals(policy.getStatus())) {
            throw new IllegalStateException("Only active policies can be terminated");
        }

        if (terminationDate.isBefore(policy.getEffectiveDate()) || 
            terminationDate.isAfter(policy.getExpiryDate())) {
            throw new IllegalArgumentException("Termination date must be within policy period");
        }

        policy.setStatus("TERMINATED");
        policy.setExpiryDate(terminationDate);

        logger.info("Terminating policy with ID: " + id);
        return policyRepository.save(policy);
    }

    /**
     * Validates PolicyDTO data.
     *
     * @param policyDTO The DTO to validate
     * @throws IllegalArgumentException if validation fails
     */
    private void validatePolicyDTO(PolicyDTO policyDTO) {
        if (policyDTO.getPolicyNumber() == null || policyDTO.getPolicyNumber().trim().isEmpty()) {
            throw new IllegalArgumentException("Policy number is required");
        }
        if (policyDTO.getEffectiveDate() == null || policyDTO.getExpiryDate() == null) {
            throw new IllegalArgumentException("Policy dates are required");
        }
        if (policyDTO.getOwnerId() == null) {
            throw new IllegalArgumentException("Policy owner is required");
        }
    }

    /**
     * Maps PolicyDTO data to Policy entity.
     *
     * @param source The source DTO
     * @param target The target Policy entity
     */
    private void mapDTOToPolicy(PolicyDTO source, Policy target) {
        target.setPolicyNumber(source.getPolicyNumber());
        target.setEffectiveDate(source.getEffectiveDate());
        target.setExpiryDate(source.getExpiryDate());
        target.setStatus(source.getStatus());
        
        // Additional mapping logic for coverages and endorsements would go here
        // Omitted for brevity as it would require additional DTOs and mapping logic
    }
}