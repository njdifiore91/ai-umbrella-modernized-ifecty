package com.prcins.umbrella.web.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for managing claim information between web and service layers.
 * Implements comprehensive validation using Jakarta validation constraints.
 * Supports end-to-end claims management workflow requirements.
 */
public class ClaimDTO {

    private Long id;

    @NotNull(message = "Claim number is required")
    @Size(min = 1, max = 50, message = "Claim number must be between 1 and 50 characters")
    private String claimNumber;

    @NotNull(message = "Status is required")
    @Size(min = 1, max = 20, message = "Status must be between 1 and 20 characters")
    private String status;

    @Size(max = 4000, message = "Description cannot exceed 4000 characters")
    private String description;

    @NotNull(message = "Claim amount is required")
    private BigDecimal claimAmount;

    private BigDecimal paidAmount;

    @NotNull(message = "Incident date is required")
    private LocalDateTime incidentDate;

    @NotNull(message = "Reported date is required")
    private LocalDateTime reportedDate;

    @NotNull(message = "Policy ID is required")
    private Long policyId;

    /**
     * Default constructor for ClaimDTO.
     */
    public ClaimDTO() {
        // Initialize empty ClaimDTO object
    }

    /**
     * Retrieves the claim identifier.
     *
     * @return The unique identifier of the claim
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the claim identifier.
     *
     * @param id The unique identifier to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the claim number.
     *
     * @return The unique claim number
     */
    public String getClaimNumber() {
        return claimNumber;
    }

    /**
     * Sets the claim number with validation.
     *
     * @param claimNumber The claim number to set
     */
    public void setClaimNumber(String claimNumber) {
        this.claimNumber = claimNumber;
    }

    /**
     * Retrieves the claim status.
     *
     * @return The current status of the claim
     */
    public String getStatus() {
        return status;
    }

    /**
     * Sets the claim status with validation.
     *
     * @param status The status to set
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Retrieves the claim description.
     *
     * @return The description of the claim
     */
    public String getDescription() {
        return description;
    }

    /**
     * Sets the claim description with validation.
     *
     * @param description The description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Retrieves the claim amount.
     *
     * @return The total amount of the claim
     */
    public BigDecimal getClaimAmount() {
        return claimAmount;
    }

    /**
     * Sets the claim amount with validation.
     *
     * @param claimAmount The claim amount to set
     */
    public void setClaimAmount(BigDecimal claimAmount) {
        this.claimAmount = claimAmount;
    }

    /**
     * Retrieves the paid amount.
     *
     * @return The amount paid for the claim
     */
    public BigDecimal getPaidAmount() {
        return paidAmount;
    }

    /**
     * Sets the paid amount with validation.
     *
     * @param paidAmount The paid amount to set
     */
    public void setPaidAmount(BigDecimal paidAmount) {
        this.paidAmount = paidAmount;
    }

    /**
     * Retrieves the incident date.
     *
     * @return The date and time of the incident
     */
    public LocalDateTime getIncidentDate() {
        return incidentDate;
    }

    /**
     * Sets the incident date with validation.
     *
     * @param incidentDate The incident date to set
     */
    public void setIncidentDate(LocalDateTime incidentDate) {
        this.incidentDate = incidentDate;
    }

    /**
     * Retrieves the reported date.
     *
     * @return The date and time when the claim was reported
     */
    public LocalDateTime getReportedDate() {
        return reportedDate;
    }

    /**
     * Sets the reported date with validation.
     *
     * @param reportedDate The reported date to set
     */
    public void setReportedDate(LocalDateTime reportedDate) {
        this.reportedDate = reportedDate;
    }

    /**
     * Retrieves the policy identifier.
     *
     * @return The associated policy ID
     */
    public Long getPolicyId() {
        return policyId;
    }

    /**
     * Sets the policy identifier with validation.
     *
     * @param policyId The policy ID to set
     */
    public void setPolicyId(Long policyId) {
        this.policyId = policyId;
    }
}