package com.prcins.umbrella.web.dto;

import com.prcins.umbrella.domain.policy.Coverage;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.Objects;

/**
 * Data Transfer Object representing an insurance policy for web layer operations.
 * Provides a clean separation between domain entities and web layer while supporting
 * comprehensive policy management features with modern Jakarta validation support.
 *
 * @version 1.0
 * @since 3.2.1 (Spring Boot)
 */
public class PolicyDTO implements Serializable {

    private static final long serialVersionUID = 1L;

    private Long id;

    @NotNull(message = "Policy number is required")
    @Size(min = 1, max = 50, message = "Policy number must be between 1 and 50 characters")
    private String policyNumber;

    @NotNull(message = "Policy status is required")
    @Size(max = 20, message = "Status cannot exceed 20 characters")
    private String status;

    @NotNull(message = "Total premium is required")
    private BigDecimal totalPremium;

    @NotNull(message = "Effective date is required")
    private LocalDateTime effectiveDate;

    @NotNull(message = "Expiry date is required")
    private LocalDateTime expiryDate;

    private LocalDateTime createdDate;
    private LocalDateTime modifiedDate;

    @NotNull(message = "Coverages collection is required")
    private Set<CoverageDTO> coverages;

    @NotNull(message = "Endorsements collection is required")
    private Set<EndorsementDTO> endorsements;

    @NotNull(message = "Owner ID is required")
    private Long ownerId;

    /**
     * Default constructor initializing collections using modern Java practices.
     * Sets creation and modification timestamps to current time.
     */
    public PolicyDTO() {
        this.coverages = new HashSet<>();
        this.endorsements = new HashSet<>();
        this.createdDate = LocalDateTime.now();
        this.modifiedDate = LocalDateTime.now();
        this.totalPremium = BigDecimal.ZERO;
    }

    // Getters and Setters

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPolicyNumber() {
        return policyNumber;
    }

    public void setPolicyNumber(String policyNumber) {
        this.policyNumber = policyNumber;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public BigDecimal getTotalPremium() {
        return totalPremium;
    }

    public void setTotalPremium(BigDecimal totalPremium) {
        this.totalPremium = totalPremium;
    }

    public LocalDateTime getEffectiveDate() {
        return effectiveDate;
    }

    public void setEffectiveDate(LocalDateTime effectiveDate) {
        this.effectiveDate = effectiveDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public LocalDateTime getCreatedDate() {
        return createdDate;
    }

    public void setCreatedDate(LocalDateTime createdDate) {
        this.createdDate = createdDate;
    }

    public LocalDateTime getModifiedDate() {
        return modifiedDate;
    }

    public void setModifiedDate(LocalDateTime modifiedDate) {
        this.modifiedDate = modifiedDate;
    }

    public Set<CoverageDTO> getCoverages() {
        return coverages;
    }

    public void setCoverages(Set<CoverageDTO> coverages) {
        this.coverages = coverages;
    }

    public Set<EndorsementDTO> getEndorsements() {
        return endorsements;
    }

    public void setEndorsements(Set<EndorsementDTO> endorsements) {
        this.endorsements = endorsements;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    /**
     * Calculates total premium by summing all coverage premiums and applying endorsement adjustments.
     * Uses BigDecimal for precise monetary calculations.
     *
     * @return The calculated total premium with proper decimal precision
     */
    public BigDecimal calculateTotalPremium() {
        BigDecimal total = coverages.stream()
                .map(CoverageDTO::getPremium)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal endorsementAdjustments = endorsements.stream()
                .map(EndorsementDTO::getPremiumAdjustment)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return total.add(endorsementAdjustments).setScale(2, BigDecimal.ROUND_HALF_UP);
    }

    /**
     * Updates the modification timestamp to the current time.
     * Should be called whenever the policy is modified.
     */
    public void updateModificationTimestamp() {
        this.modifiedDate = LocalDateTime.now();
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) return true;
        if (obj == null || getClass() != obj.getClass()) return false;
        PolicyDTO policyDTO = (PolicyDTO) obj;
        return Objects.equals(id, policyDTO.id) &&
               Objects.equals(policyNumber, policyDTO.policyNumber);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, policyNumber);
    }

    @Override
    public String toString() {
        return "PolicyDTO{" +
               "id=" + id +
               ", policyNumber='" + policyNumber + '\'' +
               ", status='" + status + '\'' +
               ", totalPremium=" + totalPremium +
               ", effectiveDate=" + effectiveDate +
               ", expiryDate=" + expiryDate +
               ", coverages.size=" + coverages.size() +
               ", endorsements.size=" + endorsements.size() +
               '}';
    }
}