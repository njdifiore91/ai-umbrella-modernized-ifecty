package com.prcins.umbrella.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Bean;
import org.springframework.beans.factory.annotation.Value;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.simple.SimpleMeterRegistry;
import org.springframework.boot.actuate.health.HealthIndicator;
import org.springframework.boot.actuate.health.Health;

/**
 * Configuration class for application metrics and monitoring using Spring Boot Actuator.
 * Provides metrics collection, health indicators and monitoring endpoints optimized for
 * containerized environments and Virtual Thread monitoring in Java 21.
 *
 * @since 3.2.1
 */
@Configuration
public class MetricsConfig {

    // Spring Boot Actuator 3.2.1
    private final boolean metricsEnabled;
    private final long metricsExportInterval;
    private final boolean virtualThreadMetricsEnabled;

    /**
     * Initializes metrics configuration with environment-specific properties.
     *
     * @param metricsEnabled Flag to enable/disable metrics collection
     * @param metricsExportInterval Interval in seconds for metrics export
     * @param virtualThreadMetricsEnabled Flag to enable Virtual Thread monitoring
     */
    public MetricsConfig(
            @Value("${metrics.enabled:true}") boolean metricsEnabled,
            @Value("${metrics.export.interval:60}") long metricsExportInterval,
            @Value("${metrics.virtual.threads.enabled:true}") boolean virtualThreadMetricsEnabled) {
        this.metricsEnabled = metricsEnabled;
        this.metricsExportInterval = metricsExportInterval;
        this.virtualThreadMetricsEnabled = virtualThreadMetricsEnabled;
    }

    /**
     * Configures and provides the primary MeterRegistry for metrics collection.
     * Includes Virtual Thread monitoring capabilities when enabled.
     *
     * @return Configured MeterRegistry instance
     */
    @Bean
    public MeterRegistry meterRegistry() {
        SimpleMeterRegistry registry = new SimpleMeterRegistry();

        // Configure common tags for container environment
        registry.config()
                .commonTags("application", "umbrella")
                .commonTags("container.id", System.getenv().getOrDefault("HOSTNAME", "unknown"));

        // Configure Virtual Thread metrics if enabled
        if (virtualThreadMetricsEnabled) {
            registry.gauge("jvm.threads.virtual.active", 
                Thread.activeVirtualThreadCount());
            registry.gauge("jvm.threads.virtual.mounted", 
                Thread.getMountedVirtualThreadCount());
        }

        // Configure metric naming convention and base units
        registry.config()
                .namingConvention()
                .name("umbrella")
                .baseUnit("milliseconds");

        return registry;
    }

    /**
     * Provides custom health indicator for application-specific health checks.
     * Implements container-aware health monitoring including Virtual Thread status.
     *
     * @return Container-aware HealthIndicator implementation
     */
    @Bean
    public HealthIndicator customHealthIndicator() {
        return () -> {
            Health.Builder health = new Health.Builder();

            try {
                // Basic health checks
                health.withDetail("metrics.enabled", metricsEnabled)
                     .withDetail("metrics.export.interval", metricsExportInterval);

                // Virtual Thread monitoring if enabled
                if (virtualThreadMetricsEnabled) {
                    health.withDetail("virtual.threads.active", Thread.activeVirtualThreadCount())
                         .withDetail("virtual.threads.mounted", Thread.getMountedVirtualThreadCount());
                }

                // Container environment checks
                health.withDetail("container.id", System.getenv().getOrDefault("HOSTNAME", "unknown"))
                     .withDetail("container.memory.max", Runtime.getRuntime().maxMemory())
                     .withDetail("container.memory.free", Runtime.getRuntime().freeMemory());

                return health.status(Health.Status.UP).build();

            } catch (Exception e) {
                return health.status(Health.Status.DOWN)
                           .withException(e)
                           .build();
            }
        };
    }
}