package com.prcins.umbrella.integration.rmv;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestExecutionListener;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpEntity;
import org.springframework.beans.factory.annotation.Autowired;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.Timeout;
import org.mockito.ArgumentMatchers;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;

import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.List;
import java.util.Arrays;

import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration test class for RMVClient that validates RMV service integration capabilities
 * using Spring Boot Test framework and JUnit Jupiter with Virtual Thread support.
 *
 * @version 2.0.0
 * @since Spring Boot 3.2.x
 */
@SpringBootTest
@ActiveProfiles("test")
@TestExecutionListener(VirtualThreadTestExecutionListener.class)
public class RMVClientTest {

    @Autowired
    private RMVClient rmvClient;

    @MockBean
    private RestTemplate mockRestTemplate;

    @MockBean
    private MeterRegistry meterRegistry;

    private Timer.Sample timerSample;

    @BeforeEach
    void setUp() {
        timerSample = Timer.start(meterRegistry);
        when(meterRegistry.timer(anyString())).thenReturn(mock(Timer.class));
    }

    /**
     * Tests asynchronous driver history retrieval using Virtual Threads.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testGetDriverHistoryAsync() throws Exception {
        // Arrange
        String licenseNumber = "DL123456";
        String state = "MA";
        
        RMVClient.DriverHistoryResponse mockResponse = new RMVClient.DriverHistoryResponse();
        mockResponse.setLicenseNumber(licenseNumber);
        mockResponse.setState(state);
        mockResponse.setStatus("ACTIVE");
        mockResponse.setViolations(Arrays.asList(
            new Violation("2023-01-01", "SPEEDING", "MA"),
            new Violation("2023-02-01", "PARKING", "MA")
        ));

        ResponseEntity<RMVClient.DriverHistoryResponse> responseEntity = 
            new ResponseEntity<>(mockResponse, HttpStatus.OK);

        when(mockRestTemplate.exchange(
            anyString(),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(RMVClient.DriverHistoryResponse.class)
        )).thenReturn(responseEntity);

        // Act
        CompletableFuture<RMVClient.DriverHistoryResponse> future = 
            rmvClient.getDriverHistory(licenseNumber, state);
        RMVClient.DriverHistoryResponse result = future.get(3, TimeUnit.SECONDS);

        // Assert
        assertNotNull(result);
        assertEquals(licenseNumber, result.getLicenseNumber());
        assertEquals(state, result.getState());
        assertEquals("ACTIVE", result.getStatus());
        assertEquals(2, result.getViolations().size());
        
        // Verify metrics
        verify(meterRegistry).timer("rmv.driver.history");
    }

    /**
     * Tests license validation functionality with metrics validation.
     */
    @Test
    @Timeout(value = 3, unit = TimeUnit.SECONDS)
    void testValidateLicenseWithMetrics() throws Exception {
        // Arrange
        String licenseNumber = "DL789012";
        String state = "MA";

        RMVClient.LicenseValidationResponse mockResponse = new RMVClient.LicenseValidationResponse();
        mockResponse.setLicenseNumber(licenseNumber);
        mockResponse.setState(state);
        mockResponse.setValid(true);
        mockResponse.setExpirationDate("2025-12-31");
        mockResponse.setStatus("VALID");

        ResponseEntity<RMVClient.LicenseValidationResponse> responseEntity = 
            new ResponseEntity<>(mockResponse, HttpStatus.OK);

        when(mockRestTemplate.exchange(
            anyString(),
            eq(HttpMethod.POST),
            any(HttpEntity.class),
            eq(RMVClient.LicenseValidationResponse.class)
        )).thenReturn(responseEntity);

        // Act
        CompletableFuture<RMVClient.LicenseValidationResponse> future = 
            rmvClient.validateLicense(licenseNumber, state);
        RMVClient.LicenseValidationResponse result = future.get(2, TimeUnit.SECONDS);

        // Assert
        assertNotNull(result);
        assertTrue(result.isValid());
        assertEquals("2025-12-31", result.getExpirationDate());
        assertEquals("VALID", result.getStatus());

        // Verify metrics
        verify(meterRegistry).timer("rmv.license.validation");
    }

    /**
     * Tests parallel vehicle history retrieval using Virtual Threads.
     */
    @Test
    @Timeout(value = 5, unit = TimeUnit.SECONDS)
    void testGetVehicleHistoryParallel() throws Exception {
        // Arrange
        List<String> vins = Arrays.asList("VIN123", "VIN456", "VIN789");
        
        RMVClient.VehicleHistoryResponse mockResponse = new RMVClient.VehicleHistoryResponse();
        mockResponse.setVin("VIN123");
        mockResponse.setMake("Toyota");
        mockResponse.setModel("Camry");
        mockResponse.setYear("2023");
        mockResponse.setAccidents(Arrays.asList(
            new Accident("2023-03-01", "Minor", "MA")
        ));
        mockResponse.setRegistrations(Arrays.asList(
            new Registration("2023-01-01", "2024-01-01", "MA")
        ));

        ResponseEntity<RMVClient.VehicleHistoryResponse> responseEntity = 
            new ResponseEntity<>(mockResponse, HttpStatus.OK);

        when(mockRestTemplate.exchange(
            anyString(),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(RMVClient.VehicleHistoryResponse.class)
        )).thenReturn(responseEntity);

        // Act
        List<CompletableFuture<RMVClient.VehicleHistoryResponse>> futures = 
            vins.stream()
                .map(vin -> rmvClient.getVehicleHistory(vin))
                .toList();

        List<RMVClient.VehicleHistoryResponse> results = 
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0]))
                .thenApply(v -> futures.stream()
                    .map(CompletableFuture::join)
                    .toList())
                .get(4, TimeUnit.SECONDS);

        // Assert
        assertEquals(3, results.size());
        results.forEach(result -> {
            assertNotNull(result);
            assertNotNull(result.getVin());
            assertNotNull(result.getMake());
            assertNotNull(result.getModel());
            assertFalse(result.getAccidents().isEmpty());
            assertFalse(result.getRegistrations().isEmpty());
        });

        // Verify metrics
        verify(meterRegistry, times(3)).timer("rmv.vehicle.history");
    }

    /**
     * Tests error handling scenarios with metrics validation.
     */
    @Test
    @Timeout(value = 3, unit = TimeUnit.SECONDS)
    void testErrorHandlingWithMetrics() throws Exception {
        // Arrange
        String licenseNumber = "INVALID";
        String state = "XX";

        when(mockRestTemplate.exchange(
            anyString(),
            eq(HttpMethod.GET),
            any(HttpEntity.class),
            eq(RMVClient.DriverHistoryResponse.class)
        )).thenThrow(new RuntimeException("RMV Service Unavailable"));

        // Act & Assert
        CompletableFuture<RMVClient.DriverHistoryResponse> future = 
            rmvClient.getDriverHistory(licenseNumber, state);

        Exception exception = assertThrows(Exception.class, () -> 
            future.get(2, TimeUnit.SECONDS));
        
        assertTrue(exception.getCause() instanceof RuntimeException);
        assertEquals("RMV Service Unavailable", exception.getCause().getMessage());

        // Verify error metrics
        verify(meterRegistry).timer("rmv.driver.history");
        verify(meterRegistry).counter("rmv.errors");
    }
}