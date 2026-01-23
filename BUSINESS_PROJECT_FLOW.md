# Business Project Flow - Complete Guide with Samples

## 📋 Table of Contents

1. [System Overview](#system-overview)
2. [User Roles & Permissions](#user-roles--permissions)
3. [Complete Business Flow](#complete-business-flow)
4. [Detailed Flow Examples with Samples](#detailed-flow-examples-with-samples)
5. [Education Status Lifecycle](#education-status-lifecycle)
6. [Document Submission & Approval Flow](#document-submission--approval-flow)
7. [Data Flow Architecture](#data-flow-architecture)
8. [Sample Scenarios](#sample-scenarios)
9. [Key Business Rules](#key-business-rules)

---

## System Overview

**Education Management System** is a comprehensive platform for managing educational programs, instructor assignments, document submissions, and approvals.

### Core Business Functions

- **Education Program Management**: Create, manage, and track educational programs
- **Instructor Assignment**: Handle instructor applications, approvals, and assignments
- **Document Management**: Process attendance sheets, activity logs, equipment confirmations, and lesson plans
- **Status Management**: Track education status through complete lifecycle
- **Real-time Synchronization**: Ensure data consistency across admin and instructor interfaces

---

## User Roles & Permissions

### 👨‍💼 Administrator (Admin)

**Responsibilities:**
- Create and manage education programs
- Approve/reject instructor applications
- Assign instructors to educations
- Review and approve/reject submitted documents
- Manage reference data (institutions, programs, instructors)
- System configuration and user management

**Access:**
- All `/admin/*` routes
- Full CRUD operations on all entities
- Document approval/rejection authority

### 👨‍🏫 Instructor

**Responsibilities:**
- Apply for available educations
- Confirm assigned educations
- Create and submit documents (attendance, activity logs, equipment confirmations, lesson plans)
- View assigned education schedules
- Track document approval status

**Access:**
- All `/instructor/*` routes
- Can only view/edit own data
- Cannot approve documents

### 👩‍🏫 Teacher

**Responsibilities:**
- View and sign attendance sheets
- Submit education-related requests

**Access:**
- Limited `/teacher/*` routes
- View-only access to assigned educations

---

## Complete Business Flow

### End-to-End Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPLETE BUSINESS FLOW                        │
└─────────────────────────────────────────────────────────────────┘

[1] ADMIN: Create Education Program
    ├─ Education Details (name, institution, period, schedule)
    ├─ Initial Status: "대기" (Pending)
    └─ Save to dataStore

[2] ADMIN: Change Education Status
    ├─ "대기" → "오픈예정" (Scheduled to Open)
    ├─ "오픈예정" → "강사공개" (Open for Application)
    └─ Status change triggers event

[3] INSTRUCTOR: View Available Educations
    ├─ Filter by status: "강사공개"
    ├─ View education details
    └─ Check eligibility (region, role, deadline)

[4] INSTRUCTOR: Apply for Education
    ├─ Select role (Main Instructor / Assistant)
    ├─ Submit application
    └─ Status: "대기" (Pending Approval)

[5] ADMIN: Review Applications
    ├─ View all pending applications
    ├─ Check education status and deadline
    ├─ Approve or Reject
    └─ Update application status

[6] ADMIN: Assign Instructors
    ├─ Manual assignment (if needed)
    ├─ Assign main/assistant instructors
    └─ Set assignment mode (Partial/Full Region)

[7] INSTRUCTOR: Confirm Assignment
    ├─ View assigned educations
    ├─ Confirm attendance
    └─ Status: "확정" (Confirmed)

[8] ADMIN: Change Status to "진행중" (In Progress)
    └─ When education start date arrives

[9] INSTRUCTOR: Conduct Education & Submit Documents
    ├─ Create Attendance Sheet
    ├─ Create Activity Log (with photos)
    ├─ Create Equipment Confirmation
    ├─ Create Lesson Plan
    └─ Submit each document

[10] ADMIN: Review & Approve Documents
     ├─ View submitted documents
     ├─ Review content and attachments
     ├─ Approve or Reject (with reason)
     └─ Update document status

[11] INSTRUCTOR: Handle Rejections
     ├─ View rejection reason
     ├─ Modify document
     └─ Resubmit

[12] ADMIN: Change Status to "완료" (Completed)
     └─ When education end date arrives

[13] ADMIN: Process Settlement
     ├─ Calculate instructor fees
     ├─ Process travel expenses
     └─ Finalize settlement
```

---

## Detailed Flow Examples with Samples

### Example 1: Complete Education Lifecycle

#### Step 1: Admin Creates Education

**Sample Data:**
```json
{
  "educationId": "EDU-2025-001",
  "name": "2025년 1학기 과학실험 교육",
  "institution": "서울초등학교",
  "program": "과학실험 프로그램",
  "status": "대기",
  "periodStart": "2025-03-01",
  "periodEnd": "2025-03-31",
  "gradeClass": "3학년 1반",
  "studentCount": 25,
  "lessons": [
    {
      "lessonNumber": 1,
      "date": "2025-03-05",
      "startTime": "09:00",
      "endTime": "11:00",
      "mainInstructorCount": 1,
      "assistantInstructorCount": 1
    },
    {
      "lessonNumber": 2,
      "date": "2025-03-12",
      "startTime": "09:00",
      "endTime": "11:00",
      "mainInstructorCount": 1,
      "assistantInstructorCount": 1
    }
  ]
}
```

**Action Flow:**
1. Admin navigates to `/admin/operations`
2. Clicks "신규 교육 생성" (New Education)
3. Fills in education details
4. Adds lesson schedule
5. Saves → Education created with status "대기"

---

#### Step 2: Admin Changes Status

**Status Transition:**
```
대기 → 오픈예정 → 강사공개 → 신청마감 → 확정 → 진행중 → 완료
```

**Sample Actions:**
1. Admin navigates to `/admin/education-status`
2. Selects education "EDU-2025-001"
3. Changes status from "대기" to "오픈예정"
4. Later changes to "강사공개" (or scheduled at 21:00)
5. System dispatches `educationStatusUpdated` event

**Sample Status Change:**
```typescript
// Before
{
  "educationId": "EDU-2025-001",
  "status": "대기"
}

// After
{
  "educationId": "EDU-2025-001",
  "status": "강사공개",
  "openAt": "2025-02-20T21:00:00Z"
}
```

---

#### Step 3: Instructor Views Available Educations

**Sample View:**
- **Page**: `/instructor/apply/open`
- **Filter**: Status = "강사공개"
- **Display**: List of educations with:
  - Education name
  - Institution
  - Period
  - Application deadline
  - Available roles

**Sample Education Card:**
```
┌─────────────────────────────────────────┐
│ 2025년 1학기 과학실험 교육              │
│ 서울초등학교                            │
│ 기간: 2025-03-01 ~ 2025-03-31          │
│ 신청마감: 2025-02-25                    │
│ [신청하기]                              │
└─────────────────────────────────────────┘
```

---

#### Step 4: Instructor Applies

**Sample Application:**
```json
{
  "applicationId": "APP-001",
  "educationId": "EDU-2025-001",
  "instructorId": "INST-001",
  "instructorName": "홍길동",
  "role": "주강사",
  "status": "대기",
  "appliedAt": "2025-02-21T10:30:00Z"
}
```

**Action Flow:**
1. Instructor clicks "신청하기" on education card
2. Selects role: "주강사" or "보조강사"
3. Confirms application
4. Application saved with status "대기"
5. Redirected to `/instructor/apply/mine`

---

#### Step 5: Admin Reviews Application

**Sample View:**
- **Page**: `/admin/instructor-assignment/applications`
- **Display**: Table with applications

**Sample Application Row:**
```
교육명: 2025년 1학기 과학실험 교육
강사명: 홍길동
역할: 주강사
신청일: 2025-02-21
상태: 대기
[승인] [거절]
```

**Business Rules:**
- Approve button disabled if:
  - Education status = "신청마감" (Closed)
  - Application deadline has passed
- Can approve/reject regardless of other applications

**Action Flow:**
1. Admin views application list
2. Clicks "승인" button
3. Confirmation modal appears
4. Confirms → Application status changes to "승인"
5. Instructor assignment created automatically

---

#### Step 6: Admin Assigns Instructors (Manual)

**Sample Assignment:**
```json
{
  "assignmentId": "ASSIGN-001",
  "educationId": "EDU-2025-001",
  "lessons": [
    {
      "lessonNumber": 1,
      "mainInstructorId": "INST-001",
      "mainInstructorName": "홍길동",
      "assistantInstructorIds": ["INST-002"],
      "assistantInstructorNames": ["김철수"]
    }
  ],
  "regionAssignmentMode": "PARTIAL"
}
```

**Action Flow:**
1. Admin navigates to `/admin/instructor-assignment/manual`
2. Selects education "EDU-2025-001"
3. Clicks "부분 권역 배정" or "전체 권역 배정"
4. Selects instructors from modal
5. Assigns roles (main/assistant)
6. Confirms → Assignment saved

---

#### Step 7: Instructor Confirms Assignment

**Sample View:**
- **Page**: `/instructor/schedule/list`
- **Display**: Assigned educations

**Sample Education Card:**
```
┌─────────────────────────────────────────┐
│ 2025년 1학기 과학실험 교육              │
│ 서울초등학교                            │
│ 역할: 주강사                            │
│ 상태: 배정됨                            │
│ [출석부 작성] [활동일지 작성]           │
└─────────────────────────────────────────┘
```

**Action Flow:**
1. Instructor views assigned educations
2. Confirms assignment (implicit or explicit)
3. Education appears in "내 출강 리스트"

---

#### Step 8: Education Starts - Status Changes to "진행중"

**Automatic or Manual:**
- Automatic: When `periodStart` date arrives
- Manual: Admin changes status in `/admin/education-status`

**Sample Status Update:**
```json
{
  "educationId": "EDU-2025-001",
  "status": "진행중",
  "startedAt": "2025-03-01T00:00:00Z"
}
```

---

#### Step 9: Instructor Submits Documents

**Document Types:**
1. **Attendance Sheet** (`/instructor/schedule/[educationId]/attendance`)
2. **Activity Log** (`/instructor/activity-logs/[logId]`)
3. **Equipment Confirmation** (`/instructor/equipment-confirmations/[id]`)
4. **Lesson Plan** (`/instructor/schedule/[educationId]/lesson-plan`)

**Sample Attendance Sheet:**
```json
{
  "id": "ATT-001",
  "educationId": "EDU-2025-001",
  "programName": "2025년 1학기 과학실험 교육",
  "institution": "서울초등학교",
  "gradeClass": "3학년 1반",
  "students": [
    {
      "name": "이영희",
      "attendance": [
        { "lesson": 1, "status": "출석" },
        { "lesson": 2, "status": "출석" }
      ],
      "attendanceRate": 100
    }
  ],
  "status": "SUBMITTED",
  "submittedAt": "2025-03-15T14:30:00Z"
}
```

**Action Flow:**
1. Instructor navigates to attendance page
2. Enters student information
3. Marks attendance for each lesson
4. Clicks "제출하기" (Submit)
5. Status changes to "SUBMITTED"
6. Event `attendanceUpdated` dispatched

---

#### Step 10: Admin Reviews Documents

**Sample View:**
- **Page**: `/admin/submissions`
- **Display**: Grouped by education

**Sample Submission Group:**
```
┌─────────────────────────────────────────┐
│ 2025년 1학기 과학실험 교육              │
│ 서울초등학교                            │
│                                         │
│ 출석부: [제출됨] [상세보기] [승인] [반려]│
│ 활동일지: [제출됨] [상세보기] [승인] [반려]│
│ 교구확인서: [미제출]                    │
└─────────────────────────────────────────┘
```

**Action Flow:**
1. Admin views submission list
2. Clicks "상세보기" on document
3. Reviews content, attachments, signatures
4. Clicks "승인" or "반려"
5. If reject: Enters rejection reason
6. Document status updated
7. Event dispatched → Instructor notified

**Sample Approval:**
```json
{
  "id": "ATT-001",
  "status": "APPROVED",
  "approvedAt": "2025-03-16T10:00:00Z",
  "approvedBy": "admin-user"
}
```

**Sample Rejection:**
```json
{
  "id": "ACT-001",
  "status": "REJECTED",
  "rejectReason": "활동 사진이 5장 미만입니다. 최소 5장 이상 업로드해주세요.",
  "rejectedAt": "2025-03-16T10:15:00Z",
  "rejectedBy": "admin-user"
}
```

---

#### Step 11: Instructor Handles Rejection

**Action Flow:**
1. Instructor views document status
2. Sees rejection reason
3. Clicks "수정하기"
4. Makes corrections
5. Resubmits → Status changes to "SUBMITTED" again

---

#### Step 12: Education Completes

**Status Change:**
- Automatic: When `periodEnd` date arrives
- Manual: Admin changes status

**Sample Final Status:**
```json
{
  "educationId": "EDU-2025-001",
  "status": "완료",
  "completedAt": "2025-03-31T23:59:59Z",
  "allDocumentsApproved": true
}
```

---

## Education Status Lifecycle

### Status Definitions

| Status | Korean | Description | Next Possible Statuses |
|--------|--------|-------------|------------------------|
| 대기 | Pending | Initial state after creation | 오픈예정, 취소 |
| 오픈예정 | Scheduled to Open | Scheduled to be opened | 강사공개, 취소 |
| 강사공개 | Open for Application | Open for instructor applications | 신청마감, 취소 |
| 신청마감 | Application Closed | Application deadline passed | 확정, 취소 |
| 확정 | Confirmed | Instructors confirmed | 진행중, 취소 |
| 진행중 | In Progress | Education is ongoing | 완료, 중지 |
| 완료 | Completed | Education finished | 종료 |
| 종료 | Finished | Final state | - |
| 중지 | Suspended | Education suspended | - |
| 취소 | Canceled | Education canceled | - |

### Status Transition Rules

**Normal Flow:**
```
대기 → 오픈예정 → 강사공개 → 신청마감 → 확정 → 진행중 → 완료 → 종료
```

**Scheduled Transitions:**
- `오픈예정 → 강사공개`: Automatic at 21:00
- `강사공개 → 신청마감`: Automatic next day
- `신청마감 → 진행중`: Automatic on `periodStart` date
- `진행중 → 완료`: Automatic on `periodEnd` date

**Irreversible Transitions:**
- `신청마감 → 확정`: Cannot be undone
- `확정 → 진행중`: Significant milestone

**Cancellation:**
- Can cancel from: 대기, 오픈예정, 강사공개, 신청마감
- Cannot cancel from: 확정, 진행중, 완료, 종료

### Sample Status Change Sequence

```typescript
// Day 1: Admin creates education
{
  "educationId": "EDU-001",
  "status": "대기",
  "createdAt": "2025-02-01T09:00:00Z"
}

// Day 2: Admin schedules for opening
{
  "educationId": "EDU-001",
  "status": "오픈예정",
  "scheduledOpenAt": "2025-02-05T21:00:00Z"
}

// Day 5, 21:00: Automatic transition
{
  "educationId": "EDU-001",
  "status": "강사공개",
  "openedAt": "2025-02-05T21:00:00Z"
}

// Day 6: Automatic transition
{
  "educationId": "EDU-001",
  "status": "신청마감",
  "closedAt": "2025-02-06T00:00:00Z"
}

// After instructor assignment: Admin confirms
{
  "educationId": "EDU-001",
  "status": "확정",
  "confirmedAt": "2025-02-10T10:00:00Z"
}

// On start date: Automatic transition
{
  "educationId": "EDU-001",
  "status": "진행중",
  "startedAt": "2025-03-01T00:00:00Z"
}

// On end date: Automatic transition
{
  "educationId": "EDU-001",
  "status": "완료",
  "completedAt": "2025-03-31T23:59:59Z"
}
```

---

## Document Submission & Approval Flow

### Document Types

1. **Attendance Sheet (출석부)**
   - Student attendance tracking
   - Attendance rate calculation (80% threshold for completion)
   - Institution contact and signature

2. **Activity Log (활동일지)**
   - Activity descriptions per lesson
   - Photo uploads (minimum 5 photos required)
   - Lesson plan attachment

3. **Equipment Confirmation (교구확인서)**
   - Equipment list
   - Borrow/return dates
   - Signatures (borrower, admin, return confirmation)

4. **Lesson Plan (강의계획서)**
   - Lesson objectives
   - Teaching methods
   - Materials and resources

5. **Evidence (증빙자료)**
   - Supporting documents
   - Receipts, certificates, etc.

### Document Status Flow

```
DRAFT → SUBMITTED → APPROVED
                ↓
            REJECTED → (수정) → SUBMITTED → APPROVED
```

**Status Definitions:**
- **DRAFT**: Saved but not submitted (can edit)
- **SUBMITTED**: Submitted for review (cannot edit)
- **APPROVED**: Approved by admin (final state)
- **REJECTED**: Rejected by admin (can edit and resubmit)

**Special Statuses (Equipment Confirmation):**
- **BORROWED**: Equipment borrowed (after approval)
- **RETURNED**: Equipment returned (final state)

### Complete Document Flow Example

#### Step 1: Instructor Creates Attendance Sheet

**Sample Data:**
```json
{
  "id": "ATT-001",
  "educationId": "EDU-2025-001",
  "status": "DRAFT",
  "students": [
    {
      "name": "이영희",
      "attendance": [
        { "lesson": 1, "status": "출석", "note": "" },
        { "lesson": 2, "status": "지각", "note": "10분 지각" }
      ],
      "attendanceRate": 90
    },
    {
      "name": "김철수",
      "attendance": [
        { "lesson": 1, "status": "출석", "note": "" },
        { "lesson": 2, "status": "결석", "note": "병결" }
      ],
      "attendanceRate": 50
    }
  ],
  "institutionContact": "02-1234-5678",
  "instructorSignature": "홍길동",
  "createdAt": "2025-03-10T09:00:00Z"
}
```

**Action:**
1. Instructor navigates to `/instructor/schedule/EDU-2025-001/attendance`
2. Enters student information
3. Marks attendance for each lesson
4. Clicks "임시저장" → Status: DRAFT
5. Later clicks "제출하기" → Status: SUBMITTED

---

#### Step 2: Admin Reviews Attendance Sheet

**Sample View:**
- **Page**: `/admin/submissions`
- **Filter**: Education = "EDU-2025-001"
- **Display**: Attendance sheet with status "제출됨"

**Action:**
1. Admin clicks "상세보기"
2. Reviews attendance data
3. Checks attendance rates
4. Verifies signatures
5. Clicks "승인" → Status: APPROVED

**Sample Approval:**
```json
{
  "id": "ATT-001",
  "status": "APPROVED",
  "approvedAt": "2025-03-11T14:30:00Z",
  "approvedBy": "admin-user"
}
```

---

#### Step 3: Instructor Creates Activity Log

**Sample Data:**
```json
{
  "id": "ACT-001",
  "educationId": "EDU-2025-001",
  "status": "DRAFT",
  "activities": [
    {
      "lesson": 1,
      "date": "2025-03-05",
      "content": "과학실험: 물의 상태 변화 관찰",
      "photos": [
        "photo1.jpg",
        "photo2.jpg",
        "photo3.jpg",
        "photo4.jpg",
        "photo5.jpg"
      ]
    },
    {
      "lesson": 2,
      "date": "2025-03-12",
      "content": "과학실험: 식물의 성장 관찰",
      "photos": [
        "photo6.jpg",
        "photo7.jpg",
        "photo8.jpg",
        "photo9.jpg",
        "photo10.jpg"
      ]
    }
  ],
  "lessonPlan": "lesson-plan.pdf",
  "createdAt": "2025-03-13T10:00:00Z"
}
```

**Validation:**
- Minimum 5 photos required per activity
- Lesson plan attachment optional but recommended

**Action:**
1. Instructor navigates to `/instructor/activity-logs/ACT-001`
2. Enters activity descriptions
3. Uploads photos (at least 5 per lesson)
4. Uploads lesson plan
5. Clicks "제출하기" → Status: SUBMITTED

---

#### Step 4: Admin Rejects Activity Log

**Sample Rejection:**
```json
{
  "id": "ACT-001",
  "status": "REJECTED",
  "rejectReason": "1차시 활동 사진이 4장만 업로드되었습니다. 최소 5장 이상 필요합니다.",
  "rejectedAt": "2025-03-14T09:00:00Z",
  "rejectedBy": "admin-user"
}
```

**Action:**
1. Admin reviews activity log
2. Notices only 4 photos for lesson 1
3. Clicks "반려"
4. Enters rejection reason
5. Confirms → Status: REJECTED
6. Event dispatched → Instructor notified

---

#### Step 5: Instructor Resubmits

**Action:**
1. Instructor views rejection reason
2. Clicks "수정하기"
3. Adds missing photo
4. Clicks "제출하기" → Status: SUBMITTED (again)
5. Admin reviews again and approves

---

## Data Flow Architecture

### Data Storage

**Centralized Data Store:**
- **Location**: `lib/dataStore.ts`
- **Storage**: localStorage (development)
- **Entities**: Educations, Instructor Assignments, Users

**Document Storage:**
- **Attendance**: `app/instructor/schedule/[educationId]/attendance/storage.ts`
- **Activity Logs**: `app/instructor/activity-logs/storage.ts`
- **Equipment**: `app/instructor/equipment-confirmations/storage.ts`
- **Lesson Plans**: `app/instructor/schedule/[educationId]/lesson-plan/storage.ts`
- **Evidence**: `app/instructor/evidence/storage.ts`

### Data Aggregation

**Document Summary Generation:**
- **Function**: `getEducationDocSummariesByInstructor()`
- **Location**: `entities/submission/submission-utils.ts`
- **Purpose**: Aggregate all documents for an education

**Sample Summary:**
```typescript
{
  "educationId": "EDU-2025-001",
  "educationName": "2025년 1학기 과학실험 교육",
  "institutionName": "서울초등학교",
  "instructorName": "홍길동",
  "attendance": {
    "id": "ATT-001",
    "status": "APPROVED",
    "submittedAt": "2025-03-11T10:00:00Z",
    "count": 1
  },
  "activity": {
    "id": "ACT-001",
    "status": "APPROVED",
    "submittedAt": "2025-03-15T14:00:00Z",
    "count": 1
  },
  "equipment": {
    "id": "EQ-001",
    "status": "RETURNED",
    "submittedAt": "2025-03-10T09:00:00Z",
    "count": 1
  },
  "overallStatus": "ALL_APPROVED",
  "lastUpdatedAt": "2025-03-15T14:00:00Z"
}
```

### Real-time Synchronization

**Event System:**
- **Custom Events**: `educationStatusUpdated`, `attendanceUpdated`, `activityUpdated`, etc.
- **Storage Events**: localStorage change events
- **Purpose**: Keep admin and instructor views synchronized

**Sample Event:**
```typescript
// When education status changes
window.dispatchEvent(
  new CustomEvent('educationStatusUpdated', {
    detail: { educationIds: ['EDU-2025-001'] }
  })
)

// When document is submitted
window.dispatchEvent(
  new CustomEvent('attendanceUpdated', {
    detail: { educationId: 'EDU-2025-001' }
  })
)
```

**Event Listeners:**
```typescript
// In component
useEffect(() => {
  const handleUpdate = () => {
    // Reload data from store
    // Update local state
  }
  
  window.addEventListener('educationStatusUpdated', handleUpdate)
  window.addEventListener('attendanceUpdated', handleUpdate)
  
  return () => {
    window.removeEventListener('educationStatusUpdated', handleUpdate)
    window.removeEventListener('attendanceUpdated', handleUpdate)
  }
}, [])
```

---

## Sample Scenarios

### Scenario 1: New Education Program (Complete Cycle)

**Timeline:**
- **Day 1 (2025-02-01)**: Admin creates education
- **Day 2 (2025-02-02)**: Admin changes status to "오픈예정"
- **Day 5 (2025-02-05, 21:00)**: Automatic change to "강사공개"
- **Day 6 (2025-02-06)**: Automatic change to "신청마감"
- **Day 7 (2025-02-07)**: Admin approves applications, changes to "확정"
- **Day 30 (2025-03-01)**: Education starts, status changes to "진행중"
- **Day 60 (2025-03-31)**: Education ends, status changes to "완료"

**Key Actions:**
1. Admin creates education with 2 lessons
2. 3 instructors apply (2 main, 1 assistant)
3. Admin approves 1 main + 1 assistant
4. Instructors confirm assignments
5. Education starts
6. Instructors submit all documents
7. Admin approves all documents
8. Education completes

---

### Scenario 2: Document Rejection & Resubmission

**Timeline:**
- **Day 1**: Instructor submits activity log with 4 photos
- **Day 2**: Admin rejects (needs 5 photos minimum)
- **Day 3**: Instructor adds photo and resubmits
- **Day 4**: Admin approves

**Sample Data Flow:**
```json
// Initial Submission
{
  "id": "ACT-001",
  "status": "SUBMITTED",
  "activities": [
    {
      "lesson": 1,
      "photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg"]
    }
  ]
}

// Rejection
{
  "id": "ACT-001",
  "status": "REJECTED",
  "rejectReason": "활동 사진이 4장만 업로드되었습니다. 최소 5장 이상 필요합니다."
}

// Resubmission
{
  "id": "ACT-001",
  "status": "SUBMITTED",
  "activities": [
    {
      "lesson": 1,
      "photos": ["photo1.jpg", "photo2.jpg", "photo3.jpg", "photo4.jpg", "photo5.jpg"]
    }
  ]
}

// Approval
{
  "id": "ACT-001",
  "status": "APPROVED"
}
```

---

### Scenario 3: Multiple Instructors, One Education

**Setup:**
- Education: "EDU-2025-001"
- Main Instructor: 홍길동
- Assistant Instructors: 김철수, 이영희

**Assignment Data:**
```json
{
  "assignmentId": "ASSIGN-001",
  "educationId": "EDU-2025-001",
  "lessons": [
    {
      "lessonNumber": 1,
      "mainInstructorId": "INST-001",
      "mainInstructorName": "홍길동",
      "assistantInstructorIds": ["INST-002", "INST-003"],
      "assistantInstructorNames": ["김철수", "이영희"]
    }
  ]
}
```

**Document Submission:**
- Main instructor submits: Attendance, Activity Log, Lesson Plan
- Assistant instructors may submit: Activity Log (optional)

**Admin View:**
- All documents grouped under same education
- Can see which instructor submitted which document

---

### Scenario 4: Bulk Status Change

**Scenario:**
- Admin needs to change 10 educations from "오픈예정" to "강사공개" at once

**Action Flow:**
1. Admin navigates to `/admin/education-status`
2. Filters by status: "오픈예정"
3. Selects all 10 educations (checkboxes)
4. Selects new status: "강사공개" from dropdown
5. Clicks "상태 변경" (Status Change) button
6. Confirmation modal: "선택한 10개 교육의 상태를 '강사공개'로 변경하시겠습니까?"
7. Confirms → All 10 educations updated
8. Events dispatched for all 10 educations

**Sample Bulk Update:**
```typescript
const selectedIds = ['EDU-001', 'EDU-002', ..., 'EDU-010']
const newStatus = '강사공개'

selectedIds.forEach(id => {
  dataStore.updateEducation(id, { status: newStatus })
  educationScheduler.scheduleEducation(education)
})

window.dispatchEvent(
  new CustomEvent('educationStatusUpdated', {
    detail: { educationIds: selectedIds }
  })
)
```

---

## Key Business Rules

### Education Status Rules

1. **Status Progression**: Must follow normal flow (can skip some steps)
2. **Cancellation**: Can only cancel before "확정" status
3. **Automatic Transitions**: Scheduled at specific times/dates
4. **Irreversible Transitions**: Some status changes cannot be undone

### Instructor Application Rules

1. **Application Window**: Only when status = "강사공개"
2. **Deadline**: Cannot apply after application deadline
3. **Approval Restrictions**: 
   - Cannot approve if education status = "신청마감"
   - Cannot approve if deadline passed
4. **Role Selection**: Can apply as main or assistant instructor

### Document Submission Rules

1. **Attendance Sheet**:
   - Must include all students
   - Attendance rate calculated automatically
   - 80% threshold for completion

2. **Activity Log**:
   - Minimum 5 photos per activity required
   - Lesson plan attachment recommended
   - Activity description required per lesson

3. **Equipment Confirmation**:
   - Equipment list required
   - Borrow/return dates required
   - Signatures required

4. **Document States**:
   - DRAFT: Can edit
   - SUBMITTED: Cannot edit (admin review)
   - APPROVED: Final state
   - REJECTED: Can edit and resubmit

### Assignment Rules

1. **Assignment Modes**:
   - PARTIAL: Partial region assignment (default)
   - FULL: Full region assignment

2. **Instructor Display**:
   - Main instructor: First name shown
   - Assistant instructors: Comma-separated list

3. **Confirmation**: Instructors must confirm assignments

### Synchronization Rules

1. **Real-time Updates**: Changes reflect immediately across views
2. **Event System**: Custom events for cross-component communication
3. **Storage Events**: localStorage changes trigger updates

---

## Summary

This document provides a comprehensive guide to the business project flow, including:

- **Complete end-to-end flow** from education creation to completion
- **Detailed examples** with sample data structures
- **Status lifecycle** with all possible transitions
- **Document submission flow** with approval/rejection handling
- **Data flow architecture** with storage and synchronization
- **Sample scenarios** demonstrating real-world usage
- **Key business rules** that govern the system

The system ensures:
- ✅ Real-time synchronization between admin and instructor views
- ✅ Complete audit trail of all status changes and document submissions
- ✅ Flexible status management with automatic and manual transitions
- ✅ Comprehensive document management with approval workflow
- ✅ Role-based access control and permissions

---

**Document Version**: 1.0  
**Last Updated**: 2025-01-XX  
**Maintained By**: Development Team
