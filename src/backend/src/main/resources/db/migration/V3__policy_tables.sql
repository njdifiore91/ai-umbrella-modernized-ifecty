-- Policy Management Tables Migration Script
-- Version: 3.0
-- Author: AI Umbrella Team
-- Dependencies: V2__security_tables.sql

-- Create sequence for policy IDs
CREATE SEQUENCE CSRI_POLICIES_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create sequence for coverage IDs
CREATE SEQUENCE CSRI_COVERAGE_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create sequence for endorsement IDs
CREATE SEQUENCE CSRI_ENDORSEMENTS_SEQ
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Create policies table for storing core policy information
CREATE TABLE CSRI_POLICIES (
    id BIGINT DEFAULT nextval('CSRI_POLICIES_SEQ') PRIMARY KEY,
    policy_number VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL,
    premium DECIMAL(19,2) NOT NULL,
    effective_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    owner_id BIGINT NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id),
    CONSTRAINT chk_policy_status CHECK (status IN ('DRAFT', 'ACTIVE', 'CANCELLED', 'EXPIRED', 'PENDING_RENEWAL')),
    CONSTRAINT chk_policy_dates CHECK (effective_date < expiry_date),
    CONSTRAINT chk_premium_amount CHECK (premium >= 0)
);

-- Create coverage table for storing policy coverage details
CREATE TABLE CSRI_COVERAGE (
    id BIGINT DEFAULT nextval('CSRI_COVERAGE_SEQ') PRIMARY KEY,
    policy_id BIGINT NOT NULL,
    coverage_type VARCHAR(50) NOT NULL,
    description VARCHAR(255),
    limit_amount DECIMAL(19,2) NOT NULL,
    deductible DECIMAL(19,2) NOT NULL,
    effective_date TIMESTAMP NOT NULL,
    expiry_date TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL,
    FOREIGN KEY (policy_id) REFERENCES CSRI_POLICIES(id) ON DELETE CASCADE,
    CONSTRAINT chk_coverage_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'PENDING')),
    CONSTRAINT chk_coverage_dates CHECK (effective_date < expiry_date),
    CONSTRAINT chk_coverage_amounts CHECK (limit_amount >= 0 AND deductible >= 0)
);

-- Create endorsements table for storing policy changes and modifications
CREATE TABLE CSRI_ENDORSEMENTS (
    id BIGINT DEFAULT nextval('CSRI_ENDORSEMENTS_SEQ') PRIMARY KEY,
    policy_id BIGINT NOT NULL,
    endorsement_number VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    type VARCHAR(50) NOT NULL,
    premium_change DECIMAL(19,2) NOT NULL,
    effective_date TIMESTAMP NOT NULL,
    processed_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL,
    reason VARCHAR(255),
    FOREIGN KEY (policy_id) REFERENCES CSRI_POLICIES(id) ON DELETE CASCADE,
    CONSTRAINT chk_endorsement_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'CANCELLED')),
    CONSTRAINT chk_endorsement_type CHECK (type IN ('COVERAGE_CHANGE', 'LIMIT_CHANGE', 'DEDUCTIBLE_CHANGE', 'POLICY_CHANGE'))
);

-- Create indexes for performance optimization
CREATE INDEX IDX_POLICY_NUMBER ON CSRI_POLICIES(policy_number);
CREATE INDEX IDX_POLICY_OWNER ON CSRI_POLICIES(owner_id);
CREATE INDEX IDX_COVERAGE_POLICY ON CSRI_COVERAGE(policy_id);
CREATE INDEX IDX_ENDORSEMENT_POLICY ON CSRI_ENDORSEMENTS(policy_id);

-- Create trigger for updating policy modified_date
CREATE OR REPLACE FUNCTION update_policy_modified_date()
RETURNS TRIGGER AS $$
BEGIN
    NEW.modified_date = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_policy_modified_date
    BEFORE UPDATE ON CSRI_POLICIES
    FOR EACH ROW
    EXECUTE FUNCTION update_policy_modified_date();

-- Create trigger for validating policy dates
CREATE OR REPLACE FUNCTION validate_policy_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.effective_date >= NEW.expiry_date THEN
        RAISE EXCEPTION 'Policy effective date must be before expiry date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_policy_dates_validation
    BEFORE INSERT OR UPDATE ON CSRI_POLICIES
    FOR EACH ROW
    EXECUTE FUNCTION validate_policy_dates();

-- Create trigger for validating coverage dates
CREATE OR REPLACE FUNCTION validate_coverage_dates()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.effective_date >= NEW.expiry_date THEN
        RAISE EXCEPTION 'Coverage effective date must be before expiry date';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_coverage_dates_validation
    BEFORE INSERT OR UPDATE ON CSRI_COVERAGE
    FOR EACH ROW
    EXECUTE FUNCTION validate_coverage_dates();