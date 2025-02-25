package com.prcins.umbrella.domain.claims;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Version;
import jakarta.persistence.Column;
import jakarta.persistence.OneToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.CascadeType;
import jakarta.persistence.FetchType;
import jakarta.persistence.GenerationType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;

import java.util.Set;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.util.DateUtils;

/**
 * Thread-safe domain entity representing an insurance claim.
 * Provides comprehensive claim lifecycle management with optimistic locking support.
 * Leverages Jakarta Persistence and Java 21 concurrent features.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Entity
@Table(name = "CSRI_CLAIMS")
@EntityListeners(AuditingEntityListener.class)
public class Claim {

    private static final long serialVersionUID = 1L;
    
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "CLAIM_ID")
    private Long id;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @NotNull(message = "Claim number is required")
    @Size(max = 50, message = "Claim number cannot exceed 50 characters")
    @Column(name = "CLAIM_NUMBER", nullable = false, unique = true)
    private String claimNumber;

    @NotNull(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "STATUS", nullable = false)
    private String status;

    @Size(max = 4000, message = "Description cannot exceed 4000 characters")
    @Column(name = "DESCRIPTION", length = 4000)
    private String description;

    @NotNull(message = "Claim amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Claim amount must be non-negative")
    @Column(name = "CLAIM_AMOUNT", precision = 19, scale = 2, nullable = false)
    private BigDecimal claimAmount;

    @NotNull(message = "Paid amount is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Paid amount must be non-negative")
    @Column(name = "PAID_AMOUNT", precision = 19, scale = 2, nullable = false)
    private BigDecimal paidAmount;

    @NotNull(message = "Incident date is required")
    @Column(name = "INCIDENT_DATE", nullable = false)
    private LocalDateTime incidentDate;

    @NotNull(message = "Reported date is required")
    @Column(name = "REPORTED_DATE", nullable = false)
    private LocalDateTime reportedDate;

    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    private Policy policy;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<ClaimDocument> documents;

    @OneToMany(mappedBy = "claim", cascade = CascadeType.ALL, orphanRemoval = true)
    private Set<PaymentDetail> paymentDetails;

    /**
     * Default constructor required by JPA.
     * Initializes collections with thread-safe implementations.
     */
    public Claim() {
        this.documents = ConcurrentHashMap.newKeySet();
        this.paymentDetails = ConcurrentHashMap.newKeySet();
        this.status = "PENDING";
        this.paidAmount = BigDecimal.ZERO;
        this.createdDate = DateUtils.getCurrentDateTime();
        this.version = 0L;
    }

    /**
     * Thread-safe method to add a document to the claim.
     *
     * @param document The document to add
     * @throws IllegalArgumentException if document is invalid
     */
    public void addDocument(ClaimDocument document) {
        Objects.requireNonNull(document, "Document cannot be null");
        
        if (!document.validateDocument()) {
            throw new IllegalArgumentException("Invalid document");
        }

        try {
            lock.writeLock().lock();
            documents.add(document);
            this.modifiedDate = DateUtils.getCurrentDateTime();
            this.version++;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Thread-safe method to record a payment with optimistic locking.
     *
     * @param amount The payment amount
     * @param paymentMethod The payment method used
     * @param transactionId The payment transaction ID
     * @throws IllegalArgumentException if payment details are invalid
     */
    public void recordPayment(BigDecimal amount, String paymentMethod, String transactionId) {
        Objects.requireNonNull(amount, "Payment amount cannot be null");
        Objects.requireNonNull(paymentMethod, "Payment method cannot be null");
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }

        try {
            lock.writeLock().lock();
            
            BigDecimal newPaidAmount = paidAmount.add(amount);
            if (newPaidAmount.compareTo(claimAmount) > 0) {
                throw new IllegalArgumentException("Total paid amount cannot exceed claim amount");
            }

            PaymentDetail payment = new PaymentDetail();
            payment.setAmount(amount);
            payment.setPaymentMethod(paymentMethod);
            payment.setTransactionId(transactionId);
            payment.setPaymentDate(DateUtils.getCurrentDateTime());

            paymentDetails.add(payment);
            this.paidAmount = newPaidAmount;
            this.modifiedDate = DateUtils.getCurrentDateTime();
            this.version++;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Thread-safe method to update claim status with validation.
     *
     * @param newStatus The new status to set
     * @throws IllegalArgumentException if status transition is invalid
     */
    public void updateStatus(String newStatus) {
        Objects.requireNonNull(newStatus, "Status cannot be null");
        
        try {
            lock.writeLock().lock();
            validateStatusTransition(newStatus);
            this.status = newStatus;
            this.modifiedDate = DateUtils.getCurrentDateTime();
            this.version++;
        } finally {
            lock.writeLock().unlock();
        }
    }

    /**
     * Validates claim data before persistence.
     */
    @PrePersist
    protected void onCreate() {
        this.createdDate = DateUtils.getCurrentDateTime();
        this.modifiedDate = this.createdDate;
        validateClaimDates();
    }

    /**
     * Validates claim data before updates.
     */
    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = DateUtils.getCurrentDateTime();
        validateClaimDates();
    }

    /**
     * Validates claim dates according to business rules.
     *
     * @throws IllegalStateException if dates are invalid
     */
    private void validateClaimDates() {
        if (incidentDate == null || reportedDate == null) {
            throw new IllegalStateException("Incident and reported dates are required");
        }

        if (incidentDate.isAfter(reportedDate)) {
            throw new IllegalStateException("Incident date cannot be after reported date");
        }

        if (reportedDate.isAfter(DateUtils.getCurrentDateTime())) {
            throw new IllegalStateException("Reported date cannot be in the future");
        }
    }

    /**
     * Validates status transitions according to business rules.
     *
     * @param newStatus The new status to validate
     * @throws IllegalArgumentException if transition is invalid
     */
    private void validateStatusTransition(String newStatus) {
        if (this.status.equals(newStatus)) {
            return;
        }

        switch (this.status) {
            case "PENDING":
                if (!newStatus.equals("IN_PROGRESS") && !newStatus.equals("REJECTED")) {
                    throw new IllegalArgumentException("Invalid status transition from PENDING");
                }
                break;
            case "IN_PROGRESS":
                if (!newStatus.equals("APPROVED") && !newStatus.equals("REJECTED")) {
                    throw new IllegalArgumentException("Invalid status transition from IN_PROGRESS");
                }
                break;
            case "APPROVED":
            case "REJECTED":
                throw new IllegalArgumentException("Cannot change status once claim is " + this.status);
            default:
                throw new IllegalArgumentException("Unknown current status: " + this.status);
        }
    }

    // Getters and setters with proper validation

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getVersion() {
        return version;
    }

    public String getClaimNumber() {
        return claimNumber;
    }

    public void setClaimNumber(String claimNumber) {
        this.claimNumber = Objects.requireNonNull(claimNumber, "Claim number cannot be null");
    }

    public String getStatus() {
        return status;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getClaimAmount() {
        try {
            lock.readLock().lock();
            return claimAmount;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void setClaimAmount(BigDecimal claimAmount) {
        Objects.requireNonNull(claimAmount, "Claim amount cannot be null");
        if (claimAmount.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Claim amount cannot be negative");
        }
        try {
            lock.writeLock().lock();
            this.claimAmount = claimAmount;
        } finally {
            lock.writeLock().unlock();
        }
    }

    public BigDecimal getPaidAmount() {
        try {
            lock.readLock().lock();
            return paidAmount;
        } finally {
            lock.readLock().unlock();
        }
    }

    public LocalDateTime getIncidentDate() {
        return incidentDate;
    }

    public void setIncidentDate(LocalDateTime incidentDate) {
        this.incidentDate = Objects.requireNonNull(incidentDate, "Incident date cannot be null");
    }

    public LocalDateTime getReportedDate() {
        return reportedDate;
    }

    public void setReportedDate(LocalDateTime reportedDate) {
        this.reportedDate = Objects.requireNonNull(reportedDate, "Reported date cannot be null");
    }

    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = Objects.requireNonNull(policy, "Policy cannot be null");
    }

    public Set<ClaimDocument> getDocuments() {
        return documents;
    }

    public Set<PaymentDetail> getPaymentDetails() {
        return paymentDetails;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Claim)) return false;
        Claim claim = (Claim) o;
        return Objects.equals(getId(), claim.getId()) &&
               Objects.equals(getClaimNumber(), claim.getClaimNumber());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getClaimNumber());
    }

    @Override
    public String toString() {
        return "Claim{" +
               "id=" + id +
               ", claimNumber='" + claimNumber + '\'' +
               ", status='" + status + '\'' +
               ", claimAmount=" + claimAmount +
               ", paidAmount=" + paidAmount +
               ", incidentDate=" + incidentDate +
               ", reportedDate=" + reportedDate +
               ", documents=" + documents.size() +
               ", paymentDetails=" + paymentDetails.size() +
               '}';
    }
}