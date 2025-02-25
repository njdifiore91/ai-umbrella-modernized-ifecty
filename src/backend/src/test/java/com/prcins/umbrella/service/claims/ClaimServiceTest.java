package com.prcins.umbrella.service.claims;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.domain.claims.ClaimDocument;
import com.prcins.umbrella.domain.claims.Payment;
import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.integration.speedpay.SpeedPayClient;
import com.prcins.umbrella.repository.claims.ClaimRepository;
import com.prcins.umbrella.web.dto.ClaimDTO;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.junit.jupiter.SpringExtension;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/**
 * Test class for ClaimService implementation using JUnit Jupiter and Spring Boot Test.
 * Tests claim management functionality with Virtual Thread execution support.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@ExtendWith(SpringExtension.class)
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
class ClaimServiceTest {

    @Mock
    private ClaimRepository claimRepository;

    @Mock
    private SpeedPayClient speedPayClient;

    @InjectMocks
    private ClaimServiceImpl claimService;

    private ClaimDTO testClaimDTO;
    private Claim testClaim;
    private Policy testPolicy;

    @BeforeEach
    void setUp() {
        testPolicy = new Policy();
        testPolicy.setId(1L);
        testPolicy.setPolicyNumber("POL-123");

        testClaim = new Claim();
        testClaim.setId(1L);
        testClaim.setClaimNumber("CLM-123");
        testClaim.setStatus("PENDING");
        testClaim.setClaimAmount(BigDecimal.valueOf(1000));
        testClaim.setPaidAmount(BigDecimal.ZERO);
        testClaim.setIncidentDate(LocalDateTime.now().minusDays(1));
        testClaim.setReportedDate(LocalDateTime.now());
        testClaim.setPolicy(testPolicy);

        testClaimDTO = new ClaimDTO();
        testClaimDTO.setId(1L);
        testClaimDTO.setClaimNumber("CLM-123");
        testClaimDTO.setStatus("PENDING");
        testClaimDTO.setClaimAmount(BigDecimal.valueOf(1000));
        testClaimDTO.setPaidAmount(BigDecimal.ZERO);
        testClaimDTO.setIncidentDate(LocalDateTime.now().minusDays(1));
        testClaimDTO.setReportedDate(LocalDateTime.now());
        testClaimDTO.setPolicyId(1L);
    }

    @Test
    @DisplayName("Test create claim with Virtual Thread execution")
    void testCreateClaimWithVirtualThread() throws ExecutionException, InterruptedException {
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        CompletableFuture<ClaimDTO> futureResult = claimService.createClaimAsync(testClaimDTO);
        ClaimDTO result = futureResult.get();

        assertNotNull(result);
        assertEquals(testClaimDTO.getClaimAmount(), result.getClaimAmount());
        assertEquals("PENDING", result.getStatus());
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    @DisplayName("Test get claim with Virtual Thread execution")
    void testGetClaimWithVirtualThread() throws ExecutionException, InterruptedException {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        CompletableFuture<ClaimDTO> futureResult = claimService.getClaimAsync(1L);
        ClaimDTO result = futureResult.get();

        assertNotNull(result);
        assertEquals(testClaimDTO.getId(), result.getId());
        assertEquals(testClaimDTO.getClaimNumber(), result.getClaimNumber());
        verify(claimRepository, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test concurrent document uploads")
    void testConcurrentDocumentUploads() throws ExecutionException, InterruptedException {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        MockMultipartFile file = new MockMultipartFile(
            "test.pdf",
            "test.pdf",
            "application/pdf",
            "test content".getBytes()
        );

        CompletableFuture<Void> futureResult = claimService.uploadClaimDocumentAsync(1L, file);
        futureResult.get();

        verify(claimRepository, times(1)).findById(1L);
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    @DisplayName("Test async claim payment processing")
    void testAsyncClaimPaymentProcessing() throws ExecutionException, InterruptedException {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);
        when(speedPayClient.processPayment(any(Payment.class)))
            .thenReturn(CompletableFuture.completedFuture(ResponseEntity.ok().build()));

        BigDecimal paymentAmount = BigDecimal.valueOf(500);
        CompletableFuture<ClaimDTO> futureResult = claimService.processClaimPaymentAsync(
            1L, paymentAmount, "CREDIT_CARD"
        );
        ClaimDTO result = futureResult.get();

        assertNotNull(result);
        verify(speedPayClient, times(1)).processPayment(any(Payment.class));
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @ParameterizedTest
    @DisplayName("Test claim status updates with different statuses")
    @ValueSource(strings = {"IN_PROGRESS", "APPROVED", "REJECTED"})
    void testClaimStatusUpdates(String newStatus) throws ExecutionException, InterruptedException {
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));
        when(claimRepository.save(any(Claim.class))).thenReturn(testClaim);

        CompletableFuture<ClaimDTO> futureResult = claimService.updateClaimStatusAsync(1L, newStatus);
        ClaimDTO result = futureResult.get();

        assertNotNull(result);
        verify(claimRepository, times(1)).save(any(Claim.class));
    }

    @Test
    @DisplayName("Test async claim search with pagination")
    void testAsyncClaimSearch() throws ExecutionException, InterruptedException {
        PageRequest pageRequest = PageRequest.of(0, 10);
        Page<Claim> claimPage = new PageImpl<>(Arrays.asList(testClaim));
        
        when(claimRepository.findByStatus(anyString(), any(PageRequest.class)))
            .thenReturn(claimPage);

        CompletableFuture<Page<ClaimDTO>> futureResult = claimService.searchClaimsAsync(
            "PENDING", pageRequest
        );
        Page<ClaimDTO> result = futureResult.get();

        assertNotNull(result);
        assertFalse(result.getContent().isEmpty());
        assertEquals(1, result.getContent().size());
        verify(claimRepository, times(1)).findByStatus(anyString(), any(PageRequest.class));
    }

    @Test
    @DisplayName("Test claim creation with invalid data")
    void testCreateClaimWithInvalidData() {
        testClaimDTO.setIncidentDate(LocalDateTime.now().plusDays(1));

        assertThrows(
            IllegalArgumentException.class,
            () -> claimService.createClaimAsync(testClaimDTO).get()
        );
    }

    @Test
    @DisplayName("Test claim payment with excessive amount")
    void testClaimPaymentWithExcessiveAmount() {
        BigDecimal excessiveAmount = testClaim.getClaimAmount().multiply(BigDecimal.valueOf(2));

        assertThrows(
            IllegalArgumentException.class,
            () -> claimService.processClaimPaymentAsync(1L, excessiveAmount, "CREDIT_CARD").get()
        );
    }

    @Test
    @DisplayName("Test document upload with invalid file type")
    void testDocumentUploadWithInvalidFileType() {
        MockMultipartFile invalidFile = new MockMultipartFile(
            "test.exe",
            "test.exe",
            "application/octet-stream",
            "test content".getBytes()
        );

        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        assertThrows(
            IllegalArgumentException.class,
            () -> claimService.uploadClaimDocumentAsync(1L, invalidFile).get()
        );
    }

    @Test
    @DisplayName("Test claim status update with invalid transition")
    void testInvalidClaimStatusTransition() {
        testClaim.setStatus("APPROVED");
        when(claimRepository.findById(1L)).thenReturn(Optional.of(testClaim));

        assertThrows(
            IllegalArgumentException.class,
            () -> claimService.updateClaimStatusAsync(1L, "PENDING").get()
        );
    }
}