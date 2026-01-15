# Database Schema Documentation

## Overview
This document describes the database schema structure for the backend application. The schema is managed using Flyway migrations located in `src/main/resources/db/`.

---

## Tables

### users
**Description**: Stores user account information and authentication details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | User unique identifier (auto-increment) |
| username | VARCHAR(255) | NOT NULL, UNIQUE | Username for login |
| password | VARCHAR(255) | NOT NULL | Encrypted password (BCrypt) |
| role | VARCHAR(255) | NOT NULL | User role (USER, ADMIN, etc.) |
| enabled | BOOLEAN | NOT NULL, DEFAULT TRUE | Account enabled status |

**Indexes**:
- `idx_users_username` on `username` - For faster username lookups during authentication

---

### refresh_token_t
**Description**: Stores JWT refresh tokens for secure token refresh mechanism.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Token unique identifier (auto-increment) |
| lookup_hash | VARCHAR(255) | NOT NULL, UNIQUE | Hash for token lookup |
| token | VARCHAR(255) | NOT NULL | Refresh token value |
| expires_at | TIMESTAMP | NOT NULL | Token expiration timestamp |
| revoked | BOOLEAN | NOT NULL, DEFAULT FALSE | Token revocation status |
| revoked_reason | VARCHAR(100) | | Reason for token revocation |
| revoked_at | TIMESTAMP | | Timestamp when token was revoked |
| replaced_by_id | BIGINT | | ID of token that replaced this one |
| user_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to users.id |
| created_by_ip | VARCHAR(45) | | Client IP address when token was created |
| user_agent | VARCHAR(255) | | Client user agent string |

**Foreign Keys**:
- `fk_refresh_token_user` → `users(id)` ON DELETE CASCADE

**Indexes**:
- `idx_refresh_token_lookup_hash` on `lookup_hash` (UNIQUE) - For token lookup
- `idx_refresh_token_user_id` on `user_id` - For user-based token queries

---

### samples
**Description**: Sample entity table for testing and demonstration purposes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Sample unique identifier (auto-increment) |
| name | VARCHAR(255) | UNIQUE | Sample name |

**Indexes**:
- `idx_samples_name` on `name` - For faster name-based lookups

---

### master_code
**Description**: Stores hierarchical master code data with parent-child relationships for code management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Master code unique identifier (auto-increment) |
| code | INT | NOT NULL | Code value |
| code_name | VARCHAR(255) | NOT NULL | Code name/description |
| parent_id | BIGINT | NULL, FOREIGN KEY | Reference to parent master_code.id (NULL for root level codes) |

**Foreign Keys**:
- `master_code.parent_id` → `master_code(id)` ON DELETE RESTRICT

**Indexes**:
- `idx_master_code_parent_id` on `parent_id` - For faster tree queries and parent-child lookups
- `uq_master_code_parent_code` on `(parent_id, code)` (UNIQUE) - Ensures code uniqueness within the same parent
- `uq_master_code_parent_name` on `(parent_id, code_name)` (UNIQUE) - Ensures code name uniqueness within the same parent

---

## Relationships

- `refresh_token_t.user_id` → `users.id` (Many-to-One)
  - Cascade delete: When a user is deleted, all their refresh tokens are automatically deleted

- `master_code.parent_id` → `master_code.id` (Self-referencing, Many-to-One)
  - Restrict delete: Prevents deletion of a parent code if it has child codes
  - Supports hierarchical code structure (tree-like organization)

---

## Schema Management

### Migration Files
- Location: `src/main/resources/db/`
- Format: Flyway naming convention (`V{version}__{description}.sql`)
- Current version: `V0__init.sql` (Initial schema)

### Adding New Tables
1. Create a new Flyway migration file following the naming convention
2. Update this documentation with the new table structure
3. Update corresponding Entity classes in the Java codebase

---

## Notes
- All tables use `BIGSERIAL` for primary keys (PostgreSQL auto-increment)
- Timestamps are stored in UTC
- Passwords are encrypted using BCrypt before storage
- Refresh tokens implement token rotation and revocation mechanism
- Foreign keys use CASCADE delete where appropriate for data integrity

