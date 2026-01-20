# Education Status Change Page Flow

## Overview

The Education Status Change page (`/admin/education-status`) is an admin interface for managing education program statuses, instructor assignments, and bulk operations. This document describes the complete flow, data structures, and user interactions.

## Table of Contents

1. [Page Structure](#page-structure)
2. [Data Flow](#data-flow)
3. [User Interactions](#user-interactions)
4. [Status Transition Rules](#status-transition-rules)
5. [Bulk Operations](#bulk-operations)
6. [Instructor Assignment](#instructor-assignment)
7. [Event System](#event-system)
8. [Technical Implementation](#technical-implementation)

---

## Page Structure

### Main Components

```
EducationStatusPage
├── StatusChangeToolbar
│   ├── Partial Region Assignment Button
│   ├── Full Region Assignment Button
│   ├── Status Dropdown
│   └── Apply Status Change Button
├── Bulk Scheduled Status Changes Card
│   ├── Open Scheduled → Public Button
│   └── Public → Closed Button
└── EducationStatusTable
    ├── Selection Checkboxes
    ├── Status Column (with dropdown)
    ├── Education ID
    ├── Education Name
    ├── Institution Name
    ├── Grade/Class
    ├── Main Instructor (single name)
    ├── Assistant Instructors (comma-separated)
    ├── Period
    └── Schedule Info
```

### Key UI Elements

- **Search Input**: Filters by institution name (case-insensitive, partial match)
- **Filter Dropdown**: Status filter and date range picker
- **Selection Checkboxes**: Row-level and page-level selection
- **Status Badge**: Visual status indicator with change dropdown
- **Action Buttons**: Region assignment and bulk status change

---

## Data Flow

### Initial Load

```
1. Component Mounts
   ↓
2. Load Educations from dataStore
   ↓
3. Load Instructor Assignments from dataStore
   ↓
4. Map Instructor Names to Education Items
   ↓
5. Render Table with Mapped Data
```

### Data Mapping

```typescript
Education (from dataStore)
  ↓
educationToStatusItem()
  ↓
EducationStatusItem (for table display)
  ├── mainInstructorNames: string[] (first name shown)
  ├── assistantInstructorNames: string[] (comma-separated)
  └── ... other fields
```

### Status Update Flow

```
User Selects Rows + Chooses New Status
   ↓
handleApplyStatusChange()
   ↓
Modal.confirm() (with warning if irreversible)
   ↓
User Confirms
   ↓
For Each Selected Education:
  ├── dataStore.updateEducation(id, { status: newStatus })
  ├── educationScheduler.scheduleEducation(education)
  └── Dispatch 'educationStatusUpdated' event
   ↓
Update Local State
   ↓
Show Success Message
```

---

## User Interactions

### 1. Search and Filter

**Institution Name Search**
- Input field at top of table
- Real-time filtering (case-insensitive)
- Searches `education.institution` field
- Partial match (contains)

**Filter Dropdown**
- Status filter: Dropdown with all available statuses
- Date range filter: Range picker for education period
- Apply/Reset buttons

### 2. Row Selection

**Single Row Selection**
- Click checkbox in row
- Toggles selection state
- Updates `selectedIds` array

**Page-Level Selection**
- Click header checkbox
- Selects/deselects all rows on current page
- Respects pagination

**Selection Persistence**
- Selection cleared on:
  - Page change
  - Filter application
  - After bulk operation

### 3. Status Change

**Single Row Status Change**
- Click edit icon next to status badge
- Dropdown shows allowed next statuses
- Select new status
- Confirmation modal (with irreversible warning if applicable)
- Update applied immediately

**Bulk Status Change**
- Select multiple rows (any statuses)
- Choose new status from toolbar dropdown
- Click "상태 변경" (Status Change) button
- Confirmation modal shows count and warning
- All selected rows updated to new status
- Event dispatched for all affected educations

### 4. Region Assignment

**Partial Region Assignment**
- Select one or more educations
- Click "부분 권역 배정" (Partial Region Assignment) button
- Modal opens with instructor selection
- Select instructors
- Confirm assignment

**Full Region Assignment**
- Select one or more educations
- Click "전체 권역 배정" (Full Region Assignment) button
- Modal opens with instructor selection
- Select instructors
- Confirm assignment

**Default Mode**
- Default: `PARTIAL` (부분 권역 배정)
- Stored in `education.regionAssignmentMode`
- Persists across page loads

### 5. Scheduled Bulk Changes

**Open Scheduled → Public**
- Button in "예약된 일괄 상태 변경" card
- Filters educations with status "오픈예정"
- Confirmation modal
- Updates all to "강사공개"
- Dispatches events

**Public → Closed**
- Button in "예약된 일괄 상태 변경" card
- Filters educations with status "강사공개"
- Confirmation modal
- Updates all to "신청마감"
- Dispatches events

---

## Status Transition Rules

### Available Statuses

```typescript
type EducationStatus = 
  | '대기'           // Pending
  | '오픈예정'       // Scheduled to Open
  | '강사공개'       // Open for Application
  | '신청마감'       // Application Closed
  | '확정'          // Confirmed
  | '진행중'        // In Progress
  | '완료'          // Completed
  | '종료'          // Finished
  | '중지'          // Suspended
  | '취소'          // Canceled
```

### Transition Rules

**Normal Transitions** (from `statusTransitions.ts`)

```
대기 → 오픈예정
오픈예정 → 강사공개 (scheduled at 21:00)
강사공개 → 신청마감 (scheduled next day)
신청마감 → 확정
확정 → 진행중
진행중 → 완료
완료 → 종료
```

**Irreversible Transitions**

- `신청마감 → 확정`: Cannot be undone
- `확정 → 진행중`: Significant milestone

**Bulk Change Behavior**

- **No validation**: Mixed statuses can be changed to any new status
- **No sequence check**: Can skip intermediate statuses
- **Warning shown**: If any transition is irreversible

### Status Display

- **Badge**: Color-coded status indicator
- **Icon**: Visual status icon
- **Tooltip**: Status description on hover
- **Edit Button**: Only shown if status can be changed

---

## Bulk Operations

### Bulk Status Change

**Requirements**
- Select one or more educations
- Choose new status from dropdown
- Click "상태 변경" button

**Behavior**
- Works with mixed statuses (no validation)
- Shows confirmation modal with:
  - Count of selected educations
  - New status name
  - Irreversible warning (if applicable)
- Updates all selected educations
- Dispatches `educationStatusUpdated` event
- Clears selection after update

**Event Payload**
```typescript
{
  detail: {
    educationIds: string[] // Array of affected education IDs
  }
}
```

### Scheduled Bulk Changes

**Open Scheduled → Public**
- Filters: `status === '오픈예정'`
- Action: Set all to `'강사공개'`
- Use case: Scheduled 21:00 daily transition

**Public → Closed**
- Filters: `status === '강사공개'`
- Action: Set all to `'신청마감'`
- Use case: Scheduled next day transition

---

## Instructor Assignment

### Assignment Modes

**Partial Region Assignment (부분 권역 배정)**
- Default mode
- Assigns instructors to selected educations
- Mode stored in `education.regionAssignmentMode = 'PARTIAL'`

**Full Region Assignment (전체 권역 배정)**
- Alternative mode
- Assigns instructors to selected educations
- Mode stored in `education.regionAssignmentMode = 'FULL'`

### Assignment Flow

```
1. Select Educations
   ↓
2. Click Assignment Button (Partial/Full)
   ↓
3. InstructorAssignmentModal Opens
   ├── Search Instructors
   ├── Select Instructors (checkboxes)
   └── Confirm Assignment
   ↓
4. Assignment Saved
   ↓
5. Modal Closes
   ↓
6. Table Refreshes (instructor names updated)
```

### Instructor Display

**Main Instructor**
- Shows first main instructor name
- Or "—" if none assigned
- Single name only (not count)

**Assistant Instructors**
- Shows comma-separated list of names
- Or "—" if none assigned
- All names shown (not count)

**Data Source**
- Extracted from `InstructorAssignment.lessons`
- Mapped via `mapInstructorNamesToEducationItem()`
- Updated on assignment changes

---

## Event System

### Custom Events

**educationStatusUpdated**
```typescript
window.dispatchEvent(
  new CustomEvent('educationStatusUpdated', {
    detail: { educationIds: string[] }
  })
)
```
- Dispatched when education status changes
- Used to refresh other pages/components
- Listened by: Dashboard, other admin pages

**educationUpdated**
```typescript
window.dispatchEvent(
  new CustomEvent('educationUpdated', {
    detail: { educationIds: string[] }
  })
)
```
- Dispatched when education data changes
- Used for general data refresh
- Listened by: All education-related components

### Event Listeners

**In Component**
```typescript
useEffect(() => {
  const handleStatusUpdate = () => {
    // Reload data from dataStore
    // Update local state
  }
  
  window.addEventListener('educationStatusUpdated', handleStatusUpdate)
  window.addEventListener('educationUpdated', handleStatusUpdate)
  
  return () => {
    window.removeEventListener('educationStatusUpdated', handleStatusUpdate)
    window.removeEventListener('educationUpdated', handleStatusUpdate)
  }
}, [])
```

---

## Technical Implementation

### Key Files

```
app/admin/education-status/
└── page.tsx                    # Main page component

components/admin/operations/
├── StatusChangeToolbar.tsx     # Toolbar with assignment & status controls
├── EducationStatusTable.tsx    # Table component
├── InstructorAssignmentModal.tsx # Assignment modal
├── ScheduleTimeModal.tsx       # Schedule time picker
├── StatusDropdown.tsx          # Status selection dropdown
└── statusTransitions.ts        # Status transition rules

entities/
├── education/
│   └── education-utils.ts      # Education data mapping utilities
└── fee/
    └── fee-policy.ts          # Fee calculation logic

lib/
├── dataStore.ts                # Centralized data store
└── educationScheduler.ts      # Scheduled status transitions
```

### Data Structures

**Education**
```typescript
interface Education {
  key: string
  educationId: string
  status: string
  name: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart?: string
  periodEnd?: string
  regionAssignmentMode?: 'PARTIAL' | 'FULL'  // Default: 'PARTIAL'
  mainInstructorId?: string
  assistantInstructorIds?: string[]
  openAt?: string  // ISO datetime
  closeAt?: string  // ISO datetime
  // ... other fields
}
```

**EducationStatusItem**
```typescript
interface EducationStatusItem {
  key: string
  status: string
  educationId: string
  name: string
  institution: string
  gradeClass: string
  mainInstructorNames: string[]      // First name shown
  assistantInstructorNames: string[] // Comma-separated
  periodStart?: string
  periodEnd?: string
  period?: string
  openAt?: string
  closeAt?: string
}
```

### State Management

**Local State**
- `selectedIds`: Array of selected education keys
- `statusValue`: Selected status for bulk change
- `assignmentMode`: 'partial' | 'full' | null
- `data`: Array of EducationStatusItem
- `filters`: Filter values (status, dateRange)
- `searchText`: Institution name search text

**Data Store**
- `dataStore.getEducations()`: All educations
- `dataStore.getInstructorAssignments()`: All assignments
- `dataStore.updateEducation()`: Update education
- `dataStore.getEducationById()`: Get single education

### Utility Functions

**educationToStatusItem()**
- Maps Education to EducationStatusItem
- Extracts instructor names from assignments
- Handles missing data gracefully

**mapInstructorNamesToEducationItem()**
- Extracts main and assistant instructor names
- Deduplicates names across lessons
- Returns arrays of names

**bulkUpdateEducationStatuses()**
- Updates multiple educations to new status
- Dispatches events
- Handles errors gracefully

---

## User Flow Examples

### Example 1: Change Single Education Status

```
1. User views education list
2. User clicks edit icon next to status badge
3. Dropdown shows allowed next statuses
4. User selects "확정" (Confirmed)
5. Confirmation modal appears
6. User confirms
7. Status updated in dataStore
8. Event dispatched
9. Table refreshes
10. Success message shown
```

### Example 2: Bulk Status Change (Mixed Statuses)

```
1. User selects 3 educations:
   - Education A: "대기" (Pending)
   - Education B: "강사공개" (Open)
   - Education C: "신청마감" (Closed)
2. User selects "확정" (Confirmed) from dropdown
3. User clicks "상태 변경" button
4. Confirmation modal shows:
   - "선택한 3개 교육의 상태를 '확정'으로 변경하시겠습니까?"
   - "⚠️ 이 변경은 되돌릴 수 없습니다."
5. User confirms
6. All 3 educations updated to "확정"
7. Events dispatched for all 3
8. Table refreshes
9. Success message: "3개 교육의 상태가 변경되었습니다."
```

### Example 3: Partial Region Assignment

```
1. User selects 2 educations
2. User clicks "부분 권역 배정" button
3. Modal opens with instructor list
4. User searches for "홍길동"
5. User selects 2 instructors
6. User clicks "배정하기" (Assign) button
7. Assignment saved
8. Modal closes
9. Table refreshes (instructor names updated)
10. Assignment mode remains "partial"
```

### Example 4: Scheduled Bulk Change

```
1. User clicks "오픈예정 → 강사공개" button
2. System filters educations with status "오픈예정"
3. Confirmation modal shows count (e.g., "5개 교육")
4. User confirms
5. All 5 educations updated to "강사공개"
6. Events dispatched
7. Table refreshes
8. Success message shown
```

---

## Error Handling

### Validation

- **Status Change**: Only validates if status is valid enum value
- **Bulk Change**: No validation for mixed statuses (intentional)
- **Assignment**: Validates instructor selection (at least one required)

### Error Messages

- Status change blocked: "이 상태로 변경할 수 없습니다."
- No selection: Tooltip shows "교육을 선택하면 일괄 변경이 가능합니다"
- Empty search: No results shown (filtered out)

### Edge Cases

- **Missing Data**: Shows "—" for missing instructor names
- **No Assignments**: Empty arrays for instructor names
- **Invalid Status**: Falls back to "대기" (Pending)
- **Event Failures**: Gracefully continues (no blocking)

---

## Performance Considerations

### Data Loading

- Initial load: All educations and assignments loaded once
- Updates: Only affected educations updated
- Mapping: Instructor names mapped on-demand

### Rendering

- Pagination: Only current page rows rendered
- Virtual scrolling: Not implemented (consider for large datasets)
- Memoization: `filteredData` memoized with `useMemo`

### Event Handling

- Event listeners: Cleaned up on unmount
- Debouncing: Not implemented (consider for search)
- Batching: Multiple updates batched in single state update

---

## Future Enhancements

### Potential Improvements

1. **Debounced Search**: Add debounce to search input
2. **Virtual Scrolling**: For large datasets (1000+ rows)
3. **Export Functionality**: Export filtered data to Excel
4. **Undo/Redo**: History of status changes
5. **Bulk Assignment**: Assign same instructors to multiple educations
6. **Status History**: Show status change history per education
7. **Advanced Filters**: Filter by instructor, region, date range
8. **Keyboard Shortcuts**: Quick actions via keyboard

### Backend Integration

When migrating to backend API:

1. Replace `dataStore` calls with API calls
2. Add loading states
3. Add error handling for API failures
4. Implement optimistic updates
5. Add retry logic for failed requests
6. Cache API responses
7. Implement pagination on server side

---

## Testing Checklist

### Manual Testing

- [ ] Search filters by institution name correctly
- [ ] Status filter works
- [ ] Date range filter works
- [ ] Row selection works (single and page-level)
- [ ] Single status change works
- [ ] Bulk status change works with mixed statuses
- [ ] Irreversible warning shows correctly
- [ ] Partial region assignment works
- [ ] Full region assignment works
- [ ] Instructor names display correctly
- [ ] Scheduled bulk changes work
- [ ] Events dispatch correctly
- [ ] Table refreshes after updates
- [ ] Default assignment mode is PARTIAL

### Edge Cases

- [ ] Empty education list
- [ ] No instructor assignments
- [ ] Invalid status values
- [ ] Missing education data
- [ ] Concurrent status changes
- [ ] Large dataset (1000+ rows)

---

## Related Documentation

- [Status Transitions](./statusTransitions.md) - Detailed status transition rules
- [Fee Calculation Policy](./fee-policy.md) - Fee calculation logic
- [Data Store](./dataStore.md) - Centralized data store documentation
- [Event System](./events.md) - Custom event system documentation

---

## Changelog

### Version 1.0 (Current)
- Initial implementation
- Bulk status change with mixed statuses
- Region assignment (partial/full)
- Instructor name display
- Scheduled bulk changes
- Event system integration

---

## Contact

For questions or issues related to this page, please contact the development team.
