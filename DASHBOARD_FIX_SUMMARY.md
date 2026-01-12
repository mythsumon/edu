# Dashboard Fix Summary

## ✅ Completed Changes

### A) Single Source of Truth (Data Consistency)

1. **Created unified data helpers** (`entities/submission/submission-utils.ts`):
   - `deriveEducationDocSummary(educationId)`: Gets document summary for a specific education
   - `getAllEducationDocSummaries()`: Gets all education summaries
   - `getEducationDocSummariesByInstructor(instructorName)`: Filters by instructor
   - `getEvidenceByEducationGrouped(educationId)`: Gets all evidence documents for an education
   - All functions use consistent `educationId` as the primary identifier

2. **Fixed identifier consistency**:
   - All tables now use `educationId` as the primary key
   - Document status is tracked consistently across attendance, activity, and equipment
   - Status values: `DRAFT | SUBMITTED | APPROVED | REJECTED`

### B) Fixed Tab UX Issue (Education-Centric)

**Before**: Tabs split by document type (출석부/활동일지/교구확인서) → confusing

**After**: 
- ✅ Main table rows = Education (grouped by educationId)
- ✅ Added 3 document status indicators per education row:
  - 출석부 상태 (✅/⚠️/❌ + count)
  - 활동일지 상태 (✅/⚠️/❌ + count)
  - 교구 확인서 상태 (✅/⚠️/❌ + count)
- ✅ Tabs repurposed as FILTERS:
  - 전체
  - 미제출 있음 (has SUBMITTED documents)
  - 반려 있음 (has REJECTED documents)
  - 승인 완료 (ALL_APPROVED)
- ✅ Clicking a row opens Drawer detail view (no page change)
- ✅ Drawer groups all 3 doc types in tabs inside

### C) Instructor Dashboard Fixes

1. **Education-centric view**: Shows instructor's educations with document status indicators
2. **Detail view**: Drawer shows all 3 document types for selected education
3. **Status display**: Clear indicators for 미제출/제출(검토중)/승인/반려(사유)
4. **Navigation**: Clicking document in drawer navigates to detail page

### D) Admin Dashboard Fixes

1. **Education-centric review queue**: Filter by evidence status (제출됨/반려/승인)
2. **Approve/Reject**: 
   - Updates evidence.status and stores rejectReason
   - Reject reason visible to instructor immediately
   - Updates localStorage consistently
3. **Detail view**: Drawer with approve/reject buttons for each document type
4. **Download**: Filename generator wired (needs actual file download implementation)

### E) Download Filename Rules

✅ Filename generator already exists in `lib/filenameGenerator.ts`:
- 강의계획서: `(강의날짜)(시작일~종료일)학교이름학년-반_강의계획서_이름`
- 활동일지: `(강의날짜)(시작일~종료일)학교이름학년-반_교육활동일지_이름`
- 출석부: `(강의날짜)학교이름학년-반_출석부`
- 활동사진: `(강의날짜)(시작일~종료일)학교이름학년-반_활동사진01~NN`

✅ Wired to download buttons in `EducationDetailDrawer` component

### F) New Components Created

1. **`DocumentStatusIndicator`** (`components/shared/common/DocumentStatusIndicator.tsx`):
   - Shows document status with icon (✅/⚠️/❌)
   - Displays count
   - Reusable across both dashboards

2. **`EducationDetailDrawer`** (`components/shared/common/EducationDetailDrawer.tsx`):
   - Drawer component for education detail view
   - Groups all 3 document types in tabs
   - Shows status, reject reason, submit date
   - Admin: Approve/Reject buttons
   - Instructor: View/Download buttons
   - Filename generation on download

## 📋 Files Modified

1. `entities/submission/submission-utils.ts` - Created unified data helpers
2. `entities/submission/index.ts` - Updated exports
3. `components/shared/common/DocumentStatusIndicator.tsx` - New component
4. `components/shared/common/EducationDetailDrawer.tsx` - New component
5. `components/shared/common/index.ts` - Added exports
6. `app/instructor/submissions/page.tsx` - Refactored to education-centric
7. `app/admin/submissions/page.tsx` - Refactored to education-centric

## 🔄 Data Flow

```
Storage (localStorage)
  ↓
getAttendanceDocs() / getActivityLogs() / getEquipmentDocs()
  ↓
getAllEducationDocSummaries() / getEducationDocSummariesByInstructor()
  ↓
EducationDocSummary[] (unified format)
  ↓
Table (education-centric rows with document status indicators)
  ↓
Drawer (detail view with all 3 document types)
```

## ⚠️ Remaining Tasks (Optional)

1. **File Download Implementation**: 
   - Currently filename is generated but actual download needs to be implemented
   - Need to handle file storage/retrieval

2. **Role-based Submission Rules**:
   - 주강사: 강의계획서 requirement
   - 주/보조: 활동일지 requirement
   - 보조: 출석부 + 활동사진(>=5) requirement
   - These can be added as validation in submission forms

3. **Time Conflict Prevention**:
   - Can be added when applying for educations
   - Check session time overlaps

4. **Audit Logs**:
   - Optional: Track admin approvals/rejections with timestamps

## ✅ Key Improvements

1. **Consistent Data**: All pages use same `educationId` and status values
2. **Better UX**: Education-centric view makes it easier to see all documents for an education
3. **Clear Status**: Visual indicators (✅/⚠️/❌) make status immediately clear
4. **No Page Changes**: Drawer keeps user in context
5. **Reusable Components**: DocumentStatusIndicator and EducationDetailDrawer can be used elsewhere
6. **Filter-based Tabs**: More intuitive than document-type tabs

