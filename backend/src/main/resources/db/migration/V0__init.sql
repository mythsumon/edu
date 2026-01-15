-- Initial database schema migration
-- Version: V0 (Initial)

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Create index on role name for faster lookups
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Insert default roles
INSERT INTO roles (name) VALUES ('ADMIN'), ('INSTRUCTOR')
ON CONFLICT (name) DO NOTHING;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role_id BIGINT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE NOT NULL,
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE RESTRICT
);

-- Create indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role_id ON users(role_id);

-- Refresh tokens table
CREATE TABLE refresh_tokens (
    id BIGSERIAL PRIMARY KEY,
    lookup_hash VARCHAR(255) NOT NULL UNIQUE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE,
    revoked_reason VARCHAR(100),
    revoked_at TIMESTAMP,
    replaced_by_id BIGINT,
    user_id BIGINT NOT NULL,
    created_by_ip VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    CONSTRAINT fk_refresh_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for refresh_tokens
CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_token_lookup_hash ON refresh_tokens(lookup_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_token_user_id ON refresh_tokens(user_id);

-- Zones table
CREATE TABLE IF NOT EXISTS zones (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Create index on zone name for faster lookups
CREATE INDEX IF NOT EXISTS idx_zones_name ON zones(name);

-- Regions table
CREATE TABLE IF NOT EXISTS regions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    zone_id BIGINT NOT NULL,
    CONSTRAINT fk_regions_zone FOREIGN KEY (zone_id) REFERENCES zones(id) ON DELETE RESTRICT
);

-- Create indexes for regions table
CREATE INDEX IF NOT EXISTS idx_regions_name ON regions(name);
CREATE INDEX IF NOT EXISTS idx_regions_zone_id ON regions(zone_id);

-- Master code table (hierarchical self-referencing table)
-- Must be created before instructors table as instructors reference master_code
CREATE TABLE IF NOT EXISTS master_code (
    id BIGSERIAL PRIMARY KEY,
    code INT NOT NULL,
    code_name VARCHAR(255) NOT NULL,
    parent_id BIGINT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP,
    is_delete BOOLEAN NOT NULL DEFAULT FALSE,
    CONSTRAINT fk_master_code_parent FOREIGN KEY (parent_id) REFERENCES master_code(id) ON DELETE RESTRICT
);

-- Create indexes for master_code table
CREATE INDEX IF NOT EXISTS idx_master_code_parent_id ON master_code(parent_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_master_code_parent_code ON master_code(parent_id, code);
CREATE UNIQUE INDEX IF NOT EXISTS uq_master_code_parent_name ON master_code(parent_id, code_name);

-- Admins table
CREATE TABLE IF NOT EXISTS admins (
    user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    profile_photo VARCHAR(500),
    CONSTRAINT fk_admins_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for admins table
CREATE INDEX IF NOT EXISTS idx_admins_email ON admins(email);
CREATE INDEX IF NOT EXISTS idx_admins_phone ON admins(phone);

-- Instructors table
CREATE TABLE IF NOT EXISTS instructors (
    user_id BIGINT PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    gender VARCHAR(20),
    dob DATE,
    region_id BIGINT,
    city VARCHAR(255),
    street VARCHAR(255),
    detail_address VARCHAR(500),
    status_id BIGINT,
    classification_id BIGINT,
    signature VARCHAR(500),
    profile_photo VARCHAR(500),
    CONSTRAINT fk_instructors_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_instructors_region FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE RESTRICT,
    CONSTRAINT fk_instructors_status FOREIGN KEY (status_id) REFERENCES master_code(id) ON DELETE RESTRICT,
    CONSTRAINT fk_instructors_classification FOREIGN KEY (classification_id) REFERENCES master_code(id) ON DELETE RESTRICT
);

-- Create indexes for instructors table
CREATE INDEX IF NOT EXISTS idx_instructors_email ON instructors(email);
CREATE INDEX IF NOT EXISTS idx_instructors_phone ON instructors(phone);
CREATE INDEX IF NOT EXISTS idx_instructors_region_id ON instructors(region_id);
CREATE INDEX IF NOT EXISTS idx_instructors_status_id ON instructors(status_id);
CREATE INDEX IF NOT EXISTS idx_instructors_classification_id ON instructors(classification_id);

-- Samples table
CREATE TABLE IF NOT EXISTS samples (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE
);

-- Create index on name for faster lookups
CREATE INDEX IF NOT EXISTS idx_samples_name ON samples(name);
