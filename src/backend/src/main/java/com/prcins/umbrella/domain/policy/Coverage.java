package com.prcins.umbrella.domain.policy;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.persistence.Version;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.DecimalMin;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Optional;

/**
 * Domain entity representing insurance coverage within a policy.
 * Provides comprehensive coverage details including limits, deductibles, and premium information.
 * Implements proper JPA mapping and validation using Jakarta Persistence.
 *
 * @version 1.0
 * @since 3.2.1 (Spring Boot)
 */
@Entity
@Table(name = "CSRI_COVERAGES")
public class Coverage implements Serializable {

    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "COVERAGE_ID")
    private Long id;

    @Version
    @Column(name = "VERSION")
    private Long version;

    @NotNull(message = "Policy ID is required")
    @Column(name = "POLICY_ID", nullable = false)
    private Long policyId;

    @NotNull(message = "Coverage type is required")
    @Size(max = 50, message = "Coverage type cannot exceed 50 characters")
    @Column(name = "COVERAGE_TYPE", length = 50, nullable = false)
    private String coverageType;

    @Size(max = 255, message = "Description cannot exceed 255 characters")
    @Column(name = "DESCRIPTION")
    private String description;

    @NotNull(message = "Coverage limit is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Coverage limit must be non-negative")
    @Column(name = "COVERAGE_LIMIT", precision = 19, scale = 2, nullable = false)
    private BigDecimal limit;

    @NotNull(message = "Deductible is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Deductible must be non-negative")
    @Column(name = "DEDUCTIBLE", precision = 19, scale = 2, nullable = false)
    private BigDecimal deductible;

    @NotNull(message = "Premium is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Premium must be non-negative")
    @Column(name = "PREMIUM", precision = 19, scale = 2, nullable = false)
    private BigDecimal premium;

    @NotNull(message = "Status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    @Column(name = "STATUS", length = 20, nullable = false)
    private String status;

    @Column(name = "CREATED_DATE", nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column(name = "LAST_MODIFIED_DATE")
    private LocalDateTime lastModifiedDate;

    /**
     * Default constructor required by JPA.
     * Initializes a new Coverage instance with default values.
     */
    public Coverage() {
        this.status = "PENDING";
        this.limit = BigDecimal.ZERO;
        this.deductible = BigDecimal.ZERO;
        this.premium = BigDecimal.ZERO;
        this.createdDate = LocalDateTime.now();
    }

    /**
     * Retrieves the coverage ID wrapped in Optional for null safety.
     *
     * @return Optional containing the coverage ID
     */
    public Optional<Long> getId() {
        return Optional.ofNullable(id);
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

    public Long getPolicyId() {
        return policyId;
    }

    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }

    public String getCoverageType() {
        return coverageType;
    }

    public void setCoverageType(String coverageType) {
        this.coverageType = coverageType;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getLimit() {
        return limit;
    }

    public void setLimit(BigDecimal limit) {
        this.limit = limit;
    }

    public BigDecimal getDeductible() {
        return deductible;
    }

    public void setDeductible(BigDecimal deductible) {
        this.deductible = deductible;
    }

    public BigDecimal getPremium() {
        return premium;
    }

    public void setPremium(BigDecimal premium) {
        this.premium = premium;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public LocalDateTime getLastModifiedDate() {
        return lastModifiedDate;
    }

    public void setLastModifiedDate(LocalDateTime lastModifiedDate) {
        this.lastModifiedDate = lastModifiedDate;
    }

    /**
     * Calculates the total cost of coverage including premium and any adjustments.
     * Ensures proper decimal precision and rounding.
     *
     * @return The total cost with proper scale
     */
    public BigDecimal calculateTotalCost() {
        if (premium == null) {
            return BigDecimal.ZERO;
        }
        return premium.setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        Coverage coverage = (Coverage) obj;
        return Objects.equals(id, coverage.id) &&
               Objects.equals(version, coverage.version);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, version);
    }

    @Override
    public String toString() {
        return "Coverage{" +
               "id=" + id +
               ", policyId=" + policyId +
               ", coverageType='" + coverageType + '\'' +
               ", limit=" + limit +
               ", status='" + status + '\'' +
               '}';
    }
}