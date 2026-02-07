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

**Note**: The payment statement format uses different base rates than the internal calculation system:
- **Internal Calculation** (for display/explanation): Main: 40,000 KRW, Assistant: 30,000 KRW per session
- **Payment Statement Format** (for official statements): Main: 32,000 KRW, Assistant: 24,000 KRW per session

The payment statement generator (`payment-statement-generator.ts`) uses the official rates (32,000/24,000) to match the required statement format.

- **Main Instructor**: 32,000 KRW per session (statement format) / 40,000 KRW per session (internal calculation)
- **Assistant Instructor**: 24,000 KRW per session (statement format) / 30,000 KRW per session (internal calculation)
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

The instructor settlement system must be designed with an instructor-centric approach, where all calculations are performed based on the instructor rather than individual trainings. An instructor may serve as a main instructor or an assistant instructor depending on the training, and the role must be applied per training when calculating fees. The base session fee is 40,000 KRW per session for main instructors and 30,000 KRW per session for assistant instructors, with multiple session-based allowances applied cumulatively, including island/remote area allowance (5,000 KRW), special education allowance (10,000 KRW), weekend allowance (5,000 KRW, excluding event participation), middle school allowance (5,000 KRW), high school allowance (10,000 KRW), and an additional allowance of 5,000 KRW per session when a class has 15 or more students and no assistant instructor is assigned (main instructor only). Additional activity-based payments include teaching equipment transport allowance (20,000 KRW per day, capped at 300,000 KRW per month), event participation allowance (25,000 KRW per hour), and mentoring or instructor capacity-building allowances as defined by policy. Travel allowance must be calculated once per instructor per day based on the instructor’s home region and the total daily route (home → institution(s) → home), using a predefined fixed city-to-city distance matrix rather than live map APIs; travel allowance is paid according to distance brackets ranging from 20,000 KRW to 60,000 KRW, while distances under 50 km or within the same city or county are not paid, and when multiple institutions are visited on the same day, travel allowance is paid only once. For every travel allowance payment, a reference map image showing the departure point, intermediate institutions, and return route must be stored as supporting evidence, although the distance calculation itself must rely solely on the fixed distance table. All assigned trainings are included for budget counting and statistical purposes regardless of status, but actual payments are made only for trainings with a confirmed or completed status. The total settlement amount is subject to a 3.3% withholding tax (including local income tax), and the instructor-facing user interface must clearly display calculation formulas, applied allowances, travel allowance reasons, and explanations for any zero-value items to ensure transparency and trust.