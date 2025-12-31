# Business Rules Verification Report

## A) Data Model Analysis

### 1. Education Entity
**File:** `app/admin/education/page.tsx`, `app/admin/operations/page.tsx`

**Status Values Found:**
- `'신청 마감'` (Application Closed)
- `'신청 중'` (Application Open)
- `'OPEN'`, `'INIT'`, `'CANCEL'` (from statusOptions)

**Fields:**
```typescript
interface EducationItem {
  key: string
  status: string  // Education status
  educationId: string
  name: string
  institution: string
  region: string
  gradeClass: string
  period: string
  periodStart?: string
  periodEnd?: string
  // ... other fields
}
```

**Missing:** `applicationDeadline` or `신청마감일` field not found in any Education interface.

### 2. Application Entity (Teacher Application)
**File:** `app/admin/instructor-assignment/applications/page.tsx`

**Status Values:**
- `'수락됨'` (Approved)
- `'거절됨'` (Rejected)
- `'대기'` (Pending)

**Fields:**
```typescript
interface InstructorApplicationItem {
  key: string
  educationId: string
  educationName: string
  institution: string
  region: string
  gradeClass: string
  role: string
  instructorName: string
  applicationDate: string
  status: '수락됨' | '거절됨' | '대기'
  // ... other fields
}
```

**Missing:** No reference to parent Education status or deadline.

### 3. Assignment Entity (Final Assignment)
**File:** `app/admin/instructor-assignment/manual/page.tsx`

**Status Values:**
- `'confirmed'` (확정)
- `'unconfirmed'` (미확정)

**Fields:**
```typescript
interface EducationAssignmentItem {
  key: string
  educationId: string
  educationName: string
  assignmentStatus: 'confirmed' | 'unconfirmed'
  // ... other fields
}
```

---

## B) Business Rules Verification

### Rule 1: Teacher Dashboard Visibility
**Requirement:** Teacher dashboard only shows educations with status = 공개/모집중 (or equivalent)

**Status:** ❌ **FAIL**

**Evidence:**
- **File:** `app/instructor/dashboard/page.tsx`
- **Lines:** 213-219
- **Current Implementation:** Filters by course status ('예정', '진행중', '완료'), NOT by education publication status
- **Missing:** No filter for education status (OPEN/공개/모집중)

**Fix Required:**
```typescript
// Add education status check
const filteredCourses = instructorCourses.filter(course => {
  // Add: Only show if education status is 'OPEN' or '신청 중'
  if (course.educationStatus !== 'OPEN' && course.educationStatus !== '신청 중') {
    return false
  }
  // ... existing filters
})
```

---

### Rule 2: Approve Restriction in 강사 신청 관리
**Requirement:** In 강사 신청 관리 list, approve button is disabled when:
- Education status = '신청 마감' OR
- Current date > application deadline

**Status:** ❌ **FAIL**

**Evidence:**
- **File:** `app/admin/instructor-assignment/applications/page.tsx`
- **Lines:** 620-680 (action column render)
- **Current Implementation:** 
  - Buttons are only disabled if `record.status === '수락됨'` or `'거절됨'`
  - No check for education status
  - No check for deadline
- **Missing:** 
  1. Education status field in `InstructorApplicationItem`
  2. Application deadline field
  3. Disable logic for approve button

**Fix Required:**
```typescript
// 1. Add fields to interface
interface InstructorApplicationItem {
  // ... existing fields
  educationStatus?: string  // '신청 마감' | '신청 중' | etc.
  applicationDeadline?: string  // Date string
}

// 2. Add disable check function
const canApprove = (record: InstructorApplicationItem): boolean => {
  if (record.status !== '대기') return false
  if (record.educationStatus === '신청 마감') return false
  if (record.applicationDeadline) {
    const deadline = dayjs(record.applicationDeadline)
    if (dayjs().isAfter(deadline)) return false
  }
  return true
}

// 3. Update button render (line ~659)
render: (_, record) => {
  if (record.status === '수락됨') {
    // ... existing disabled button
  } else if (record.status === '거절됨') {
    // ... existing disabled button
  } else {
    const canApproveRecord = canApprove(record)
    return (
      <div className="flex gap-2 flex-wrap">
        <Button
          disabled={!canApproveRecord}
          // ... existing props
        >
          수락
        </Button>
        // ... reject button
      </div>
    )
  }
}
```

---

### Rule 3: Override in 강사 배정 관리 상세
**Requirement:** 
- "최종 확정" and "삭제" buttons must work regardless of education status
- When final confirm/delete happens, changes must sync to 강사 신청 관리

**Status:** ❌ **FAIL**

**Evidence:**
- **File:** `app/admin/instructor-assignment/manual/page.tsx`
- **Lines:** 640-690 (detail view)
- **Current Implementation:**
  - No "최종 확정" button found in detail view
  - Only individual instructor delete buttons exist (lines 739-748, 836-846)
  - No final assignment confirmation action
  - No state synchronization with application page

**Missing:**
1. Final confirmation button/action
2. State sync mechanism between assignment and application pages

**Fix Required:**
```typescript
// 1. Add final confirm handler
const handleFinalConfirm = async () => {
  if (!selectedEducation) return
  
  try {
    // TODO: API call
    // await assignmentService.finalConfirm(selectedEducation.educationId)
    
    // Update assignment status
    setSelectedEducation({
      ...selectedEducation,
      assignmentStatus: 'confirmed'
    })
    
    // Sync to application page (if shared state or API)
    // Option A: Shared state store
    // Option B: API refresh triggers update
    // Option C: Manual sync call
    // syncApplicationStatus(selectedEducation.educationId, '수락됨')
    
    message.success('배정이 확정되었습니다.')
  } catch (error) {
    message.error('확정 처리 중 오류가 발생했습니다.')
  }
}

// 2. Add button in detail view (after line ~690)
<div className="flex gap-2 pt-4 border-t border-gray-200">
  <Button
    type="primary"
    onClick={handleFinalConfirm}
    className="h-11 px-6 rounded-xl"
  >
    최종 확정
  </Button>
  <Button
    danger
    onClick={() => {
      // Handle delete entire assignment
    }}
    className="h-11 px-6 rounded-xl"
  >
    삭제
  </Button>
</div>

// 3. Update delete handler to sync
const confirmDelete = async () => {
  if (deleteTarget && selectedEducation) {
    // ... delete logic
    
    // Sync to application page
    // Update application status to '거절됨' or remove
    // syncApplicationStatus(...)
  }
}
```

---

### Rule 4: State Synchronization
**Requirement:** Changes in 강사 배정 관리 must reflect in 강사 신청 관리

**Status:** ❌ **FAIL**

**Evidence:**
- **Files:** 
  - `app/admin/instructor-assignment/manual/page.tsx` (assignment)
  - `app/admin/instructor-assignment/applications/page.tsx` (application)
- **Current Implementation:**
  - Both pages use separate local state (`useState`)
  - No shared state management
  - No API integration for sync
  - No refresh mechanism

**Fix Required:**
```typescript
// Option 1: Shared Context/Store (Recommended)
// Create: contexts/InstructorAssignmentContext.tsx
export const InstructorAssignmentContext = createContext<{
  applications: InstructorApplicationItem[]
  assignments: EducationAssignmentItem[]
  updateApplication: (key: string, status: string) => void
  updateAssignment: (key: string, status: string) => void
}>(...)

// Option 2: API-based sync
// In manual/page.tsx after confirm/delete:
const syncToApplications = async (educationId: string, action: 'confirm' | 'delete') => {
  // Call API to update application status
  // await api.updateApplicationStatus(educationId, action)
  // Refresh application page data
}

// Option 3: Event-based sync (if same session)
// Use custom events or state management library
```

---

## C) Summary Checklist

| Rule | Status | File(s) | Line(s) |
|------|--------|---------|---------|
| 1. Teacher dashboard visibility filter | ❌ FAIL | `app/instructor/dashboard/page.tsx` | 213-219 |
| 2. Approve button disable (status check) | ❌ FAIL | `app/admin/instructor-assignment/applications/page.tsx` | 620-680 |
| 2. Approve button disable (deadline check) | ❌ FAIL | Same as above | Same |
| 3. Final confirm button exists | ❌ FAIL | `app/admin/instructor-assignment/manual/page.tsx` | 640-690 |
| 3. Final confirm always enabled | ❌ FAIL | Same as above | Same |
| 4. Delete always enabled | ⚠️ PARTIAL | Same as above | 739-748, 836-846 |
| 5. State sync assignment → application | ❌ FAIL | Both pages | N/A |

---

## D) Required Code Changes

### Change 1: Add Education Status & Deadline to Application Model
**File:** `app/admin/instructor-assignment/applications/page.tsx`

```typescript
// Line ~39: Update interface
interface InstructorApplicationItem {
  // ... existing fields
  educationStatus?: string  // Add this
  applicationDeadline?: string  // Add this
}

// Line ~54: Update dummyData to include these fields
const dummyData: InstructorApplicationItem[] = [
  {
    // ... existing fields
    educationStatus: '신청 중',  // Add
    applicationDeadline: '2025-02-28',  // Add
  },
  // ... other items
]
```

### Change 2: Implement Approve Disable Logic
**File:** `app/admin/instructor-assignment/applications/page.tsx`

```typescript
// After line ~330: Add helper function
import dayjs from 'dayjs'

const canApproveApplication = (record: InstructorApplicationItem): boolean => {
  if (record.status !== '대기') return false
  if (record.educationStatus === '신청 마감') return false
  if (record.applicationDeadline) {
    const deadline = dayjs(record.applicationDeadline)
    if (dayjs().isAfter(deadline)) return false
  }
  return true
}

// Line ~659: Update button render
render: (_, record) => {
  // ... existing status checks
  } else {
    const canApprove = canApproveApplication(record)
    return (
      <div className="flex gap-2 flex-wrap">
        <Button
          disabled={!canApprove}
          icon={<Check className="w-4 h-4" />}
          onClick={(e) => {
            e.stopPropagation()
            if (canApprove) {
              handleAcceptClick(record)
            }
          }}
          className="h-8 px-3 rounded-lg bg-green-600 hover:bg-green-400 active:bg-green-600 border-0 text-white font-medium transition-all shadow-sm hover:shadow-md"
          size="small"
        >
          수락
        </Button>
        // ... reject button
      </div>
    )
  }
}
```

### Change 3: Add Final Confirm Button
**File:** `app/admin/instructor-assignment/manual/page.tsx`

```typescript
// After line ~690: Add final confirm handler
const handleFinalConfirm = async () => {
  if (!selectedEducation) return
  
  Modal.confirm({
    title: '최종 확정',
    content: '이 배정을 최종 확정하시겠습니까?',
    onOk: async () => {
      try {
        // TODO: API call
        // await assignmentService.finalConfirm(selectedEducation.educationId)
        
        // Update local state
        setSelectedEducation({
          ...selectedEducation,
          assignmentStatus: 'confirmed'
        })
        
        // TODO: Sync to application page
        // syncApplicationStatus(selectedEducation.educationId, '수락됨')
        
        message.success('배정이 확정되었습니다.')
      } catch (error) {
        message.error('확정 처리 중 오류가 발생했습니다.')
      }
    }
  })
}

// After line ~912 (before closing DetailSectionCard): Add buttons
<div className="border-t border-gray-100 pt-6 mt-6 flex gap-3">
  <Button
    type="primary"
    onClick={handleFinalConfirm}
    className="h-11 px-6 rounded-xl"
  >
    최종 확정
  </Button>
  <Button
    danger
    onClick={() => {
      Modal.confirm({
        title: '배정 삭제',
        content: '이 배정을 삭제하시겠습니까?',
        onOk: async () => {
          // TODO: Delete assignment and sync
        }
      })
    }}
    className="h-11 px-6 rounded-xl"
  >
    삭제
  </Button>
</div>
```

### Change 4: Teacher Dashboard Visibility Filter
**File:** `app/instructor/dashboard/page.tsx`

```typescript
// Line ~213: Update filter
const filteredCourses = instructorCourses.filter(course => {
  // Add: Only show published educations
  if (course.educationStatus && 
      course.educationStatus !== 'OPEN' && 
      course.educationStatus !== '신청 중') {
    return false
  }
  
  // Existing filters
  if (activeFilter === 'all') return true
  if (activeFilter === 'scheduled') return course.status === '예정'
  if (activeFilter === 'ongoing') return course.status === '진행중'
  if (activeFilter === 'completed') return course.status === '완료'
  return true
})
```

### Change 5: State Synchronization (Basic Implementation)
**Files:** Both assignment and application pages

**Option A: Shared Context (Recommended)**
Create: `contexts/InstructorAssignmentContext.tsx`

```typescript
'use client'
import { createContext, useContext, useState, ReactNode } from 'react'

interface InstructorAssignmentContextType {
  applications: InstructorApplicationItem[]
  assignments: EducationAssignmentItem[]
  updateApplication: (key: string, updates: Partial<InstructorApplicationItem>) => void
  updateAssignment: (key: string, updates: Partial<EducationAssignmentItem>) => void
}

const InstructorAssignmentContext = createContext<InstructorAssignmentContextType | undefined>(undefined)

export function InstructorAssignmentProvider({ children }: { children: ReactNode }) {
  const [applications, setApplications] = useState<InstructorApplicationItem[]>([])
  const [assignments, setAssignments] = useState<EducationAssignmentItem[]>([])
  
  const updateApplication = (key: string, updates: Partial<InstructorApplicationItem>) => {
    setApplications(prev => prev.map(item => 
      item.key === key ? { ...item, ...updates } : item
    ))
  }
  
  const updateAssignment = (key: string, updates: Partial<EducationAssignmentItem>) => {
    setAssignments(prev => prev.map(item => 
      item.key === key ? { ...item, ...updates } : item
    ))
  }
  
  return (
    <InstructorAssignmentContext.Provider value={{
      applications,
      assignments,
      updateApplication,
      updateAssignment
    }}>
      {children}
    </InstructorAssignmentContext.Provider>
  )
}

export const useInstructorAssignment = () => {
  const context = useContext(InstructorAssignmentContext)
  if (!context) {
    throw new Error('useInstructorAssignment must be used within InstructorAssignmentProvider')
  }
  return context
}
```

**Option B: API-based Sync (If backend exists)**
In `manual/page.tsx` after confirm/delete:
```typescript
// After final confirm
await api.syncApplicationStatus(educationId, '수락됨')

// After delete
await api.syncApplicationStatus(educationId, '거절됨')
```

---

## E) Notes

1. **Missing Data Fields:** The `applicationDeadline` field is not present in any Education or Application interface. This needs to be added to the data model.

2. **Status Mapping:** There's inconsistency in status values:
   - Education: `'신청 마감'`, `'신청 중'`, `'OPEN'`, `'INIT'`, `'CANCEL'`
   - Need to standardize: `'OPEN'` = 공개/모집중, `'신청 마감'` = 마감

3. **API Integration:** All fixes include `TODO` comments for API integration. Current implementation uses local state only.

4. **Testing:** After implementing fixes, test:
   - Teacher dashboard only shows OPEN/신청 중 educations
   - Approve button disabled when education is 마감 or past deadline
   - Final confirm/delete buttons always enabled
   - State syncs between pages after refresh



