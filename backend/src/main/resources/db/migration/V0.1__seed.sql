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
-- First insert the parent
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('100', 'Instructor Status', NULL, NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Then insert the children
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('100-1', 'Active', (SELECT id FROM master_code WHERE code = '100' AND parent_id IS NULL), NOW(), FALSE),
    ('100-2', 'Inactive', (SELECT id FROM master_code WHERE code = '100' AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert master codes for instructor classification
-- First insert the parent
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('200', 'Instructor Classification', NULL, NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Then insert the children
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('200-1', 'Basic', (SELECT id FROM master_code WHERE code = '200' AND parent_id IS NULL), NOW(), FALSE),
    ('200-2', 'Intermediate', (SELECT id FROM master_code WHERE code = '200' AND parent_id IS NULL), NOW(), FALSE),
    ('200-3', 'Advanced', (SELECT id FROM master_code WHERE code = '200' AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert master codes for education type
-- First insert the parent
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('300', 'Education Type', NULL, NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Then insert the children
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('300-1', 'On site Education', (SELECT id FROM master_code WHERE code = '300' AND parent_id IS NULL), NOW(), FALSE),
    ('300-2', 'Center Education', (SELECT id FROM master_code WHERE code = '300' AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert master codes for institution type
-- First insert the parent
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('400', 'Institution Type', NULL, NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Then insert the children
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('400-1', 'Institution Type A', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE),
    ('400-2', 'Institution Type B', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE),
    ('400-3', 'Institution Type C', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE),
    ('400-4', 'Institution Type D', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE),
    ('400-5', 'Institution Type E', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE),
    ('400-6', 'Institution Type F', (SELECT id FROM master_code WHERE code = '400' AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert master codes for district
-- First insert the parent
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('500', 'District', NULL, NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Insert 경기도 (Gyeonggi-do)
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('500-1', '경기도', (SELECT id FROM master_code WHERE code = '500' AND parent_id IS NULL), NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Insert zones under 경기도
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('500-1-1', 'Zone-1', (SELECT id FROM master_code WHERE code = '500-1'), NOW(), FALSE),
    ('500-1-2', 'Zone-2', (SELECT id FROM master_code WHERE code = '500-1'), NOW(), FALSE),
    ('500-1-3', 'Zone-3', (SELECT id FROM master_code WHERE code = '500-1'), NOW(), FALSE),
    ('500-1-4', 'Zone-4', (SELECT id FROM master_code WHERE code = '500-1'), NOW(), FALSE),
    ('500-1-5', 'Zone-5', (SELECT id FROM master_code WHERE code = '500-1'), NOW(), FALSE)
ON CONFLICT DO NOTHING;
-- Insert cities under each zone
INSERT INTO master_code (code, code_name, parent_id, created_at, is_delete) VALUES
    ('500-1-1-1', 'Suwon City', (SELECT id FROM master_code WHERE code = '500-1-1'), NOW(), FALSE),
    ('500-1-1-2', 'Yongin City', (SELECT id FROM master_code WHERE code = '500-1-1'), NOW(), FALSE),
    ('500-1-2-1', 'Goyang City', (SELECT id FROM master_code WHERE code = '500-1-2'), NOW(), FALSE),
    ('500-1-2-2', 'Seongnam City', (SELECT id FROM master_code WHERE code = '500-1-2'), NOW(), FALSE),
    ('500-1-3-1', 'Bucheon City', (SELECT id FROM master_code WHERE code = '500-1-3'), NOW(), FALSE),
    ('500-1-3-2', 'Ansan City', (SELECT id FROM master_code WHERE code = '500-1-3'), NOW(), FALSE),
    ('500-1-4-1', 'Anyang City', (SELECT id FROM master_code WHERE code = '500-1-4'), NOW(), FALSE),
    ('500-1-4-2', 'Hwaseong City', (SELECT id FROM master_code WHERE code = '500-1-4'), NOW(), FALSE),
    ('500-1-5-1', 'Pyeongtaek City', (SELECT id FROM master_code WHERE code = '500-1-5'), NOW(), FALSE),
    ('500-1-5-2', 'Gimpo City', (SELECT id FROM master_code WHERE code = '500-1-5'), NOW(), FALSE)
ON CONFLICT DO NOTHING;

-- Insert admin user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('admin',
        '$2a$10$LWSEfV04/gvaPfZED39xuOc.QDJs3nCBjvQ2NRqLxyCpHbrj0gpjK',
        (SELECT id FROM roles WHERE name = 'ADMIN'),
        TRUE)
ON CONFLICT (username) DO NOTHING;
-- Insert admin profile
INSERT INTO admins (user_id, name, email, phone)
VALUES ((SELECT id FROM users WHERE username = 'admin'),
        'Admin User',
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
INSERT INTO instructors (user_id, name, email, phone, gender, dob, region_id, city, street, detail_address, status_id, classification_id)
VALUES ((SELECT id FROM users WHERE username = 'instructor'),
        'Instructor User',
        'instructor@example.com',
        '+1234567890',
        'MALE',
        '1990-01-01',
        (SELECT id FROM regions WHERE name = 'Central Region 1' LIMIT 1),
        'City',
        'Street',
        'Detail Address',
        (SELECT id FROM master_code WHERE code = '100-1' AND parent_id = (SELECT id FROM master_code WHERE code = '100' AND parent_id IS NULL)),
        (SELECT id FROM master_code WHERE code = '200-1' AND parent_id = (SELECT id FROM master_code WHERE code = '200' AND parent_id IS NULL)))
ON CONFLICT (user_id) DO NOTHING;

-- Insert teacher user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('teacher-a',
        '$2a$10$mDQoYJDbT2nybSeSa.FeJuSa67r15X3s.HjCxlUjnDMsu0Hv6aS/O',
        (SELECT id FROM roles WHERE name = 'TEACHER'),
        TRUE)
ON CONFLICT (username) DO NOTHING;
-- Insert teacher profile
INSERT INTO teachers (user_id, first_name, last_name, email, phone)
VALUES ((SELECT id FROM users WHERE username = 'teacher-a'),
        'TeacherA',
        'User',
        'teachera@example.com',
        '+1234567890')
ON CONFLICT (user_id) DO NOTHING;


