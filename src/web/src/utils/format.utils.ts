import { format } from 'numeral'; // v2.0.6
import { ApiResponse } from '../types/common.types';

/**
 * Currency formatting options interface
 */
interface CurrencyFormatOptions {
  currencyCode: string;
  locale?: string;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

/**
 * Phone number format patterns by country
 */
const PHONE_PATTERNS: Record<string, string> = {
  US: '($1) $2-$3', // (555) 555-5555
  CA: '$1-$2-$3',   // 555-555-5555
  UK: '+44 $1 $2 $3', // +44 7911 123456
  DEFAULT: '$1-$2-$3'
};

/**
 * Policy number format patterns by type
 */
const POLICY_PATTERNS: Record<string, string> = {
  AUTO: 'AU-$1-$2-$3',
  HOME: 'HO-$1-$2-$3',
  UMBRELLA: 'UM-$1-$2-$3',
  DEFAULT: '$1-$2-$3'
};

/**
 * Formats a number as currency with proper decimal places and currency symbol
 * @param amount - The amount to format
 * @param options - Currency formatting options
 * @returns Formatted currency string
 */
export const formatCurrency = (
  amount: number | null | undefined,
  options: CurrencyFormatOptions
): string => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return `${options.currencyCode} 0.00`;
  }

  const {
    currencyCode,
    locale = 'en-US',
    minimumFractionDigits = 2,
    maximumFractionDigits = 2
  } = options;

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits,
      maximumFractionDigits
    });
    return formatter.format(amount);
  } catch (error) {
    console.error('Currency formatting error:', error);
    return `${currencyCode} ${format(amount).format('0,0.00')}`;
  }
};

/**
 * Formats a phone number string into standardized format with international support
 * @param phoneNumber - The phone number to format
 * @param countryCode - The country code (e.g., 'US', 'CA', 'UK')
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (
  phoneNumber: string,
  countryCode: string = 'US'
): string => {
  if (!phoneNumber) {
    return '';
  }

  // Remove all non-numeric characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Get country-specific pattern or default
  const pattern = PHONE_PATTERNS[countryCode] || PHONE_PATTERNS.DEFAULT;

  // Format based on country pattern
  try {
    if (countryCode === 'US' && cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, pattern);
    } else if (countryCode === 'UK' && cleaned.length === 11) {
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, pattern);
    } else if (cleaned.length === 10) {
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, pattern);
    }
    return phoneNumber; // Return original if no pattern matches
  } catch (error) {
    console.error('Phone formatting error:', error);
    return phoneNumber;
  }
};

/**
 * Formats a policy number with proper separators based on policy type
 * @param policyNumber - The policy number to format
 * @param policyType - The type of policy (AUTO, HOME, UMBRELLA)
 * @returns Formatted policy number
 */
export const formatPolicyNumber = (
  policyNumber: string,
  policyType: string = 'DEFAULT'
): string => {
  if (!policyNumber) {
    return '';
  }

  // Remove non-alphanumeric characters
  const cleaned = policyNumber.replace(/[^\w\d]/g, '');
  
  // Get policy type specific pattern or default
  const pattern = POLICY_PATTERNS[policyType] || POLICY_PATTERNS.DEFAULT;

  try {
    // Format based on policy type pattern
    if (cleaned.length === 12) {
      return cleaned.replace(/(\w{4})(\w{4})(\w{4})/, pattern);
    }
    return policyNumber; // Return original if pattern doesn't match
  } catch (error) {
    console.error('Policy number formatting error:', error);
    return policyNumber;
  }
};

/**
 * Formats a decimal number as a percentage with bounds checking and localization
 * @param value - The decimal value to format as percentage
 * @param decimalPlaces - Number of decimal places to show
 * @param locale - Locale for number formatting
 * @returns Formatted percentage string
 */
export const formatPercentage = (
  value: number,
  decimalPlaces: number = 2,
  locale: string = 'en-US'
): string => {
  if (isNaN(value) || value < 0 || value > 1) {
    return '0%';
  }

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'percent',
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces
    });
    return formatter.format(value);
  } catch (error) {
    console.error('Percentage formatting error:', error);
    return `${(value * 100).toFixed(decimalPlaces)}%`;
  }
};

/**
 * Truncates text to specified length with UTF-8 support and accessibility features
 * @param text - The text to truncate
 * @param maxLength - Maximum length before truncation
 * @param addTooltip - Whether to add tooltip with full text
 * @returns Truncated text with accessibility attributes
 */
export const truncateText = (
  text: string,
  maxLength: number,
  addTooltip: boolean = true
): string => {
  if (!text || text.length <= maxLength) {
    return text;
  }

  try {
    const truncated = text.slice(0, maxLength) + '...';
    const ariaLabel = `Full text: ${text}`;
    
    if (addTooltip) {
      return `<span aria-label="${ariaLabel}" title="${text}">${truncated}</span>`;
    }
    return `<span aria-label="${ariaLabel}">${truncated}</span>`;
  } catch (error) {
    console.error('Text truncation error:', error);
    return text;
  }
};

/**
 * Validates and formats API response data
 * @param response - API response object
 * @returns Formatted data or null if invalid
 */
export const formatApiResponse = <T>(response: ApiResponse<T>): T | null => {
  if (!response || !response.data) {
    return null;
  }
  return response.data;
};