package com.prcins.umbrella.service.claims;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.web.dto.ClaimDTO;

/**
 * Service interface defining asynchronous claims management operations.
 * Leverages Java 21's Virtual Threads for enhanced concurrency and performance.
 * Provides comprehensive claims lifecycle management with Spring Boot 3.2.x integration.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
public interface ClaimService {

    /**
     * Asynchronously creates a new claim using Virtual Threads.
     * Performs concurrent validation, policy verification, and CLUE Property integration.
     *
     * @param claimDTO The claim data to create
     * @return CompletableFuture containing the created claim DTO
     * @throws IllegalArgumentException if claim data is invalid
     */
    CompletableFuture<ClaimDTO> createClaimAsync(ClaimDTO claimDTO);

    /**
     * Asynchronously retrieves a claim by its ID using Virtual Threads.
     * Performs concurrent data access and DTO conversion.
     *
     * @param id The claim ID to retrieve
     * @return CompletableFuture containing the claim DTO if found
     * @throws IllegalArgumentException if ID is invalid
     */
    CompletableFuture<ClaimDTO> getClaimAsync(Long id);

    /**
     * Asynchronously uploads and processes a document for a claim using Virtual Threads.
     * Handles concurrent document validation, storage, and association.
     *
     * @param claimId The ID of the claim to attach the document to
     * @param file The document file to upload
     * @return CompletableFuture completing when upload is finished
     * @throws IllegalArgumentException if claim ID is invalid or file is null
     * @throws IllegalStateException if file type is unsupported or size exceeds limits
     */
    CompletableFuture<Void> uploadClaimDocumentAsync(Long claimId, MultipartFile file);

    /**
     * Asynchronously processes a payment for a claim using Virtual Threads.
     * Handles concurrent SpeedPay integration and payment recording.
     *
     * @param claimId The ID of the claim to process payment for
     * @param amount The payment amount
     * @param paymentMethod The payment method to use
     * @return CompletableFuture containing updated claim DTO with payment details
     * @throws IllegalArgumentException if claim ID is invalid or amount is negative
     * @throws IllegalStateException if claim status doesn't allow payments
     */
    CompletableFuture<ClaimDTO> processClaimPaymentAsync(Long claimId, BigDecimal amount, String paymentMethod);

    /**
     * Asynchronously searches claims with pagination using Virtual Threads.
     * Performs concurrent search execution and result transformation.
     *
     * @param searchTerm The search criteria
     * @param pageable The pagination parameters
     * @return CompletableFuture containing paginated list of matching claims
     * @throws IllegalArgumentException if search parameters are invalid
     */
    CompletableFuture<Page<ClaimDTO>> searchClaimsAsync(String searchTerm, Pageable pageable);

    /**
     * Asynchronously updates claim status using Virtual Threads.
     * Validates status transitions and performs concurrent updates.
     *
     * @param claimId The ID of the claim to update
     * @param newStatus The new status to set
     * @return CompletableFuture containing updated claim DTO
     * @throws IllegalArgumentException if claim ID is invalid
     * @throws IllegalStateException if status transition is invalid
     */
    CompletableFuture<ClaimDTO> updateClaimStatusAsync(Long claimId, String newStatus);

    /**
     * Asynchronously validates a claim against CLUE Property using Virtual Threads.
     * Performs concurrent external service integration and validation.
     *
     * @param claimId The ID of the claim to validate
     * @return CompletableFuture containing validation result
     * @throws IllegalArgumentException if claim ID is invalid
     */
    CompletableFuture<Boolean> validateClaimAsync(Long claimId);

    /**
     * Asynchronously retrieves claim documents using Virtual Threads.
     * Performs concurrent document metadata retrieval.
     *
     * @param claimId The ID of the claim to get documents for
     * @return CompletableFuture containing page of claim documents
     * @throws IllegalArgumentException if claim ID is invalid
     */
    CompletableFuture<Page<ClaimDTO>> getClaimDocumentsAsync(Long claimId, Pageable pageable);
}