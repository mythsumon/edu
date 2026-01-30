# Travel Allowance Module Implementation Summary

## ✅ Completed Implementation

### 1. Database Migration (V2)
- **File**: `backend/src/main/resources/db/migration/V2__create_travel_allowance_tables.sql`
- **Tables Created**:
  - `travel_allowance_policy`: Configurable distance-based policy table
  - `instructor_daily_travel`: Daily travel records (unique: instructor_id + travel_date)
  - `instructor_daily_travel_waypoint`: Route waypoints (Home → Inst1 → Inst2 → ... → Home)
- **Schema Updates**:
  - Added `home_address`, `home_lat`, `home_lng` to `instructors` table
  - Added `institution_lat`, `institution_lng` to `institutions` table
- **Default Policy Data**: Inserted distance ranges (70-90km → 20,000 KRW, etc.)

### 2. Entities
- **TravelAllowancePolicy**: Policy entity with distance range matching
- **InstructorDailyTravel**: Daily travel record with status (DRAFT/FINAL)
- **TravelWaypoint**: Route waypoint with sequence order

### 3. Repositories
- **TravelAllowancePolicyRepository**: Find matching policy by distance
- **InstructorDailyTravelRepository**: Query by instructor, date, month
- **TravelWaypointRepository**: Query waypoints by daily travel ID

### 4. Services
- **DistanceCalculationService**: Haversine formula (straight-line distance)
  - TODO: Integrate with Kakao Maps Directions API for actual route distance
- **MapSnapshotService**: Placeholder for map image generation
  - TODO: Integrate with Kakao Maps Static Map API
- **TravelAllowanceService**: Core business logic
  - Recalculate daily travel (idempotent)
  - Build route: Home → Inst1 → Inst2 → ... → Home
  - Calculate distance and apply policy
  - Generate map snapshot
  - Monthly summary aggregation

### 5. DTOs
- **DailyTravelResponseDto**: Daily travel record with waypoints
- **WaypointResponseDto**: Route waypoint details
- **MonthlyTravelSummaryDto**: Monthly aggregation

### 6. Controller
- **TravelAllowanceController**: Minimal REST APIs
  - `GET /api/v1/admin/instructors/{instructorId}/daily-travel?from=YYYY-MM-DD&to=YYYY-MM-DD`
  - `POST /api/v1/admin/instructors/{instructorId}/daily-travel/recalculate?date=YYYY-MM-DD`
  - `GET /api/v1/admin/instructors/{instructorId}/monthly-travel?month=YYYY-MM`

### 7. Error Codes
- Added travel allowance error codes to `ErrorCode.java`:
  - `INSTRUCTOR_NOT_FOUND`, `INSTITUTION_NOT_FOUND`
  - `INSTRUCTOR_ADDRESS_MISSING`, `INSTITUTION_ADDRESS_MISSING`
  - `DAILY_TRAVEL_NOT_FOUND`, `TRAVEL_POLICY_NOT_FOUND`
  - `MAP_SNAPSHOT_GENERATION_FAILED`

### 8. Security
- Updated `SecurityConfig.java` to allow ADMIN access to travel allowance endpoints

## ⚠️ Critical Missing Component

### Instructor-Period Assignment Table

**Current Status**: The `queryInstructorPeriods()` method in `TravelAllowanceServiceImpl` is a placeholder that returns an empty list.

**Required**: You need to create an assignment table or modify the existing schema to link instructors to periods.

**Options**:

1. **Create Assignment Table** (Recommended):
   ```sql
   CREATE TABLE instructor_period_assignment (
       id BIGSERIAL PRIMARY KEY,
       instructor_id BIGINT NOT NULL,
       period_id BIGINT NOT NULL,
       role VARCHAR(20) NOT NULL,  -- 'MAIN' or 'ASSISTANT'
       created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
       CONSTRAINT fk_assignment_instructor FOREIGN KEY (instructor_id) REFERENCES instructors(user_id),
       CONSTRAINT fk_assignment_period FOREIGN KEY (period_id) REFERENCES periods(id),
       CONSTRAINT uk_assignment_instructor_period UNIQUE (instructor_id, period_id)
   );
   ```

2. **Update PeriodRepository**: Add query method:
   ```java
   @Query("SELECT p FROM PeriodEntity p " +
          "JOIN InstructorPeriodAssignment a ON a.periodId = p.id " +
          "WHERE a.instructorId = :instructorId AND p.date = :date " +
          "ORDER BY p.startTime ASC")
   List<PeriodEntity> findByInstructorIdAndDate(@Param("instructorId") Long instructorId, 
                                                  @Param("date") LocalDate date);
   ```

3. **Update TravelAllowanceServiceImpl**: Replace placeholder:
   ```java
   private List<PeriodEntity> queryInstructorPeriods(Long instructorId, LocalDate date) {
       return periodRepository.findByInstructorIdAndDate(instructorId, date);
   }
   ```

## 🔧 TODO Items

### High Priority
1. **Create Instructor-Period Assignment Table** (see above)
2. **Implement `queryInstructorPeriods()` method** in `TravelAllowanceServiceImpl`
3. **Integrate Kakao Maps Directions API** for actual route distance calculation
4. **Integrate Kakao Maps Static Map API** for map snapshot generation

### Medium Priority
5. **Add geocoding service** to convert addresses to coordinates (lat/lng)
6. **Add validation** for address format and coordinate ranges
7. **Add batch recalculation** for all instructors in `rebuildDailyTravelRecords()`
8. **Add unit tests** for:
   - Multi-training same day → no duplicated home trips
   - Policy mapping correctness (boundaries: 89.9, 90.0, 109.9, 110.0, 150.0)
   - Missing address → DRAFT status
   - Distance < 70km → amount = 0

### Low Priority
9. **Add timezone configuration** (currently hardcoded to Asia/Seoul)
10. **Add route optimization** (shortest path algorithm for multiple waypoints)
11. **Add audit logging** for travel allowance calculations
12. **Add export functionality** for monthly reports

## 📋 Testing Checklist

- [ ] Unit test: Multi-training same day → single route (Home → Inst1 → Inst2 → Home)
- [ ] Unit test: Policy boundaries (89.9km → 20,000, 90.0km → 30,000)
- [ ] Unit test: Missing address → DRAFT status
- [ ] Unit test: Distance < 70km → amount = 0
- [ ] Integration test: Full flow from period assignment to daily travel record
- [ ] Integration test: Monthly aggregation
- [ ] Manual test: API endpoints with real data

## 📝 Notes

1. **Distance Calculation**: Currently uses Haversine formula (straight-line). Final implementation should use Kakao Maps Directions API for actual route distance.

2. **Map Snapshot**: Currently returns placeholder URL. Final implementation should:
   - Call Kakao Maps Static Map API
   - Upload image to storage service
   - Return public URL

3. **Assignment Model**: The current implementation assumes an assignment table exists. If your system uses a different model (e.g., periods directly reference instructors), adjust the `queryInstructorPeriods()` method accordingly.

4. **Timezone**: Currently uses `Asia/Seoul` hardcoded. Consider making this configurable.

5. **Idempotency**: The `recalculateDailyTravel()` method is idempotent - it will create or update existing records based on (instructor_id, travel_date) unique constraint.

## 🚀 Next Steps

1. **Create the assignment table** (see Critical Missing Component above)
2. **Implement `queryInstructorPeriods()`** method
3. **Test the basic flow** with sample data
4. **Integrate Kakao Maps APIs** for production-ready distance and map generation
5. **Add unit tests** for critical business logic
