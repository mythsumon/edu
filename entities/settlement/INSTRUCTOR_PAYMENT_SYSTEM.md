# Instructor-Centric Payment and Travel Allowance System

## Overview

This system provides an instructor-centric view of payment and travel allowance calculations. All calculations are based on the **INSTRUCTOR**, not the training. The instructor must clearly understand: **"Why am I paid this amount?"**

## Core Principles

1. **Instructor-Centric**: All calculations are organized by Instructor → Month → Day
2. **Role-Based Payment**: Payment rate is determined per training based on role (Main: 40,000 KRW, Assistant: 30,000 KRW per session)
3. **Fixed Distance Matrix**: Uses predefined fixed distance values between 31 cities/counties (not live API calls)
4. **Daily Travel Allowance**: Calculated once per instructor per day, even if multiple trainings exist
5. **Map Image Evidence**: Reference map images are required for every travel allowance calculation

## System Architecture

### 1. Data Types (`instructor-payment-types.ts`)

- `InstructorPaymentSummary`: Overall summary for an instructor
- `InstructorMonthlyPayment`: Monthly breakdown
- `InstructorDailyPayment`: Daily breakdown with all trainings
- `DailyTravelAllowance`: Travel allowance calculation with explanation
- `TrainingPaymentBreakdown`: Payment breakdown per training

### 2. Calculation Engine (`instructor-payment-calculator.ts`)

#### Key Functions:

- `calculateInstructorPaymentSummary()`: Main entry point - calculates payment for a single instructor
- `calculateAllInstructorPayments()`: Calculates payment for all instructors
- `calculateInstructorDailyPayment()`: Calculates daily payment with travel allowance
- `calculateDailyTravelRoute()`: Calculates route distance using fixed distance matrix
- `calculateDailyTravelAllowance()`: Calculates travel allowance based on distance brackets

#### Calculation Flow:

1. Group all lessons by instructor and date
2. For each day:
   - Calculate training payments (role × sessions)
   - Calculate travel route (Home → Inst1 → Inst2 → ... → Home)
   - Calculate travel allowance from distance brackets
   - Generate map image
3. Group by month
4. Calculate monthly summaries

### 3. Distance Calculation (`city-distance-matrix.ts`)

- Uses fixed distance matrix between 31 cities/counties
- Same region = 0 km
- Cross-region = fixed distance value from table
- Route calculation: Sum of all segments (Home → Inst1 → Inst2 → ... → Home)

### 4. Travel Allowance Brackets

- 0 ~ < 50 km: 0 KRW
- 50 ~ < 70 km: 20,000 KRW
- 70 ~ < 90 km: 30,000 KRW
- 90 ~ < 110 km: 40,000 KRW
- 110 ~ < 130 km: 50,000 KRW
- ≥ 130 km: 60,000 KRW

### 5. Map Image Service (`map-image-service.ts`)

- Generates reference map images using Kakao Maps Static API
- Shows route: Home → Institution 1 → Institution 2 → ... → Home
- Falls back to placeholder if API key not configured
- Required for audit/settlement evidence

## UI Components

### Main Page: `/app/instructor/payments/page.tsx`

**Organization**: Instructor → Month → Day

**Features**:
- Overall summary (total months, days, sessions, payment)
- Monthly breakdown with expandable cards
- Daily breakdown showing:
  - Training list with roles (Main/Assistant)
  - Session count per training
  - Payment formula: `Rate × Sessions = Amount`
  - Travel allowance explanation
  - Map image preview (clickable)
- Clear payment explanations

**Key Components**:
- `MonthlyPaymentCard`: Shows monthly summary with expandable daily breakdown
- `DailyPaymentCard`: Shows daily trainings, payments, and travel allowance

## Payment Calculation Rules

### Training Payment

- **Main Instructor**: 40,000 KRW per session
- **Assistant Instructor**: 30,000 KRW per session
- Formula: `Rate × Sessions = Payment Amount`

### Travel Allowance

- Calculated **once per day** per instructor
- Even if multiple trainings exist on the same day, travel distance is aggregated
- Route: Home → Institution 1 → Institution 2 → ... → Home
- Distance from fixed city-to-city table
- Mapped to distance bracket for allowance amount

### Zero Values

- If travel allowance = 0, UI explains why (e.g., "Same region: 0 KRW")

## Counting vs Payment

### Counting (Budget/Statistics)
- Any training with instructor assigned is counted, regardless of training status

### Actual Payment
- Only trainings with status = "Confirmed" or "Completed" are included in payment settlement
- Controlled by `PaymentCountingMode` setting

## Usage Example

```typescript
import { calculateAllInstructorPayments } from '@/entities/settlement/instructor-payment-calculator'
import { dataStore } from '@/lib/dataStore'

const educations = dataStore.getEducations()
const assignments = dataStore.getInstructorAssignments()

const summaries = calculateAllInstructorPayments(educations, assignments)

// Get payment for specific instructor
const instructorSummary = summaries.find(s => s.instructorId === 'instructor-1')

// Access monthly payments
instructorSummary.monthlyPayments.forEach(monthly => {
  console.log(`Month: ${monthly.month}`)
  console.log(`Total Payment: ${monthly.eligiblePayment.toLocaleString()}원`)
  
  // Access daily payments
  monthly.dailyPayments.forEach(daily => {
    console.log(`Date: ${daily.date}`)
    console.log(`Payment: ${daily.paymentExplanation}`)
  })
})
```

## Future Enhancements

1. **Additional Allowances**: Weekend, remote island, special class, no assistant bonuses
2. **Equipment Transport**: Per-day allowance for equipment transport
3. **Event Participation**: Hourly rate for event participation
4. **Mentoring Allowance**: Session-based or hourly mentoring allowance
5. **Tax Calculation**: 3.3% tax deduction

## Notes

- Map image generation requires Kakao Maps API key (`NEXT_PUBLIC_KAKAO_MAP_API_KEY`)
- Distance matrix needs to be populated with actual values from "31개 시군청간 거리표"
- Instructor home region should be fetched from actual instructor data (currently mocked)
