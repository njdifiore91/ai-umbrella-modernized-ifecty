package com.prcins.umbrella.repository.claims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.List;

import com.prcins.umbrella.domain.claims.Claim;

/**
 * Repository interface for managing insurance claim persistence operations.
 * Provides comprehensive data access methods for claim management using Spring Data JPA.
 * Leverages Jakarta Persistence for modern enterprise Java standards.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Repository
public interface ClaimRepository extends JpaRepository<Claim, Long> {

    /**
     * Finds a claim by its unique claim number.
     *
     * @param claimNumber The unique claim number to search for
     * @return Optional containing the claim if found
     */
    @Query("SELECT c FROM Claim c WHERE c.claimNumber = :claimNumber")
    Optional<Claim> findByClaimNumber(@Param("claimNumber") String claimNumber);

    /**
     * Retrieves all claims associated with a policy ID with pagination support.
     *
     * @param policyId The ID of the policy to find claims for
     * @param pageable Pagination parameters
     * @return Page of claims for the given policy
     */
    @Query("SELECT c FROM Claim c WHERE c.policy.id = :policyId")
    Page<Claim> findByPolicyId(@Param("policyId") Long policyId, Pageable pageable);

    /**
     * Finds all claims with a specific status with pagination support.
     *
     * @param status The status to search for
     * @param pageable Pagination parameters
     * @return Page of claims with the specified status
     */
    @Query("SELECT c FROM Claim c WHERE c.status = :status")
    Page<Claim> findByStatus(@Param("status") String status, Pageable pageable);

    /**
     * Retrieves all claims that have unpaid amounts with pagination support.
     *
     * @param pageable Pagination parameters
     * @return Page of claims with unpaid amounts
     */
    @Query("SELECT c FROM Claim c WHERE c.claimAmount > c.paidAmount")
    Page<Claim> findUnpaidClaims(Pageable pageable);

    /**
     * Finds a claim by its claim number and status.
     *
     * @param claimNumber The claim number to search for
     * @param status The status to match
     * @return Optional containing the claim if found with matching criteria
     */
    @Query("SELECT c FROM Claim c WHERE c.claimNumber = :claimNumber AND c.status = :status")
    Optional<Claim> findByClaimNumberAndStatus(
        @Param("claimNumber") String claimNumber,
        @Param("status") String status
    );

    /**
     * Retrieves claims within a specified date range with pagination support.
     *
     * @param startDate Start of the date range
     * @param endDate End of the date range
     * @param pageable Pagination parameters
     * @return Page of claims within the date range
     */
    @Query("SELECT c FROM Claim c WHERE c.createdDate BETWEEN :startDate AND :endDate")
    Page<Claim> findByDateRange(
        @Param("startDate") LocalDateTime startDate,
        @Param("endDate") LocalDateTime endDate,
        Pageable pageable
    );

    /**
     * Finds claims by their payment status with pagination support.
     *
     * @param paymentStatus The payment status to search for
     * @param pageable Pagination parameters
     * @return Page of claims with the specified payment status
     */
    @Query("SELECT c FROM Claim c WHERE c.paymentStatus = :paymentStatus")
    Page<Claim> findByPaymentStatus(
        @Param("paymentStatus") String paymentStatus,
        Pageable pageable
    );

    /**
     * Counts the number of claims with a specific status.
     *
     * @param status The status to count
     * @return Count of claims with the specified status
     */
    @Query("SELECT COUNT(c) FROM Claim c WHERE c.status = :status")
    Long countByStatus(@Param("status") String status);
}