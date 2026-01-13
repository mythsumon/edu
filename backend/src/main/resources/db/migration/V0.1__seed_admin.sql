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

-- Insert admin user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('admin',
        '$2a$10$LWSEfV04/gvaPfZED39xuOc.QDJs3nCBjvQ2NRqLxyCpHbrj0gpjK',
        (SELECT id FROM roles WHERE name = 'ADMIN'),
        TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert admin profile
INSERT INTO admins (user_id, name)
VALUES ((SELECT id FROM users WHERE username = 'admin'), 'Admin User')
ON CONFLICT (user_id) DO NOTHING;

-- Insert instructor user
INSERT INTO users (username, password, role_id, enabled)
VALUES ('instructor',
        '$2a$10$G.WvTmhnBFEDmP1zL9jCrOU3HcCJYc6NGfL2kXM4FLCh9CBnLBdBi',
        (SELECT id FROM roles WHERE name = 'INSTRUCTOR'),
        TRUE)
ON CONFLICT (username) DO NOTHING;

-- Insert instructor profile
INSERT INTO instructors (user_id, name, email, phone, gender, dob, city, street, detail_address)
VALUES ((SELECT id FROM users WHERE username = 'instructor'),
        'Instructor User',
        'instructor@example.com',
        '+1234567890',
        'MALE',
        '1990-01-01',
        'City',
        'Street',
        'Detail Address')
ON CONFLICT (user_id) DO NOTHING;
