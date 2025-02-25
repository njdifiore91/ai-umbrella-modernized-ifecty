package com.prcins.umbrella.exception;

import java.io.Serializable;

/**
 * Enhanced custom runtime exception for handling business logic related exceptions in the modernized umbrella application.
 * This exception class provides improved container support, error tracking capabilities, and integration with 
 * Spring Boot's error handling mechanisms.
 * 
 * @since 3.2.1
 * @version 2.0.0
 */
public class BusinessException extends RuntimeException implements Serializable {
    
    private static final long serialVersionUID = 1L;
    
    private final String errorCode;
    private final String errorMessage;
    private final Object[] args;
    
    /**
     * Constructs a new BusinessException with enhanced error tracking and container support.
     * 
     * @param errorCode The unique error code for tracking and monitoring
     * @param errorMessage The detailed error message with improved context
     * @param args Additional arguments providing error context and details
     */
    public BusinessException(String errorCode, String errorMessage, Object... args) {
        super(errorMessage);
        this.errorCode = errorCode;
        this.errorMessage = errorMessage;
        this.args = args != null ? args.clone() : new Object[0];
    }
    
    /**
     * Retrieves the error code associated with this business exception.
     * Supports integration with modern error tracking and monitoring systems.
     * 
     * @return The error code for error tracking and monitoring
     */
    public String getErrorCode() {
        return this.errorCode;
    }
    
    /**
     * Retrieves the error message describing the business exception.
     * Enhanced for container-aware logging and error tracking.
     * 
     * @return The error message with improved context
     */
    public String getErrorMessage() {
        return this.errorMessage;
    }
    
    /**
     * Retrieves any additional arguments associated with the error.
     * Supports structured error details for enhanced tracking and monitoring.
     * 
     * @return Array of additional error arguments for detailed tracking
     */
    public Object[] getArgs() {
        return this.args != null ? this.args.clone() : new Object[0];
    }
}