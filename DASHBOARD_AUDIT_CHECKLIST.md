# Dashboard Fix Audit Checklist

## ✅ Fixed Issues

### Data Consistency
- [x] All tables use `educationId` as primary identifier
- [x] Document status values consistent: `DRAFT | SUBMITTED | APPROVED | REJECTED`
- [x] Single source of truth: `entities/submission/submission-utils.ts`
- [x] No duplicate evidence rows for same (educationId + evidenceType)
- [x] Equipment confirmation uses `educationId` (education-level, no session)

### Tab UX
- [x] Changed from document-type tabs to education-centric view
- [x] Main table rows = Education (grouped by educationId)
- [x] Document status indicators per education row (✅/⚠️/❌)
- [x] Tabs repurposed as filters (전체/미제출 있음/반려 있음/승인 완료)
- [x] Detail view uses Drawer (no page change)

### Instructor Dashboard
- [x] Shows instructor's educations with consistent keys
- [x] Document status clearly displayed
- [x] Drawer shows all 3 document types
- [x] Navigation to detail pages works

### Admin Dashboard
- [x] Education-centric review queue
- [x] Filter by evidence status
- [x] Approve/Reject updates evidence.status
- [x] Reject reason stored and visible
- [x] Drawer with approve/reject buttons

### Download Filenames
- [x] Filename generator exists (`lib/filenameGenerator.ts`)
- [x] Wired to download buttons in Drawer
- [x] Format follows rules:
  - 강의계획서: `(강의날짜)(시작일~종료일)학교이름학년-반_강의계획서_이름`
  - 활동일지: `(강의날짜)(시작일~종료일)학교이름학년-반_교육활동일지_이름`
  - 출석부: `(강의날짜)학교이름학년-반_출석부`
  - 활동사진: `(강의날짜)(시작일~종료일)학교이름학년-반_활동사진01~NN`

## ⚠️ Known Limitations / Future Enhancements

### Role-based Submission Rules (Not Yet Implemented)
- [ ] 주강사: 강의계획서 requirement validation
- [ ] 주/보조: 활동일지 requirement validation
- [ ] 보조: 출석부 + 활동사진(>=5) requirement validation
- [ ] Block submit if requirements not met

### Time Conflict Prevention (Not Yet Implemented)
- [ ] Prevent applying if session time overlaps with confirmed sessions

### File Download (Partially Implemented)
- [x] Filename generation works
- [ ] Actual file download implementation needed
- [ ] File storage/retrieval system needed

### Audit Logs (Optional)
- [ ] Track admin approvals/rejections with timestamps
- [ ] Store approval history

## 🔍 Data Flow Verification

### Instructor Flow
1. Instructor views `/instructor/submissions`
2. Sees education-centric table with document status indicators
3. Clicks "상세" → Drawer opens
4. Drawer shows all 3 document types in tabs
5. Can view/edit each document type
6. Status updates reflect immediately

### Admin Flow
1. Admin views `/admin/submissions`
2. Sees education-centric table with document status indicators
3. Filters by status (전체/미제출 있음/반려 있음/승인 완료)
4. Clicks "상세" → Drawer opens
5. Drawer shows all 3 document types
6. Can approve/reject each document
7. Reject reason prompt and storage
8. Status updates reflect immediately

## ✅ Component Reusability

- [x] `DocumentStatusIndicator` - Reusable status display
- [x] `EducationDetailDrawer` - Reusable detail view
- [x] Status badge styling consistent across pages
- [x] All using existing Ant Design components (Table, Drawer, Tabs, Badge)

## 📊 Testing Checklist

### Instructor Dashboard
- [ ] View education list with document status
- [ ] Filter by status tabs
- [ ] Open drawer for education detail
- [ ] View each document type in drawer
- [ ] Navigate to document detail pages
- [ ] Status updates after submission

### Admin Dashboard
- [ ] View all educations with document status
- [ ] Filter by status tabs
- [ ] Open drawer for education detail
- [ ] Approve document (status changes to APPROVED)
- [ ] Reject document with reason (status changes to REJECTED, reason visible)
- [ ] Reject reason visible to instructor
- [ ] Download with correct filename format

### Data Consistency
- [ ] Same educationId used across all views
- [ ] Status changes reflect in both instructor and admin views
- [ ] No duplicate records for same educationId + document type
- [ ] Equipment confirmation correctly linked to educationId

