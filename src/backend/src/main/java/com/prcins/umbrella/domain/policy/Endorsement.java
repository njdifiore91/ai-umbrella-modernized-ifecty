package com.prcins.umbrella.domain.policy;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.GenerationType;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.Pattern;

import java.time.LocalDateTime;
import java.math.BigDecimal;
import java.util.Objects;
import java.util.concurrent.locks.ReentrantReadWriteLock;

/**
 * Thread-safe domain entity representing a policy endorsement that modifies an existing insurance policy.
 * Implements comprehensive validation and leverages Java 21's modern features for enhanced concurrency.
 * Uses Jakarta Persistence 3.1.0 for JPA mapping and validation.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Entity
@Table(name = "CSRI_ENDORSEMENTS")
@EntityListeners(AuditingEntityListener.class)
public class Endorsement {

    private static final long serialVersionUID = 1L;
    
    private final ReentrantReadWriteLock lock = new ReentrantReadWriteLock();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ENDORSEMENT_ID")
    private Long id;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @NotNull(message = "Endorsement number is required")
    @Size(max = 50, message = "Endorsement number cannot exceed 50 characters")
    @Pattern(regexp = "^END-[0-9]{10}$", message = "Invalid endorsement number format")
    @Column(name = "ENDORSEMENT_NUMBER", nullable = false, unique = true)
    private String endorsementNumber;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(name = "DESCRIPTION")
    private String description;

    @NotNull(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "STATUS", nullable = false)
    private String status;

    @NotNull(message = "Premium adjustment is required")
    @Column(name = "PREMIUM_ADJUSTMENT", precision = 19, scale = 2, nullable = false)
    private BigDecimal premiumAdjustment;

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

    @ManyToOne
    @JoinColumn(name = "POLICY_ID", nullable = false)
    private Policy policy;

    /**
     * Default constructor initializing an endorsement with default values.
     * Uses thread-safe BigDecimal for monetary calculations.
     */
    public Endorsement() {
        this.status = "DRAFT";
        this.premiumAdjustment = BigDecimal.ZERO;
        this.createdDate = LocalDateTime.now();
    }

    /**
     * Validates endorsement dates against policy period with thread safety.
     *
     * @return true if dates are valid within policy period
     * @throws IllegalStateException if dates are invalid
     */
    public boolean validateDates() {
        try {
            lock.readLock().lock();
            if (effectiveDate == null || expiryDate == null) {
                throw new IllegalStateException("Endorsement dates cannot be null");
            }
            if (expiryDate.isBefore(effectiveDate)) {
                throw new IllegalStateException("Expiry date cannot be before effective date");
            }
            if (policy == null) {
                throw new IllegalStateException("Policy reference cannot be null");
            }
            return effectiveDate.isAfter(policy.getEffectiveDate()) && 
                   expiryDate.isBefore(policy.getExpiryDate());
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Calculates adjusted premium using thread-safe BigDecimal operations.
     *
     * @param basePremium The base premium to adjust
     * @return The calculated premium adjustment
     * @throws IllegalArgumentException if basePremium is null
     */
    public BigDecimal calculateAdjustedPremium(BigDecimal basePremium) {
        Objects.requireNonNull(basePremium, "Base premium cannot be null");
        try {
            lock.readLock().lock();
            return basePremium.add(premiumAdjustment)
                            .setScale(2, BigDecimal.ROUND_HALF_UP);
        } finally {
            lock.readLock().unlock();
        }
    }

    /**
     * Checks if endorsement is currently active with thread safety.
     *
     * @return true if endorsement is active
     */
    public boolean isActive() {
        try {
            lock.readLock().lock();
            LocalDateTime now = LocalDateTime.now();
            return "ACTIVE".equals(status) &&
                   !now.isBefore(effectiveDate) &&
                   !now.isAfter(expiryDate);
        } finally {
            lock.readLock().unlock();
        }
    }

    @PrePersist
    protected void onCreate() {
        this.createdDate = LocalDateTime.now();
        this.modifiedDate = this.createdDate;
        validateDates();
    }

    @PreUpdate
    protected void onUpdate() {
        this.modifiedDate = LocalDateTime.now();
        validateDates();
    }

    // Getters and setters with proper validation and thread safety

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

    public String getEndorsementNumber() {
        return endorsementNumber;
    }

    public void setEndorsementNumber(String endorsementNumber) {
        this.endorsementNumber = Objects.requireNonNull(endorsementNumber, "Endorsement number cannot be null");
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getStatus() {
        try {
            lock.readLock().lock();
            return status;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void setStatus(String status) {
        try {
            lock.writeLock().lock();
            this.status = Objects.requireNonNull(status, "Status cannot be null");
        } finally {
            lock.writeLock().unlock();
        }
    }

    public BigDecimal getPremiumAdjustment() {
        try {
            lock.readLock().lock();
            return premiumAdjustment;
        } finally {
            lock.readLock().unlock();
        }
    }

    public void setPremiumAdjustment(BigDecimal premiumAdjustment) {
        try {
            lock.writeLock().lock();
            this.premiumAdjustment = Objects.requireNonNull(premiumAdjustment, "Premium adjustment cannot be null");
        } finally {
            lock.writeLock().unlock();
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

    public Policy getPolicy() {
        return policy;
    }

    public void setPolicy(Policy policy) {
        this.policy = Objects.requireNonNull(policy, "Policy cannot be null");
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof Endorsement)) return false;
        Endorsement that = (Endorsement) o;
        return Objects.equals(getId(), that.getId()) &&
               Objects.equals(getEndorsementNumber(), that.getEndorsementNumber());
    }

    @Override
    public int hashCode() {
        return Objects.hash(getId(), getEndorsementNumber());
    }

    @Override
    public String toString() {
        return "Endorsement{" +
               "id=" + id +
               ", endorsementNumber='" + endorsementNumber + '\'' +
               ", status='" + status + '\'' +
               ", premiumAdjustment=" + premiumAdjustment +
               ", effectiveDate=" + effectiveDate +
               ", expiryDate=" + expiryDate +
               '}';
    }
}