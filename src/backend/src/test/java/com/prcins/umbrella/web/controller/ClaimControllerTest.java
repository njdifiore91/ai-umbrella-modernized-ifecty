package com.prcins.umbrella.web.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.prcins.umbrella.service.claims.ClaimService;
import com.prcins.umbrella.web.dto.ClaimDTO;
import com.prcins.umbrella.util.DateUtils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Test class for ClaimController using Spring Boot Test and JUnit Jupiter.
 * Leverages Virtual Threads for enhanced concurrent testing capabilities.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@AutoConfigureMockMvc
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(MockitoExtension.class)
public class ClaimControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private ClaimService claimService;

    private ClaimDTO testClaimDTO;

    /**
     * Sets up test data and mocks before each test.
     * Configures Virtual Thread context and async operation support.
     */
    @BeforeEach
    void setUp() {
        testClaimDTO = new ClaimDTO();
        testClaimDTO.setId(1L);
        testClaimDTO.setClaimNumber("CLM-2023-001");
        testClaimDTO.setStatus("PENDING");
        testClaimDTO.setDescription("Test claim description");
        testClaimDTO.setClaimAmount(new BigDecimal("1000.00"));
        testClaimDTO.setPaidAmount(BigDecimal.ZERO);
        testClaimDTO.setIncidentDate(DateUtils.getCurrentDateTime().minusDays(1));
        testClaimDTO.setReportedDate(DateUtils.getCurrentDateTime());
        testClaimDTO.setPolicyId(1L);
    }

    /**
     * Tests async claim creation endpoint with Virtual Thread support.
     */
    @Test
    void testCreateClaimAsync() throws Exception {
        when(claimService.createClaimAsync(any(ClaimDTO.class)))
            .thenReturn(CompletableFuture.completedFuture(testClaimDTO));

        mockMvc.perform(post("/api/v1/claims")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testClaimDTO)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.claimNumber").value(testClaimDTO.getClaimNumber()))
                .andExpect(jsonPath("$.status").value(testClaimDTO.getStatus()));
    }

    /**
     * Tests async claim retrieval with Virtual Thread support.
     */
    @Test
    void testGetClaimAsync() throws Exception {
        when(claimService.getClaimAsync(anyLong()))
            .thenReturn(CompletableFuture.completedFuture(testClaimDTO));

        mockMvc.perform(get("/api/v1/claims/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(testClaimDTO.getId()))
                .andExpect(jsonPath("$.claimNumber").value(testClaimDTO.getClaimNumber()));
    }

    /**
     * Tests async claim status update with Virtual Thread support.
     */
    @Test
    void testUpdateClaimStatusAsync() throws Exception {
        testClaimDTO.setStatus("IN_PROGRESS");
        when(claimService.updateClaimStatusAsync(anyLong(), anyString()))
            .thenReturn(CompletableFuture.completedFuture(testClaimDTO));

        mockMvc.perform(patch("/api/v1/claims/{id}/status", 1L)
                .param("status", "IN_PROGRESS"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
    }

    /**
     * Tests concurrent document upload with Virtual Thread processing.
     */
    @Test
    void testUploadClaimDocumentWithVirtualThread() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            MediaType.APPLICATION_PDF_VALUE,
            "test content".getBytes()
        );

        when(claimService.uploadClaimDocumentAsync(anyLong(), any(MultipartFile.class)))
            .thenReturn(CompletableFuture.completedFuture(null));

        mockMvc.perform(multipart("/api/v1/claims/{id}/documents", 1L)
                .file(file))
                .andExpect(status().isOk());
    }

    /**
     * Tests async claim payment processing with Virtual Thread support.
     */
    @Test
    void testProcessClaimPaymentAsync() throws Exception {
        BigDecimal paymentAmount = new BigDecimal("500.00");
        testClaimDTO.setPaidAmount(paymentAmount);

        when(claimService.processClaimPaymentAsync(anyLong(), any(BigDecimal.class), anyString()))
            .thenReturn(CompletableFuture.completedFuture(testClaimDTO));

        mockMvc.perform(post("/api/v1/claims/{id}/payments", 1L)
                .param("amount", paymentAmount.toString())
                .param("paymentMethod", "CREDIT_CARD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paidAmount").value(paymentAmount.doubleValue()));
    }

    /**
     * Tests async claim search with pagination and Virtual Thread support.
     */
    @Test
    void testSearchClaimsAsync() throws Exception {
        Page<ClaimDTO> claimPage = new PageImpl<>(List.of(testClaimDTO));
        
        when(claimService.searchClaimsAsync(anyString(), any(PageRequest.class)))
            .thenReturn(CompletableFuture.completedFuture(claimPage));

        mockMvc.perform(get("/api/v1/claims/search")
                .param("searchTerm", "test")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].claimNumber").value(testClaimDTO.getClaimNumber()));
    }

    /**
     * Tests validation error handling with Virtual Thread context.
     */
    @Test
    void testCreateClaimValidationError() throws Exception {
        testClaimDTO.setClaimNumber(null); // Trigger validation error

        mockMvc.perform(post("/api/v1/claims")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testClaimDTO)))
                .andExpect(status().isBadRequest());
    }

    /**
     * Tests concurrent claim operations with Virtual Thread pool.
     */
    @Test
    void testConcurrentClaimOperations() throws Exception {
        var executor = Executors.newVirtualThreadPerTaskExecutor();
        
        try {
            CompletableFuture.allOf(
                CompletableFuture.runAsync(() -> {
                    try {
                        testCreateClaimAsync();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }, executor),
                CompletableFuture.runAsync(() -> {
                    try {
                        testGetClaimAsync();
                    } catch (Exception e) {
                        throw new RuntimeException(e);
                    }
                }, executor)
            ).join();
        } finally {
            executor.close();
        }
    }
}