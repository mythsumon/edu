# Data Structure Implementation

This document describes how data structures are implemented and matched between list pages and detail pages in the education management system.

## Implementation Summary

We've implemented a consistent data structure approach that ensures seamless navigation and data flow between list views and detail views:

1. **Shared TypeScript Interfaces**: All data structures are defined in `types/program.ts`
2. **Centralized Service Layer**: Data fetching and manipulation happens through `services/programService.ts`
3. **RESTful API Endpoints**: Backend communication through standardized API routes
4. **Consistent ID Handling**: Program IDs link list items to their detailed views

## Key Components

### 1. Type Definitions (`types/program.ts`)

Contains all shared interfaces:
- `ProgramListItem` - For list views
- `AttendanceData`, `ActivityData`, `EquipmentData` - For detail views
- Supporting interfaces like `Student`, `Instructor`, `Session`, `RentalItem`

### 2. Service Layer (`services/programService.ts`)

Handles all data operations:
- Fetching list data: `getAllPrograms()`
- Fetching detail data: `getAttendanceData(id)`, `getActivityData(id)`, `getEquipmentData(id)`
- Updating data: `updateAttendanceData(data)`, etc.

### 3. API Routes (`pages/api/programs/[id]/`)

RESTful endpoints for backend communication:
- `/api/programs/{id}/attendance` (GET/PUT)
- `/api/programs/{id}/activity` (GET/PUT)
- `/api/programs/{id}/equipment` (GET/PUT)

### 4. Detail Pages (`app/[type]/[id]/page.tsx`)

React components that consume the service layer:
- Fetch data on mount using `useEffect`
- Display loading/error states
- Enable editing with save/cancel functionality

## Data Flow

```
Dashboard/List View
    ↓ (click "상세보기")
Program ID passed via URL
    ↓ (/attendance/1, /activity/1, etc.)
Detail Page mounts
    ↓ (useEffect)
programService.getData(id)
    ↓ (API call)
Backend returns detailed data
    ↓
Component renders with data
    ↓ (Edit + Save)
programService.updateData(modifiedData)
    ↓ (API call)
Backend updates and confirms
```

## Benefits of This Approach

1. **Type Safety**: TypeScript interfaces ensure data consistency
2. **Reusability**: Shared types reduce duplication
3. **Maintainability**: Centralized service layer simplifies updates
4. **Scalability**: Easy to add new detail views or data types
5. **Error Handling**: Graceful fallbacks when API calls fail
6. **Performance**: Loading states provide good UX during data fetch

## Testing

Unit tests in `__tests__/data-consistency.test.ts` verify:
- Data structure consistency
- Proper ID mapping between list and detail views
- Service layer functionality