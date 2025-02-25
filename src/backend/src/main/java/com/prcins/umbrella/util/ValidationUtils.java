package com.prcins.umbrella.util;

import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import jakarta.validation.Validation;
import jakarta.validation.ConstraintViolation;
import java.util.Set;
import java.util.Objects;

import com.prcins.umbrella.exception.BusinessException;
import com.prcins.umbrella.domain.policy.Policy;

/**
 * Thread-safe utility class providing enterprise-grade validation methods using Jakarta Validation framework.
 * Implements comprehensive validation rules for domain objects with optimized performance for container environments.
 *
 * @version 2.0
 * @since Spring Boot 3.2.x
 */
public final class ValidationUtils {

    // Thread-safe validator factory initialized lazily
    private static volatile ValidatorFactory validatorFactory;
    private static volatile Validator validator;

    // Error codes for validation failures
    private static final String ERROR_NULL_VALUE = "VAL-001";
    private static final String ERROR_EMPTY_STRING = "VAL-002";
    private static final String ERROR_POLICY_VALIDATION = "VAL-003";
    private static final String ERROR_BEAN_VALIDATION = "VAL-004";

    /**
     * Private constructor to prevent instantiation
     */
    private ValidationUtils() {
        throw new AssertionError("ValidationUtils is a utility class and should not be instantiated");
    }

    /**
     * Thread-safe initialization of validator
     */
    private static Validator getValidator() {
        if (validator == null) {
            synchronized (ValidationUtils.class) {
                if (validator == null) {
                    validatorFactory = Validation.buildDefaultValidatorFactory();
                    validator = validatorFactory.getValidator();
                }
            }
        }
        return validator;
    }

    /**
     * Thread-safe method that validates object non-nullity with optimized performance.
     *
     * @param value The object to validate
     * @param fieldName The name of the field being validated
     * @throws BusinessException if validation fails
     */
    public static void validateNotNull(Object value, String fieldName) {
        try {
            Objects.requireNonNull(value, 
                String.format("Field '%s' cannot be null", fieldName));
        } catch (NullPointerException e) {
            throw new BusinessException(ERROR_NULL_VALUE, 
                String.format("Validation failed: Field '%s' cannot be null", fieldName));
        }
    }

    /**
     * Validates string non-emptiness with performance optimization for container environments.
     *
     * @param value The string to validate
     * @param fieldName The name of the field being validated
     * @throws BusinessException if validation fails
     */
    public static void validateStringNotEmpty(String value, String fieldName) {
        validateNotNull(value, fieldName);
        
        if (value.trim().isEmpty()) {
            throw new BusinessException(ERROR_EMPTY_STRING,
                String.format("Validation failed: Field '%s' cannot be empty", fieldName));
        }
    }

    /**
     * Comprehensive policy validation using Jakarta Validation framework.
     * Validates policy data against business rules and constraints.
     *
     * @param policy The policy to validate
     * @throws BusinessException if validation fails
     */
    public static void validatePolicy(Policy policy) {
        validateNotNull(policy, "Policy");

        // Validate policy number format and uniqueness
        validateStringNotEmpty(policy.getPolicyNumber(), "Policy Number");

        // Validate policy dates
        if (!DateUtils.validatePolicyDates(policy.getEffectiveDate(), policy.getExpiryDate())) {
            throw new BusinessException(ERROR_POLICY_VALIDATION,
                "Invalid policy dates: Effective date must be in the future and expiry date must be within one year");
        }

        // Perform bean validation
        Set<ConstraintViolation<Policy>> violations = getValidator().validate(policy);
        if (!violations.isEmpty()) {
            StringBuilder errorMessage = new StringBuilder("Policy validation failed:");
            violations.forEach(violation -> 
                errorMessage.append("\n- ")
                          .append(violation.getPropertyPath())
                          .append(": ")
                          .append(violation.getMessage()));
            
            throw new BusinessException(ERROR_POLICY_VALIDATION, errorMessage.toString());
        }
    }

    /**
     * Generic bean validation using Jakarta Validation with performance optimization.
     * Provides detailed validation context for container environments.
     *
     * @param bean The bean to validate
     * @throws BusinessException if validation fails
     */
    public static void validateBeanConstraints(Object bean) {
        validateNotNull(bean, "Bean");

        Set<ConstraintViolation<Object>> violations = getValidator().validate(bean);
        if (!violations.isEmpty()) {
            StringBuilder errorMessage = new StringBuilder("Bean validation failed:");
            violations.forEach(violation -> 
                errorMessage.append("\n- ")
                          .append(violation.getPropertyPath())
                          .append(": ")
                          .append(violation.getMessage()));
            
            throw new BusinessException(ERROR_BEAN_VALIDATION, errorMessage.toString());
        }
    }

    /**
     * Cleanup method to close the validator factory.
     * Should be called during application shutdown.
     */
    public static void closeValidatorFactory() {
        if (validatorFactory != null) {
            validatorFactory.close();
        }
    }
}