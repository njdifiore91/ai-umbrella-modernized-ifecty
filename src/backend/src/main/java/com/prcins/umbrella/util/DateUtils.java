package com.prcins.umbrella.util;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.ZoneId;
import java.time.DateTimeException;
import java.util.Objects;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Thread-safe utility class providing comprehensive date manipulation and validation functions
 * for the insurance domain. Leverages Java 21's modern date/time APIs with enhanced error handling,
 * business rule validation, and performance optimizations.
 *
 * @version 2.0
 * @since Java 21
 */
public final class DateUtils {

    // Global constants for date formats and timezone
    private static final String DEFAULT_DATE_FORMAT = "yyyy-MM-dd";
    private static final String DEFAULT_DATETIME_FORMAT = "yyyy-MM-dd HH:mm:ss";
    private static final String DEFAULT_TIMEZONE = "America/New_York";

    // Thread-safe formatter cache using ConcurrentHashMap
    private static final ConcurrentHashMap<String, DateTimeFormatter> formatterCache = new ConcurrentHashMap<>();

    // Private constructor to prevent instantiation
    private DateUtils() {
        throw new AssertionError("DateUtils is a utility class and should not be instantiated");
    }

    /**
     * Thread-safe method for parsing date strings into LocalDate objects.
     *
     * @param dateStr The date string to parse
     * @param format The format pattern to use (optional)
     * @return LocalDate object representing the parsed date
     * @throws DateTimeException if parsing fails or date is invalid
     * @throws IllegalArgumentException if input parameters are invalid
     */
    public static LocalDate parseDate(String dateStr, String format) {
        validateInput(dateStr, "Date string cannot be null or empty");
        String dateFormat = format == null ? DEFAULT_DATE_FORMAT : format;
        
        try {
            DateTimeFormatter formatter = getFormatter(dateFormat);
            return LocalDate.parse(dateStr, formatter);
        } catch (DateTimeException e) {
            throw new DateTimeException("Failed to parse date: " + dateStr + " with format: " + dateFormat, e);
        }
    }

    /**
     * Thread-safe method for formatting LocalDate objects to strings.
     *
     * @param date The LocalDate to format
     * @param format The format pattern to use (optional)
     * @return Formatted date string
     * @throws IllegalArgumentException if date is null
     */
    public static String formatDate(LocalDate date, String format) {
        Objects.requireNonNull(date, "Date cannot be null");
        String dateFormat = format == null ? DEFAULT_DATE_FORMAT : format;
        
        try {
            DateTimeFormatter formatter = getFormatter(dateFormat);
            return date.format(formatter);
        } catch (DateTimeException e) {
            throw new DateTimeException("Failed to format date: " + date + " with format: " + dateFormat, e);
        }
    }

    /**
     * Thread-safe datetime parser with timezone awareness.
     *
     * @param dateTimeStr The datetime string to parse
     * @param format The format pattern to use (optional)
     * @return LocalDateTime object representing the parsed datetime
     * @throws DateTimeException if parsing fails or datetime is invalid
     */
    public static LocalDateTime parseDateTime(String dateTimeStr, String format) {
        validateInput(dateTimeStr, "DateTime string cannot be null or empty");
        String dateTimeFormat = format == null ? DEFAULT_DATETIME_FORMAT : format;
        
        try {
            DateTimeFormatter formatter = getFormatter(dateTimeFormat);
            return LocalDateTime.parse(dateTimeStr, formatter);
        } catch (DateTimeException e) {
            throw new DateTimeException("Failed to parse datetime: " + dateTimeStr + " with format: " + dateTimeFormat, e);
        }
    }

    /**
     * Thread-safe datetime formatter with timezone handling.
     *
     * @param dateTime The LocalDateTime to format
     * @param format The format pattern to use (optional)
     * @return Formatted datetime string
     * @throws IllegalArgumentException if datetime is null
     */
    public static String formatDateTime(LocalDateTime dateTime, String format) {
        Objects.requireNonNull(dateTime, "DateTime cannot be null");
        String dateTimeFormat = format == null ? DEFAULT_DATETIME_FORMAT : format;
        
        try {
            DateTimeFormatter formatter = getFormatter(dateTimeFormat);
            return dateTime.format(formatter);
        } catch (DateTimeException e) {
            throw new DateTimeException("Failed to format datetime: " + dateTime + " with format: " + dateTimeFormat, e);
        }
    }

    /**
     * Validates if a date falls within a specified range with business rule enforcement.
     *
     * @param date The date to check
     * @param startDate The start of the valid range
     * @param endDate The end of the valid range
     * @return true if date is within range and meets business rules
     * @throws IllegalArgumentException if any date parameter is null
     */
    public static boolean isDateInRange(LocalDateTime date, LocalDateTime startDate, LocalDateTime endDate) {
        Objects.requireNonNull(date, "Date cannot be null");
        Objects.requireNonNull(startDate, "Start date cannot be null");
        Objects.requireNonNull(endDate, "End date cannot be null");

        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date");
        }

        return !date.isBefore(startDate) && !date.isAfter(endDate);
    }

    /**
     * Retrieves current date-time with timezone awareness.
     *
     * @return Current LocalDateTime in system timezone
     */
    public static LocalDateTime getCurrentDateTime() {
        return LocalDateTime.now(ZoneId.of(DEFAULT_TIMEZONE));
    }

    /**
     * Adds specified days to a date with business rule validation.
     *
     * @param date The base date
     * @param days Number of days to add
     * @return New LocalDateTime with days added
     * @throws IllegalArgumentException if date is null or days is negative
     */
    public static LocalDateTime addDays(LocalDateTime date, int days) {
        Objects.requireNonNull(date, "Date cannot be null");
        if (days < 0) {
            throw new IllegalArgumentException("Days cannot be negative");
        }
        
        return date.plusDays(days);
    }

    /**
     * Validates policy effective and expiry dates against business rules.
     *
     * @param effectiveDate The policy effective date
     * @param expiryDate The policy expiry date
     * @return true if dates meet all business rules
     * @throws IllegalArgumentException if dates are null or invalid
     */
    public static boolean validatePolicyDates(LocalDateTime effectiveDate, LocalDateTime expiryDate) {
        Objects.requireNonNull(effectiveDate, "Effective date cannot be null");
        Objects.requireNonNull(expiryDate, "Expiry date cannot be null");

        // Policy must start in the future
        if (effectiveDate.isBefore(getCurrentDateTime())) {
            return false;
        }

        // Policy must have valid duration
        if (expiryDate.isBefore(effectiveDate)) {
            return false;
        }

        // Maximum policy duration is 1 year
        LocalDateTime maxExpiryDate = effectiveDate.plusYears(1);
        return !expiryDate.isAfter(maxExpiryDate);
    }

    /**
     * Thread-safe method to get or create a DateTimeFormatter.
     *
     * @param pattern The format pattern
     * @return DateTimeFormatter instance
     */
    private static DateTimeFormatter getFormatter(String pattern) {
        return formatterCache.computeIfAbsent(pattern, DateTimeFormatter::ofPattern);
    }

    /**
     * Validates input string parameters.
     *
     * @param input The input string to validate
     * @param message The error message
     * @throws IllegalArgumentException if input is invalid
     */
    private static void validateInput(String input, String message) {
        if (input == null || input.trim().isEmpty()) {
            throw new IllegalArgumentException(message);
        }
    }
}