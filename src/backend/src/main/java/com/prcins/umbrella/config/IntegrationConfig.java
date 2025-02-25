package com.prcins.umbrella.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import java.net.http.HttpClient;

/**
 * Configuration class for external service integrations leveraging Spring Boot 3.2.x features
 * and Java 21 Virtual Thread support. Provides centralized REST client configuration for:
 * - CLUE Property service
 * - PolicySTAR Export service
 * - RMV (Registry of Motor Vehicles) service
 * - SpeedPay service
 *
 * @version 2.0.0
 * @since Spring Boot 3.2.x
 */
@Configuration(proxyBeanMethods = false)
public class IntegrationConfig {

    @Value("${clue.connect.timeout:5000}")
    private int clueConnectTimeout;

    @Value("${clue.read.timeout:10000}")
    private int clueReadTimeout;

    @Value("${policystar.connect.timeout:5000}")
    private int policystarConnectTimeout;

    @Value("${policystar.read.timeout:15000}")
    private int policystarReadTimeout;

    @Value("${rmv.connect.timeout:5000}")
    private int rmvConnectTimeout;

    @Value("${rmv.read.timeout:10000}")
    private int rmvReadTimeout;

    @Value("${speedpay.connect.timeout:5000}")
    private int speedpayConnectTimeout;

    @Value("${speedpay.read.timeout:10000}")
    private int speedpayReadTimeout;

    /**
     * Configures REST template for CLUE Property service with Virtual Thread support
     * and Spring Boot Actuator metrics integration.
     *
     * @return RestTemplate Configured REST template for CLUE Property service
     */
    @Bean
    public RestTemplate clueRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(clueConnectTimeout);
        factory.setReadTimeout(clueReadTimeout);
        
        // Configure Virtual Thread executor using Java 21 HttpClient
        HttpClient httpClient = HttpClient.newBuilder()
            .executor(Thread.ofVirtual().factory())
            .build();
        factory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(factory);
        
        // Enable Spring Boot Actuator metrics collection
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("X-Service", "CLUE");
            return execution.execute(request, body);
        });

        return restTemplate;
    }

    /**
     * Configures REST template for PolicySTAR Export service with Virtual Thread support
     * and Spring Boot Actuator metrics integration.
     *
     * @return RestTemplate Configured REST template for PolicySTAR service
     */
    @Bean
    public RestTemplate policyStarRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(policystarConnectTimeout);
        factory.setReadTimeout(policystarReadTimeout);
        
        // Configure Virtual Thread executor using Java 21 HttpClient
        HttpClient httpClient = HttpClient.newBuilder()
            .executor(Thread.ofVirtual().factory())
            .build();
        factory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(factory);
        
        // Enable Spring Boot Actuator metrics collection
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("X-Service", "PolicySTAR");
            return execution.execute(request, body);
        });

        return restTemplate;
    }

    /**
     * Configures REST template for RMV service with Virtual Thread support
     * and Spring Boot Actuator metrics integration.
     *
     * @return RestTemplate Configured REST template for RMV service
     */
    @Bean
    public RestTemplate rmvRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(rmvConnectTimeout);
        factory.setReadTimeout(rmvReadTimeout);
        
        // Configure Virtual Thread executor using Java 21 HttpClient
        HttpClient httpClient = HttpClient.newBuilder()
            .executor(Thread.ofVirtual().factory())
            .build();
        factory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(factory);
        
        // Enable Spring Boot Actuator metrics collection
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("X-Service", "RMV");
            return execution.execute(request, body);
        });

        return restTemplate;
    }

    /**
     * Configures REST template for SpeedPay service with Virtual Thread support
     * and Spring Boot Actuator metrics integration.
     *
     * @return RestTemplate Configured REST template for SpeedPay service
     */
    @Bean
    public RestTemplate speedPayRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(speedpayConnectTimeout);
        factory.setReadTimeout(speedpayReadTimeout);
        
        // Configure Virtual Thread executor using Java 21 HttpClient
        HttpClient httpClient = HttpClient.newBuilder()
            .executor(Thread.ofVirtual().factory())
            .build();
        factory.setHttpClient(httpClient);

        RestTemplate restTemplate = new RestTemplate(factory);
        
        // Enable Spring Boot Actuator metrics collection
        restTemplate.getInterceptors().add((request, body, execution) -> {
            request.getHeaders().add("X-Service", "SpeedPay");
            return execution.execute(request, body);
        });

        return restTemplate;
    }
}