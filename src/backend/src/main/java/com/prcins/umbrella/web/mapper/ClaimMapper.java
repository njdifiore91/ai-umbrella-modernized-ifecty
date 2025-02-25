package com.prcins.umbrella.web.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValuePropertyMappingStrategy;
import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.prcins.umbrella.domain.claims.Claim;
import com.prcins.umbrella.web.dto.ClaimDTO;

/**
 * Thread-safe MapStruct mapper interface for converting between Claim entities and ClaimDTO objects.
 * Optimized for Spring Boot 3.2.x with Jakarta EE validation support.
 * Provides high-performance, null-safe mapping operations with comprehensive validation.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
@Mapper(
    componentModel = "spring",
    nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
)
public interface ClaimMapper {

    /**
     * Converts a Claim entity to a ClaimDTO with enhanced validation and null safety.
     * Maps all relevant fields while preserving data integrity and applying business rules.
     *
     * @param claim The Claim entity to convert
     * @return The converted ClaimDTO with validated data
     * @throws IllegalArgumentException if claim is null or invalid
     */
    @Mapping(
        source = "policy.id",
        target = "policyId",
        nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE
    )
    @Valid
    ClaimDTO toDTO(@Valid Claim claim);

    /**
     * Converts a ClaimDTO to a Claim entity with comprehensive validation.
     * Ensures data integrity and business rule compliance during conversion.
     *
     * @param claimDTO The ClaimDTO to convert
     * @return The converted Claim entity with validated data
     * @throws IllegalArgumentException if claimDTO is null or invalid
     */
    @Valid
    Claim toEntity(@Valid ClaimDTO claimDTO);

    /**
     * Default value mapping for null BigDecimal fields.
     * Ensures proper handling of null monetary values.
     *
     * @param value The value to check
     * @return BigDecimal.ZERO if value is null, otherwise the original value
     */
    default BigDecimal mapBigDecimal(BigDecimal value) {
        return value != null ? value : BigDecimal.ZERO;
    }

    /**
     * Default value mapping for null LocalDateTime fields.
     * Ensures proper handling of null temporal values.
     *
     * @param value The value to check
     * @return Current timestamp if value is null, otherwise the original value
     */
    default LocalDateTime mapLocalDateTime(LocalDateTime value) {
        return value != null ? value : LocalDateTime.now();
    }

    /**
     * Default value mapping for null String fields.
     * Ensures proper handling of null string values.
     *
     * @param value The value to check
     * @return Empty string if value is null, otherwise the original value
     */
    default String mapString(String value) {
        return value != null ? value : "";
    }
}