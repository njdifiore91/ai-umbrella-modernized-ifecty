package com.prcins.umbrella.repository.claims;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.prcins.umbrella.domain.claims.Payment;

import java.util.List;
import java.util.Optional;

/**
 * Thread-safe repository interface for managing payment transactions in the claims processing system.
 * Provides optimized data access operations with Spring Data JPA integration and Jakarta EE compatibility.
 * Supports Virtual Thread execution for improved performance under high concurrent loads.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    /**
     * Finds a payment by its SpeedPay transaction ID with optimistic locking support.
     * Uses indexed query for optimal performance.
     *
     * @param transactionId The SpeedPay transaction identifier
     * @return Optional containing the payment if found
     */
    Optional<Payment> findByTransactionId(String transactionId);

    /**
     * Retrieves all payments for a specific claim with eager loading optimization.
     * Uses join fetch to minimize N+1 query issues.
     *
     * @param claimId The claim identifier
     * @return List of payments associated with the claim
     */
    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.claim c " +
           "WHERE c.id = :claimId")
    List<Payment> findByClaimId(@Param("claimId") Long claimId);

    /**
     * Finds all payments with a specific status using indexed queries.
     * Supports Virtual Thread execution for concurrent access.
     *
     * @param status The payment status to filter by
     * @return List of payments matching the status
     */
    List<Payment> findByStatus(String status);

    /**
     * Updates payment status with optimistic locking and audit tracking.
     * Uses atomic update to prevent concurrent modification issues.
     *
     * @param transactionId The SpeedPay transaction identifier
     * @param status The new payment status
     * @param version The current version for optimistic locking
     * @return Number of records updated
     */
    @Modifying
    @Query("UPDATE Payment p " +
           "SET p.status = :status, " +
           "p.modifiedDate = CURRENT_TIMESTAMP, " +
           "p.version = p.version + 1 " +
           "WHERE p.transactionId = :transactionId " +
           "AND p.version = :version")
    int updatePaymentStatus(
        @Param("transactionId") String transactionId,
        @Param("status") String status,
        @Param("version") Long version
    );

    /**
     * Retrieves payments requiring processing with optimistic locking support.
     * Uses indexed query for efficient status-based filtering.
     *
     * @return List of pending payments
     */
    @Query("SELECT p FROM Payment p " +
           "WHERE p.status = 'PENDING' " +
           "ORDER BY p.createdDate ASC")
    List<Payment> findPendingPayments();

    /**
     * Finds payments by claim ID and status with eager loading optimization.
     * Supports Virtual Thread execution for improved performance.
     *
     * @param claimId The claim identifier
     * @param status The payment status
     * @return List of matching payments
     */
    @Query("SELECT DISTINCT p FROM Payment p " +
           "LEFT JOIN FETCH p.claim c " +
           "WHERE c.id = :claimId " +
           "AND p.status = :status")
    List<Payment> findByClaimIdAndStatus(
        @Param("claimId") Long claimId,
        @Param("status") String status
    );

    /**
     * Checks if a payment exists by transaction ID with optimistic locking.
     * Uses indexed query for efficient existence check.
     *
     * @param transactionId The SpeedPay transaction identifier
     * @return true if payment exists, false otherwise
     */
    boolean existsByTransactionId(String transactionId);
}