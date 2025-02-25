package com.prcins.umbrella.domain.policy;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.FetchType;
import jakarta.persistence.GenerationType;
import jakarta.persistence.JoinColumn;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;
import java.util.concurrent.locks.ReentrantReadWriteLock;

import com.prcins.umbrella.domain.user.User;
import com.prcins.umbrella.util.DateUtils;

/**
 * Thread-safe domain entity representing an insurance policy.
 * Leverages Java 21 Virtual Threads for concurrent operations and modern Jakarta EE specifications.
 * Provides comprehensive policy lifecycle management with optimistic locking support.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Entity
@Table(name = "CSRI_POLICIES")
@EntityListeners(AuditingEntityListener.class)
public class Policy implements Serializable {

    private static final long serialVersionUID = 1L;

    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "POLICY_ID")
    private Long id;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @NotNull(message = "Policy number is required")
    @Size(max = 50, message = "Policy number cannot exceed 50 characters")
    @Column(name = "POLICY_NUMBER", nullable = false, unique = true)
    private String policyNumber;

    @NotNull(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "STATUS", nullable = false)
    private String status;

    @NotNull(message = "Total premium is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Total premium must be non-negative")
    @Column(name = "TOTAL_PREMIUM", precision = 19, scale = 2)
    private BigDecimal totalPremium;

    @NotNull(message = "Effective date is required")
    @Column(name = "EFFECTIVE_DATE", nullable = false)
    private LocalDateTime effectiveDate;

    @NotNull(message = "Expiry date is required")
    @Column(name = "EXPIRY_DATE", nullable = false)
    private LocalDateTime expiryDate;

    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "MODIFIED_DATE")
    private LocalDateTime modifiedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "OWNER_ID", nullable = false)
    private User owner;

    // Thread-safe collections for concurrent access
    private final ConcurrentHashMap<Long, Coverage> coverages;
    private final ConcurrentHashMap<Long, EndorsementData> endorsements;

    /**
     * Default constructor initializing thread-safe collections
     */
    public Policy() {
        this.coverages = new ConcurrentHashMap<>();
        this.endorsements = new ConcurrentHashMap<>();
        this.totalPremium = BigDecimal.ZERO;
        this.status = "DRAFT";
        this.createdDate = DateUtils.getCurrentDateTime();
    }

    /**
     * Adds coverage to the policy using Virtual Threads for concurrent processing
     *
     * @param coverage The coverage to add
     * @return CompletableFuture representing the asynchronous operation
     */
    public CompletableFuture<Void> addCoverageConcurrently(Coverage coverage) {
        return CompletableFuture.runAsync(() -> {
            try {
                lock.writeLock().lock();
                validateCoverage(coverage);
                coverages.put(coverage.getId().orElseThrow(), coverage);
                recalculatePremium();
                modifiedDate = DateUtils.getCurrentDateTime();
            } finally {
                lock.writeLock().unlock();
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Adds endorsement to the policy using Virtual Threads for concurrent processing
     *
     * @param endorsement The endorsement to add
     * @return CompletableFuture representing the asynchronous operation
     */
    public CompletableFuture<Void> addEndorsementConcurrently(EndorsementData endorsement) {
        return CompletableFuture.runAsync(() -> {
            try {
                lock.writeLock().lock();
                validateEndorsement(endorsement);
                endorsements.put(endorsement.getId(), endorsement);
                recalculatePremium();
                modifiedDate = DateUtils.getCurrentDateTime();
            } finally {
                lock.writeLock().unlock();
            }
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Validates policy dates before persistence
     */
    @PrePersist
    protected void onCreate() {
        if (!DateUtils.validatePolicyDates(effectiveDate, expiryDate)) {
            throw new IllegalStateException("Invalid policy dates");
        }
        this.createdDate = DateUtils.getCurrentDateTime();
        this.modifiedDate = this.createdDate;
    }

    /**
     * Validates policy state before updates
     */
    @PreUpdate
    protected void onUpdate() {
        if (!DateUtils.validatePolicyDates(effectiveDate, expiryDate)) {
            throw new IllegalStateException("Invalid policy dates");
        }
        this.modifiedDate = DateUtils.getCurrentDateTime();
    }

    /**
     * Thread-safe premium recalculation
     */
    private void recalculatePremium() {
        try {
            lock.readLock().lock();
            this.totalPremium = coverages.values().stream()
                .map(Coverage::calculateTotalCost)
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .setScale(2, BigDecimal.ROUND_HALF_UP);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Validates coverage before addition
     */
    private void validateCoverage(Coverage coverage) {
        Objects.requireNonNull(coverage, "Coverage cannot be null");
        if (coverage.getId().isEmpty()) {
            throw new IllegalArgumentException("Coverage must have an ID");
        }
    }

    /**
     * Validates endorsement before addition
     */
    private void validateEndorsement(EndorsementData endorsement) {
        Objects.requireNonNull(endorsement, "Endorsement cannot be null");
        if (endorsement.getId() == null) {
            throw new IllegalArgumentException("Endorsement must have an ID");
        }
        if (!DateUtils.isDateInRange(endorsement.getEffectiveDate(), 
                                   this.effectiveDate, 
                                   this.expiryDate)) {
            throw new IllegalArgumentException("Endorsement dates must be within policy period");
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

    public void setVersion(Long version) {
        this.version = version;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = Objects.requireNonNull(policyNumber, "Policy number cannot be null");
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = Objects.requireNonNull(status, "Status cannot be null");
    }

    public BigDecimal getTotalPremium() {
        try {
            lock.readLock().lock();
            return totalPremium;
        } finally {
            lock.readLock().unlock();
        }
    }

    public LocalDateTime getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDateTime effectiveDate) {
        this.effectiveDate = Objects.requireNonNull(effectiveDate, "Effective date cannot be null");
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = Objects.requireNonNull(expiryDate, "Expiry date cannot be null");
    }

    public User getOwner() {
        return owner;
    }

    public void setOwner(User owner) {
        this.owner = Objects.requireNonNull(owner, "Owner cannot be null");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Policy)) return false;
        Policy policy = (Policy) o;
        return Objects.equals(getId(), policy.getId()) &&
               Objects.equals(getPolicyNumber(), policy.getPolicyNumber());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getPolicyNumber());
    }

    @Override
    public String toString() {
        return "Policy{" +
               "id=" + id +
               ", policyNumber='" + policyNumber + '\'' +
               ", status='" + status + '\'' +
               ", totalPremium=" + totalPremium +
               ", effectiveDate=" + effectiveDate +
               ", expiryDate=" + expiryDate +
               ", coverages=" + coverages.size() +
               ", endorsements=" + endorsements.size() +
               '}';
    }
}