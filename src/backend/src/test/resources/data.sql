-- Test Data SQL Script for AI Umbrella Insurance System
-- Version: 1.0
-- Purpose: Provides test data for unit and integration testing with Spring Boot 3.2.x and Java 21
-- Dependencies: V1__initial_schema.sql, V2__security_tables.sql, V3__policy_tables.sql, V4__claims_tables.sql

-- Test Users with BCrypt encoded passwords for Spring Security testing
INSERT INTO users (id, username, password, email, first_name, last_name, enabled, account_non_locked, account_non_expired, credentials_non_expired, version)
VALUES 
(1, 'admin_user', '$2a$10$encrypted_password_hash', 'admin@test.com', 'Admin', 'User', true, true, true, true, 1),
(2, 'test_manager', '$2a$10$encrypted_password_hash', 'manager@test.com', 'Test', 'Manager', true, true, true, true, 1),
(3, 'concurrent_user', '$2a$10$encrypted_password_hash', 'concurrent@test.com', 'Concurrent', 'User', true, true, true, true, 1);

-- Test Roles with enhanced permissions for Virtual Thread testing
INSERT INTO roles (id, name, description, version)
VALUES 
(1, 'ROLE_ADMIN', 'Administrator role with full access', 1),
(2, 'ROLE_MANAGER', 'Manager role with elevated privileges', 1),
(3, 'ROLE_CONCURRENT', 'Role for Virtual Thread testing scenarios', 1);

-- User-Role assignments
INSERT INTO user_roles (user_id, role_id)
VALUES 
(1, 1), -- admin_user -> ROLE_ADMIN
(2, 2), -- test_manager -> ROLE_MANAGER
(3, 3); -- concurrent_user -> ROLE_CONCURRENT

-- Test Policies optimized for concurrent operations testing
INSERT INTO CSRI_POLICIES (id, policy_number, status, premium, effective_date, expiry_date, owner_id, version, last_modified, created_by)
VALUES 
(1, 'POL-2023-001', 'ACTIVE', 1500.00, '2023-01-01', '2024-01-01', 1, 1, '2023-01-01 00:00:00', 'system'),
(2, 'POL-2023-002', 'PENDING', 2000.00, '2023-02-01', '2024-02-01', 2, 1, '2023-02-01 00:00:00', 'system'),
(3, 'POL-2023-003', 'ACTIVE', 2500.00, '2023-03-01', '2024-03-01', 3, 1, '2023-03-01 00:00:00', 'system');

-- Test Claims with Virtual Thread processing scenarios
INSERT INTO CSRI_CLAIMS (id, claim_number, policy_id, status, claim_amount, incident_date, reported_date, processing_thread, version, last_modified)
VALUES 
(1, 'CLM-2023-001', 1, 'IN_PROGRESS', 5000.00, '2023-06-15', '2023-06-16', 'virtual-thread-1', 1, '2023-06-16 00:00:00'),
(2, 'CLM-2023-002', 2, 'PENDING', 7500.00, '2023-07-15', '2023-07-16', 'virtual-thread-2', 1, '2023-07-16 00:00:00'),
(3, 'CLM-2023-003', 3, 'SUBMITTED', 10000.00, '2023-08-15', '2023-08-16', 'virtual-thread-3', 1, '2023-08-16 00:00:00');

-- Test Claim Documents for concurrent file processing tests
INSERT INTO CSRI_CLAIM_DOCUMENTS (id, claim_id, file_name, content_type, file_size, storage_location, upload_date, uploaded_by)
VALUES 
(1, 1, 'claim1_doc1.pdf', 'application/pdf', 1024000, '/storage/claims/2023/06/claim1_doc1.pdf', '2023-06-16', 'admin_user'),
(2, 1, 'claim1_doc2.jpg', 'image/jpeg', 2048000, '/storage/claims/2023/06/claim1_doc2.jpg', '2023-06-16', 'admin_user'),
(3, 2, 'claim2_doc1.pdf', 'application/pdf', 1536000, '/storage/claims/2023/07/claim2_doc1.pdf', '2023-07-16', 'test_manager');

-- Test Claim Payments for SpeedPay integration testing
INSERT INTO CSRI_CLAIMS_PAYMENTS (id, claim_id, transaction_id, amount, status, payment_method, created_at, processed_at)
VALUES 
(1, 1, 'TXN-2023-001', 2500.00, 'COMPLETED', 'ACH', '2023-06-17 10:00:00', '2023-06-17 10:15:00'),
(2, 1, 'TXN-2023-002', 2500.00, 'PENDING', 'ACH', '2023-06-18 10:00:00', NULL),
(3, 2, 'TXN-2023-003', 7500.00, 'PROCESSING', 'WIRE', '2023-07-17 10:00:00', NULL);

-- Test Security Events for Spring Boot Actuator monitoring
INSERT INTO security_events (id, user_id, event_type, event_timestamp, ip_address, description, severity, success)
VALUES 
(1, 1, 'AUTH_SUCCESS', '2023-01-01 09:00:00', '192.168.1.100', 'Successful login', 'LOW', true),
(2, 2, 'AUTH_FAILURE', '2023-01-01 09:15:00', '192.168.1.101', 'Invalid credentials', 'MEDIUM', false),
(3, 3, 'ACCESS_DENIED', '2023-01-01 09:30:00', '192.168.1.102', 'Unauthorized resource access', 'HIGH', false);

-- Test User Sessions for container-based session management
INSERT INTO user_sessions (id, user_id, session_id, ip_address, user_agent, login_timestamp, last_activity_timestamp, expiry_timestamp, status)
VALUES 
(1, 1, 'SESSION-001', '192.168.1.100', 'Mozilla/5.0', '2023-01-01 09:00:00', '2023-01-01 10:00:00', '2023-01-01 11:00:00', 'ACTIVE'),
(2, 2, 'SESSION-002', '192.168.1.101', 'Chrome/96.0', '2023-01-01 09:15:00', '2023-01-01 10:15:00', '2023-01-01 11:15:00', 'ACTIVE'),
(3, 3, 'SESSION-003', '192.168.1.102', 'Firefox/95.0', '2023-01-01 09:30:00', '2023-01-01 10:30:00', '2023-01-01 11:30:00', 'EXPIRED');