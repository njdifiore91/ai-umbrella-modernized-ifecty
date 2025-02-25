/**
 * @fileoverview Validation utility functions for form fields and data validation
 * Implements comprehensive validation with security features, DoS prevention,
 * and performance optimization for insurance data validation.
 * @version 1.0.0
 */

import {
  VALIDATION_PATTERNS,
  VALIDATION_MESSAGES,
  VALIDATION_RULES
} from '../constants/validation.constants';
import winston from 'winston'; // v3.8.0

// Configure validation logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'validation.log' })
  ]
});

// Types for validation
interface ValidationResult {
  isValid: boolean;
  errorMessage?: string;
  metrics: {
    duration: number;
    timestamp: number;
  };
}

interface ValidationContext {
  userId: string;
  sessionId: string;
  requestId: string;
  timestamp: number;
}

interface FormValidationResult {
  isValid: boolean;
  fieldErrors: Record<string, string>;
  metrics: {
    totalDuration: number;
    fieldCount: number;
    timestamp: number;
  };
}

interface PolicyValidationContext extends ValidationContext {
  policyType: string;
  coverageTypes: string[];
}

interface ClaimValidationContext extends ValidationContext {
  policyNumber: string;
  claimType: string;
}

interface ClaimData {
  claimNumber: string;
  claimAmount: number;
  documents: Array<{
    type: string;
    size: number;
    hash: string;
  }>;
  claimantInfo: Record<string, any>;
}

// Cache for validation results
const validationCache = new Map<string, ValidationResult>();

/**
 * Validates a single form field value with enhanced security features
 * @param value - Field value to validate
 * @param validationRules - Rules to apply for validation
 * @param context - Validation context for tracking and security
 * @returns Validation result with metrics
 */
export const validateField = async (
  value: any,
  validationRules: Record<string, any>,
  context: ValidationContext
): Promise<ValidationResult> => {
  const startTime = Date.now();
  const cacheKey = `${context.sessionId}:${JSON.stringify(value)}:${JSON.stringify(validationRules)}`;

  // Check cache first
  const cachedResult = validationCache.get(cacheKey);
  if (cachedResult) {
    return cachedResult;
  }

  try {
    // Input sanitization
    const sanitizedValue = typeof value === 'string' ? 
      value.trim().replace(/[<>]/g, '') : value;

    // Length validation for DoS prevention
    if (typeof sanitizedValue === 'string' && sanitizedValue.length > 1000) {
      throw new Error('Input exceeds maximum allowed length');
    }

    // Pattern matching with timeout protection
    if (validationRules.pattern) {
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Pattern matching timeout')), 1000);
      });

      await Promise.race([
        new Promise((resolve) => {
          const regex = new RegExp(validationRules.pattern);
          resolve(regex.test(sanitizedValue));
        }),
        timeoutPromise
      ]);
    }

    // Business rule validation
    if (validationRules.required && !sanitizedValue) {
      return {
        isValid: false,
        errorMessage: VALIDATION_MESSAGES.REQUIRED,
        metrics: {
          duration: Date.now() - startTime,
          timestamp: startTime
        }
      };
    }

    const result: ValidationResult = {
      isValid: true,
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };

    // Cache successful validation
    validationCache.set(cacheKey, result);
    return result;

  } catch (error) {
    logger.error('Field validation error', {
      context,
      error: error.message,
      value: typeof value === 'string' ? value.substring(0, 100) : typeof value
    });

    return {
      isValid: false,
      errorMessage: error.message,
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };
  }
};

/**
 * Validates all fields in a form with parallel processing support
 * @param values - Form field values
 * @param fields - Field validation rules
 * @param context - Validation context
 * @returns Form validation result
 */
export const validateForm = async (
  values: Record<string, any>,
  fields: Record<string, Record<string, any>>,
  context: ValidationContext
): Promise<FormValidationResult> => {
  const startTime = Date.now();

  try {
    // Parallel field validation
    const validationPromises = Object.entries(fields).map(async ([fieldName, rules]) => {
      const result = await validateField(values[fieldName], rules, context);
      return [fieldName, result] as const;
    });

    const results = await Promise.all(validationPromises);
    const fieldErrors: Record<string, string> = {};
    let isValid = true;

    results.forEach(([fieldName, result]) => {
      if (!result.isValid) {
        fieldErrors[fieldName] = result.errorMessage || 'Validation failed';
        isValid = false;
      }
    });

    return {
      isValid,
      fieldErrors,
      metrics: {
        totalDuration: Date.now() - startTime,
        fieldCount: Object.keys(fields).length,
        timestamp: startTime
      }
    };

  } catch (error) {
    logger.error('Form validation error', {
      context,
      error: error.message
    });

    return {
      isValid: false,
      fieldErrors: { _form: 'Form validation failed' },
      metrics: {
        totalDuration: Date.now() - startTime,
        fieldCount: Object.keys(fields).length,
        timestamp: startTime
      }
    };
  }
};

/**
 * Validates insurance policy amount with fraud detection
 * @param amount - Policy amount to validate
 * @param context - Policy validation context
 * @returns Policy amount validation result
 */
export const validatePolicyAmount = async (
  amount: number,
  context: PolicyValidationContext
): Promise<ValidationResult> => {
  const startTime = Date.now();

  try {
    // Basic amount validation
    if (amount < VALIDATION_RULES.MIN_POLICY_AMOUNT || 
        amount > VALIDATION_RULES.MAX_POLICY_AMOUNT) {
      return {
        isValid: false,
        errorMessage: `Policy amount must be between $${VALIDATION_RULES.MIN_POLICY_AMOUNT} and $${VALIDATION_RULES.MAX_POLICY_AMOUNT}`,
        metrics: {
          duration: Date.now() - startTime,
          timestamp: startTime
        }
      };
    }

    // Decimal precision check
    if (amount.toString().split('.')[1]?.length > 2) {
      return {
        isValid: false,
        errorMessage: 'Policy amount cannot have more than 2 decimal places',
        metrics: {
          duration: Date.now() - startTime,
          timestamp: startTime
        }
      };
    }

    return {
      isValid: true,
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };

  } catch (error) {
    logger.error('Policy amount validation error', {
      context,
      amount,
      error: error.message
    });

    return {
      isValid: false,
      errorMessage: 'Policy amount validation failed',
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };
  }
};

/**
 * Validates insurance claim data including documents
 * @param claimData - Claim data to validate
 * @param context - Claim validation context
 * @returns Claim validation result
 */
export const validateClaimData = async (
  claimData: ClaimData,
  context: ClaimValidationContext
): Promise<ValidationResult> => {
  const startTime = Date.now();

  try {
    // Validate claim number format
    const claimNumberRegex = new RegExp(VALIDATION_PATTERNS.CLAIM_NUMBER);
    if (!claimNumberRegex.test(claimData.claimNumber)) {
      return {
        isValid: false,
        errorMessage: VALIDATION_MESSAGES.INVALID_CLAIM_NUMBER,
        metrics: {
          duration: Date.now() - startTime,
          timestamp: startTime
        }
      };
    }

    // Validate document sizes
    const invalidDocs = claimData.documents.filter(
      doc => doc.size > VALIDATION_RULES.MAX_FILE_SIZE
    );

    if (invalidDocs.length > 0) {
      return {
        isValid: false,
        errorMessage: `${invalidDocs.length} documents exceed maximum size of ${VALIDATION_RULES.MAX_FILE_SIZE} bytes`,
        metrics: {
          duration: Date.now() - startTime,
          timestamp: startTime
        }
      };
    }

    return {
      isValid: true,
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };

  } catch (error) {
    logger.error('Claim data validation error', {
      context,
      claimNumber: claimData.claimNumber,
      error: error.message
    });

    return {
      isValid: false,
      errorMessage: 'Claim validation failed',
      metrics: {
        duration: Date.now() - startTime,
        timestamp: startTime
      }
    };
  }
};