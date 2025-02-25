package com.prcins.umbrella.domain.claims;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GenerationType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicReference;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.util.DateUtils;

/**
 * Thread-safe domain entity representing a payment transaction for an insurance claim.
 * Implements payment processing functionality with SpeedPay integration using Virtual Threads.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Entity
@Table(name = "CLAIM_PAYMENTS")
@EntityListeners(AuditingEntityListener.class)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "PAYMENT_ID")
    private Long id;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @NotNull(message = "Transaction ID is required")
    @Column(name = "TRANSACTION_ID", nullable = false, unique = true)
    private String transactionId;

    @NotNull(message = "Payment amount is required")
    @Positive(message = "Payment amount must be positive")
    @Column(name = "AMOUNT", precision = 19, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "STATUS", nullable = false)
    private AtomicReference<String> status;

    @NotNull(message = "Payment date is required")
    @Column(name = "PAYMENT_DATE", nullable = false)
    private LocalDateTime paymentDate;

    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;

    @ManyToOne
    private Claim claim;

    /**
     * Default constructor initializing thread-safe fields.
     */
    public Payment() {
        this.status = new AtomicReference<>("PENDING");
        this.createdDate = DateUtils.getCurrentDateTime();
        this.version = 0L;
    }

    /**
     * Processes payment asynchronously using Virtual Threads with SpeedPay integration.
     *
     * @param amount The payment amount
     * @param claimNumber The associated claim number
     * @return CompletableFuture representing the payment processing result
     * @throws IllegalArgumentException if payment parameters are invalid
     */
    public CompletableFuture<Boolean> processPayment(BigDecimal amount, String claimNumber) {
        Objects.requireNonNull(amount, "Payment amount cannot be null");
        Objects.requireNonNull(claimNumber, "Claim number cannot be null");

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        return CompletableFuture.supplyAsync(() -> {
            try {
                this.transactionId = generateTransactionId();
                this.amount = amount;
                this.paymentDate = DateUtils.getCurrentDateTime();
                
                // Simulate SpeedPay integration
                boolean paymentSuccess = processSpeedPayTransaction();
                
                if (paymentSuccess) {
                    updateStatus("COMPLETED");
                } else {
                    updateStatus("FAILED");
                }
                
                return paymentSuccess;
            } catch (Exception e) {
                updateStatus("ERROR");
                throw new RuntimeException("Payment processing failed", e);
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Updates payment status in a thread-safe manner.
     *
     * @param newStatus The new status to set
     */
    public void updateStatus(String newStatus) {
        Objects.requireNonNull(newStatus, "Status cannot be null");
        
        if (!isValidStatusTransition(newStatus)) {
            throw new IllegalArgumentException("Invalid status transition to: " + newStatus);
        }

        status.set(newStatus);
        this.modifiedDate = DateUtils.getCurrentDateTime();
    }

    /**
     * Validates the payment before persistence.
     */
    @PrePersist
    protected void onCreate() {
        this.createdDate = DateUtils.getCurrentDateTime();
        this.modifiedDate = this.createdDate;
        validatePayment();
    }

    /**
     * Validates the payment before updates.
     */
    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = DateUtils.getCurrentDateTime();
        validatePayment();
    }

    private void validatePayment() {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("Invalid payment amount");
        }
        if (transactionId == null || transactionId.trim().isEmpty()) {
            throw new IllegalStateException("Transaction ID is required");
        }
    }

    private boolean isValidStatusTransition(String newStatus) {
        String currentStatus = status.get();
        
        switch (currentStatus) {
            case "PENDING":
                return newStatus.equals("PROCESSING") || 
                       newStatus.equals("FAILED") || 
                       newStatus.equals("ERROR");
            case "PROCESSING":
                return newStatus.equals("COMPLETED") || 
                       newStatus.equals("FAILED") || 
                       newStatus.equals("ERROR");
            case "COMPLETED":
            case "FAILED":
            case "ERROR":
                return false;
            default:
                return false;
        }
    }

    private String generateTransactionId() {
        return "PAY-" + UUID.randomUUID().toString();
    }

    private boolean processSpeedPayTransaction() {
        // Simulate SpeedPay API integration
        try {
            Thread.sleep(1000); // Simulate API call
            return true;
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            return false;
        }
    }

    // Getters and setters with proper validation

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTransactionId() {
        return transactionId;
    }

    public void setTransactionId(String transactionId) {
        this.transactionId = Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Amount must be positive");
        }
        this.amount = amount;
    }

    public String getStatus() {
        return status.get();
    }

    public LocalDateTime getPaymentDate() {
        return paymentDate;
    }

    public void setPaymentDate(LocalDateTime paymentDate) {
        this.paymentDate = Objects.requireNonNull(paymentDate, "Payment date cannot be null");
    }

    public Claim getClaim() {
        return claim;
    }

    public void setClaim(Claim claim) {
        this.claim = Objects.requireNonNull(claim, "Claim cannot be null");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Payment)) return false;
        Payment payment = (Payment) o;
        return Objects.equals(getId(), payment.getId()) &&
               Objects.equals(getTransactionId(), payment.getTransactionId());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getTransactionId());
    }

    @Override
    public String toString() {
        return "Payment{" +
               "id=" + id +
               ", transactionId='" + transactionId + '\'' +
               ", amount=" + amount +
               ", status=" + status.get() +
               ", paymentDate=" + paymentDate +
               '}';
    }
}