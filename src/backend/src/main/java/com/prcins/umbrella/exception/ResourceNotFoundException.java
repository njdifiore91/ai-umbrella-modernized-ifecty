package com.prcins.umbrella.exception;

import java.io.Serializable;

/**
 * Enhanced custom runtime exception for handling resource not found scenarios in the umbrella application.
 * Provides detailed error information and monitoring support through Spring Boot's error handling infrastructure.
 * 
 * @version 2.0.0
 * @since Java 21
 */
public class ResourceNotFoundException extends RuntimeException implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private final String resourceName;
    private final String fieldName;
    private final Object fieldValue;
    
    /**
     * Constructs a new ResourceNotFoundException with detailed information about the missing resource.
     * Provides enhanced error message formatting and null safety checks for improved error tracking.
     *
     * @param resourceName the type of resource that was not found (e.g., "Policy", "Claim", "User")
     * @param fieldName the name of the field used to look up the resource (e.g., "id", "policyNumber")
     * @param fieldValue the value of the lookup field that resulted in no match
     * @throws IllegalArgumentException if resourceName or fieldName is null
     */
    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(String.format("%s not found with %s : '%s'", 
            validateParam(resourceName, "resourceName"),
            validateParam(fieldName, "fieldName"),
            fieldValue));
            
        this.resourceName = resourceName;
        this.fieldName = fieldName;
        this.fieldValue = fieldValue;
    }
    
    /**
     * Retrieves the name of the resource that was not found.
     * Provides null safety for enhanced error tracking.
     *
     * @return the resource name or null if not set
     */
    public String getResourceName() {
        return resourceName;
    }
    
    /**
     * Retrieves the name of the field used to look up the resource.
     * Provides null safety for enhanced error tracking.
     *
     * @return the field name or null if not set
     */
    public String getFieldName() {
        return fieldName;
    }
    
    /**
     * Retrieves the value of the field that was used in the lookup.
     * Provides null safety for enhanced error tracking.
     *
     * @return the field value or null if not set
     */
    public Object getFieldValue() {
        return fieldValue;
    }
    
    /**
     * Validates input parameters for null values and provides consistent error messaging.
     * 
     * @param param the parameter to validate
     * @param paramName the name of the parameter for error messaging
     * @return the validated parameter
     * @throws IllegalArgumentException if the parameter is null
     */
    private static String validateParam(String param, String paramName) {
        if (param == null) {
            throw new IllegalArgumentException(String.format("%s cannot be null", paramName));
        }
        return param;
    }
}