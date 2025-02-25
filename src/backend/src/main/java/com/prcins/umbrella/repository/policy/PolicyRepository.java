package com.prcins.umbrella.repository.policy;

import com.prcins.umbrella.domain.policy.Policy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.QueryHints;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository interface for managing Policy entities with optimized performance for Virtual Threads.
 * Provides comprehensive data access operations with Jakarta Persistence support.
 * Implements caching and query optimization for improved response times under high concurrent loads.
 *
 * @version 2.0
 * @since Spring Boot 3.2.1
 */
@Repository
@Transactional(readOnly = true)
public interface PolicyRepository extends JpaRepository<Policy, Long> {

    /**
     * Retrieves a policy by its unique policy number with optimistic locking.
     * Optimized for Virtual Thread execution with query caching.
     *
     * @param policyNumber The unique policy number
     * @return Optional containing the policy if found
     */
    @Lock(LockModeType.OPTIMISTIC)
    @QueryHints({
        @QueryHint(name = "org.hibernate.cacheable", value = "true"),
        @QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000")
    })
    @Query("SELECT p FROM Policy p WHERE p.policyNumber = :policyNumber")
    Optional<Policy> findByPolicyNumber(@Param("policyNumber") String policyNumber);

    /**
     * Retrieves all policies with a specific status.
     * Optimized for batch processing with Virtual Threads.
     *
     * @param status The policy status to search for
     * @return List of matching policies
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.fetchSize", value = "50"),
        @QueryHint(name = "org.hibernate.cacheable", value = "true")
    })
    @Query("SELECT p FROM Policy p WHERE p.status = :status")
    List<Policy> findByStatus(@Param("status") String status);

    /**
     * Retrieves all currently active policies.
     * Optimized for concurrent access with result set streaming.
     *
     * @param currentDate The date to check policy validity against
     * @return List of active policies
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.fetchSize", value = "100"),
        @QueryHint(name = "org.hibernate.cacheable", value = "true")
    })
    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' " +
           "AND p.effectiveDate <= :currentDate AND p.expiryDate > :currentDate")
    List<Policy> findActivePolicies(@Param("currentDate") LocalDateTime currentDate);

    /**
     * Retrieves policies that need to be exported to PolicySTAR.
     * Optimized for large result sets with batch processing support.
     *
     * @param lastExportDate The date of the last export
     * @return List of policies modified since last export
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.fetchSize", value = "200"),
        @QueryHint(name = "org.hibernate.readOnly", value = "true")
    })
    @Query("SELECT p FROM Policy p WHERE p.modifiedDate > :lastExportDate")
    List<Policy> findPoliciesForExport(@Param("lastExportDate") LocalDateTime lastExportDate);

    /**
     * Retrieves policies approaching expiration within a date range.
     * Uses database indexing for optimized date range queries.
     *
     * @param startDate The start of the date range
     * @param endDate The end of the date range
     * @return List of expiring policies
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.comment", value = "Index: IDX_POLICY_EXPIRY"),
        @QueryHint(name = "org.hibernate.cacheable", value = "true")
    })
    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' " +
           "AND p.expiryDate BETWEEN :startDate AND :endDate")
    List<Policy> findExpiringPolicies(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate
    );

    /**
     * Retrieves policies by owner with pagination support.
     * Optimized for Virtual Thread execution with fetch join optimization.
     *
     * @param ownerId The ID of the policy owner
     * @return List of policies for the owner
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.fetchSize", value = "50"),
        @QueryHint(name = "org.hibernate.cacheable", value = "true")
    })
    @Query("SELECT DISTINCT p FROM Policy p LEFT JOIN FETCH p.owner " +
           "WHERE p.owner.id = :ownerId")
    List<Policy> findByOwnerId(@Param("ownerId") Long ownerId);

    /**
     * Retrieves policies requiring renewal processing.
     * Optimized for batch processing with result streaming.
     *
     * @param renewalDate The date to check for renewals
     * @return List of policies requiring renewal
     */
    @QueryHints({
        @QueryHint(name = "org.hibernate.fetchSize", value = "100"),
        @QueryHint(name = "org.hibernate.readOnly", value = "true")
    })
    @Query("SELECT p FROM Policy p WHERE p.status = 'ACTIVE' " +
           "AND p.expiryDate <= :renewalDate " +
           "AND NOT EXISTS (SELECT 1 FROM Policy r WHERE r.status = 'RENEWAL' " +
           "AND r.policyNumber = p.policyNumber)")
    List<Policy> findPoliciesForRenewal(@Param("renewalDate") LocalDateTime renewalDate);
}