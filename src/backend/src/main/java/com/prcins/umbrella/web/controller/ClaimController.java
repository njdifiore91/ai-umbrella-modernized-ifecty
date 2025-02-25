package com.prcins.umbrella.web.controller;

import com.prcins.umbrella.service.claims.ClaimService;
import com.prcins.umbrella.web.dto.ClaimDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * REST controller handling claim-related HTTP endpoints with Virtual Thread support.
 * Provides comprehensive claims management capabilities including creation, updates,
 * document management, and payment processing.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@RestController
@RequestMapping("/api/v1/claims")
@Validated
public class ClaimController {

    private static final Logger logger = LoggerFactory.getLogger(ClaimController.class);
    private final ClaimService claimService;

    /**
     * Constructs ClaimController with required dependencies.
     *
     * @param claimService The claim service implementation
     */
    public ClaimController(ClaimService claimService) {
        this.claimService = claimService;
    }

    /**
     * Creates a new claim asynchronously using Virtual Threads.
     *
     * @param claimDTO The claim data to create
     * @return CompletableFuture containing the created claim
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CompletableFuture<ResponseEntity<ClaimDTO>> createClaim(
            @Valid @RequestBody ClaimDTO claimDTO) {
        logger.info("Creating new claim with number: {}", claimDTO.getClaimNumber());
        return claimService.createClaimAsync(claimDTO)
                .thenApply(created -> ResponseEntity.status(HttpStatus.CREATED).body(created));
    }

    /**
     * Retrieves a claim by ID asynchronously.
     *
     * @param id The claim ID to retrieve
     * @return CompletableFuture containing the found claim or 404
     */
    @GetMapping("/{id}")
    public CompletableFuture<ResponseEntity<ClaimDTO>> getClaim(
            @PathVariable @NotNull Long id) {
        logger.info("Retrieving claim with ID: {}", id);
        return claimService.getClaimAsync(id)
                .thenApply(claim -> claim != null 
                    ? ResponseEntity.ok(claim)
                    : ResponseEntity.notFound().build());
    }

    /**
     * Updates claim status asynchronously.
     *
     * @param id The claim ID to update
     * @param status The new status
     * @return CompletableFuture containing the updated claim
     */
    @PatchMapping("/{id}/status")
    public CompletableFuture<ResponseEntity<ClaimDTO>> updateClaimStatus(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull String status) {
        logger.info("Updating status for claim ID: {} to: {}", id, status);
        return claimService.updateClaimStatusAsync(id, status)
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Uploads a document for a claim asynchronously.
     *
     * @param id The claim ID
     * @param file The document file
     * @return CompletableFuture completing when upload is finished
     */
    @PostMapping(value = "/{id}/documents", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public CompletableFuture<ResponseEntity<Void>> uploadClaimDocument(
            @PathVariable @NotNull Long id,
            @RequestParam("file") MultipartFile file) {
        logger.info("Uploading document for claim ID: {}, filename: {}", id, file.getOriginalFilename());
        return claimService.uploadClaimDocumentAsync(id, file)
                .thenApply(v -> ResponseEntity.ok().build());
    }

    /**
     * Processes a payment for a claim asynchronously.
     *
     * @param id The claim ID
     * @param amount The payment amount
     * @param paymentMethod The payment method
     * @return CompletableFuture containing the updated claim
     */
    @PostMapping("/{id}/payments")
    public CompletableFuture<ResponseEntity<ClaimDTO>> processClaimPayment(
            @PathVariable @NotNull Long id,
            @RequestParam @NotNull BigDecimal amount,
            @RequestParam @NotNull String paymentMethod) {
        logger.info("Processing payment for claim ID: {}, amount: {}", id, amount);
        return claimService.processClaimPaymentAsync(id, amount, paymentMethod)
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Searches claims with pagination support asynchronously.
     *
     * @param searchTerm The search criteria
     * @param page The page number
     * @param size The page size
     * @return CompletableFuture containing paginated search results
     */
    @GetMapping("/search")
    public CompletableFuture<ResponseEntity<Page<ClaimDTO>>> searchClaims(
            @RequestParam String searchTerm,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        logger.info("Searching claims with term: {}, page: {}, size: {}", searchTerm, page, size);
        return claimService.searchClaimsAsync(searchTerm, PageRequest.of(page, size))
                .thenApply(ResponseEntity::ok);
    }

    /**
     * Exception handler for validation errors.
     *
     * @param ex The validation exception
     * @return ResponseEntity with error details
     */
    @ExceptionHandler(jakarta.validation.ConstraintViolationException.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public ResponseEntity<String> handleValidationExceptions(
            jakarta.validation.ConstraintViolationException ex) {
        logger.error("Validation error: {}", ex.getMessage());
        return ResponseEntity.badRequest().body(ex.getMessage());
    }
}