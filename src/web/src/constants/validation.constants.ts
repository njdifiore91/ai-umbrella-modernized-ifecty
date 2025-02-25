/**
 * @fileoverview Validation constants for form validation and data constraints
 * Implements comprehensive validation patterns and rules for policy administration
 * and secure input handling across the web application.
 */

/**
 * Regular expression patterns for validating various input fields
 * Implements strict validation with DoS prevention through pattern length limits
 */
export const VALIDATION_PATTERNS = {
  // RFC 5322 compliant email pattern with reasonable length limits
  EMAIL: '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$',
  
  // Standardized SSN format with required dashes
  SSN: '^\\d{3}-\\d{2}-\\d{4}$',
  
  // Basic credit card validation - 16 digits only
  CREDIT_CARD: '^[0-9]{16}$',
  
  // North American phone number format with required dashes
  PHONE: '^\\d{3}-\\d{3}-\\d{4}$',
  
  // US ZIP code with optional 4-digit extension
  ZIP_CODE: '^\\d{5}(-\\d{4})?$',
  
  // Policy number format: POL-YYYY-XXXXXX
  POLICY_NUMBER: '^POL-\\d{4}-\\d{6}$',
  
  // Claim number format: CLM-YYYY-XXX
  CLAIM_NUMBER: '^CLM-\\d{4}-\\d{3}$'
} as const;

/**
 * User-friendly validation error messages
 * Supports internationalization and maintains consistent formatting
 */
export const VALIDATION_MESSAGES = {
  // Generic required field message
  REQUIRED: 'This field is required',
  
  // Format-specific validation messages
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_SSN: 'Please enter a valid SSN (XXX-XX-XXXX)',
  INVALID_PHONE: 'Please enter a valid phone number (XXX-XXX-XXXX)',
  INVALID_CREDIT_CARD: 'Please enter a valid 16-digit credit card number',
  INVALID_ZIP: 'Please enter a valid ZIP code',
  INVALID_POLICY_NUMBER: 'Please enter a valid policy number (POL-YYYY-XXXXXX)',
  INVALID_CLAIM_NUMBER: 'Please enter a valid claim number (CLM-YYYY-XXX)'
} as const;

/**
 * Validation rules and constraints with security boundaries
 * Implements strict limits to prevent DoS attacks and ensure data integrity
 */
export const VALIDATION_RULES = {
  // Password constraints
  MIN_PASSWORD_LENGTH: 8,
  MAX_PASSWORD_LENGTH: 32,
  
  // Username constraints
  MIN_USERNAME_LENGTH: 3,
  MAX_USERNAME_LENGTH: 50,
  
  // Policy amount limits in dollars
  MAX_POLICY_AMOUNT: 10_000_000, // $10M maximum policy value
  MIN_POLICY_AMOUNT: 1_000, // $1K minimum policy value
  
  // File upload size limit (10MB)
  MAX_FILE_SIZE: 10 * 1024 * 1024 // 10MB in bytes
} as const;

// Type assertions to ensure type safety
type ValidationPatterns = typeof VALIDATION_PATTERNS;
type ValidationMessages = typeof VALIDATION_MESSAGES;
type ValidationRules = typeof VALIDATION_RULES;

// Ensure objects are readonly at compile time
declare const validationPatterns: Readonly<ValidationPatterns>;
declare const validationMessages: Readonly<ValidationMessages>;
declare const validationRules: Readonly<ValidationRules>;