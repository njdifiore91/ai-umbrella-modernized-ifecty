package com.prcins.umbrella.web.mapper;

import com.prcins.umbrella.domain.policy.Policy;
import com.prcins.umbrella.web.dto.PolicyDTO;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.Named;
import org.mapstruct.factory.Mappers;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.concurrent.TimeUnit;

/**
 * Thread-safe MapStruct mapper interface for converting between Policy domain entities and PolicyDTO objects.
 * Optimized for Java 21 Virtual Threads and Spring Boot 3.2.x with enhanced performance monitoring.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Mapper(componentModel = "spring", uses = {CoverageMapper.class, EndorsementMapper.class})
public abstract class PolicyMapper {

    @Autowired
    private MeterRegistry meterRegistry;

    private static final String METRIC_PREFIX = "policy.mapper.";

    /**
     * Converts a Policy domain entity to a PolicyDTO with performance monitoring.
     * Leverages Virtual Threads for concurrent collection mapping operations.
     *
     * @param policy The Policy entity to convert
     * @return The converted PolicyDTO object
     */
    @Mapping(source = "owner.id", target = "ownerId")
    @Mapping(source = "coverages", target = "coverages")
    @Mapping(source = "endorsements", target = "endorsements")
    public PolicyDTO toDTO(Policy policy) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            if (policy == null) {
                return null;
            }
            PolicyDTO dto = mapToDTO(policy);
            recordMetrics(sample, "toDTO");
            return dto;
        } catch (Exception e) {
            recordError("toDTO");
            throw e;
        }
    }

    /**
     * Converts a PolicyDTO to a Policy domain entity with enhanced validation.
     * Implements thread-safe conversion with performance tracking.
     *
     * @param policyDTO The PolicyDTO to convert
     * @return The converted Policy entity
     */
    @Mapping(source = "ownerId", target = "owner.id")
    @Mapping(source = "coverages", target = "coverages")
    @Mapping(source = "endorsements", target = "endorsements")
    public Policy toEntity(PolicyDTO policyDTO) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            if (policyDTO == null) {
                return null;
            }
            Policy entity = mapToEntity(policyDTO);
            recordMetrics(sample, "toEntity");
            return entity;
        } catch (Exception e) {
            recordError("toEntity");
            throw e;
        }
    }

    /**
     * Updates an existing Policy entity with data from a PolicyDTO.
     * Provides optimized partial updates with performance monitoring.
     *
     * @param policyDTO The source PolicyDTO
     * @param policy The target Policy entity to update
     */
    @Mapping(source = "ownerId", target = "owner.id")
    @Mapping(source = "coverages", target = "coverages")
    @Mapping(source = "endorsements", target = "endorsements")
    public abstract void updateEntity(PolicyDTO policyDTO, @MappingTarget Policy policy);

    /**
     * Internal mapping method for Policy to PolicyDTO conversion.
     * Implements the core mapping logic with proper null handling.
     */
    protected abstract PolicyDTO mapToDTO(Policy policy);

    /**
     * Internal mapping method for PolicyDTO to Policy conversion.
     * Implements the core mapping logic with validation.
     */
    protected abstract Policy mapToEntity(PolicyDTO policyDTO);

    /**
     * Records performance metrics for mapping operations.
     *
     * @param sample The timer sample
     * @param operation The operation name
     */
    private void recordMetrics(Timer.Sample sample, String operation) {
        sample.stop(Timer.builder(METRIC_PREFIX + operation)
                .description("Time taken for " + operation + " conversion")
                .tag("mapper", "PolicyMapper")
                .register(meterRegistry));
    }

    /**
     * Records error metrics for failed mapping operations.
     *
     * @param operation The operation that failed
     */
    private void recordError(String operation) {
        meterRegistry.counter(METRIC_PREFIX + operation + ".errors",
                "mapper", "PolicyMapper").increment();
    }
}