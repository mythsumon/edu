# Instructor Fee & Travel Allowance Automation - Implementation Summary

## Overview

This implementation provides comprehensive automation for monthly settlement calculations for instructors, including teaching fees, travel allowances, and extra allowances per the full requirements.

## Implemented Components

### 1. City/County Distance Matrix (`city-distance-matrix.ts`)

- **31-city/county fixed distance matrix structure**
- Supports mapping city/county names to codes
- Rule: Same city/county movement = 0 km
- Route calculation: Home → Inst1 → Inst2 → ... → Home
- **TODO**: Populate with actual distance data from "31개 시군청간 거리표"

### 2. Travel Expense Calculator (`travel-expense-calculator.ts`)

- **Updated brackets per requirements**:
  - 0 ~ < 50 km: 0 KRW
  - 50 ~ < 70 km: 20,000 KRW
  - 70 ~ < 90 km: 30,000 KRW
  - 90 ~ < 110 km: 40,000 KRW
  - 110 ~ < 130 km: 50,000 KRW
  - ≥ 130 km: 60,000 KRW

### 3. Comprehensive Allowance Calculator (`comprehensive-allowance-calculator.ts`)

Implements all required allowances:

#### Base Fees
- **Main Instructor**: 40,000 KRW per session
- **Assistant Instructor**: 30,000 KRW per session

#### Additional Allowances
1. **Remote/Island Allowance (도서·벽지)**: +5,000 KRW per session
2. **Special Education Allowance (특별수당)**: +10,000 KRW per session
3. **No Assistant despite 15+ Students**: +5,000 KRW per session (main instructor only)
4. **Weekend Allowance (휴일/주말수당)**: +5,000 KRW per session
   - Exception: Not applied if event participation
5. **Middle School Allowance (중고등부)**: +5,000 KRW per session
6. **High School Allowance (중고등부)**: +10,000 KRW per session

#### Special Allowances
7. **Equipment Transport Allowance (교구 운반 수당)**: 20,000 KRW per day
   - Monthly cap: Max 300,000 KRW per instructor per month
8. **Event Participation Allowance (행사참여수당)**: 25,000 KRW per hour
9. **Mentoring Allowance (역량강화)**:
   - Method A: 10,000 KRW per session
   - Method B: 40,000 KRW per hour (1-3 hours per session, max 3h/day)

### 4. Tax Calculation

- **3.3% business income tax** (includes local income tax)
- Calculates: gross amount, tax amount, net amount

### 5. Monthly Minimum Activity Check

- **Requirement**: Monthly 30 sessions or more
- Flags instructors who do not meet minimum

### 6. Enhanced Types (`settlement-types-enhanced.ts`)

- `DailyCalculationOutput`: Per-day calculation output
- `MonthlyAggregationOutput`: Monthly aggregation with compliance flags
- `TrainingSessionData`: Per-schedule training data
- `InstitutionSettlementData`: Institution/school data
- `InstructorSettlementData`: Instructor master data
- `SettlementReviewData`: Admin review/approval data
- `SettlementExportData`: Export/print data

### 7. Lesson Plan Session Types Updated

Extended `LessonPlanSession` to capture:
- Start/end time
- Student count
- Assistant instructor flag
- Weekend/holiday flags
- Event participation flag and hours
- Mentoring flag and hours
- Equipment transport requirement

## Key Rules Implemented

### Distance Calculation
- ✅ Fixed 31-city/county distance table (structure ready, data needs population)
- ✅ Same city/county travel = 0 km
- ✅ Daily route: Home → institutions → Home
- ✅ Multiple outside-area institutions included as waypoints

### Travel Allowance
- ✅ Flat amount by distance bracket (per requirements)
- ✅ Route description generation
- ✅ Evidence support (map images)

### Teaching Fee
- ✅ Per session by role (Main: 40k, Assistant: 30k)
- ✅ Tax deduction (3.3%)

### Allowances
- ✅ All allowance types implemented
- ✅ Equipment transport monthly cap (300k)
- ✅ Event participation hourly rate
- ✅ Weekend allowance exception for events
- ✅ Mentoring dual calculation methods

### Compliance
- ✅ Monthly minimum 30 sessions check
- ✅ Missing evidence tracking
- ✅ Cap enforcement

## Usage Example

```typescript
import {
  calculateComprehensiveAllowance,
  calculateTaxDeduction,
  checkMonthlyMinimumSessions,
  applyEquipmentTransportCap,
} from '@/entities/settlement/comprehensive-allowance-calculator'
import { getCityDistance, calculateRouteDistance } from '@/entities/settlement/city-distance-matrix'
import { computeTravelExpense } from '@/entities/settlement/travel-expense-calculator'

// Calculate allowance for a session
const allowance = calculateComprehensiveAllowance({
  sessionCount: 8,
  role: 'main',
  institutionCategory: 'ELEMENTARY',
  isRemoteIsland: false,
  isSpecialEducation: false,
  studentCount: 22,
  hasAssistant: false,
  weekendSessionCount: 2,
  isEventParticipation: false,
  equipmentTransportDays: 1,
  isMiddleSchool: false,
  isHighSchool: false,
})

// Calculate tax
const taxResult = calculateTaxDeduction(allowance.grossTotal)

// Check monthly minimum
const minCheck = checkMonthlyMinimumSessions(35) // 35 sessions in month

// Calculate travel distance
const distance = calculateRouteDistance('SUWON', ['SEONGNAM', 'YONGIN'])
const travelExpense = computeTravelExpense(distance)
```

## Next Steps

1. **Populate 31-city distance matrix** with actual data from "31개 시군청간 거리표"
2. **Create settlement calculation service** that aggregates daily calculations into monthly summaries
3. **Build admin review/approval UI** for settlement review
4. **Implement export/print functionality** (Excel, PDF)
5. **Integrate with lesson plan data** to auto-populate settlement fields
6. **Add evidence upload/management** (map screenshots, signatures)

## Files Created/Modified

### New Files
- `entities/settlement/city-distance-matrix.ts`
- `entities/settlement/comprehensive-allowance-calculator.ts`
- `entities/settlement/settlement-types-enhanced.ts`
- `entities/settlement/SETTLEMENT_IMPLEMENTATION.md`

### Modified Files
- `entities/settlement/travel-expense-calculator.ts` (updated brackets)
- `entities/settlement/allowance-calculator.ts` (updated base rates)
- `entities/settlement/index.ts` (added exports)
- `app/instructor/schedule/[educationId]/lesson-plan/types.ts` (extended session types)

## Compliance with Requirements

✅ **Core Data Requirements**: Types defined for instructor, institution, training data  
✅ **Travel Allowance**: Fixed distance table structure, route logic, brackets  
✅ **Teaching Fee**: Base fees per role, tax calculation  
✅ **Additional Allowances**: All 9 allowance types implemented  
✅ **Capacity Enhancement**: Mentoring and research support  
✅ **Calculation Outputs**: Daily and monthly output types defined  
✅ **Admin Requirements**: Review/approval types defined  
✅ **Key Rules**: Same-city rule, route logic, caps, validation
