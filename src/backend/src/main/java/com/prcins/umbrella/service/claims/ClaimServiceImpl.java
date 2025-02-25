package com.prcins.umbrella.service.claims;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.domain.claims.ClaimDocument;
import com.prcins.umbrella.domain.claims.Payment;
import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.integration.speedpay.SpeedPayClient;
import com.prcins.umbrella.repository.claims.ClaimRepository;
import com.prcins.umbrella.util.DateUtils;
import com.prcins.umbrella.web.dto.ClaimDTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

/**
 * Implementation of ClaimService providing comprehensive claims management functionality.
 * Leverages Java 21 Virtual Threads and Spring Boot 3.2.x features for enhanced performance.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Service
@Transactional
public class ClaimServiceImpl implements ClaimService {

    private final ClaimRepository claimRepository;
    private final SpeedPayClient speedPayClient;

    /**
     * Constructs ClaimServiceImpl with required dependencies.
     *
     * @param claimRepository Repository for claim data access
     * @param speedPayClient Client for payment processing
     */
    public ClaimServiceImpl(ClaimRepository claimRepository, SpeedPayClient speedPayClient) {
        this.claimRepository = claimRepository;
        this.speedPayClient = speedPayClient;
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional
    public CompletableFuture<ClaimDTO> createClaimAsync(@Valid @NotNull ClaimDTO claimDTO) {
        return CompletableFuture.supplyAsync(() -> {
            validateClaimDTO(claimDTO);

            Claim claim = new Claim();
            claim.setClaimNumber(generateClaimNumber());
            claim.setStatus("PENDING");
            claim.setDescription(claimDTO.getDescription());
            claim.setClaimAmount(claimDTO.getClaimAmount());
            claim.setPaidAmount(BigDecimal.ZERO);
            claim.setIncidentDate(claimDTO.getIncidentDate());
            claim.setReportedDate(claimDTO.getReportedDate());

            Claim savedClaim = claimRepository.save(claim);
            return convertToDTO(savedClaim);
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<ClaimDTO> getClaimAsync(@NotNull Long id) {
        return CompletableFuture.supplyAsync(() -> {
            Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + id));
            return convertToDTO(claim);
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional
    public CompletableFuture<Void> uploadClaimDocumentAsync(@NotNull Long claimId, @NotNull MultipartFile file) {
        return CompletableFuture.runAsync(() -> {
            Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

            validateDocument(file);

            ClaimDocument document = new ClaimDocument();
            document.setClaimId(claimId);
            document.setFileName(file.getOriginalFilename());
            document.setFileType(file.getContentType());
            document.setFileSize(file.getSize());
            document.setUploadedAt(DateUtils.getCurrentDateTime());
            document.setDocumentType(determineDocumentType(file.getOriginalFilename()));

            claim.addDocument(document);
            claimRepository.save(claim);
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional
    public CompletableFuture<ClaimDTO> processClaimPaymentAsync(
            @NotNull Long claimId, 
            @NotNull BigDecimal amount, 
            @NotNull String paymentMethod) {
        return CompletableFuture.supplyAsync(() -> {
            Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

            validatePayment(claim, amount);

            Payment payment = new Payment();
            payment.setAmount(amount);
            payment.setTransactionId(generateTransactionId());
            payment.setPaymentDate(DateUtils.getCurrentDateTime());
            payment.setClaim(claim);

            return speedPayClient.processPayment(payment)
                .thenApply(response -> {
                    if (response.getStatusCode().is2xxSuccessful()) {
                        claim.recordPayment(amount, paymentMethod, payment.getTransactionId());
                        Claim updatedClaim = claimRepository.save(claim);
                        return convertToDTO(updatedClaim);
                    } else {
                        throw new RuntimeException("Payment processing failed");
                    }
                }).join();
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional
    public CompletableFuture<ClaimDTO> updateClaimStatusAsync(@NotNull Long claimId, @NotNull String newStatus) {
        return CompletableFuture.supplyAsync(() -> {
            Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new IllegalArgumentException("Claim not found with ID: " + claimId));

            claim.updateStatus(newStatus);
            Claim updatedClaim = claimRepository.save(claim);
            return convertToDTO(updatedClaim);
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * {@inheritDoc}
     */
    @Override
    @Async
    @Transactional(readOnly = true)
    public CompletableFuture<Page<ClaimDTO>> searchClaimsAsync(String searchTerm, Pageable pageable) {
        return CompletableFuture.supplyAsync(() -> {
            Page<Claim> claims = claimRepository.findByStatus(searchTerm, pageable);
            return claims.map(this::convertToDTO);
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    private void validateClaimDTO(ClaimDTO claimDTO) {
        if (claimDTO.getIncidentDate().isAfter(DateUtils.getCurrentDateTime())) {
            throw new IllegalArgumentException("Incident date cannot be in the future");
        }
        if (claimDTO.getClaimAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Claim amount must be positive");
        }
    }

    private void validateDocument(MultipartFile file) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be empty");
        }
        if (file.getSize() > 10_000_000) { // 10MB limit
            throw new IllegalArgumentException("File size exceeds limit");
        }
        String contentType = file.getContentType();
        if (contentType == null || !isValidDocumentType(contentType)) {
            throw new IllegalArgumentException("Invalid file type");
        }
    }

    private void validatePayment(Claim claim, BigDecimal amount) {
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        BigDecimal remainingAmount = claim.getClaimAmount().subtract(claim.getPaidAmount());
        if (amount.compareTo(remainingAmount) > 0) {
            throw new IllegalArgumentException("Payment amount exceeds remaining claim amount");
        }
    }

    private String generateClaimNumber() {
        return "CLM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }

    private String determineDocumentType(String fileName) {
        if (fileName == null) return "UNKNOWN";
        fileName = fileName.toLowerCase();
        if (fileName.endsWith(".pdf")) return "PDF";
        if (fileName.matches(".*\\.(jpg|jpeg|png)$")) return "IMAGE";
        if (fileName.matches(".*\\.(doc|docx)$")) return "DOCUMENT";
        return "OTHER";
    }

    private boolean isValidDocumentType(String contentType) {
        return contentType.startsWith("image/") ||
               contentType.equals("application/pdf") ||
               contentType.equals("application/msword") ||
               contentType.equals("application/vnd.openxmlformats-officedocument.wordprocessingml.document");
    }

    private ClaimDTO convertToDTO(Claim claim) {
        ClaimDTO dto = new ClaimDTO();
        dto.setId(claim.getId());
        dto.setClaimNumber(claim.getClaimNumber());
        dto.setStatus(claim.getStatus());
        dto.setDescription(claim.getDescription());
        dto.setClaimAmount(claim.getClaimAmount());
        dto.setPaidAmount(claim.getPaidAmount());
        dto.setIncidentDate(claim.getIncidentDate());
        dto.setReportedDate(claim.getReportedDate());
        dto.setPolicyId(claim.getPolicy().getId());
        return dto;
    }
}