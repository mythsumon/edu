# 출석부 워크플로우 테스트 가이드

## ✅ 구현 완료된 기능

### 1. AttendanceSheet Storage (`lib/attendanceSheetStore.ts`)
- ✅ 완전한 상태 머신 구현
- ✅ localStorage + CustomEvent 실시간 동기화

### 2. Teacher Classes Page (`app/teacher/classes/page.tsx`)
- ✅ "출석부 작성" 버튼 표시 (교육 상태가 "확정" 또는 "교육 진행 중"일 때)

### 3. Teacher Attendance Page (`app/teacher/attendance/[educationId]/page.tsx`)
- ✅ 교육 정보 입력 (학년, 반, 담임 이름, 연락처)
- ✅ 학생 명단 관리 (추가/수정/삭제)
- ✅ "강사에게 전달(공유)" 버튼

### 4. Instructor Attendance Page (`app/instructor/schedule/[educationId]/attendance/page.tsx`)
- ✅ AttendanceSheet 로드 및 표시
- ✅ 교사 필드 읽기 전용 표시
- ✅ "출석부 정보 요청" 버튼
- ✅ "출석부 작성 시작" 버튼
- ✅ "서명 요청(학교로 전달)" 버튼
- ✅ "관리자 제출" 버튼 (서명 완료 후만 활성화)
- ✅ 출석 정보 저장 시 AttendanceSheet 업데이트

### 5. Teacher Signature Page (`app/teacher/attendance-sign/page.tsx`)
- ✅ AttendanceSheet 통합
- ✅ WAITING_TEACHER_SIGNATURE 상태의 출석부 표시
- ✅ 서명 기능 (PNG 또는 입력 이름)

### 6. Admin Education Status (`app/admin/education-status/page.tsx`)
- ✅ 교육 상태를 "확정" 또는 "교육 진행 중"으로 변경 시 AttendanceSheet 자동 생성

### 7. Admin Submissions (`app/admin/submissions/page.tsx`)
- ✅ AttendanceSheet 승인/반려 기능
- ✅ 실시간 업데이트 리스너

## 🧪 테스트 시나리오

### 시나리오 1: 전체 워크플로우 테스트

1. **Admin → Education Status 변경**
   - `/admin/education-status` 접속
   - 교육 상태를 "확정" 또는 "교육 진행 중"으로 변경
   - ✅ AttendanceSheet가 자동 생성됨

2. **Teacher → 출석부 작성**
   - `/teacher/classes` 접속
   - "출석부 작성" 버튼 클릭
   - 교육 정보 입력 (학년, 반, 담임 이름, 연락처)
   - 학생 명단 추가
   - "강사에게 전달(공유)" 버튼 클릭
   - ✅ 상태가 READY_FOR_INSTRUCTOR로 변경됨

3. **Instructor → 출석부 작성**
   - `/instructor/schedule/[educationId]/attendance` 접속
   - 교사 필드가 읽기 전용으로 표시됨
   - "출석부 작성 시작" 버튼 클릭
   - 출석 정보 입력
   - "저장하기" 클릭
   - "서명 요청(학교로 전달)" 버튼 클릭
   - ✅ 상태가 WAITING_TEACHER_SIGNATURE로 변경됨

4. **Teacher → 서명**
   - `/teacher/attendance-sign` 접속
   - 서명이 필요한 출석부 확인
   - "서명하기" 클릭
   - 서명 방법 선택 (PNG 또는 입력 이름)
   - 서명 완료
   - ✅ 상태가 SIGNED_BY_TEACHER로 변경됨

5. **Instructor → 관리자 제출**
   - `/instructor/schedule/[educationId]/attendance` 접속
   - "관리자 제출" 버튼 클릭 (서명 완료 후 활성화)
   - ✅ 상태가 SUBMITTED_TO_ADMIN으로 변경됨

6. **Admin → 승인/반려**
   - `/admin/submissions` 접속
   - 제출된 출석부 확인
   - 승인 또는 반려
   - ✅ 상태가 APPROVED 또는 REJECTED로 변경됨

### 시나리오 2: 출석부 정보 요청

1. **Instructor → 정보 요청**
   - `/instructor/schedule/[educationId]/attendance` 접속
   - "출석부 정보 요청" 버튼 클릭
   - 요청 메시지 입력
   - 전송
   - ✅ Teacher의 `/teacher/requests`에 요청 표시

2. **Teacher → 정보 입력**
   - `/teacher/requests` 접속
   - 요청 확인
   - `/teacher/classes/[educationId]`에서 정보 입력
   - 요청 완료 처리

### 시나리오 3: 반려 후 재작업

1. **Admin → 반려**
   - 출석부 반려 (사유 입력)
   - ✅ 상태가 적절한 이전 단계로 변경됨

2. **Instructor/Teacher → 수정**
   - 반려된 출석부 수정
   - 다시 제출

## 📝 주요 파일 위치

- **AttendanceSheet Storage**: `lib/attendanceSheetStore.ts`
- **Teacher Classes**: `app/teacher/classes/page.tsx`
- **Teacher Attendance**: `app/teacher/attendance/[educationId]/page.tsx`
- **Instructor Attendance**: `app/instructor/schedule/[educationId]/attendance/page.tsx`
- **Teacher Signature**: `app/teacher/attendance-sign/page.tsx`
- **Admin Education Status**: `app/admin/education-status/page.tsx`
- **Admin Submissions**: `app/admin/submissions/page.tsx`

## 🔄 상태 전환 흐름

```
TEACHER_DRAFT
  ↓ (Teacher: 강사에게 전달)
READY_FOR_INSTRUCTOR
  ↓ (Instructor: 출석부 작성 시작)
INSTRUCTOR_IN_PROGRESS
  ↓ (Instructor: 서명 요청)
WAITING_TEACHER_SIGNATURE
  ↓ (Teacher: 서명)
SIGNED_BY_TEACHER
  ↓ (Instructor: 관리자 제출)
SUBMITTED_TO_ADMIN
  ↓ (Admin: 승인/반려)
APPROVED / REJECTED
```

## ⚠️ 주의사항

1. **교육 상태 변경**: Admin이 교육 상태를 "확정" 또는 "교육 진행 중"으로 변경해야 Teacher가 출석부 작성 버튼을 볼 수 있습니다.

2. **읽기 전용 필드**: Instructor는 Teacher가 입력한 교육 정보와 학생 명단을 수정할 수 없습니다.

3. **서명 필수**: Instructor는 Teacher의 서명이 완료된 후에만 관리자에게 제출할 수 있습니다.

4. **실시간 동기화**: CustomEvent를 통해 실시간으로 상태가 업데이트됩니다. 여러 탭을 열어 테스트할 수 있습니다.
