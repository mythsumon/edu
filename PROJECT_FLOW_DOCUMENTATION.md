# 교육 관리 시스템 전체 플로우 문서

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [사용자 역할](#사용자-역할)
3. [관리자 플로우](#관리자-플로우)
4. [강사 플로우](#강사-플로우)
5. [관리자-강사 연동 플로우](#관리자-강사-연동-플로우)
6. [문서 제출 및 승인 플로우](#문서-제출-및-승인-플로우)
7. [메뉴 구조 및 네비게이션](#메뉴-구조-및-네비게이션)

---

## 시스템 개요

이 시스템은 교육 프로그램 관리, 강사 배정, 문서 제출 및 승인을 위한 통합 플랫폼입니다.

### 주요 기능
- 교육 프로그램 생성 및 관리
- 강사 신청 및 배정 관리
- 출석부, 활동일지, 교구확인서 제출 및 승인
- 교육 현황 및 통계 관리

---

## 사용자 역할

### 관리자 (Admin)
- 교육 프로그램 생성 및 관리
- 강사 신청 승인 및 배정
- 제출된 문서 검토 및 승인/반려
- 기준정보 관리 (교육기관, 프로그램, 강사)
- 시스템 설정

### 강사 (Instructor)
- 교육 신청 및 출강 확정
- 출석부, 활동일지, 교구확인서 작성 및 제출
- 내 출강 일정 조회
- 교육 진행 및 문서 관리

---

## 관리자 플로우

### 1. 대시보드 (`/admin` 또는 `/admin/dashboard`)
**목적**: 전체 시스템 현황 파악

**주요 정보**:
- 전체 교육 프로그램 현황
- 진행 중인 교육 수
- 대기 중인 문서 제출 건수
- 강사 배정 현황

**다음 액션 가능**:
- 교육 관리로 이동
- 문서 제출 현황 확인
- 강사 배정 관리

---

### 2. 교육 운영 관리 (`/admin/operations`)
**목적**: 교육 프로그램 생성 및 관리

**플로우**:
```
교육 목록 조회
  ↓
[신규 교육 생성] 클릭
  ↓
교육 정보 입력:
  - 교육명
  - 교육기관
  - 교육 기간
  - 교육 일정 (차시별)
  - 교육 상태 (초기: "대기")
  ↓
저장
  ↓
교육 목록에 추가됨
```

**교육 상태 전환**:
- 대기 → 오픈예정 → 강사공개 → 신청마감 → 진행중 → 완료
- 취소 가능 (중지 불가)

**다음 액션**:
- 교육 상태 변경 (`/admin/education-status`)
- 강사 배정 관리

---

### 3. 교육 상태 변경 (`/admin/education-status`)
**목적**: 교육 상태 일괄 변경

**기능**:
- 개별 교육 상태 변경
- 일괄 상태 변경 (21:00 자동 전환, 다음날 자동 전환)
- 상태별 필터링

**상태 전환 규칙**:
- 오픈예정 → 강사공개 (21:00 자동)
- 강사공개 → 신청마감 (다음날 자동)
- 신청마감 → 진행중 (교육 시작일)
- 진행중 → 완료 (교육 종료일)

---

### 4. 강사 배정 관리

#### 4.1 강사 신청 관리 (`/admin/instructor-assignment/applications`)
**목적**: 강사 신청 내역 확인 및 승인

**플로우**:
```
강사 신청 목록 조회
  ↓
신청 내역 확인:
  - 교육명
  - 강사명
  - 역할 (주강사/보조강사)
  - 신청일
  - 상태 (대기/승인/거절)
  ↓
[승인] 또는 [거절] 선택
  ↓
승인 시 → 강사 배정 목록에 추가
거절 시 → 신청 거절 처리
```

**3일 프로세스** (향후 구현 예정):
- Day 1: 주강사만 승인
- Day 2: 보조강사 + 미배정 주강사 승인
- Day 3: 수동 배정

#### 4.2 강사 배정 관리 (`/admin/instructor-assignment/manual`)
**목적**: 강사를 수동으로 교육에 배정

**플로우**:
```
미배정 교육 목록 조회
  ↓
교육 선택
  ↓
강사 목록에서 강사 선택
  ↓
역할 지정 (주강사/보조강사)
  ↓
배정 완료
```

#### 4.3 출강 확정 관리 (`/admin/instructor-assignment/confirmations`)
**목적**: 강사 출강 확정 내역 확인

**기능**:
- 확정된 출강 일정 조회
- 확정 상태 변경

---

### 5. 기준정보 관리

#### 5.1 교육기관 관리 (`/admin/institution` 또는 `/admin/reference-info/institution-page`)
**목적**: 교육기관 정보 관리

**플로우**:
```
교육기관 목록 조회
  ↓
[신규 등록] 클릭
  ↓
교육기관 정보 입력:
  - 기관명
  - 주소
  - 연락처
  - 분류 (일반학교, 특수학급, 도서벽지, 지역아동센터, 기타)
  ↓
저장
```

**기능**:
- 교육기관 등록/수정/삭제
- 일괄 업로드 (`/admin/institutions/bulk-upload`)

#### 5.2 프로그램 관리 (`/admin/program` 또는 `/admin/reference-info/program-page`)
**목적**: 교육 프로그램 템플릿 관리

**플로우**:
```
프로그램 목록 조회
  ↓
[신규 등록] 클릭
  ↓
프로그램 정보 입력:
  - 프로그램명
  - 설명
  - 교육 시간
  - 교육 내용
  ↓
저장
```

#### 5.3 강사 관리 (`/admin/instructor` 또는 `/admin/reference-info/instructor-page`)
**목적**: 강사 정보 관리

**플로우**:
```
강사 목록 조회
  ↓
[신규 등록] 클릭
  ↓
강사 정보 입력:
  - 이름
  - 연락처
  - 이메일
  - 전문 분야
  ↓
저장
```

---

### 6. 문서 제출 현황 (`/admin/submissions`)
**목적**: 강사가 제출한 문서 검토 및 승인

**플로우**:
```
제출된 문서 목록 조회
  ↓
교육별로 그룹화된 문서 확인:
  - 출석부
  - 활동일지
  - 교구확인서
  ↓
문서 선택
  ↓
문서 상세 확인:
  - 제출 내용 검토
  - 첨부 파일 확인
  - 서명 확인
  ↓
[승인] 또는 [반려] 선택
  ↓
반려 시 사유 입력
  ↓
처리 완료
```

**문서 상태**:
- DRAFT: 초안 (미제출)
- SUBMITTED: 제출됨 (검토 대기)
- APPROVED: 승인됨
- REJECTED: 반려됨

**실시간 동기화**:
- 강사가 문서를 제출하면 관리자 화면에 즉시 반영
- 승인/반려 시 강사 화면에 즉시 반영

---

### 7. 시스템 관리 (`/admin/system`)
**목적**: 시스템 설정 및 사용자 관리

**기능**:
- 시스템 설정
- 사용자 권한 관리
- 로그 조회

---

## 강사 플로우

### 1. 대시보드 (`/instructor/dashboard`)
**목적**: 강사 개인 대시보드

**주요 정보**:
- 내 출강 리스트 (전체/예정/진행중/완료)
- 오픈 예정 교육
- 신청 가능 교육
- 진행 중인 교육
- 완료된 교육

**카드 클릭 시**:
- 해당 필터로 자동 전환
- 제목 동적 변경 (예: "오픈 예정" 클릭 시 제목이 "오픈 예정"으로 변경)
- 해당 상태의 교육만 표시

**다음 액션**:
- 내 출강 리스트 상세보기
- 교육 신청하기
- 문서 작성하기

---

### 2. 출강 일정 관리

#### 2.1 내 출강 리스트 (`/instructor/schedule/list`)
**목적**: 내가 배정된 모든 교육 일정 조회

**플로우**:
```
내 출강 리스트 조회
  ↓
교육 카드 확인:
  - 교육명
  - 교육기관
  - 교육 기간
  - 문서 제출 상태 (출석부/활동일지/교구확인서)
  - 교육 상태 (예정/진행중/완료)
  ↓
[상세보기] 클릭
  ↓
교육 상세 정보 확인
  ↓
문서 작성/수정 가능:
  - 출석부 작성하기/수정하기
  - 활동일지 작성하기/수정하기
  - 교구확인서 작성하기/수정하기
```

**문서 상태 표시**:
- ✅: 제출 완료 (APPROVED)
- ⚠️: 제출됨 (SUBMITTED, 검토 대기)
- ❌: 미제출 (DRAFT)

**실시간 동기화**:
- 관리자가 교육을 생성하면 강사 화면에 즉시 표시
- 문서 제출 시 관리자 화면에 즉시 반영

#### 2.2 확정된 수업 조회 (`/instructor/schedule/confirmed`)
**목적**: 확정된 출강 일정만 조회

**기능**:
- 확정 상태인 교육만 필터링하여 표시

#### 2.3 진행 중인 교육 (`/instructor/schedule/in-progress`)
**목적**: 현재 진행 중인 교육만 조회

**기능**:
- 진행중 상태인 교육만 필터링하여 표시

#### 2.4 완료된 교육 (`/instructor/schedule/completed`)
**목적**: 완료된 교육만 조회

**기능**:
- 완료 상태인 교육만 필터링하여 표시

---

### 3. 출강 신청

#### 3.1 오픈 예정 교육 (`/instructor/apply/upcoming`)
**목적**: 곧 오픈될 교육 미리보기

**기능**:
- 오픈 예정 교육 목록 조회
- 교육 정보 미리보기
- 신청 불가 (아직 오픈 전)

#### 3.2 출강 신청하기 (`/instructor/apply/open`)
**목적**: 신청 가능한 교육에 출강 신청

**플로우**:
```
신청 가능한 교육 목록 조회
  ↓
교육 선택
  ↓
역할 선택 (주강사/보조강사)
  ↓
신청 조건 확인:
  - 교육 상태가 "강사공개"여야 함
  - 신청 마감일이 지나지 않아야 함
  ↓
[신청하기] 클릭
  ↓
신청 확인 모달
  ↓
[확인] 클릭
  ↓
신청 완료
  ↓
내가 신청한 교육들 페이지로 이동
```

**신청 제한**:
- 교육 상태가 "강사공개"일 때만 신청 가능
- 신청 마감일 이후에는 신청 불가

#### 3.3 내가 신청한 교육들 (`/instructor/apply/mine`)
**목적**: 내가 신청한 교육의 승인 상태 확인

**플로우**:
```
내 신청 목록 조회
  ↓
신청 상태 확인:
  - 대기: 관리자 검토 중
  - 승인: 출강 확정
  - 거절: 신청 거절됨
  ↓
승인된 교육은 내 출강 리스트에 자동 추가
```

---

### 4. 문서 작성 및 제출

#### 4.1 출석부 작성 (`/instructor/schedule/[educationId]/attendance`)
**목적**: 교육 출석부 작성 및 제출

**플로우**:
```
교육 선택
  ↓
출석부 작성 페이지 진입
  ↓
교육 정보 확인:
  - 교육명
  - 교육기관
  - 교육 기간
  - 교육 일정 (차시별)
  ↓
학생 정보 입력:
  - 학생명
  - 출석 여부 (차시별)
  - 지각/조퇴/결석 처리
  ↓
기관 연락처 및 서명 정보 입력
  ↓
[임시저장] 또는 [제출하기] 선택
  ↓
임시저장: DRAFT 상태로 저장 (수정 가능)
제출하기: SUBMITTED 상태로 저장 (관리자 검토 대기)
  ↓
제출 완료
  ↓
관리자 문서 제출 현황에 표시됨
```

**출석률 계산**:
- 80% 이상 출석 시 수료 처리
- 자동 계산 및 표시

**상세보기** (`/instructor/attendance/[id]`):
- 제출된 출석부 상세 확인
- 수정하기 버튼 (DRAFT 또는 REJECTED 상태일 때)
- 활동일지 보기 버튼

#### 4.2 활동일지 작성 (`/instructor/activity-logs/[logId]`)
**목적**: 교육 활동일지 작성 및 제출

**플로우**:
```
교육 선택
  ↓
활동일지 작성 페이지 진입
  ↓
교육 정보 확인
  ↓
활동 내용 입력:
  - 교육 시작일/종료일
  - 차시별 활동 내용
  - 활동 사진 업로드 (5장 이상 필수)
  - 강의계획서 업로드
  ↓
[임시저장] 또는 [제출하기] 선택
  ↓
제출 완료
  ↓
관리자 문서 제출 현황에 표시됨
```

**필수 요구사항**:
- 활동 사진 5장 이상 필수
- 차시별 활동 내용 입력 필수

#### 4.3 교구확인서 작성 (`/instructor/equipment-confirmations/[id]`)
**목적**: 교구 대여 및 반납 확인서 작성

**플로우**:
```
교육 선택
  ↓
교구확인서 작성 페이지 진입
  ↓
교육 정보 확인
  ↓
교구 목록 입력:
  - 교구명
  - 수량
  - 대여일
  - 반납 예정일
  ↓
서명 정보 입력:
  - 대여자 서명
  - 관리자 서명
  - 반납 확인 서명
  ↓
첨부 파일 업로드
  ↓
[임시저장] 또는 [제출하기] 선택
  ↓
제출 완료
  ↓
관리자 문서 제출 현황에 표시됨
```

**상태**:
- DRAFT: 초안
- SUBMITTED: 제출됨
- BORROWED: 대여됨 (승인 후)
- RETURNED: 반납됨 (승인 후)
- APPROVED: 승인됨
- REJECTED: 반려됨

---

## 관리자-강사 연동 플로우

### 1. 교육 생성부터 문서 승인까지 전체 플로우

```
[관리자] 교육 생성
  ↓
  /admin/operations에서 교육 생성
  ↓
  교육 상태: "대기"
  ↓
[관리자] 교육 상태 변경
  ↓
  /admin/education-status에서 상태 변경
  ↓
  "대기" → "오픈예정" → "강사공개"
  ↓
[강사] 교육 신청
  ↓
  /instructor/apply/open에서 신청
  ↓
  신청 상태: "대기"
  ↓
[관리자] 강사 신청 승인
  ↓
  /admin/instructor-assignment/applications에서 승인
  ↓
  신청 상태: "승인"
  ↓
[강사] 출강 확정 확인
  ↓
  /instructor/schedule/list에서 확인
  ↓
  교육이 내 출강 리스트에 표시됨
  ↓
[강사] 교육 진행 및 문서 작성
  ↓
  출석부, 활동일지, 교구확인서 작성
  ↓
[강사] 문서 제출
  ↓
  문서 상태: "SUBMITTED"
  ↓
[관리자] 문서 검토
  ↓
  /admin/submissions에서 확인
  ↓
[관리자] 승인/반려 결정
  ↓
  승인: 문서 상태 "APPROVED"
  반려: 문서 상태 "REJECTED" (사유 포함)
  ↓
[강사] 결과 확인
  ↓
  승인: 문서 승인 완료
  반려: 반려 사유 확인 후 수정하여 재제출
```

---

### 2. 실시간 데이터 동기화

**동기화 메커니즘**:
- localStorage 이벤트를 통한 실시간 업데이트
- CustomEvent를 통한 컴포넌트 간 통신
- 페이지 새로고침 없이 데이터 자동 갱신

**동기화되는 데이터**:
- 교육 생성/수정 시 강사 대시보드에 즉시 반영
- 문서 제출 시 관리자 화면에 즉시 반영
- 문서 승인/반려 시 강사 화면에 즉시 반영

**이벤트 타입**:
- `storage`: localStorage 변경 이벤트
- `attendanceUpdated`: 출석부 업데이트
- `activityUpdated`: 활동일지 업데이트
- `equipmentUpdated`: 교구확인서 업데이트

---

### 3. 데이터 흐름

#### 3.1 교육 데이터 흐름
```
관리자 교육 생성
  ↓
dataStore에 저장
  ↓
강사 대시보드에서 조회
  ↓
getEducationDocSummariesByInstructor()로 필터링
  ↓
강사별 교육 목록 표시
```

#### 3.2 문서 데이터 흐름
```
강사 문서 작성
  ↓
localStorage에 저장 (각 문서별 storage.ts)
  ↓
getEducationDocSummariesByInstructor()로 집계
  ↓
EducationDocSummary 생성
  ↓
관리자/강사 화면에 표시
```

#### 3.3 승인/반려 데이터 흐름
```
관리자 승인/반려 결정
  ↓
문서 상태 업데이트
  ↓
CustomEvent 발생
  ↓
강사 화면 자동 갱신
```

---

## 문서 제출 및 승인 플로우

### 1. 출석부 제출 플로우

```
[강사] 출석부 작성
  /instructor/schedule/[educationId]/attendance
  ↓
학생 정보 및 출석 정보 입력
  ↓
[임시저장] → DRAFT 상태
[제출하기] → SUBMITTED 상태
  ↓
[관리자] 문서 확인
  /admin/submissions
  ↓
출석부 상세 확인
  /admin/attendance/[id]
  ↓
[승인] → APPROVED 상태
[반려] → REJECTED 상태 (사유 입력)
  ↓
[강사] 결과 확인
  /instructor/attendance/[id]
  ↓
반려 시 수정 후 재제출
```

### 2. 활동일지 제출 플로우

```
[강사] 활동일지 작성
  /instructor/activity-logs/[logId]
  ↓
활동 내용 및 사진 업로드 (5장 이상 필수)
  ↓
[임시저장] → DRAFT 상태
[제출하기] → SUBMITTED 상태
  ↓
[관리자] 문서 확인
  /admin/submissions
  ↓
활동일지 상세 확인
  /admin/activity-logs/[id]
  ↓
[승인] → APPROVED 상태
[반려] → REJECTED 상태 (사유 입력)
  ↓
[강사] 결과 확인
  /instructor/activity-logs/[logId]
  ↓
반려 시 수정 후 재제출
```

### 3. 교구확인서 제출 플로우

```
[강사] 교구확인서 작성
  /instructor/equipment-confirmations/[id]
  ↓
교구 목록 및 서명 정보 입력
  ↓
[임시저장] → DRAFT 상태
[제출하기] → SUBMITTED 상태
  ↓
[관리자] 문서 확인
  /admin/submissions
  ↓
교구확인서 상세 확인
  /admin/equipment-confirmations/[id]
  ↓
[승인] → APPROVED 상태
  ↓
대여 진행 → BORROWED 상태
  ↓
반납 완료 → RETURNED 상태
  ↓
[반려] → REJECTED 상태 (사유 입력)
  ↓
[강사] 결과 확인
  /instructor/equipment-confirmations/[id]
  ↓
반려 시 수정 후 재제출
```

---

## 메뉴 구조 및 네비게이션

### 관리자 메뉴 구조

```
📊 대시보드
  └─ 전체 프로그램 현황 (/admin)

📚 교육 운영
  ├─ 교육 관리 (/admin/operations)
  └─ 교육 상태 변경 (/admin/education-status)

👨‍🏫 강사 배정
  ├─ 강사 신청 관리 (/admin/instructor-assignment/applications)
  ├─ 강사 배정 관리 (/admin/instructor-assignment/manual)
  └─ 출강 확정 관리 (/admin/instructor-assignment/confirmations)

🏢 기준정보 관리
  ├─ 교육기관 관리 (/admin/institution)
  ├─ 프로그램 관리 (/admin/program)
  └─ 강사 관리 (/admin/instructor)

📄 문서 관리
  └─ 문서 제출 현황 (/admin/submissions)

⚙️ 시스템 관리
  └─ 설정 및 사용자 관리 (/admin/system)
```

### 강사 메뉴 구조

```
📊 대시보드
  └─ 내 대시보드 (/instructor/dashboard)

📅 출강 일정
  ├─ 내 출강 리스트 (/instructor/schedule/list)
  ├─ 확정된 수업 조회 (/instructor/schedule/confirmed)
  ├─ 진행 중인 교육 (/instructor/schedule/in-progress)
  └─ 완료된 교육 (/instructor/schedule/completed)

📝 출강 신청
  ├─ 오픈 예정 교육 (/instructor/apply/upcoming)
  ├─ 출강 신청하기 (/instructor/apply/open)
  └─ 내가 신청한 교육들 (/instructor/apply/mine)
```

---

## 주요 페이지 라우트 매핑

### 관리자 페이지

| 메뉴 | 라우트 | 설명 |
|------|--------|------|
| 전체 프로그램 현황 | `/admin` | 관리자 대시보드 |
| 교육 관리 | `/admin/operations` | 교육 생성 및 관리 |
| 교육 상태 변경 | `/admin/education-status` | 교육 상태 일괄 변경 |
| 강사 신청 관리 | `/admin/instructor-assignment/applications` | 강사 신청 승인/거절 |
| 강사 배정 관리 | `/admin/instructor-assignment/manual` | 강사 수동 배정 |
| 출강 확정 관리 | `/admin/instructor-assignment/confirmations` | 출강 확정 내역 |
| 교육기관 관리 | `/admin/institution` | 교육기관 정보 관리 |
| 프로그램 관리 | `/admin/program` | 프로그램 템플릿 관리 |
| 강사 관리 | `/admin/instructor` | 강사 정보 관리 |
| 문서 제출 현황 | `/admin/submissions` | 제출된 문서 검토 |
| 출석부 상세 | `/admin/attendance/[id]` | 출석부 상세 확인 |
| 활동일지 상세 | `/admin/activity-logs/[id]` | 활동일지 상세 확인 |
| 교구확인서 상세 | `/admin/equipment-confirmations/[id]` | 교구확인서 상세 확인 |
| 시스템 설정 | `/admin/system` | 시스템 설정 |

### 강사 페이지

| 메뉴 | 라우트 | 설명 |
|------|--------|------|
| 내 대시보드 | `/instructor/dashboard` | 강사 개인 대시보드 |
| 내 출강 리스트 | `/instructor/schedule/list` | 배정된 교육 목록 |
| 확정된 수업 조회 | `/instructor/schedule/confirmed` | 확정된 교육만 조회 |
| 진행 중인 교육 | `/instructor/schedule/in-progress` | 진행 중인 교육만 조회 |
| 완료된 교육 | `/instructor/schedule/completed` | 완료된 교육만 조회 |
| 오픈 예정 교육 | `/instructor/apply/upcoming` | 곧 오픈될 교육 |
| 출강 신청하기 | `/instructor/apply/open` | 교육 신청 |
| 내가 신청한 교육들 | `/instructor/apply/mine` | 신청 내역 확인 |
| 출석부 작성 | `/instructor/schedule/[educationId]/attendance` | 출석부 작성/수정 |
| 출석부 상세 | `/instructor/attendance/[id]` | 출석부 상세 확인 |
| 활동일지 작성 | `/instructor/activity-logs/[logId]` | 활동일지 작성/수정 |
| 교구확인서 작성 | `/instructor/equipment-confirmations/[id]` | 교구확인서 작성/수정 |

---

## 데이터 저장 구조

### 교육 데이터
- **저장 위치**: `lib/dataStore.ts`
- **주요 필드**: educationId, name, institution, period, status, lessons

### 문서 데이터
- **출석부**: `app/instructor/schedule/[educationId]/attendance/storage.ts`
- **활동일지**: `app/instructor/activity-logs/storage.ts`
- **교구확인서**: `app/instructor/equipment-confirmations/storage.ts`

### 문서 집계
- **집계 함수**: `entities/submission/submission-utils.ts`
- **주요 함수**:
  - `getAllEducationDocSummaries()`: 모든 교육의 문서 요약
  - `getEducationDocSummariesByInstructor()`: 강사별 문서 요약
  - `getEducationSubmissionGroups()`: 교육별 그룹화

---

## 상태 관리

### 교육 상태
- 대기 → 오픈예정 → 강사공개 → 신청마감 → 진행중 → 완료
- 취소 가능 (중지 불가)

### 문서 상태
- **DRAFT**: 초안 (임시저장)
- **SUBMITTED**: 제출됨 (검토 대기)
- **APPROVED**: 승인됨
- **REJECTED**: 반려됨

### 교구확인서 추가 상태
- **BORROWED**: 대여됨 (승인 후)
- **RETURNED**: 반납됨

### 강사 신청 상태
- **대기**: 관리자 검토 중
- **승인**: 출강 확정
- **거절**: 신청 거절됨

---

## 권한 및 접근 제어

### 관리자 권한
- ✅ 모든 `/admin/*` 라우트 접근 가능
- ✅ 교육 생성/수정/삭제
- ✅ 강사 배정 및 승인
- ✅ 문서 승인/반려
- ❌ `/instructor/*` 라우트 접근 불가

### 강사 권한
- ✅ 모든 `/instructor/*` 라우트 접근 가능
- ✅ 교육 신청
- ✅ 문서 작성 및 제출
- ✅ 내 출강 일정 조회
- ❌ `/admin/*` 라우트 접근 불가

### 인증
- 로그인 페이지: `/login`
- 역할 선택 후 자동 로그인
- `ProtectedRoute` 컴포넌트로 라우트 보호

---

## 주요 기능 상세

### 1. 실시간 동기화
- localStorage 이벤트 리스너
- CustomEvent를 통한 컴포넌트 간 통신
- 페이지 새로고침 없이 자동 갱신

### 2. 필터링 및 검색
- 교육 상태별 필터링
- 강사별 필터링
- 교육명/기관명 검색

### 3. 문서 다운로드
- 파일명 자동 생성
- 형식: `(강의날짜)(시작일~종료일)학교이름학년-반_문서타입_이름`

### 4. 출석률 계산
- 80% 이상 출석 시 수료 처리
- 자동 계산 및 표시

### 5. 필수 요구사항 검증
- 활동일지: 사진 5장 이상 필수
- 출석부: 모든 차시 출석 정보 입력 필수

---

## 향후 구현 예정 기능

### 1. 3일 프로세스 강사 배정
- Day 1: 주강사만 승인
- Day 2: 보조강사 + 미배정 주강사 승인
- Day 3: 수동 배정

### 2. 강의계획서 업로드
- 활동일지에 강의계획서 첨부 기능

### 3. 관리자 문서 미리보기
- 팝업/라이트박스를 통한 문서 미리보기

### 4. 통계 및 리포트
- 교육 운영 현황 요약
- 배정 요약 (미배정 세션)
- 완료 통계

---

## 기술 스택

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Ant Design
- **State Management**: Zustand
- **Form**: React Hook Form + Zod
- **Storage**: localStorage (개발용)

---

## 결론

이 시스템은 교육 프로그램 관리부터 문서 제출 및 승인까지의 전체 프로세스를 통합 관리하는 플랫폼입니다. 관리자와 강사 간의 실시간 데이터 동기화를 통해 효율적인 교육 운영이 가능합니다.
