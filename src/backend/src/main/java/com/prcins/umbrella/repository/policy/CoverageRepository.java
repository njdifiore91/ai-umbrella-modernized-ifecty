package com.prcins.umbrella.repository.policy;

import com.prcins.umbrella.domain.policy.Coverage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing Coverage entities using Spring Data JPA.
 * Provides optimized data access operations for insurance policy coverages.
 * Leverages Spring Boot 3.2.x features and Jakarta Persistence support.
 *
 * @version 1.0
 * @since 3.2.1 (Spring Boot)
 */
public interface CoverageRepository extends JpaRepository<Coverage, Long> {

    /**
     * Retrieves all coverages associated with a specific policy ID.
     * Uses optimized JPQL query with eager loading of essential attributes.
     *
     * @param policyId the ID of the policy to find coverages for
     * @return list of coverages for the specified policy
     */
    @Query("SELECT c FROM Coverage c WHERE c.policyId = :policyId")
    List<Coverage> findByPolicyId(@Param("policyId") Long policyId);

    /**
     * Retrieves all coverages for a policy with a specific status.
     * Implements type-safe parameter binding and query optimization.
     *
     * @param policyId the ID of the policy to find coverages for
     * @param status the status of coverages to filter by
     * @return filtered list of coverages matching the criteria
     */
    @Query("SELECT c FROM Coverage c WHERE c.policyId = :policyId AND c.status = :status")
    List<Coverage> findByPolicyIdAndStatus(
        @Param("policyId") Long policyId,
        @Param("status") String status
    );

    /**
     * Finds an active coverage by its ID with null-safe return handling.
     * Optimizes query execution for single entity retrieval.
     *
     * @param id the ID of the coverage to find
     * @return Optional containing the coverage if found and active
     */
    @Query("SELECT c FROM Coverage c WHERE c.id = :id AND c.status = 'ACTIVE'")
    Optional<Coverage> findActiveCoverageById(@Param("id") Long id);
}