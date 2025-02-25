package com.prcins.umbrella.domain.claims;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Id;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Column;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

/**
 * Entity class representing a document associated with an insurance claim.
 * Handles document metadata, storage, and lifecycle management using Jakarta Persistence.
 * 
 * @version 1.0
 * @since 3.2.1 (Spring Boot)
 */
@Entity
@Table(name = "claims_documents")
public class ClaimDocument {

    @Id
    @GeneratedValue
    @Column(name = "document_id")
    private Long id;

    @NotNull
    @Column(name = "claim_id", nullable = false)
    private Long claimId;

    @NotNull
    @Size(max = 255)
    @Column(name = "file_name", nullable = false)
    private String fileName;

    @NotNull
    @Size(max = 50)
    @Column(name = "file_type", nullable = false)
    private String fileType;

    @NotNull
    @Size(max = 512)
    @Column(name = "storage_location", nullable = false)
    private String storageLocation;

    @NotNull
    @Size(max = 50)
    @Column(name = "document_type", nullable = false)
    private String documentType;

    @Column(name = "file_size")
    private Long fileSize;

    @NotNull
    @Column(name = "uploaded_at", nullable = false)
    private LocalDateTime uploadedAt;

    @NotNull
    @Size(max = 100)
    @Column(name = "uploaded_by", nullable = false)
    private String uploadedBy;

    /**
     * Default constructor required by JPA.
     * Initializes uploadedAt to current timestamp.
     */
    public ClaimDocument() {
        this.uploadedAt = LocalDateTime.now();
    }

    /**
     * Retrieves the document ID.
     * 
     * @return The unique identifier for this document
     */
    public Long getId() {
        return id;
    }

    /**
     * Sets the document ID.
     * 
     * @param id The unique identifier to set
     */
    public void setId(Long id) {
        this.id = id;
    }

    /**
     * Retrieves the associated claim ID.
     * 
     * @return The ID of the claim this document belongs to
     */
    public Long getClaimId() {
        return claimId;
    }

    /**
     * Sets the associated claim ID.
     * 
     * @param claimId The ID of the claim to associate with this document
     */
    public void setClaimId(Long claimId) {
        this.claimId = claimId;
    }

    /**
     * Retrieves the document file name.
     * 
     * @return The name of the file
     */
    public String getFileName() {
        return fileName;
    }

    /**
     * Sets the document file name.
     * 
     * @param fileName The name of the file to set
     */
    public void setFileName(String fileName) {
        this.fileName = fileName;
    }

    /**
     * Retrieves the document file type.
     * 
     * @return The type of the file
     */
    public String getFileType() {
        return fileType;
    }

    /**
     * Sets the document file type.
     * 
     * @param fileType The type of the file to set
     */
    public void setFileType(String fileType) {
        this.fileType = fileType;
    }

    /**
     * Retrieves the document storage location.
     * 
     * @return The storage location path
     */
    public String getStorageLocation() {
        return storageLocation;
    }

    /**
     * Sets the document storage location.
     * 
     * @param storageLocation The storage location path to set
     */
    public void setStorageLocation(String storageLocation) {
        this.storageLocation = storageLocation;
    }

    /**
     * Retrieves the document type.
     * 
     * @return The type of document
     */
    public String getDocumentType() {
        return documentType;
    }

    /**
     * Sets the document type.
     * 
     * @param documentType The type of document to set
     */
    public void setDocumentType(String documentType) {
        this.documentType = documentType;
    }

    /**
     * Retrieves the file size.
     * 
     * @return The size of the file in bytes
     */
    public Long getFileSize() {
        return fileSize;
    }

    /**
     * Sets the file size.
     * 
     * @param fileSize The size of the file in bytes to set
     */
    public void setFileSize(Long fileSize) {
        this.fileSize = fileSize;
    }

    /**
     * Retrieves the upload timestamp.
     * 
     * @return The timestamp when the document was uploaded
     */
    public LocalDateTime getUploadedAt() {
        return uploadedAt;
    }

    /**
     * Sets the upload timestamp.
     * 
     * @param uploadedAt The timestamp to set
     */
    public void setUploadedAt(LocalDateTime uploadedAt) {
        this.uploadedAt = uploadedAt;
    }

    /**
     * Retrieves the uploader's identifier.
     * 
     * @return The identifier of the user who uploaded the document
     */
    public String getUploadedBy() {
        return uploadedBy;
    }

    /**
     * Sets the uploader's identifier.
     * 
     * @param uploadedBy The identifier of the user who uploaded the document
     */
    public void setUploadedBy(String uploadedBy) {
        this.uploadedBy = uploadedBy;
    }

    /**
     * Validates document metadata and storage location.
     * 
     * @return true if document is valid, false otherwise
     */
    public boolean validateDocument() {
        if (fileName == null || fileName.trim().isEmpty()) {
            return false;
        }
        
        if (fileType == null || !isValidFileType(fileType)) {
            return false;
        }
        
        if (storageLocation == null || storageLocation.trim().isEmpty()) {
            return false;
        }
        
        return true;
    }

    /**
     * Helper method to validate file type.
     * 
     * @param fileType The file type to validate
     * @return true if file type is supported, false otherwise
     */
    private boolean isValidFileType(String fileType) {
        // List of supported file types for claim documents
        return fileType.matches("^(pdf|jpg|jpeg|png|doc|docx|tiff)$");
    }
}