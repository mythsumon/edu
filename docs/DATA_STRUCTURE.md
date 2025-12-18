# Data Structure Documentation

This document explains how data is structured and matched between list pages and detail pages in the education management system.

## Overview

The system maintains consistency between list views and detail views by using shared TypeScript interfaces and a centralized service layer for data fetching and manipulation.

## Shared Data Structures

All data structures are defined in `types/program.ts` and are used consistently across the application.

### Program List Item

Used in dashboard and list views:

```typescript
interface ProgramListItem {
  id: number
  name: string
  institution: string
  mainInstructor: string
  subInstructor: string
  createdDate: string
  lastUpdated: string
}
```

### Attendance Data

Used in attendance detail view:

```typescript
interface AttendanceData {
  id: string
  title: string
  attendanceCode: string
  programName: string
  institutionName: string
  grade: string
  class: string
  totalApplicants: number
  totalGraduates: number
  maleGraduates: number
  femaleGraduates: number
  students: Student[]
  instructors: Instructor[]
}
```

### Activity Data

Used in activity detail view:

```typescript
interface ActivityData {
  id: string
  title: string
  activityCode: string
  educationType: string
  institutionType: string
  region: string
  institutionName: string
  grade: string
  class: string
  startDate: string
  endDate: string
  totalApplicants: number
  totalGraduates: number
  maleGraduates: number
  femaleGraduates: number
  sessions: Session[]
  photos: Photo[]
  createdAt: string
  createdBy: string
}
```

### Equipment Data

Used in equipment detail view:

```typescript
interface EquipmentData {
  id: string
  assignmentNumber: string
  courseName: string
  institution: string
  educationDate: string
  currentSession: number
  totalSessions: number
  instructorName: string
  expectedParticipants: number
  rentalDate: string
  rentalTime: string
  renterName: string
  returnerName: string
  returnDate: string
  returnTime: string
  notes: string
  rentalItems: RentalItem[]
  returnerNameConfirm: string
  returnDateConfirm: string
  returnTimeConfirm: string
  returnStatus: string
  returnQuantity: number
  targetEligible: boolean
  remarks: string
  signatureOmitted: boolean
  signatureName: string
  signatureDate: string
}
```

## Data Flow

1. **List View**: 
   - Dashboard displays `ProgramListItem[]` from `programService.getAllPrograms()`
   - Each item has an ID that links to detail views

2. **Navigation**:
   - Clicking "상세보기" buttons in the list passes the program ID to detail pages
   - URLs follow the pattern: `/attendance/{id}`, `/activity/{id}`, `/equipment/{id}`

3. **Detail Views**:
   - Pages fetch detailed data using the ID via `programService` methods:
     - `programService.getAttendanceData(id)` for attendance details
     - `programService.getActivityData(id)` for activity details
     - `programService.getEquipmentData(id)` for equipment details

4. **Editing**:
   - Detail pages can modify data and save changes using:
     - `programService.updateAttendanceData(data)` for attendance
     - `programService.updateActivityData(data)` for activity
     - `programService.updateEquipmentData(data)` for equipment

## API Endpoints

The service layer communicates with the backend via these RESTful endpoints:

- GET `/api/programs/{id}/attendance` - Fetch attendance data
- PUT `/api/programs/{id}/attendance` - Update attendance data
- GET `/api/programs/{id}/activity` - Fetch activity data
- PUT `/api/programs/{id}/activity` - Update activity data
- GET `/api/programs/{id}/equipment` - Fetch equipment data
- PUT `/api/programs/{id}/equipment` - Update equipment data

## Consistency Patterns

1. **ID Matching**: All detail data structures include an `id` field that matches the program ID from list items
2. **Naming Consistency**: Related fields across different data structures use consistent naming (e.g., `programName`, `institutionName`)
3. **Shared Components**: Sub-interfaces like `Student`, `Instructor`, `Session`, and `RentalItem` are reused where appropriate
4. **Error Handling**: All service methods include fallback mock data in case of API failures
5. **Loading States**: All detail pages show loading indicators while fetching data

This structure ensures that data flows consistently from list views to detail views and that modifications are properly synchronized back to the data source.