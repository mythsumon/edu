# Attendance Sheet Workflow Implementation

## ✅ Completed

### 1. AttendanceSheet Storage (`lib/attendanceSheetStore.ts`)
- ✅ Created AttendanceSheet entity with full state machine
- ✅ State transitions: TEACHER_DRAFT → READY_FOR_INSTRUCTOR → INSTRUCTOR_IN_PROGRESS → WAITING_TEACHER_SIGNATURE → SIGNED_BY_TEACHER → SUBMITTED_TO_ADMIN → APPROVED/REJECTED
- ✅ Validation for state transitions
- ✅ localStorage + CustomEvent for real-time sync
- ✅ Methods: create, upsert, transitionStatus, addTeacherSignature, adminReview

### 2. Teacher Classes Page (`app/teacher/classes/page.tsx`)
- ✅ Added "출석부 작성" button when education status is "확정" or "교육 진행 중"
- ✅ Button shows when sheet is TEACHER_DRAFT or doesn't exist
- ✅ Integrated with attendanceSheetStore

### 3. Teacher Attendance Page (`app/teacher/attendance/[educationId]/page.tsx`)
- ✅ Created new page for teacher attendance management
- ✅ Education info fields (grade, className, teacherName, teacherContact) - editable only in TEACHER_DRAFT
- ✅ Student roster management (add/edit/remove)
- ✅ "강사에게 전달(공유)" button - transitions to READY_FOR_INSTRUCTOR
- ✅ Read-only mode when status is not TEACHER_DRAFT

### 4. Instructor Attendance Page (`app/instructor/schedule/[educationId]/attendance/page.tsx`)
- ✅ Added import for attendanceSheetStore
- ⚠️ Needs integration: Load AttendanceSheet and show teacher fields as read-only
- ⚠️ Needs: "출석부 정보 요청" button
- ⚠️ Needs: "서명 요청(학교로 전달)" button
- ⚠️ Needs: "관리자 제출" button (only when SIGNED_BY_TEACHER)

## 🔄 In Progress / TODO

### 5. Teacher Signature Page (`app/teacher/attendance-sign/page.tsx`)
- ⚠️ Needs: Update to use AttendanceSheet instead of AttendanceDocument
- ⚠️ Needs: Show "서명하기" CTA when status is WAITING_TEACHER_SIGNATURE
- ⚠️ Needs: Signature method (PNG from account or typed name + confirm)
- ⚠️ Needs: Transition to SIGNED_BY_TEACHER after signing

### 6. Admin Submissions Page (`app/admin/submissions/page.tsx`)
- ⚠️ Needs: Show AttendanceSheet status
- ⚠️ Needs: Preview AttendanceSheet
- ⚠️ Needs: Approve/reject with reason
- ⚠️ Needs: Handle rejection returns (back to appropriate state)

### 7. Admin Education Status Change
- ⚠️ Needs: Auto-create AttendanceSheet when education status reaches "확정" or "교육 진행 중"

### 8. Real-time Sync
- ✅ CustomEvent: attendanceSheetUpdated
- ⚠️ Needs: All pages to listen and refresh

## 📋 Implementation Notes

### State Flow
1. **Admin** creates Education → changes status to "확정" or "교육 진행 중"
2. **Teacher** sees "출석부 작성" button → creates/edits attendance sheet (TEACHER_DRAFT)
3. **Teacher** clicks "강사에게 전달" → status → READY_FOR_INSTRUCTOR
4. **Instructor** opens attendance → sees teacher fields (read-only) → marks attendance → status → INSTRUCTOR_IN_PROGRESS
5. **Instructor** clicks "서명 요청" → status → WAITING_TEACHER_SIGNATURE
6. **Teacher** signs → status → SIGNED_BY_TEACHER
7. **Instructor** clicks "관리자 제출" → status → SUBMITTED_TO_ADMIN
8. **Admin** approves/rejects → status → APPROVED or REJECTED (with return logic)

### Access Rules
- ✅ Teacher can only access educations for their institutionId
- ✅ Teacher fields are read-only for instructor
- ⚠️ Instructor cannot edit teacher-owned fields (needs enforcement in UI)
- ⚠️ Teacher cannot edit instructor attendance markings (needs enforcement)

### Signature Implementation
- Signature must be: account signature PNG OR "typed name + confirm"
- No image upload/OCR
- Store in AttendanceSheet.teacherSignature

## 🚀 Next Steps

1. Complete instructor attendance page integration
2. Update teacher signature page to use AttendanceSheet
3. Update admin submissions to review AttendanceSheet
4. Add auto-creation of AttendanceSheet on education status change
5. Add rejection return logic
6. Test full workflow end-to-end
