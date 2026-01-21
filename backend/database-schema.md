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
| code | VARCHAR(255) | NOT NULL | Code value (e.g., "400" for parent, "400-1", "400-2" for children) |
| code_name | VARCHAR(255) | NOT NULL | Code name/description |
| parent_id | BIGINT | NULL, FOREIGN KEY | Reference to parent master_code.id (NULL for root level codes) |

**Foreign Keys**:
- `master_code.parent_id` → `master_code(id)` ON DELETE RESTRICT

**Indexes**:
- `idx_master_code_parent_id` on `parent_id` - For faster tree queries and parent-child lookups
- `uq_master_code_parent_code` on `(parent_id, code)` (UNIQUE) - Ensures code uniqueness within the same parent
- `uq_master_code_parent_name` on `(parent_id, code_name)` (UNIQUE) - Ensures code name uniqueness within the same parent

---

### teachers
**Description**: Stores teacher profile information linked to user accounts.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| user_id | BIGINT | PRIMARY KEY, FOREIGN KEY | Reference to users.id (one-to-one relationship) |
| first_name | VARCHAR(255) | NOT NULL | Teacher's first name |
| last_name | VARCHAR(255) | NOT NULL | Teacher's last name |
| email | VARCHAR(255) | | Teacher's email address |
| phone | VARCHAR(50) | | Teacher's phone number |
| profile_photo | VARCHAR(500) | | Path to teacher's profile photo |

**Foreign Keys**:
- `fk_teachers_user` → `users(id)` ON DELETE CASCADE

**Indexes**:
- `idx_teachers_email` on `email` - For faster email-based lookups
- `idx_teachers_phone` on `phone` - For faster phone-based lookups

---

### institutions
**Description**: Stores institution information including type, location, education type, and in-charge person details.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Institution unique identifier (auto-increment) |
| name | VARCHAR(255) | NOT NULL | Institution name |
| institution_type_id | BIGINT | FOREIGN KEY | Reference to master_code.id for institution type (code 400 series) |
| phone_number | VARCHAR(50) | | Institution phone number |
| region_id | BIGINT | FOREIGN KEY | Reference to master_code.id for region |
| education_type_id | BIGINT | FOREIGN KEY | Reference to master_code.id for education type (code 300 series) |
| street | VARCHAR(255) | | Street/Road address |
| additional_address | VARCHAR(500) | | Additional address information |
| note | TEXT | | Additional notes about the institution |
| in_charge_person_id | BIGINT | FOREIGN KEY | Reference to teachers.user_id (in-charge person) |
| signature | VARCHAR(500) | | Path to signature file (file upload) |

**Foreign Keys**:
- `fk_institutions_institution_type` → `master_code(id)` ON DELETE RESTRICT
- `fk_institutions_region` → `master_code(id)` ON DELETE RESTRICT
- `fk_institutions_education_type` → `master_code(id)` ON DELETE RESTRICT
- `fk_institutions_in_charge_person` → `teachers(user_id)` ON DELETE RESTRICT

**Indexes**:
- `idx_institutions_name` on `name` - For faster name-based lookups
- `idx_institutions_institution_type_id` on `institution_type_id` - For filtering by institution type
- `idx_institutions_region_id` on `region_id` - For filtering by region
- `idx_institutions_education_type_id` on `education_type_id` - For filtering by education type
- `idx_institutions_in_charge_person_id` on `in_charge_person_id` - For filtering by in-charge person

---

### programs
**Description**: Stores program information including session/part, name, status, program type, and notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Program unique identifier (auto-increment) |
| program_id | VARCHAR(255) | UNIQUE | Auto-generated program ID in format "PID{serial}" |
| session_part_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to master_code.id for session/part |
| name | VARCHAR(255) | NOT NULL | Program name |
| status_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to master_code.id for program status |
| program_type_id | BIGINT | FOREIGN KEY | Reference to master_code.id for program type |
| notes | TEXT | | Additional notes about the program |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| updated_at | TIMESTAMP | | Timestamp when record was last updated |
| is_delete | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft delete flag |

**Foreign Keys**:
- `fk_programs_session_part` → `master_code(id)` ON DELETE RESTRICT
- `fk_programs_status` → `master_code(id)` ON DELETE RESTRICT
- `fk_programs_program_type` → `master_code(id)` ON DELETE RESTRICT

**Indexes**:
- `idx_programs_program_id` on `program_id` - For faster program_id lookups
- `idx_programs_name` on `name` - For faster name-based lookups
- `idx_programs_session_part_id` on `session_part_id` - For filtering by session/part
- `idx_programs_status_id` on `status_id` - For filtering by status
- `idx_programs_program_type_id` on `program_type_id` - For filtering by program type
- `idx_programs_is_delete` on `is_delete` - For filtering active/deleted records

---

### trainings
**Description**: Stores training information linked to a program and institution, including schedule (date-only), grade/class info, student count, and notes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Training unique identifier (auto-increment) |
| training_id | VARCHAR(255) | UNIQUE | Auto-generated training ID in format "EDU-YYYY-{serial}" |
| name | VARCHAR(255) | NOT NULL | Training name |
| program_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to programs.id |
| institution_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to institutions.id |
| description | TEXT | | Training description |
| start_date | DATE | NOT NULL | Training start date (date only) |
| end_date | DATE | NOT NULL | Training end date (date only) |
| note | TEXT | | Additional note |
| grade | VARCHAR(50) | | Grade info (flexible text) |
| class | VARCHAR(50) | | Class info (flexible text) |
| number_students | INT | CHECK (number_students >= 0) | Number of students |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| updated_at | TIMESTAMP | | Timestamp when record was last updated |
| is_delete | BOOLEAN | NOT NULL, DEFAULT FALSE | Soft delete flag |

**Check Constraints**:
- `chk_training_date_range` → `end_date >= start_date`
- `chk_training_number_students` → `number_students >= 0`

**Foreign Keys**:
- `fk_training_program` → `programs(id)` ON DELETE RESTRICT
- `fk_training_institution` → `institutions(id)` ON DELETE RESTRICT

**Indexes**:
- `idx_training_training_id` on `training_id` - For faster training_id lookups
- `idx_training_name` on `name` - For faster name-based lookups
- `idx_training_program_id` on `program_id` - For filtering by program
- `idx_training_institution_id` on `institution_id` - For filtering by institution
- `idx_training_start_date` on `start_date` - For schedule filtering/sorting
- `idx_training_end_date` on `end_date` - For schedule filtering/sorting
- `idx_training_is_delete` on `is_delete` - For filtering active/deleted records

---

### periods
**Description**: Stores period/class session information linked to trainings, including date, time range, and number of instructors required.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | BIGSERIAL | PRIMARY KEY | Period unique identifier (auto-increment) |
| date | DATE | NOT NULL | Period date |
| start_time | TIME | NOT NULL | Period start time |
| end_time | TIME | NOT NULL | Period end time |
| number_main_instructors | INT | | Number of main instructors required |
| number_assistant_instructors | INT | | Number of assistant instructors required |
| training_id | BIGINT | NOT NULL, FOREIGN KEY | Reference to trainings.id |
| created_at | TIMESTAMP | NOT NULL, DEFAULT NOW() | Timestamp when record was created |
| updated_at | TIMESTAMP | | Timestamp when record was last updated |

**Check Constraints**:
- `chk_period_time_range` → `end_time > start_time`
- `chk_period_main_instructors` → `number_main_instructors >= 0`
- `chk_period_assistant_instructors` → `number_assistant_instructors >= 0`

**Foreign Keys**:
- `fk_period_training` → `trainings(id)` ON DELETE CASCADE

**Indexes**:
- `idx_period_date` on `date` - For date-based filtering/sorting
- `idx_period_training_id` on `training_id` - For filtering by training

---

## Relationships
- `refresh_token_t.user_id` → `users.id` (Many-to-One)
  - Cascade delete: When a user is deleted, all their refresh tokens are automatically deleted

- `master_code.parent_id` → `master_code.id` (Self-referencing, Many-to-One)
  - Restrict delete: Prevents deletion of a parent code if it has child codes
  - Supports hierarchical code structure (tree-like organization)

- `teachers.user_id` → `users.id` (One-to-One)
  - Cascade delete: When a user is deleted, their teacher profile is automatically deleted

- `institutions.institution_type_id` → `master_code.id` (Many-to-One)
  - Restrict delete: Prevents deletion of institution type master code if it has associated institutions
  - References institution type codes (400 series)

- `institutions.region_id` → `master_code.id` (Many-to-One)
  - Restrict delete: Prevents deletion of region master code if it has associated institutions
  - References region master codes

- `institutions.education_type_id` → `master_code.id` (Many-to-One)
  - Restrict delete: Prevents deletion of education type master code if it has associated institutions
  - References education type codes (300 series)

- `institutions.in_charge_person_id` → `teachers.user_id` (Many-to-One)
  - Restrict delete: Prevents deletion of a teacher if they are assigned as in-charge person for institutions
  - One teacher can be in-charge of multiple institutions

- `programs.session_part_id` → `master_code.id` (Many-to-One)
  - Restrict delete: Prevents deletion of session/part master code if it has associated programs
  - References session/part master codes

- `programs.status_id` → `master_code.id` (Many-to-One)
  - Restrict delete: Prevents deletion of status master code if it has associated programs
  - References program status master codes

- `trainings.program_id` → `programs.id` (Many-to-One)
  - Restrict delete: Prevents deletion of a program if it has associated trainings
  - One program can have multiple trainings

- `trainings.institution_id` → `institutions.id` (Many-to-One)
  - Restrict delete: Prevents deletion of an institution if it has associated trainings
  - One institution can have multiple trainings

- `periods.training_id` → `trainings.id` (Many-to-One)
  - Cascade delete: When a training is deleted, all its periods are automatically deleted
  - One training can have multiple periods

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

