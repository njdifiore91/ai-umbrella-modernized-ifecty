package com.prcins.umbrella.integration.rmv;

import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpEntity;
import org.springframework.http.MediaType;
import org.springframework.http.HttpMethod;
import io.micrometer.observation.annotation.Observed;
import java.util.concurrent.CompletableFuture;
import java.util.Map;

/**
 * Client implementation for Registry of Motor Vehicles (RMV) service integration.
 * Leverages Java 21 Virtual Threads and Spring Boot 3.2.x features for enhanced performance
 * in automated risk assessment operations.
 *
 * @version 2.0.0
 * @since Spring Boot 3.2.x
 */
@Service
@Observed(name = "rmv.client")
public class RMVClient {

    private final RestTemplate rmvRestTemplate;
    
    @Value("${rmv.service.url}")
    private String rmvServiceUrl;
    
    @Value("${rmv.api.key}")
    private String rmvApiKey;
    
    @Value("${rmv.timeout.connect:5000}")
    private Integer connectTimeout;
    
    @Value("${rmv.timeout.read:10000}")
    private Integer readTimeout;

    /**
     * Initializes RMV client with Virtual Thread-enabled REST template.
     *
     * @param rmvRestTemplate Configured REST template with Virtual Thread support
     */
    @Autowired
    public RMVClient(RestTemplate rmvRestTemplate) {
        this.rmvRestTemplate = rmvRestTemplate;
    }

    /**
     * Asynchronously retrieves driver history information using Virtual Threads.
     *
     * @param licenseNumber Driver's license number
     * @param state License issuing state
     * @return CompletableFuture containing driver history response
     */
    @Observed(name = "rmv.driver.history", contextualName = "get-driver-history")
    public CompletableFuture<DriverHistoryResponse> getDriverHistory(String licenseNumber, String state) {
        HttpHeaders headers = createHeaders();
        
        String url = String.format("%s/driver/history?license=%s&state=%s", 
            rmvServiceUrl, licenseNumber, state);
            
        return CompletableFuture.supplyAsync(() -> 
            rmvRestTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                DriverHistoryResponse.class
            ).getBody()
        );
    }

    /**
     * Asynchronously validates driver's license status using Virtual Threads.
     *
     * @param licenseNumber Driver's license number
     * @param state License issuing state
     * @return CompletableFuture containing license validation response
     */
    @Observed(name = "rmv.license.validation", contextualName = "validate-license")
    public CompletableFuture<LicenseValidationResponse> validateLicense(String licenseNumber, String state) {
        HttpHeaders headers = createHeaders();
        
        Map<String, String> requestBody = Map.of(
            "licenseNumber", licenseNumber,
            "state", state
        );

        return CompletableFuture.supplyAsync(() ->
            rmvRestTemplate.exchange(
                rmvServiceUrl + "/license/validate",
                HttpMethod.POST,
                new HttpEntity<>(requestBody, headers),
                LicenseValidationResponse.class
            ).getBody()
        );
    }

    /**
     * Asynchronously retrieves vehicle history information using Virtual Threads.
     *
     * @param vin Vehicle Identification Number
     * @return CompletableFuture containing vehicle history response
     */
    @Observed(name = "rmv.vehicle.history", contextualName = "get-vehicle-history")
    public CompletableFuture<VehicleHistoryResponse> getVehicleHistory(String vin) {
        HttpHeaders headers = createHeaders();
        
        String url = String.format("%s/vehicle/history?vin=%s", rmvServiceUrl, vin);
        
        return CompletableFuture.supplyAsync(() ->
            rmvRestTemplate.exchange(
                url,
                HttpMethod.GET,
                new HttpEntity<>(headers),
                VehicleHistoryResponse.class
            ).getBody()
        );
    }

    /**
     * Creates HTTP headers with API key and content type.
     *
     * @return Configured HTTP headers
     */
    private HttpHeaders createHeaders() {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-API-Key", rmvApiKey);
        return headers;
    }

    /**
     * Response class for driver history information.
     */
    public static class DriverHistoryResponse {
        private String licenseNumber;
        private String state;
        private String status;
        private List<Violation> violations;
        // Getters and setters omitted for brevity
    }

    /**
     * Response class for license validation.
     */
    public static class LicenseValidationResponse {
        private String licenseNumber;
        private String state;
        private boolean valid;
        private String expirationDate;
        private String status;
        // Getters and setters omitted for brevity
    }

    /**
     * Response class for vehicle history information.
     */
    public static class VehicleHistoryResponse {
        private String vin;
        private String make;
        private String model;
        private String year;
        private List<Accident> accidents;
        private List<Registration> registrations;
        // Getters and setters omitted for brevity
    }
}