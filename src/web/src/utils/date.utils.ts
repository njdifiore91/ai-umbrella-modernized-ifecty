import { format, isValid, parseISO } from 'date-fns'; // v2.30.0
import { DateRange } from '../types/common.types';

/**
 * Formats a date string or Date object into a specified format with enhanced error handling
 * @param date - Date to format as string, Date object, null or undefined
 * @param formatString - Target format string (e.g. 'yyyy-MM-dd')
 * @returns Formatted date string or empty string if input is invalid
 */
export const formatDate = (date: string | Date | null | undefined, formatString: string): string => {
  try {
    if (!date) {
      return '';
    }

    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    if (!isValid(dateObj)) {
      return '';
    }

    return format(dateObj, formatString);
  } catch (error) {
    console.error('Error formatting date:', error);
    return '';
  }
};

/**
 * Validates a date range ensuring start date is before or equal to end date
 * with comprehensive validation rules for policy and claims periods
 * @param dateRange - Object containing start and end dates
 * @returns Boolean indicating if the date range is valid
 */
export const isValidDateRange = (dateRange: DateRange): boolean => {
  try {
    if (!dateRange?.startDate || !dateRange?.endDate) {
      return false;
    }

    const startDate = parseISO(dateRange.startDate);
    const endDate = parseISO(dateRange.endDate);

    if (!isValid(startDate) || !isValid(endDate)) {
      return false;
    }

    // Ensure start date is not after end date
    if (startDate > endDate) {
      return false;
    }

    // Additional validation rules could be added here for specific business requirements
    // For example, maximum policy period validation or claims filing window checks

    return true;
  } catch (error) {
    console.error('Error validating date range:', error);
    return false;
  }
};

/**
 * Converts a date to ISO string format (YYYY-MM-DD) with enhanced validation
 * @param date - Date object to convert, null or undefined
 * @returns Date in ISO format or empty string if invalid
 */
export const toISOString = (date: Date | null | undefined): string => {
  try {
    if (!date || !isValid(date)) {
      return '';
    }

    return format(date, 'yyyy-MM-dd');
  } catch (error) {
    console.error('Error converting date to ISO string:', error);
    return '';
  }
};

/**
 * Safely parses a date string to Date object with comprehensive error handling
 * @param dateString - Date string to parse, null or undefined
 * @returns Parsed Date object or null if invalid
 */
export const parseDate = (dateString: string | null | undefined): Date | null => {
  try {
    if (!dateString) {
      return null;
    }

    const parsedDate = parseISO(dateString);

    if (!isValid(parsedDate)) {
      return null;
    }

    return parsedDate;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};