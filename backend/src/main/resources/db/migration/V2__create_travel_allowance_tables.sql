-- Travel Allowance Module Migration
-- Version: V2
-- Creates tables for instructor daily travel allowance calculation

-- Travel Allowance Policy Table (configurable distance-based policy)
CREATE TABLE IF NOT EXISTS travel_allowance_policy (
    id BIGSERIAL PRIMARY KEY,
    min_km DECIMAL(10, 2) NOT NULL,
    max_km DECIMAL(10, 2),  -- NULL means infinity
    amount_krw INTEGER NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_policy_km_range CHECK (max_km IS NULL OR max_km > min_km),
    CONSTRAINT chk_policy_amount CHECK (amount_krw >= 0)
);

-- Index for active policies
CREATE INDEX IF NOT EXISTS idx_travel_policy_active ON travel_allowance_policy(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_travel_policy_km_range ON travel_allowance_policy(min_km, max_km);

-- Insert default policy (from Form #7 / page 64)
INSERT INTO travel_allowance_policy (min_km, max_km, amount_krw, is_active) VALUES
    (0, 70, 0, TRUE),
    (70, 90, 20000, TRUE),
    (90, 110, 30000, TRUE),
    (110, 130, 40000, TRUE),
    (130, 150, 50000, TRUE),
    (150, NULL, 60000, TRUE);

-- Instructor Daily Travel Table
-- Unique constraint: (instructor_id, travel_date)
CREATE TABLE IF NOT EXISTS instructor_daily_travel (
    id BIGSERIAL PRIMARY KEY,
    instructor_id BIGINT NOT NULL,
    travel_date DATE NOT NULL,
    work_month VARCHAR(7) NOT NULL,  -- YYYY-MM format
    total_distance_km DECIMAL(10, 2) NOT NULL,
    travel_fee_amount_krw INTEGER NOT NULL,
    map_snapshot_url VARCHAR(1000),  -- NOT NULL once finalized, but nullable for DRAFT
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',  -- DRAFT or FINAL
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_daily_travel_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(user_id) ON DELETE CASCADE,
    CONSTRAINT uk_daily_travel_instructor_date UNIQUE (instructor_id, travel_date),
    CONSTRAINT chk_daily_travel_distance CHECK (total_distance_km >= 0),
    CONSTRAINT chk_daily_travel_amount CHECK (travel_fee_amount_krw >= 0),
    CONSTRAINT chk_daily_travel_status CHECK (status IN ('DRAFT', 'FINAL'))
);

-- Indexes for daily travel
CREATE INDEX IF NOT EXISTS idx_daily_travel_instructor_date ON instructor_daily_travel(instructor_id, travel_date);
CREATE INDEX IF NOT EXISTS idx_daily_travel_work_month ON instructor_daily_travel(work_month);
CREATE INDEX IF NOT EXISTS idx_daily_travel_status ON instructor_daily_travel(status);
CREATE INDEX IF NOT EXISTS idx_daily_travel_instructor_month ON instructor_daily_travel(instructor_id, work_month);

-- Instructor Daily Travel Waypoint Table
-- Stores the route: Home → Inst1 → Inst2 → ... → Home
CREATE TABLE IF NOT EXISTS instructor_daily_travel_waypoint (
    id BIGSERIAL PRIMARY KEY,
    daily_travel_id BIGINT NOT NULL,
    seq INTEGER NOT NULL,  -- Sequence order in route (0 = home, 1 = first institution, etc.)
    institution_id BIGINT,  -- NULL for home waypoint
    institution_name VARCHAR(255),  -- For home: NULL or 'HOME'
    institution_address VARCHAR(500),
    lat DECIMAL(10, 7),  -- Latitude
    lng DECIMAL(10, 7),  -- Longitude
    training_id BIGINT,  -- Reference to training (optional, for tracking)
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_waypoint_daily_travel FOREIGN KEY (daily_travel_id) REFERENCES instructor_daily_travel(id) ON DELETE CASCADE,
    CONSTRAINT fk_waypoint_institution FOREIGN KEY (institution_id) REFERENCES institutions(id) ON DELETE SET NULL,
    CONSTRAINT fk_waypoint_training FOREIGN KEY (training_id) REFERENCES trainings(id) ON DELETE SET NULL,
    CONSTRAINT chk_waypoint_seq CHECK (seq >= 0),
    CONSTRAINT chk_waypoint_coords CHECK ((lat IS NULL AND lng IS NULL) OR (lat IS NOT NULL AND lng IS NOT NULL))
);

-- Indexes for waypoints
CREATE INDEX IF NOT EXISTS idx_waypoint_daily_travel ON instructor_daily_travel_waypoint(daily_travel_id);
CREATE INDEX IF NOT EXISTS idx_waypoint_seq ON instructor_daily_travel_waypoint(daily_travel_id, seq);
CREATE INDEX IF NOT EXISTS idx_waypoint_institution ON instructor_daily_travel_waypoint(institution_id) WHERE institution_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_waypoint_training ON instructor_daily_travel_waypoint(training_id) WHERE training_id IS NOT NULL;

-- Add address fields to instructors table if not exist
-- Note: Check if columns exist first (PostgreSQL doesn't support IF NOT EXISTS for columns in older versions)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'instructors' AND column_name = 'home_address') THEN
        ALTER TABLE instructors ADD COLUMN home_address VARCHAR(500);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'instructors' AND column_name = 'home_lat') THEN
        ALTER TABLE instructors ADD COLUMN home_lat DECIMAL(10, 7);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'instructors' AND column_name = 'home_lng') THEN
        ALTER TABLE instructors ADD COLUMN home_lng DECIMAL(10, 7);
    END IF;
END $$;

-- Add address fields to institutions table if not exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'institutions' AND column_name = 'institution_lat') THEN
        ALTER TABLE institutions ADD COLUMN institution_lat DECIMAL(10, 7);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'institutions' AND column_name = 'institution_lng') THEN
        ALTER TABLE institutions ADD COLUMN institution_lng DECIMAL(10, 7);
    END IF;
END $$;

-- Create indexes for geocoding
CREATE INDEX IF NOT EXISTS idx_instructors_home_coords ON instructors(home_lat, home_lng) WHERE home_lat IS NOT NULL AND home_lng IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_institutions_coords ON institutions(institution_lat, institution_lng) WHERE institution_lat IS NOT NULL AND institution_lng IS NOT NULL;

-- Add updated_at trigger for travel_allowance_policy
CREATE TRIGGER update_travel_policy_updated_at
    BEFORE UPDATE ON travel_allowance_policy
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Add updated_at trigger for instructor_daily_travel
CREATE TRIGGER update_daily_travel_updated_at
    BEFORE UPDATE ON instructor_daily_travel
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
