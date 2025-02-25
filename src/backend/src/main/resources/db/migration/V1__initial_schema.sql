-- Initial database schema migration for security tables
-- Aligned with Jakarta Persistence entity mappings for User, Role and Permission entities
-- Version: 1.0
-- Author: AI Umbrella Team

-- Create users table for storing user account information
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    version BIGINT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    last_login_date TIMESTAMP,
    created_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    modified_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_email CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Create roles table for storing role definitions
CREATE TABLE roles (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    version BIGINT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200)
);

-- Create permissions table for storing permission definitions
CREATE TABLE permissions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    version BIGINT,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(200),
    resource_type VARCHAR(50) NOT NULL,
    access_level VARCHAR(20) NOT NULL,
    CONSTRAINT chk_resource_type CHECK (resource_type IN ('POLICY_DATA', 'CLAIMS_DATA', 'USER_MANAGEMENT', 'REPORTS')),
    CONSTRAINT chk_access_level CHECK (access_level IN ('NONE', 'READ', 'READ_WRITE', 'FULL'))
);

-- Create join table for many-to-many relationship between users and roles
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- Create join table for many-to-many relationship between roles and permissions
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Create indexes for performance optimization
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_permissions_name ON permissions(name);
CREATE INDEX idx_permissions_resource ON permissions(resource_type);

-- Insert default roles
INSERT INTO roles (name, description) VALUES
('ROLE_ADMIN', 'Administrator with full system access'),
('ROLE_MANAGER', 'Manager with elevated privileges'),
('ROLE_USER', 'Standard user with basic access'),
('ROLE_GUEST', 'Guest user with limited access');

-- Insert default permissions
INSERT INTO permissions (name, description, resource_type, access_level) VALUES
('POLICY_FULL_ACCESS', 'Full access to policy data', 'POLICY_DATA', 'FULL'),
('POLICY_READ_WRITE', 'Read/write access to policy data', 'POLICY_DATA', 'READ_WRITE'),
('POLICY_READ', 'Read-only access to policy data', 'POLICY_DATA', 'READ'),
('CLAIMS_FULL_ACCESS', 'Full access to claims data', 'CLAIMS_DATA', 'FULL'),
('CLAIMS_READ_WRITE', 'Read/write access to claims data', 'CLAIMS_DATA', 'READ_WRITE'),
('CLAIMS_READ', 'Read-only access to claims data', 'CLAIMS_DATA', 'READ'),
('USER_FULL_ACCESS', 'Full access to user management', 'USER_MANAGEMENT', 'FULL'),
('USER_READ', 'Read-only access to user management', 'USER_MANAGEMENT', 'READ'),
('REPORTS_FULL_ACCESS', 'Full access to reports', 'REPORTS', 'FULL'),
('REPORTS_READ', 'Read-only access to reports', 'REPORTS', 'READ');

-- Assign default permissions to roles
-- Admin role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_ADMIN' AND p.access_level = 'FULL';

-- Manager role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_MANAGER' 
AND ((p.resource_type IN ('POLICY_DATA', 'CLAIMS_DATA') AND p.access_level = 'READ_WRITE')
OR (p.resource_type = 'USER_MANAGEMENT' AND p.access_level = 'READ')
OR (p.resource_type = 'REPORTS' AND p.access_level = 'FULL'));

-- User role permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id FROM roles r, permissions p
WHERE r.name = 'ROLE_USER'
AND p.access_level = 'READ';

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_user_modified_date
    BEFORE UPDATE ON users
    FOR EACH ROW
    SET NEW.modified_date = CURRENT_TIMESTAMP;