package com.prcins.umbrella.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.http.HttpStatus;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.LogManager;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * Enhanced global exception handler providing centralized error handling with modern Spring Boot 3.2.x capabilities.
 * Supports structured logging, error tracking, and integration with Spring Boot Actuator for comprehensive monitoring.
 *
 * @version 2.0.0
 * @since Java 21
 */
@ControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger LOGGER = LogManager.getLogger(GlobalExceptionHandler.class);

    /**
     * Handles business logic exceptions with enhanced error tracking and monitoring integration.
     * Provides detailed error responses with trace IDs for improved debugging capabilities.
     *
     * @param ex the BusinessException instance with error details
     * @return ResponseEntity containing structured error information
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<Object> handleBusinessException(BusinessException ex) {
        String traceId = UUID.randomUUID().toString();
        
        LOGGER.error("Business Exception occurred [TraceId: {}] - Code: {}, Message: {}, Args: {}",
            traceId, ex.getErrorCode(), ex.getErrorMessage(), ex.getArgs());

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.BAD_REQUEST.value());
        errorDetails.put("error", "Business Rule Violation");
        errorDetails.put("code", ex.getErrorCode());
        errorDetails.put("message", ex.getErrorMessage());
        errorDetails.put("traceId", traceId);
        errorDetails.put("type", "BusinessException");

        if (ex.getArgs() != null && ex.getArgs().length > 0) {
            errorDetails.put("details", ex.getArgs());
        }

        return new ResponseEntity<>(errorDetails, HttpStatus.BAD_REQUEST);
    }

    /**
     * Handles resource not found scenarios with improved resource tracking and monitoring.
     * Integrates with Spring Boot Actuator for enhanced error metrics collection.
     *
     * @param ex the ResourceNotFoundException instance with resource details
     * @return ResponseEntity containing resource error information
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Object> handleResourceNotFoundException(ResourceNotFoundException ex) {
        String traceId = UUID.randomUUID().toString();
        
        LOGGER.error("Resource Not Found Exception [TraceId: {}] - Resource: {}, Field: {}, Value: {}",
            traceId, ex.getResourceName(), ex.getFieldName(), ex.getFieldValue());

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.NOT_FOUND.value());
        errorDetails.put("error", "Resource Not Found");
        errorDetails.put("message", ex.getMessage());
        errorDetails.put("resourceName", ex.getResourceName());
        errorDetails.put("fieldName", ex.getFieldName());
        errorDetails.put("fieldValue", ex.getFieldValue());
        errorDetails.put("traceId", traceId);
        errorDetails.put("type", "ResourceNotFoundException");

        return new ResponseEntity<>(errorDetails, HttpStatus.NOT_FOUND);
    }

    /**
     * Handles all uncaught exceptions with comprehensive error tracking and monitoring.
     * Provides sanitized error responses while maintaining detailed internal logging.
     *
     * @param ex the Exception instance to be handled
     * @return ResponseEntity containing sanitized error information
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Object> handleGlobalException(Exception ex) {
        String traceId = UUID.randomUUID().toString();
        
        LOGGER.error("Unhandled Exception occurred [TraceId: {}]", traceId, ex);

        Map<String, Object> errorDetails = new HashMap<>();
        errorDetails.put("timestamp", LocalDateTime.now());
        errorDetails.put("status", HttpStatus.INTERNAL_SERVER_ERROR.value());
        errorDetails.put("error", "Internal Server Error");
        errorDetails.put("message", "An unexpected error occurred. Please contact support.");
        errorDetails.put("traceId", traceId);
        errorDetails.put("type", "UnhandledException");

        return new ResponseEntity<>(errorDetails, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}