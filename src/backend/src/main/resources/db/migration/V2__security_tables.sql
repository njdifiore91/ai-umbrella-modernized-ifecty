-- Security tables migration script for Spring Security integration
-- Version: 2.0
-- Author: AI Umbrella Team
-- Dependencies: V1__initial_schema.sql

-- Create user_sessions table for Spring Security session management
CREATE TABLE user_sessions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    session_id VARCHAR(100) NOT NULL UNIQUE,
    ip_address VARCHAR(45) NOT NULL,
    user_agent VARCHAR(255),
    login_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_activity_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expiry_timestamp TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT chk_session_status CHECK (status IN ('ACTIVE', 'EXPIRED', 'TERMINATED'))
);

-- Create security_events table for Spring Boot Actuator security event tracking
CREATE TABLE security_events (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT,
    event_type VARCHAR(50) NOT NULL,
    event_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(45) NOT NULL,
    description VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL,
    success BOOLEAN NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_event_severity CHECK (severity IN ('HIGH', 'MEDIUM', 'LOW')),
    CONSTRAINT chk_event_type CHECK (event_type IN ('AUTH_SUCCESS', 'AUTH_FAILURE', 'ACCESS_DENIED', 'PASSWORD_CHANGE', 'ROLE_CHANGE', 'ACCOUNT_LOCKED'))
);

-- Create password_history table for Spring Security password management
CREATE TABLE password_history (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    password_hash VARCHAR(100) NOT NULL,
    change_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create login_attempts table for Spring Security brute force protection
CREATE TABLE login_attempts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    attempt_timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    success BOOLEAN NOT NULL
);

-- Create indexes for performance optimization
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_session ON user_sessions(session_id);
CREATE INDEX idx_security_events_user ON security_events(user_id);
CREATE INDEX idx_security_events_type ON security_events(event_type);
CREATE INDEX idx_security_events_timestamp ON security_events(event_timestamp);
CREATE INDEX idx_password_history_user ON password_history(user_id);
CREATE INDEX idx_login_attempts_username ON login_attempts(username);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address);
CREATE INDEX idx_login_attempts_timestamp ON login_attempts(attempt_timestamp);

-- Create trigger for updating last activity timestamp
DELIMITER //
CREATE TRIGGER update_session_activity
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
BEGIN
    SET NEW.last_activity_timestamp = CURRENT_TIMESTAMP;
END//
DELIMITER ;

-- Create trigger for session expiry status
DELIMITER //
CREATE TRIGGER check_session_expiry
    BEFORE UPDATE ON user_sessions
    FOR EACH ROW
BEGIN
    IF NEW.expiry_timestamp < CURRENT_TIMESTAMP THEN
        SET NEW.status = 'EXPIRED';
    END IF;
END//
DELIMITER ;

-- Create cleanup procedure for expired sessions
DELIMITER //
CREATE PROCEDURE cleanup_expired_sessions()
BEGIN
    UPDATE user_sessions 
    SET status = 'EXPIRED' 
    WHERE expiry_timestamp < CURRENT_TIMESTAMP 
    AND status = 'ACTIVE';
END//
DELIMITER ;

-- Create event for automated session cleanup
CREATE EVENT session_cleanup_event
    ON SCHEDULE EVERY 1 HOUR
    DO CALL cleanup_expired_sessions();