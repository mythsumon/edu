# 데이터베이스 연결 확인 가이드

## 연결 확인 체크리스트

DBeaver에서 연결이 완료되었다면, 다음을 확인하세요:

### 1. 테이블 확인

다음 테이블들이 생성되어 있는지 확인:

#### 여비 관련 테이블 (새로 생성됨)
- ✅ `travel_allowance_policy` - 여비 정책 테이블
- ✅ `instructor_daily_travel` - 강사 일별 여비 테이블
- ✅ `instructor_daily_travel_waypoint` - 경로 경유지 테이블

#### 기존 테이블
- ✅ `instructors` - 강사 테이블 (home_address, home_lat, home_lng 컬럼 추가됨)
- ✅ `institutions` - 기관 테이블 (institution_lat, institution_lng 컬럼 추가됨)
- ✅ `trainings` - 교육 테이블
- ✅ `periods` - 기간/세션 테이블

### 2. SQL로 확인하기

DBeaver에서 SQL Editor를 열고 다음 쿼리를 실행:

```sql
-- 여비 정책 테이블 확인
SELECT * FROM travel_allowance_policy;

-- 강사 일별 여비 테이블 구조 확인
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'instructor_daily_travel'
ORDER BY ordinal_position;

-- 강사 테이블에 주소 필드가 추가되었는지 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'instructors' 
AND column_name IN ('home_address', 'home_lat', 'home_lng');

-- 기관 테이블에 좌표 필드가 추가되었는지 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'institutions' 
AND column_name IN ('institution_lat', 'institution_lng');
```

### 3. 여비 정책 데이터 확인

```sql
-- 여비 정책이 제대로 입력되었는지 확인
SELECT 
    id,
    min_km,
    max_km,
    amount_krw,
    is_active
FROM travel_allowance_policy
ORDER BY min_km;
```

예상 결과:
- 0-70km → 0원
- 70-90km → 20,000원
- 90-110km → 30,000원
- 110-130km → 40,000원
- 130-150km → 50,000원
- 150km 이상 → 60,000원

### 4. 다음 단계

테이블이 모두 생성되었다면:

1. **강사 주소 데이터 입력**
   - `instructors` 테이블의 `home_address`, `home_lat`, `home_lng` 필드에 데이터 입력

2. **기관 좌표 데이터 입력**
   - `institutions` 테이블의 `institution_lat`, `institution_lng` 필드에 데이터 입력

3. **강사-기간 배정 테이블 생성** (아직 없으면)
   - `instructor_period_assignment` 테이블 생성 필요
   - 자세한 내용은 `TRAVEL_ALLOWANCE_IMPLEMENTATION.md` 참조

### 5. 문제 해결

#### 테이블이 없는 경우
- Flyway 마이그레이션이 실행되지 않았을 수 있습니다
- 백엔드 서버를 시작하면 자동으로 마이그레이션이 실행됩니다
- 또는 수동으로 마이그레이션 실행:
  ```bash
  cd backend
  mvn flyway:migrate
  ```

#### 컬럼이 없는 경우
- 마이그레이션 V2가 실행되지 않았을 수 있습니다
- `V2__create_travel_allowance_tables.sql` 파일이 실행되었는지 확인
