package com.prcins.umbrella;

import com.prcins.umbrella.config.AsyncConfig;
import com.prcins.umbrella.config.SecurityConfig;
import com.prcins.umbrella.config.WebConfig;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.embedded.tomcat.TomcatProtocolHandlerCustomizer;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;
import org.springframework.core.task.AsyncTaskExecutor;
import org.springframework.scheduling.annotation.EnableAsync;

import java.util.concurrent.Executors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

/**
 * Main Spring Boot application class that bootstraps the Umbrella Insurance application.
 * Leverages Spring Boot 3.2.x with Jakarta EE standards and Java 21's Virtual Thread capabilities
 * for enhanced performance and modern cloud-ready deployment.
 *
 * @version 2.1.0
 * @since Spring Boot 3.2.1
 */
@SpringBootApplication(
    scanBasePackages = "com.prcins.umbrella"
)
@EnableCaching
@EnableAsync
public class UmbrellaApplication {

    private static final Logger logger = LoggerFactory.getLogger(UmbrellaApplication.class);

    /**
     * Application entry point that bootstraps the Spring Boot application with modern features
     * and optimizations including Virtual Thread support and embedded Tomcat configuration.
     *
     * @param args command line arguments
     */
    public static void main(String[] args) {
        try {
            // Configure application startup with enhanced logging
            logger.info("Starting Umbrella Insurance Application with Java 21 and Spring Boot 3.2.x");
            
            // Initialize Spring application context
            SpringApplication.run(UmbrellaApplication.class, args);
            
            logger.info("Umbrella Insurance Application started successfully");
        } catch (Exception e) {
            logger.error("Failed to start Umbrella Insurance Application", e);
            throw e;
        }
    }

    /**
     * Configures Tomcat to use Virtual Threads for request processing.
     * Leverages Java 21's Virtual Thread capabilities for improved performance
     * under high concurrent loads.
     *
     * @return TomcatProtocolHandlerCustomizer configured for Virtual Threads
     */
    @Bean
    public TomcatProtocolHandlerCustomizer<?> protocolHandlerVirtualThreadExecutorCustomizer() {
        return protocolHandler -> {
            logger.info("Configuring Tomcat 10.1.18 with Virtual Thread support");
            protocolHandler.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        };
    }

    /**
     * Configures the async executor with Virtual Thread support for @Async operations.
     * Provides enhanced performance for asynchronous processing through lightweight
     * thread management.
     *
     * @param asyncConfig the async configuration
     * @return AsyncTaskExecutor configured with Virtual Threads
     */
    @Bean
    public AsyncTaskExecutor asyncTaskExecutor(AsyncConfig asyncConfig) {
        logger.info("Initializing Virtual Thread-based async task executor");
        return asyncConfig.getAsyncExecutor();
    }
}