-- Seed admin user migration
-- Version: V0.1 (Seed Admin User)

-- Insert default admin user
-- Username: admin
-- Password: admin123
-- Role: ADMIN
--
-- Note: It is recommended to change the default password after first login
-- To generate a new BCrypt hash, use BCryptPasswordEncoder in your application:
-- BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
-- String hash = encoder.encode("your-password");

INSERT INTO users (username, password, role, enabled)
VALUES ('admin',
        '$2a$10$LWSEfV04/gvaPfZED39xuOc.QDJs3nCBjvQ2NRqLxyCpHbrj0gpjK',
        'ADMIN',
        TRUE)
ON CONFLICT (username) DO NOTHING;
