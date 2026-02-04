# Instructor Settlement Calculator

## Overview

The Instructor Settlement Calculator is a browser-based calculation engine that generates:
1. Daily settlement per instructor (teaching fee + allowances + travel allowance)
2. Monthly settlement summary per instructor
3. Export-ready table data (JSON output / CSV-ready)

## Calculation Logic

### A) Counting Rule: Option 2
- If an instructor is assigned to a training, count it regardless of training status
- Exception: if status === "CANCELLED", exclude from teaching fee calculation (but still show separately as cancelled record)

### B) Travel Allowance Calculation
- Uses fixed distance values between 31 cities/counties (시군)
- Distances are city-to-city fixed values (city hall to city hall), not real-time maps
- Same-city travel distance is 0 km
- Travel distance is calculated per instructor per day, not per training
- If multiple institutions in a day, compute route:
  ```
  HomeCity -> Inst1City -> Inst2City -> ... -> HomeCity
  Total km = sum of each segment distance from the fixed table
  ```

### C) Travel Allowance Brackets (flat amount by total daily km)
- 50 <= km < 70  -> 20,000 KRW
- 70 <= km < 90  -> 30,000 KRW
- 90 <= km < 110 -> 40,000 KRW
- 110 <= km < 130 -> 50,000 KRW
- km >= 130 -> 60,000 KRW
- km < 50 -> 0 KRW

### D) Teaching Fee Base (per session/차시) by Role + Level

**Main Instructor:**
- Elementary: 40,000 KRW
- Middle: 45,000 KRW
- High: 50,000 KRW

**Assistant Instructor:**
- Elementary: 30,000 KRW
- Middle: 35,000 KRW
- High: 40,000 KRW

### E) Allowances Stacking Rules (can be combined)

**Per session unless stated:**
- Remote/Island (도서벽지): +5,000 KRW
- Special class/school (특수): +10,000 KRW
- Weekend allowance: +5,000 KRW (if day is Sat/Sun) [exclude if the record is EVENT type]
- If students >= 15 AND no assistant assigned: +5,000 KRW per session

**Equipment transport allowance (per day):**
- If equipmentTransport == true for that day: +20,000 KRW per day
- If more than once in a day, still only +20,000 KRW
- Monthly cap: max 300,000 KRW per instructor

**Event participation:**
- eventHours * 25,000 KRW (hourly)
- Event is separate activity type, not a normal class session

### Tax Calculation
- Show gross, tax (3.3%), net for monthly summary

## File Structure

```
lib/
  mock/
    settlementMock.ts          # Mock data (instructors, institutions, activities, city distance matrix)
  settlementEngine.ts          # Pure calculation functions

app/admin/settlements/instructor/
  page.tsx                     # Main UI page with filters, tables, export
```

## Adding More Cities to Distance Matrix

To add more cities to the distance matrix:

1. Open `lib/mock/settlementMock.ts`
2. Locate the `cityDistanceMatrix` object
3. Add your city as a key in the main object:
   ```typescript
   'NewCity': {
     'NewCity': 0,  // Same city = 0
     'Suwon': 25.5, // Distance to existing cities
     'Yongin': 30.2,
     // ... add distances to all other cities
   }
   ```
4. Update all existing cities to include distance to the new city:
   ```typescript
   'Suwon': {
     // ... existing entries
     'NewCity': 25.5,  // Must match NewCity -> Suwon distance
   }
   ```

**Important:** The matrix must be symmetric:
- `distance[A][B] === distance[B][A]`
- `distance[A][A] === 0`

## Example Scenarios

### Scenario 1: Same-city only
- Instructor home: Suwon
- Institution: Suwon
- Result: travelKm = 0, travelAllowance = 0

### Scenario 2: Multi-institution same day
- Instructor home: Yongin
- Day 1: Institution A (Seongnam), Institution B (Suwon)
- Route: Yongin -> Seongnam -> Suwon -> Yongin
- Result: travelKm = sum of segments, travelAllowance from bracket

### Scenario 3: Remote + Special + Weekend stacking
- Institution: Remote + Special
- Date: Saturday
- Result: Base fee + 5,000 (remote) + 10,000 (special) + 5,000 (weekend) per session

### Scenario 4: CANCELLED class
- Status: CANCELLED
- Result: Excluded from teaching fee, shown separately as cancelled record

## Usage

1. Navigate to `/admin/settlements/instructor`
2. Select month and instructor (optional)
3. View daily and monthly settlement tables
4. Expand daily rows to see activity details
5. Export as JSON (copy to clipboard) or CSV (download file)

## Data Model

### DailyActivity
- `type: 'CLASS' | 'EVENT'`
- `status: 'PLANNED' | 'OPEN' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'`
- For CLASS: `role`, `institutionId`, `sessions`, `students`, `hasAssistant`, `equipmentTransport`
- For EVENT: `eventHours`, `equipmentTransport`

### Institution
- `city`: City name (must match distance matrix keys)
- `isRemote`: Boolean for 도서벽지
- `isSpecial`: Boolean for 특수
- `level`: 'ELEMENTARY' | 'MIDDLE' | 'HIGH'

### Instructor
- `homeCity`: City name (must match distance matrix keys)
