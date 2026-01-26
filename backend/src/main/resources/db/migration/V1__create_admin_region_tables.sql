-- 권역 관리 테이블
CREATE TABLE admin_region (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,  -- 예: "1권역", "2권역"
    color VARCHAR(20) NOT NULL,  -- 예: "#FF5733", "blue"
    mode VARCHAR(20) NOT NULL DEFAULT 'PARTIAL',  -- 'PARTIAL' 또는 'FULL'
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_region_name UNIQUE (name)
);

-- 권역별 행정구역 매핑 테이블
CREATE TABLE admin_region_area (
    id BIGSERIAL PRIMARY KEY,
    region_id BIGINT NOT NULL,
    area_code VARCHAR(10) NOT NULL,  -- 시군구 코드 (예: "41111")
    area_name VARCHAR(100) NOT NULL,  -- 시군구 이름 (예: "수원시 영통구")
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_region_area_region FOREIGN KEY (region_id) REFERENCES admin_region(id) ON DELETE CASCADE,
    CONSTRAINT uk_region_area UNIQUE (region_id, area_code)
);

-- 인덱스
CREATE INDEX idx_region_area_code ON admin_region_area(area_code);
CREATE INDEX idx_region_area_region_id ON admin_region_area(region_id);

-- 초기 데이터: 6개 권역 생성
INSERT INTO admin_region (name, color, mode) VALUES
    ('1권역', '#FF5733', 'PARTIAL'),
    ('2권역', '#33FF57', 'PARTIAL'),
    ('3권역', '#3357FF', 'PARTIAL'),
    ('4권역', '#FF33F5', 'PARTIAL'),
    ('5권역', '#F5FF33', 'PARTIAL'),
    ('6권역', '#33FFF5', 'PARTIAL');

-- updated_at 자동 업데이트 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_admin_region_updated_at
    BEFORE UPDATE ON admin_region
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
