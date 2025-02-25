package com.prcins.umbrella.integration.speedpay;

import com.prcins.umbrella.domain.claims.Payment;
import io.micrometer.core.instrument.MeterRegistry;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestInstance;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * Test class for SpeedPay integration client with Virtual Thread support.
 * Verifies payment processing integration with SpeedPay service.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@ActiveProfiles("test")
@TestInstance(TestInstance.Lifecycle.PER_CLASS)
@ExtendWith(SpringExtension.class)
public class SpeedPayClientTest {

    private static final String MOCK_TRANSACTION_ID = "TEST-TRANS-001";
    private static final BigDecimal MOCK_PAYMENT_AMOUNT = new BigDecimal("100.00");
    private static final String SPEEDPAY_API_URL = "http://test.speedpay.api";
    private static final String SPEEDPAY_API_KEY = "test-api-key";

    @Autowired
    private SpeedPayClient speedPayClient;

    @MockBean
    private RestTemplate restTemplate;

    @MockBean
    private MeterRegistry meterRegistry;

    @MockBean
    private CircuitBreakerFactory circuitBreakerFactory;

    @MockBean
    private CircuitBreaker circuitBreaker;

    private Payment testPayment;

    /**
     * Test setup method initializing mocks and test data with Virtual Thread configuration.
     */
    @BeforeEach
    void setUp() {
        // Configure circuit breaker mock
        when(circuitBreakerFactory.create(anyString())).thenReturn(circuitBreaker);
        when(circuitBreaker.run(any(), any())).thenAnswer(invocation -> {
            Runnable runnable = invocation.getArgument(0);
            return runnable.run();
        });

        // Initialize test payment data
        testPayment = new Payment();
        testPayment.setTransactionId(MOCK_TRANSACTION_ID);
        testPayment.setAmount(MOCK_PAYMENT_AMOUNT);

        // Configure metrics
        when(meterRegistry.counter(anyString())).thenReturn(mock(Counter.class));
        when(meterRegistry.timer(anyString())).thenReturn(mock(Timer.class));
    }

    /**
     * Tests successful payment processing through SpeedPay with Virtual Thread execution.
     */
    @Test
    void testProcessPayment_Success() throws ExecutionException, InterruptedException, TimeoutException {
        // Prepare mock response
        PaymentResponse mockResponse = PaymentResponse.builder()
            .success(true)
            .transactionId(MOCK_TRANSACTION_ID)
            .build();
        ResponseEntity<PaymentResponse> mockResponseEntity = new ResponseEntity<>(mockResponse, HttpStatus.OK);
        
        when(restTemplate.postForEntity(
            eq(SPEEDPAY_API_URL + "/process"),
            any(PaymentRequest.class),
            eq(PaymentResponse.class)
        )).thenReturn(mockResponseEntity);

        // Execute payment processing with Virtual Thread
        CompletableFuture<ResponseEntity<PaymentResponse>> future = speedPayClient.processPayment(testPayment);
        ResponseEntity<PaymentResponse> response = future.get(5, TimeUnit.SECONDS);

        // Verify response
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(MOCK_TRANSACTION_ID, response.getBody().getTransactionId());

        // Verify REST template interaction
        verify(restTemplate).postForEntity(
            eq(SPEEDPAY_API_URL + "/process"),
            any(PaymentRequest.class),
            eq(PaymentResponse.class)
        );
    }

    /**
     * Tests concurrent payment processing using Virtual Threads.
     */
    @Test
    void testProcessPayment_ConcurrentExecution() throws ExecutionException, InterruptedException {
        // Prepare mock response
        PaymentResponse mockResponse = PaymentResponse.builder()
            .success(true)
            .transactionId(MOCK_TRANSACTION_ID)
            .build();
        ResponseEntity<PaymentResponse> mockResponseEntity = new ResponseEntity<>(mockResponse, HttpStatus.OK);
        
        when(restTemplate.postForEntity(
            eq(SPEEDPAY_API_URL + "/process"),
            any(PaymentRequest.class),
            eq(PaymentResponse.class)
        )).thenReturn(mockResponseEntity);

        // Execute multiple concurrent payments
        int concurrentPayments = 10;
        CompletableFuture<ResponseEntity<PaymentResponse>>[] futures = new CompletableFuture[concurrentPayments];

        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            for (int i = 0; i < concurrentPayments; i++) {
                Payment payment = new Payment();
                payment.setTransactionId(MOCK_TRANSACTION_ID + "-" + i);
                payment.setAmount(MOCK_PAYMENT_AMOUNT);
                futures[i] = speedPayClient.processPayment(payment);
            }
        }

        // Wait for all payments to complete
        CompletableFuture.allOf(futures).join();

        // Verify all payments were successful
        for (CompletableFuture<ResponseEntity<PaymentResponse>> future : futures) {
            ResponseEntity<PaymentResponse> response = future.get();
            assertNotNull(response);
            assertEquals(HttpStatus.OK, response.getStatusCode());
            assertTrue(response.getBody().isSuccess());
        }

        // Verify REST template was called correct number of times
        verify(restTemplate, times(concurrentPayments)).postForEntity(
            eq(SPEEDPAY_API_URL + "/process"),
            any(PaymentRequest.class),
            eq(PaymentResponse.class)
        );
    }

    /**
     * Tests payment validation with thread safety considerations.
     */
    @Test
    void testValidatePayment() throws ExecutionException, InterruptedException, TimeoutException {
        // Prepare mock response
        ValidationResponse mockResponse = ValidationResponse.builder()
            .success(true)
            .transactionId(MOCK_TRANSACTION_ID)
            .build();
        ResponseEntity<ValidationResponse> mockResponseEntity = new ResponseEntity<>(mockResponse, HttpStatus.OK);
        
        when(restTemplate.postForEntity(
            eq(SPEEDPAY_API_URL + "/validate"),
            any(Map.class),
            eq(ValidationResponse.class)
        )).thenReturn(mockResponseEntity);

        // Execute validation with Virtual Thread
        CompletableFuture<ResponseEntity<ValidationResponse>> future = speedPayClient.validatePayment(MOCK_TRANSACTION_ID);
        ResponseEntity<ValidationResponse> response = future.get(5, TimeUnit.SECONDS);

        // Verify response
        assertNotNull(response);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isSuccess());
        assertEquals(MOCK_TRANSACTION_ID, response.getBody().getTransactionId());

        // Verify request headers
        ArgumentCaptor<Map<String, String>> requestCaptor = ArgumentCaptor.forClass(Map.class);
        verify(restTemplate).postForEntity(
            eq(SPEEDPAY_API_URL + "/validate"),
            requestCaptor.capture(),
            eq(ValidationResponse.class)
        );
        assertEquals(MOCK_TRANSACTION_ID, requestCaptor.getValue().get("transactionId"));
    }

    /**
     * Tests error handling during payment processing.
     */
    @Test
    void testProcessPayment_Error() throws ExecutionException, InterruptedException {
        // Configure circuit breaker to simulate error
        when(circuitBreaker.run(any(), any())).thenAnswer(invocation -> {
            throw new RuntimeException("Payment processing failed");
        });

        // Execute payment processing
        CompletableFuture<ResponseEntity<PaymentResponse>> future = speedPayClient.processPayment(testPayment);
        ResponseEntity<PaymentResponse> response = future.get();

        // Verify error response
        assertNotNull(response);
        assertEquals(HttpStatus.SERVICE_UNAVAILABLE, response.getStatusCode());
        assertFalse(response.getBody().isSuccess());
        assertTrue(response.getBody().getError().contains("Payment processing failed"));

        // Verify error metrics
        verify(meterRegistry.counter("speedpay.payment.failures")).increment();
    }
}