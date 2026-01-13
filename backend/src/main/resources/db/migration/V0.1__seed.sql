-- Seed admin and instructor users migration
-- Version: V0.1 (Seed Admin and Instructor Users)

-- Insert default admin user
-- Username: admin
-- Password: admin123
-- Role: ADMIN
--
-- Insert default instructor user
-- Username: instructor
-- Password: instructor123
-- Role: INSTRUCTOR
--
-- Note: It is recommended to change the default password after first login
-- To generate a new BCrypt hash, use BCryptPasswordEncoder in your application:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hash = encoder.encode("your-password");

-- Insert zones
INSERT INTO zones (name) VALUES
    ('North Zone'),
    ('South Zone'),
    ('East Zone'),
    ('West Zone'),
    ('Central Zone')
ON CONFLICT DO NOTHING;

-- Insert regions
INSERT INTO regions (name, zone_id) VALUES
    ('North Region 1', (SELECT id FROM zones WHERE name = 'North Zone')),
    ('North Region 2', (SELECT id FROM zones WHERE name = 'North Zone')),
    ('South Region 1', (SELECT id FROM zones WHERE name = 'South Zone')),
    ('South Region 2', (SELECT id FROM zones WHERE name = 'South Zone')),
    ('East Region 1', (SELECT id FROM zones WHERE name = 'East Zone')),
    ('West Region 1', (SELECT id FROM zones WHERE name = 'West Zone')),
    ('Central Region 1', (SELECT id FROM zones WHERE name = 'Central Zone'))
ON CONFLICT DO NOTHING;

-- Insert master codes for instructor status
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    (100, 'Instructor Status', NULL, NOW(), FALSE),
    (101, 'Active', (SELECT id FROM master_code WHERE code = 100 AND parent_id IS NULL), NOW(), FALSE),
    (102, 'Inactive', (SELECT id FROM master_code WHERE code = 100 AND parent_id IS NULL), NOW(), FALSE),
    (103, 'Pending', (SELECT id FROM master_code WHERE code = 100 AND parent_id IS NULL), NOW(), FALSE),
    (104, 'Suspended', (SELECT id FROM master_code WHERE code = 100 AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert master codes for instructor classification
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    (200, 'Instructor Classification', NULL, NOW(), FALSE),
    (201, 'Senior Instructor', (SELECT id FROM master_code WHERE code = 200 AND parent_id IS NULL), NOW(), FALSE),
    (202, 'Junior Instructor', (SELECT id FROM master_code WHERE code = 200 AND parent_id IS NULL), NOW(), FALSE),
    (203, 'Associate Instructor', (SELECT id FROM master_code WHERE code = 200 AND parent_id IS NULL), NOW(), FALSE),
    (204, 'Guest Instructor', (SELECT id FROM master_code WHERE code = 200 AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert admin user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('admin',
        '$2a$10$LWSEfV04/gvaPfZED39xuOc.QDJs3nCBjvQ2NRqLxyCpHbrj0gpjK',
        (SELECT id FROM roles WHERE name = 'ADMIN'),
        TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert admin profile
INSERT INTO admins (user_id, first_name, last_name, email, phone)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        'Admin',
        'User',
        'admin@example.com',
        '+1234567890')
ON CONFLICT (user_id) DO NOTHING;

-- Insert instructor user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('instructor',
        '$2a$10$G.WvTmhnBFEDmP1zL9jCrOU3HcCJYc6NGfL2kXM4FLCh9CBnLBdBi',
        (SELECT id FROM roles WHERE name = 'INSTRUCTOR'),
        TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert instructor profile
INSERT INTO instructors (user_id, first_name, last_name, email, phone, gender, dob, region_id, city, street, detail_address, status_id, classification_id)
VALUES ((SELECT id FROM users WHERE username = 'instructor'),
        'Instructor',
        'User',
        'instructor@example.com',
        '+1234567890',
        'MALE',
        '1990-01-01',
        (SELECT id FROM regions WHERE name = 'Central Region 1' LIMIT 1),
        'City',
        'Street',
        'Detail Address',
        (SELECT id FROM master_code WHERE code = 101 AND parent_id = (SELECT id FROM master_code WHERE code = 100 AND parent_id IS NULL)),
        (SELECT id FROM master_code WHERE code = 201 AND parent_id = (SELECT id FROM master_code WHERE code = 200 AND parent_id IS NULL)))
ON CONFLICT (user_id) DO NOTHING;
