package com.prcins.umbrella.integration.speedpay;

import com.prcins.umbrella.domain.claims.Payment;
import io.micrometer.core.annotation.Timed;
import io.micrometer.core.instrument.MeterRegistry;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.client.circuitbreaker.CircuitBreakerFactory;
import org.springframework.context.annotation.Scope;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executors;

/**
 * Thread-safe client implementation for SpeedPay payment processing service.
 * Leverages Spring Boot 3.2.x features and Java 21 Virtual Threads for improved performance.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Service
@Scope("singleton")
@ConditionalOnProperty(name = "speedpay.enabled", havingValue = "true")
public class SpeedPayClient {

    private final RestTemplate restTemplate;
    private final MeterRegistry meterRegistry;
    private final CircuitBreaker circuitBreaker;

    @Value("${speedpay.api.url}")
    private String speedPayApiUrl;

    @Value("${speedpay.api.key}")
    private String speedPayApiKey;

    @Value("${speedpay.timeout:30000}")
    private Integer speedPayTimeout;

    @Value("${speedpay.retry.attempts:3}")
    private Integer speedPayRetryAttempts;

    @Value("${speedpay.circuit-breaker.threshold:50}")
    private Integer speedPayCircuitBreakerThreshold;

    /**
     * Constructs SpeedPayClient with required dependencies.
     *
     * @param restTemplate RestTemplate configured with Virtual Thread executor
     * @param meterRegistry Metrics registry for monitoring
     * @param circuitBreakerFactory Circuit breaker factory for fault tolerance
     */
    public SpeedPayClient(RestTemplate restTemplate, 
                         MeterRegistry meterRegistry,
                         CircuitBreakerFactory circuitBreakerFactory) {
        this.restTemplate = Objects.requireNonNull(restTemplate, "RestTemplate cannot be null");
        this.meterRegistry = Objects.requireNonNull(meterRegistry, "MeterRegistry cannot be null");
        this.circuitBreaker = circuitBreakerFactory.create("speedpay");
    }

    @PostConstruct
    public void initialize() {
        // Register custom metrics
        meterRegistry.gauge("speedpay.circuit_breaker.state", circuitBreaker, this::getCircuitBreakerState);
        meterRegistry.counter("speedpay.requests.total");
        meterRegistry.timer("speedpay.request.duration");
    }

    /**
     * Processes a payment transaction through SpeedPay service using Virtual Threads.
     *
     * @param payment Payment details to process
     * @return ResponseEntity containing transaction status and details
     */
    @Timed(value = "speedpay.payment.process", description = "Time taken to process payment")
    public CompletableFuture<ResponseEntity<PaymentResponse>> processPayment(Payment payment) {
        Objects.requireNonNull(payment, "Payment cannot be null");
        validatePayment(payment);

        return CompletableFuture.supplyAsync(() -> {
            HttpHeaders headers = createHeaders();
            PaymentRequest request = createPaymentRequest(payment);

            return circuitBreaker.run(() -> 
                restTemplate.postForEntity(
                    speedPayApiUrl + "/process",
                    request,
                    PaymentResponse.class
                ),
                throwable -> handlePaymentFailure(payment, throwable)
            );
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Validates a payment transaction status with SpeedPay using non-blocking operations.
     *
     * @param transactionId Transaction ID to validate
     * @return ResponseEntity containing validation status
     */
    @Timed(value = "speedpay.payment.validate")
    public CompletableFuture<ResponseEntity<ValidationResponse>> validatePayment(String transactionId) {
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");

        return CompletableFuture.supplyAsync(() -> {
            HttpHeaders headers = createHeaders();
            Map<String, String> request = Map.of("transactionId", transactionId);

            return circuitBreaker.run(() ->
                restTemplate.postForEntity(
                    speedPayApiUrl + "/validate",
                    request,
                    ValidationResponse.class
                ),
                throwable -> handleValidationFailure(transactionId, throwable)
            );
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    /**
     * Initiates a refund for a previously processed payment with enhanced error handling.
     *
     * @param transactionId Original transaction ID
     * @param amount Refund amount
     * @return ResponseEntity containing refund status
     */
    @Timed(value = "speedpay.payment.refund")
    public CompletableFuture<ResponseEntity<RefundResponse>> refundPayment(String transactionId, BigDecimal amount) {
        Objects.requireNonNull(transactionId, "Transaction ID cannot be null");
        Objects.requireNonNull(amount, "Refund amount cannot be null");

        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Refund amount must be positive");
        }

        return CompletableFuture.supplyAsync(() -> {
            HttpHeaders headers = createHeaders();
            RefundRequest request = new RefundRequest(transactionId, amount);

            return circuitBreaker.run(() ->
                restTemplate.postForEntity(
                    speedPayApiUrl + "/refund",
                    request,
                    RefundResponse.class
                ),
                throwable -> handleRefundFailure(transactionId, amount, throwable)
            );
        }, Executors.newVirtualThreadPerTaskExecutor());
    }

    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", speedPayApiKey);
        headers.set("X-Request-ID", generateRequestId());
        return headers;
    }

    private PaymentRequest createPaymentRequest(Payment payment) {
        return PaymentRequest.builder()
            .transactionId(payment.getTransactionId())
            .amount(payment.getAmount())
            .currency("USD")
            .description("Insurance claim payment")
            .build();
    }

    private void validatePayment(Payment payment) {
        if (payment.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be positive");
        }
        if (payment.getTransactionId() == null || payment.getTransactionId().trim().isEmpty()) {
            throw new IllegalArgumentException("Transaction ID is required");
        }
    }

    private ResponseEntity<PaymentResponse> handlePaymentFailure(Payment payment, Throwable throwable) {
        meterRegistry.counter("speedpay.payment.failures").increment();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(PaymentResponse.builder()
                .success(false)
                .error("Payment processing failed: " + throwable.getMessage())
                .transactionId(payment.getTransactionId())
                .build());
    }

    private ResponseEntity<ValidationResponse> handleValidationFailure(String transactionId, Throwable throwable) {
        meterRegistry.counter("speedpay.validation.failures").increment();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(ValidationResponse.builder()
                .success(false)
                .error("Validation failed: " + throwable.getMessage())
                .transactionId(transactionId)
                .build());
    }

    private ResponseEntity<RefundResponse> handleRefundFailure(String transactionId, BigDecimal amount, Throwable throwable) {
        meterRegistry.counter("speedpay.refund.failures").increment();
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body(RefundResponse.builder()
                .success(false)
                .error("Refund failed: " + throwable.getMessage())
                .transactionId(transactionId)
                .amount(amount)
                .build());
    }

    private String generateRequestId() {
        return "REQ-" + System.currentTimeMillis();
    }

    private int getCircuitBreakerState() {
        return circuitBreaker.getState().equals(CircuitBreaker.State.OPEN) ? 0 : 1;
    }
}