# 강사 신청 정책 시스템 설계 문서

## 1. 데이터베이스 스키마

### 1.1 Global Policy Table (`instructor_application_policies`)
전역 기본 정책 설정

```sql
CREATE TABLE instructor_application_policies (
  id BIGSERIAL PRIMARY KEY,
  policy_type VARCHAR(50) NOT NULL, -- 'GLOBAL', 'TRAINING', 'INSTRUCTOR_MONTH'
  -- Global policy fields
  main_instructor_monthly_max_hours DECIMAL(5,2) DEFAULT 20.0, -- 주강사 월별 최대 시간
  assistant_instructor_monthly_max_hours DECIMAL(5,2) DEFAULT 30.0, -- 보조강사 월별 최대 시간
  daily_max_applications INTEGER DEFAULT 1, -- 일일 최대 신청 수
  allow_multiple_sessions_per_day BOOLEAN DEFAULT false, -- 하루에 여러 수업 허용 (오전+오후)
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  UNIQUE(policy_type)
);
```

### 1.2 Training Policy Override Table (`training_policy_overrides`)
교육별 정책 오버라이드

```sql
CREATE TABLE training_policy_overrides (
  id BIGSERIAL PRIMARY KEY,
  training_id VARCHAR(50) NOT NULL, -- educationId
  main_instructor_monthly_max_hours DECIMAL(5,2),
  assistant_instructor_monthly_max_hours DECIMAL(5,2),
  daily_max_applications INTEGER,
  allow_multiple_sessions_per_day BOOLEAN,
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  FOREIGN KEY (training_id) REFERENCES educations(education_id),
  UNIQUE(training_id)
);
```

### 1.3 Instructor Monthly Override Table (`instructor_monthly_overrides`)
강사별 월별 정책 오버라이드

```sql
CREATE TABLE instructor_monthly_overrides (
  id BIGSERIAL PRIMARY KEY,
  instructor_id VARCHAR(50) NOT NULL,
  year_month VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
  main_instructor_monthly_max_hours DECIMAL(5,2),
  assistant_instructor_monthly_max_hours DECIMAL(5,2),
  daily_max_applications INTEGER,
  allow_multiple_sessions_per_day BOOLEAN,
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by VARCHAR(100),
  updated_by VARCHAR(100),
  FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id),
  UNIQUE(instructor_id, year_month)
);
```

### 1.4 Application Session Hours Tracking (`instructor_application_hours`)
신청별 시간 추적 (검증용)

```sql
CREATE TABLE instructor_application_hours (
  id BIGSERIAL PRIMARY KEY,
  application_id VARCHAR(50) NOT NULL,
  instructor_id VARCHAR(50) NOT NULL,
  training_id VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL, -- 'main' | 'assistant'
  session_hours DECIMAL(5,2) NOT NULL, -- 이 신청의 총 시간
  year_month VARCHAR(7) NOT NULL, -- 'YYYY-MM'
  application_date DATE NOT NULL, -- 신청일
  status VARCHAR(20) NOT NULL, -- 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'ASSIGNED'
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (application_id) REFERENCES instructor_applications(id),
  FOREIGN KEY (instructor_id) REFERENCES instructors(instructor_id),
  FOREIGN KEY (training_id) REFERENCES educations(education_id),
  INDEX idx_instructor_month (instructor_id, year_month, role),
  INDEX idx_instructor_date (instructor_id, application_date)
);
```

## 2. 정책 해석 로직 (Policy Resolution)

### 2.1 우선순위 규칙
1. **Instructor + Month Override** (최우선)
2. **Training Override**
3. **Global Default** (최하위)

### 2.2 Policy Resolution Pseudocode

```typescript
interface ResolvedPolicy {
  mainInstructorMonthlyMaxHours: number
  assistantInstructorMonthlyMaxHours: number
  dailyMaxApplications: number
  allowMultipleSessionsPerDay: boolean
}

function resolveApplicationPolicy(
  instructorId: string,
  trainingId: string,
  yearMonth: string // 'YYYY-MM'
): ResolvedPolicy {
  // 1. Load global default policy
  const globalPolicy = getGlobalPolicy()
  
  // 2. Try to load training override
  const trainingOverride = getTrainingPolicyOverride(trainingId)
  
  // 3. Try to load instructor+month override
  const instructorOverride = getInstructorMonthlyOverride(instructorId, yearMonth)
  
  // 4. Resolve with priority: instructor > training > global
  return {
    mainInstructorMonthlyMaxHours: 
      instructorOverride?.mainInstructorMonthlyMaxHours ??
      trainingOverride?.mainInstructorMonthlyMaxHours ??
      globalPolicy.mainInstructorMonthlyMaxHours,
    
    assistantInstructorMonthlyMaxHours:
      instructorOverride?.assistantInstructorMonthlyMaxHours ??
      trainingOverride?.assistantInstructorMonthlyMaxHours ??
      globalPolicy.assistantInstructorMonthlyMaxHours,
    
    dailyMaxApplications:
      instructorOverride?.dailyMaxApplications ??
      trainingOverride?.dailyMaxApplications ??
      globalPolicy.dailyMaxApplications,
    
    allowMultipleSessionsPerDay:
      instructorOverride?.allowMultipleSessionsPerDay ??
      trainingOverride?.allowMultipleSessionsPerDay ??
      globalPolicy.allowMultipleSessionsPerDay,
  }
}
```

## 3. 검증 로직 (Validation Logic)

### 3.1 월별 시간 제한 검증

```typescript
interface ValidationResult {
  valid: boolean
  errorCode?: 'LIMIT_MONTHLY_SESSIONS_EXCEEDED' | 'LIMIT_DAILY_APPLICATIONS_EXCEEDED'
  reason?: string
  details?: {
    currentHours: number
    maxHours: number
    role: 'main' | 'assistant'
    yearMonth: string
  }
}

function validateMonthlySessionHours(
  instructorId: string,
  trainingId: string,
  role: 'main' | 'assistant',
  sessionHours: number, // 이 신청의 총 시간
  yearMonth: string // 'YYYY-MM'
): ValidationResult {
  // 1. Resolve policy
  const policy = resolveApplicationPolicy(instructorId, trainingId, yearMonth)
  
  // 2. Get current monthly usage (PENDING + ACCEPTED + ASSIGNED)
  const currentUsage = getMonthlySessionHours(
    instructorId,
    role,
    yearMonth,
    ['PENDING', 'ACCEPTED', 'ASSIGNED']
  )
  
  // 3. Calculate new total
  const newTotal = currentUsage + sessionHours
  
  // 4. Get max hours for role
  const maxHours = role === 'main'
    ? policy.mainInstructorMonthlyMaxHours
    : policy.assistantInstructorMonthlyMaxHours
  
  // 5. Validate
  if (newTotal > maxHours) {
    return {
      valid: false,
      errorCode: 'LIMIT_MONTHLY_SESSIONS_EXCEEDED',
      reason: `월별 시간 제한 초과: ${yearMonth}에 ${role === 'main' ? '주강사' : '보조강사'} 역할의 시간(${newTotal.toFixed(1)}h)이 제한(${maxHours}h)을 초과합니다.`,
      details: {
        currentHours: currentUsage,
        maxHours: maxHours,
        role: role,
        yearMonth: yearMonth
      }
    }
  }
  
  return { valid: true }
}
```

### 3.2 일일 신청 제한 검증

```typescript
function validateDailyApplicationLimit(
  instructorId: string,
  trainingId: string,
  applicationDate: Date, // 신청하려는 날짜
  sessionTimes: Array<{ date: string; startTime: string; endTime: string }> // 이 신청의 수업 시간들
): ValidationResult {
  // 1. Resolve policy
  const yearMonth = formatYearMonth(applicationDate)
  const policy = resolveApplicationPolicy(instructorId, trainingId, yearMonth)
  
  // 2. Get current applications for this date
  const dateStr = formatDate(applicationDate) // 'YYYY-MM-DD'
  const currentApplications = getDailyApplications(instructorId, dateStr, ['PENDING', 'ACCEPTED'])
  
  // 3. Check if multiple sessions per day is allowed
  if (!policy.allowMultipleSessionsPerDay) {
    // Only one application per day allowed
    if (currentApplications.length > 0) {
      return {
        valid: false,
        errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
        reason: `일일 신청 제한: ${dateStr}에 이미 신청한 교육이 있습니다. 하루에 하나의 교육만 신청할 수 있습니다.`,
        details: {
          currentApplications: currentApplications.length,
          maxApplications: 1,
          date: dateStr
        }
      }
    }
  } else {
    // Multiple sessions allowed, but check count limit
    if (currentApplications.length >= policy.dailyMaxApplications) {
      return {
        valid: false,
        errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
        reason: `일일 신청 제한 초과: ${dateStr}에 신청한 교육 수(${currentApplications.length})가 제한(${policy.dailyMaxApplications})을 초과합니다.`,
        details: {
          currentApplications: currentApplications.length,
          maxApplications: policy.dailyMaxApplications,
          date: dateStr
        }
      }
    }
    
    // Check time conflicts if multiple sessions allowed
    for (const newSession of sessionTimes) {
      for (const existingApp of currentApplications) {
        if (hasTimeConflict(newSession, existingApp.sessions)) {
          return {
            valid: false,
            errorCode: 'LIMIT_DAILY_APPLICATIONS_EXCEEDED',
            reason: `시간 충돌: ${dateStr}에 이미 신청한 교육과 시간이 겹칩니다.`,
            details: {
              date: dateStr,
              conflictingSession: newSession
            }
          }
        }
      }
    }
  }
  
  return { valid: true }
}
```

### 3.3 통합 검증 함수

```typescript
function validateInstructorApplication(
  instructorId: string,
  trainingId: string,
  role: 'main' | 'assistant',
  sessionHours: number,
  applicationDate: Date,
  sessionTimes: Array<{ date: string; startTime: string; endTime: string }>
): ValidationResult {
  const yearMonth = formatYearMonth(applicationDate)
  
  // 1. Validate monthly session hours
  const monthlyValidation = validateMonthlySessionHours(
    instructorId,
    trainingId,
    role,
    sessionHours,
    yearMonth
  )
  
  if (!monthlyValidation.valid) {
    return monthlyValidation
  }
  
  // 2. Validate daily application limit
  const dailyValidation = validateDailyApplicationLimit(
    instructorId,
    trainingId,
    applicationDate,
    sessionTimes
  )
  
  if (!dailyValidation.valid) {
    return dailyValidation
  }
  
  return { valid: true }
}
```

## 4. 동시성 안전성 (Concurrency Safety)

### 4.1 데이터베이스 레벨
- 트랜잭션 격리 수준: `READ COMMITTED` 또는 `REPEATABLE READ`
- 낙관적 잠금(Optimistic Locking) 사용
- `SELECT FOR UPDATE`로 검증 시점의 데이터 잠금

### 4.2 Application Flow with Locking

```typescript
async function submitInstructorApplication(
  instructorId: string,
  trainingId: string,
  role: 'main' | 'assistant',
  sessionHours: number,
  applicationDate: Date,
  sessionTimes: Array<{ date: string; startTime: string; endTime: string }>
): Promise<{ success: boolean; errorCode?: string; reason?: string }> {
  // Start transaction
  const transaction = await db.beginTransaction()
  
  try {
    // Lock instructor's monthly usage record
    await db.query(
      `SELECT * FROM instructor_application_hours 
       WHERE instructor_id = $1 AND year_month = $2 AND role = $3
       FOR UPDATE`,
      [instructorId, formatYearMonth(applicationDate), role]
    )
    
    // Lock instructor's daily applications
    await db.query(
      `SELECT * FROM instructor_applications
       WHERE instructor_id = $1 AND application_date = $2 AND status IN ('PENDING', 'ACCEPTED')
       FOR UPDATE`,
      [instructorId, formatDate(applicationDate)]
    )
    
    // Re-validate with locked data
    const validation = await validateInstructorApplication(
      instructorId,
      trainingId,
      role,
      sessionHours,
      applicationDate,
      sessionTimes
    )
    
    if (!validation.valid) {
      await transaction.rollback()
      return {
        success: false,
        errorCode: validation.errorCode,
        reason: validation.reason
      }
    }
    
    // Create application
    const application = await createInstructorApplication({
      instructorId,
      trainingId,
      role,
      sessionHours,
      applicationDate,
      sessionTimes,
      status: 'PENDING'
    })
    
    // Record session hours
    await createApplicationHoursRecord({
      applicationId: application.id,
      instructorId,
      trainingId,
      role,
      sessionHours,
      yearMonth: formatYearMonth(applicationDate),
      applicationDate,
      status: 'PENDING'
    })
    
    await transaction.commit()
    
    return { success: true }
  } catch (error) {
    await transaction.rollback()
    throw error
  }
}
```

## 5. Admin Dashboard 필드 정의

### 5.1 Global Policy Management Screen

**Route**: `/admin/policies/instructor-application`

**Fields**:
```typescript
interface GlobalPolicyForm {
  // 주강사 월별 최대 시간
  mainInstructorMonthlyMaxHours: number
  // 보조강사 월별 최대 시간
  assistantInstructorMonthlyMaxHours: number
  // 일일 최대 신청 수
  dailyMaxApplications: number
  // 하루에 여러 수업 허용 (오전+오후)
  allowMultipleSessionsPerDay: boolean
}
```

**UI Components**:
- Number input for hours (0.5 단위)
- Number input for daily max (1 이상)
- Toggle switch for multiple sessions
- Save button with confirmation

### 5.2 Training Policy Override Screen

**Route**: `/admin/trainings/[trainingId]/policy-override`

**Fields**:
```typescript
interface TrainingPolicyOverrideForm {
  trainingId: string
  // Optional overrides (null = use global)
  mainInstructorMonthlyMaxHours?: number | null
  assistantInstructorMonthlyMaxHours?: number | null
  dailyMaxApplications?: number | null
  allowMultipleSessionsPerDay?: boolean | null
}
```

**UI Components**:
- Education info display (read-only)
- Override toggles for each field
- When toggled on, show input field
- When toggled off, show "전역 정책 사용" label
- Save/Cancel buttons

### 5.3 Instructor Monthly Override Screen

**Route**: `/admin/instructors/[instructorId]/monthly-overrides`

**Fields**:
```typescript
interface InstructorMonthlyOverrideForm {
  instructorId: string
  yearMonth: string // 'YYYY-MM'
  // Optional overrides (null = use training/global)
  mainInstructorMonthlyMaxHours?: number | null
  assistantInstructorMonthlyMaxHours?: number | null
  dailyMaxApplications?: number | null
  allowMultipleSessionsPerDay?: boolean | null
}
```

**UI Components**:
- Instructor info display
- Month picker (YYYY-MM)
- Override toggles for each field
- Table view for existing overrides
- Add/Edit/Delete buttons

## 6. Frontend Implementation (localStorage-based)

### 6.1 Policy Store Structure

```typescript
// lib/policyStore.ts
export interface ApplicationPolicy {
  mainInstructorMonthlyMaxHours: number
  assistantInstructorMonthlyMaxHours: number
  dailyMaxApplications: number
  allowMultipleSessionsPerDay: boolean
}

export interface GlobalPolicy extends ApplicationPolicy {
  id: 'GLOBAL'
  policyType: 'GLOBAL'
}

export interface TrainingPolicyOverride extends ApplicationPolicy {
  id: string
  trainingId: string
  policyType: 'TRAINING'
}

export interface InstructorMonthlyOverride extends ApplicationPolicy {
  id: string
  instructorId: string
  yearMonth: string // 'YYYY-MM'
  policyType: 'INSTRUCTOR_MONTH'
}

export const policyStore = {
  // Global policy
  getGlobalPolicy(): GlobalPolicy
  saveGlobalPolicy(policy: Partial<ApplicationPolicy>): void
  
  // Training overrides
  getTrainingOverride(trainingId: string): TrainingPolicyOverride | null
  saveTrainingOverride(trainingId: string, override: Partial<ApplicationPolicy>): void
  deleteTrainingOverride(trainingId: string): void
  
  // Instructor monthly overrides
  getInstructorMonthlyOverride(instructorId: string, yearMonth: string): InstructorMonthlyOverride | null
  saveInstructorMonthlyOverride(instructorId: string, yearMonth: string, override: Partial<ApplicationPolicy>): void
  deleteInstructorMonthlyOverride(instructorId: string, yearMonth: string): void
  
  // Policy resolution
  resolvePolicy(instructorId: string, trainingId: string, yearMonth: string): ApplicationPolicy
}
```

## 7. Frontend Implementation Files

### 7.1 Policy Store (`lib/policyStore.ts`)
- `getGlobalPolicy()`: 전역 정책 조회
- `saveGlobalPolicy()`: 전역 정책 저장
- `getTrainingOverride()`: 교육별 오버라이드 조회
- `saveTrainingOverride()`: 교육별 오버라이드 저장
- `deleteTrainingOverride()`: 교육별 오버라이드 삭제
- `getInstructorMonthlyOverride()`: 강사별 월별 오버라이드 조회
- `saveInstructorMonthlyOverride()`: 강사별 월별 오버라이드 저장
- `deleteInstructorMonthlyOverride()`: 강사별 월별 오버라이드 삭제
- `resolvePolicy()`: 우선순위 기반 정책 해석

### 7.2 Policy Validation (`entities/instructor/policy-validation.ts`)
- `validateMonthlySessionHours()`: 월별 시간 제한 검증
- `validateDailyApplicationLimit()`: 일일 신청 제한 검증
- `validateInstructorApplicationWithPolicy()`: 통합 검증 함수
- Error codes: `LIMIT_MONTHLY_SESSIONS_EXCEEDED`, `LIMIT_DAILY_APPLICATIONS_EXCEEDED`

## 8. Integration Points

### 8.1 Instructor Application Flow
- `app/instructor/apply/open/page.tsx`에서 `validateInstructorApplicationWithPolicy` 호출
- 검증 실패 시 즉시 거부 및 오류 메시지 표시
- Error code에 따른 구체적인 오류 메시지 표시

### 8.2 Admin Policy Management
- `/admin/policies/instructor-application` - 전역 정책 관리
- `/admin/trainings/[id]/policy-override` - 교육별 오버라이드
- `/admin/instructors/[id]/monthly-overrides` - 강사별 월별 오버라이드

### 8.3 Data Store Integration
- `dataStore`에 정책 관련 함수 추가
- `InstructorApplication` 생성 시 검증 로직 통합
- localStorage 기반 정책 저장/로드
