-- Integration Tables Migration Script
-- Version: 5.0
-- Author: AI Umbrella Team
-- Dependencies: V3__policy_tables.sql, V4__claims_tables.sql

-- Create sequences for integration tables
CREATE SEQUENCE integration_audit_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE clue_integration_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE policystar_export_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE rmv_validation_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE speedpay_transaction_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create integration audit log table for centralized tracking
CREATE TABLE integration_audit_log (
    id BIGINT DEFAULT nextval('integration_audit_seq') PRIMARY KEY,
    integration_type VARCHAR(50) NOT NULL,
    request_payload TEXT,
    response_payload TEXT,
    status VARCHAR(20) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_integration_type CHECK (integration_type IN ('CLUE', 'POLICYSTAR', 'RMV', 'SPEEDPAY')),
    CONSTRAINT chk_integration_status CHECK (status IN ('SUCCESS', 'FAILURE', 'PENDING', 'RETRY'))
);

-- Create CLUE Property integration table for claims history
CREATE TABLE clue_integration (
    id BIGINT DEFAULT nextval('clue_integration_seq') PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    clue_reference VARCHAR(100) NOT NULL,
    validation_status VARCHAR(20) NOT NULL,
    last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES CSRI_CLAIMS(id) ON DELETE CASCADE,
    CONSTRAINT chk_clue_status CHECK (validation_status IN ('PENDING', 'VALIDATED', 'INVALID', 'ERROR'))
);

-- Create PolicySTAR export table for policy synchronization
CREATE TABLE policystar_export (
    id BIGINT DEFAULT nextval('policystar_export_seq') PRIMARY KEY,
    policy_id BIGINT NOT NULL,
    export_status VARCHAR(20) NOT NULL,
    export_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    retry_count INT NOT NULL DEFAULT 0,
    FOREIGN KEY (policy_id) REFERENCES CSRI_POLICIES(id) ON DELETE CASCADE,
    CONSTRAINT chk_export_status CHECK (export_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED')),
    CONSTRAINT chk_retry_count CHECK (retry_count >= 0 AND retry_count <= 3)
);

-- Create RMV validation table for automated risk assessment
CREATE TABLE rmv_validation (
    id BIGINT DEFAULT nextval('rmv_validation_seq') PRIMARY KEY,
    license_number VARCHAR(50) NOT NULL,
    state VARCHAR(2) NOT NULL,
    validation_result VARCHAR(50) NOT NULL,
    validation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_validation_result CHECK (validation_result IN ('VALID', 'INVALID', 'SUSPENDED', 'EXPIRED', 'NOT_FOUND')),
    CONSTRAINT chk_state_code CHECK (state ~ '^[A-Z]{2}$')
);

-- Create SpeedPay transaction table for claims payments
CREATE TABLE speedpay_transaction (
    id BIGINT DEFAULT nextval('speedpay_transaction_seq') PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES CSRI_CLAIMS(id) ON DELETE CASCADE,
    CONSTRAINT chk_transaction_status CHECK (status IN ('INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED')),
    CONSTRAINT chk_transaction_amount CHECK (amount > 0)
);

-- Create indexes for performance optimization
CREATE INDEX idx_audit_type_status ON integration_audit_log(integration_type, status);
CREATE INDEX idx_audit_created ON integration_audit_log(created_at);
CREATE INDEX idx_clue_claim ON clue_integration(claim_id);
CREATE INDEX idx_clue_reference ON clue_integration(clue_reference);
CREATE INDEX idx_policystar_policy ON policystar_export(policy_id);
CREATE INDEX idx_policystar_status ON policystar_export(export_status);
CREATE INDEX idx_rmv_license ON rmv_validation(license_number, state);
CREATE INDEX idx_speedpay_claim ON speedpay_transaction(claim_id);
CREATE INDEX idx_speedpay_transaction ON speedpay_transaction(transaction_id);

-- Create trigger for updating last_updated timestamp in CLUE integration
CREATE OR REPLACE FUNCTION update_clue_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_clue_timestamp
    BEFORE UPDATE ON clue_integration
    FOR EACH ROW
    EXECUTE FUNCTION update_clue_timestamp();

-- Create trigger for validating PolicySTAR export retry count
CREATE OR REPLACE FUNCTION validate_retry_count()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.retry_count > 3 THEN
        NEW.export_status = 'FAILED';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_policystar_retry
    BEFORE UPDATE ON policystar_export
    FOR EACH ROW
    EXECUTE FUNCTION validate_retry_count();