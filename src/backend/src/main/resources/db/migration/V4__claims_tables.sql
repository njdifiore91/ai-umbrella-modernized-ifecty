-- Claims Management Tables Migration Script
-- Version: 4.0
-- Author: AI Umbrella Team
-- Dependencies: V3__policy_tables.sql

-- Create sequence for claims IDs
CREATE SEQUENCE CSRI_CLAIMS_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create sequence for claim documents IDs
CREATE SEQUENCE CSRI_CLAIM_DOCS_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create sequence for claim payments IDs
CREATE SEQUENCE CSRI_CLAIM_PAYMENTS_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create claims table for storing core claim information
CREATE TABLE CSRI_CLAIMS (
    id BIGINT DEFAULT nextval('CSRI_CLAIMS_SEQ') PRIMARY KEY,
    claim_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    description TEXT,
    claim_amount DECIMAL(19,2) NOT NULL,
    incident_date TIMESTAMP NOT NULL,
    reported_date TIMESTAMP NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    policy_id BIGINT NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES CSRI_POLICIES(id),
    CONSTRAINT chk_claim_status CHECK (status IN ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'APPROVED', 'DENIED', 'CLOSED')),
    CONSTRAINT chk_claim_amount CHECK (claim_amount >= 0),
    CONSTRAINT chk_claim_dates CHECK (incident_date <= reported_date)
);

-- Create claim documents table for storing document metadata
CREATE TABLE CSRI_CLAIM_DOCUMENTS (
    id BIGINT DEFAULT nextval('CSRI_CLAIM_DOCS_SEQ') PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    content_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    storage_location VARCHAR(500) NOT NULL,
    upload_date DATE NOT NULL DEFAULT CURRENT_DATE,
    uploaded_by VARCHAR(100) NOT NULL,
    FOREIGN KEY (claim_id) REFERENCES CSRI_CLAIMS(id) ON DELETE CASCADE,
    CONSTRAINT chk_file_size CHECK (file_size > 0)
);

-- Create claims payments table for payment tracking and SpeedPay integration
CREATE TABLE CSRI_CLAIMS_PAYMENTS (
    id BIGINT DEFAULT nextval('CSRI_CLAIM_PAYMENTS_SEQ') PRIMARY KEY,
    claim_id BIGINT NOT NULL,
    transaction_id VARCHAR(100) NOT NULL UNIQUE,
    amount DECIMAL(19,2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP,
    FOREIGN KEY (claim_id) REFERENCES CSRI_CLAIMS(id) ON DELETE CASCADE,
    CONSTRAINT chk_payment_status CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    CONSTRAINT chk_payment_method CHECK (payment_method IN ('ACH', 'CHECK', 'WIRE', 'CREDIT_CARD')),
    CONSTRAINT chk_payment_amount CHECK (amount > 0)
);

-- Create indexes for performance optimization
CREATE INDEX idx_claim_number ON CSRI_CLAIMS(claim_number);
CREATE INDEX idx_claim_policy ON CSRI_CLAIMS(policy_id);
CREATE INDEX idx_claim_status ON CSRI_CLAIMS(status);
CREATE INDEX idx_claim_dates ON CSRI_CLAIMS(incident_date, reported_date);
CREATE INDEX idx_document_claim ON CSRI_CLAIM_DOCUMENTS(claim_id);
CREATE INDEX idx_payment_claim ON CSRI_CLAIMS_PAYMENTS(claim_id);
CREATE INDEX idx_payment_transaction ON CSRI_CLAIMS_PAYMENTS(transaction_id);

-- Create trigger for updating claim modified_date
CREATE OR REPLACE FUNCTION update_claim_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_claim_modified_date
    BEFORE UPDATE ON CSRI_CLAIMS
    FOR EACH ROW
    EXECUTE FUNCTION update_claim_modified_date();

-- Create trigger for validating claim dates
CREATE OR REPLACE FUNCTION validate_claim_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.incident_date > NEW.reported_date THEN
        RAISE EXCEPTION 'Incident date cannot be after reported date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_claim_dates_validation
    BEFORE INSERT OR UPDATE ON CSRI_CLAIMS
    FOR EACH ROW
    EXECUTE FUNCTION validate_claim_dates();

-- Create trigger for payment status validation
CREATE OR REPLACE FUNCTION validate_payment_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'COMPLETED' AND NEW.processed_at IS NULL THEN
        NEW.processed_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_payment_status_validation
    BEFORE INSERT OR UPDATE ON CSRI_CLAIMS_PAYMENTS
    FOR EACH ROW
    EXECUTE FUNCTION validate_payment_status();