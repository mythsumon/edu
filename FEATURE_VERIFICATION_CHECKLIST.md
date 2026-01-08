# Feature Verification Checklist

## A) Education Status Flow (Admin)
- [x] Status transitions exist in `statusTransitions.ts`
- [ ] ❌ Status names mismatch: "교육 예정" vs "오픈예정", "강사 공개" vs "강사공개"
- [ ] ❌ Missing "오픈예정" status
- [ ] ❌ "중지" should be removed (only 취소 allowed)
- [ ] ❓ New educations default to "대기" - NEEDS VERIFICATION
- [ ] ❌ Bulk actions for 21:00 and next day - NOT IMPLEMENTED
- [ ] ❓ Only "강사공개" allows applications - NEEDS VERIFICATION

## B) Instructor Apply & Assignment (3-day process)
- [x] Apply logic exists
- [ ] ❌ Day1/Day2/Day3 filtering - NOT IMPLEMENTED
- [ ] ❌ Day1: 주강사 only acceptance - NOT IMPLEMENTED
- [ ] ❌ Day2: 보조강사 + 미배정 주강사 - NOT IMPLEMENTED
- [ ] ❌ Day3: Manual assignment screen - EXISTS but needs date-based filtering

## C) Evidence / Proof Upload + Review
- [x] Upload system exists (attendance, activity, equipment)
- [x] Photo count >=5 enforcement exists
- [ ] ❓ 강의계획서 upload - NOT FOUND
- [ ] ❌ Admin preview popup/lightbox - NOT IMPLEMENTED
- [x] Review workflow exists (approve/reject)

## D) Download Filename Auto Generation
- [ ] ❌ Auto filename generation - NOT IMPLEMENTED
- [ ] ❌ Format: (강의날짜)(시작일~종료일)학교이름학년-반_문서타입_이름

## E) Attendance Completion (80% rule)
- [x] Calculation exists in attendance page
- [ ] ❓ "수료 인원" total per education - NEEDS VERIFICATION

## F) Institution Classification
- [x] Common codes exist (일반학교, 특수학급, 도서벽지, 지역아동센터, 기타)
- [ ] ❓ Stored and used in reports - NEEDS VERIFICATION

## G) Reports (Admin)
- [x] Some stats exist in admin dashboard
- [ ] ❌ Education operation status summary - PARTIAL
- [ ] ❌ Assignment summary (unassigned sessions) - NOT FOUND
- [ ] ❌ Evidence review status - PARTIAL
- [ ] ❌ Completion statistics - PARTIAL
- [ ] ❌ Monthly performance by institution category - NOT FOUND
- [ ] ❌ CSV export - NOT IMPLEMENTED

