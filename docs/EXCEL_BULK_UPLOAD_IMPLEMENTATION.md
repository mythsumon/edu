# Excel 일괄 업로드 구현 가이드

## 개요

관리자 페이지에서 **프로그램 등록**과 **교육기관 관리** 기능에 Excel 파일을 통한 일괄 업로드 기능을 추가하는 방법을 설명합니다.

기존 교육기관 일괄 업로드 구현(`app/admin/institutions/bulk-upload/`)을 참고하여 동일한 패턴으로 구현합니다.

---

## 1. 프로그램 일괄 업로드

### 1.1 필드 구조

프로그램 등록에 필요한 필드는 다음과 같습니다:

| Excel 컬럼명 (한글) | Excel 컬럼명 (영문) | 필드명 | 필수 여부 | 설명 | 예시 값 |
|-------------------|-------------------|--------|----------|------|---------|
| 차시 | session | sessionValue | 필수 | 프로그램 차시 (Common Code) | 8, 16, 50, 4 |
| 프로그램 유형 | programType | programTypeValue | 필수 | 프로그램 유형 (Common Code) | 블록코딩, 텍스트코딩, 앱인벤터 |
| 상태 | status | status | 필수 | 프로그램 상태 | 활성, 대기, 비활성 |
| 비고 | note | note | 선택 | 추가 설명 | - |

**참고:**
- `sessionValue`와 `programTypeValue`는 Common Code의 `value` 값을 사용합니다.
- Common Code 조회 함수: `getProgramSessionCodes()`, `getProgramTypeCodes()`
- 프로그램명은 자동으로 생성됩니다: `{차시} {프로그램유형}` (예: "8차시 블록코딩")

### 1.2 Excel 템플릿 예시

```
차시,프로그램 유형,상태,비고
8,블록코딩,활성,초등학교용
16,텍스트코딩,대기,중학교용
50,앱인벤터,활성,고등학교용
```

또는 영문 컬럼명:

```
session,programType,status,note
8,블록코딩,활성,초등학교용
16,텍스트코딩,대기,중학교용
50,앱인벤터,활성,고등학교용
```

### 1.3 구현 단계

#### Step 1: 타입 정의 파일 생성

`app/admin/program/bulk-upload/types.ts` 생성:

```typescript
export interface ProgramBulkUploadRow {
  sessionValue: string
  sessionLabel: string
  programTypeValue: string
  programTypeLabel: string
  status: string
  note?: string
}

export interface ProgramBulkUploadError {
  rowIndex: number
  message: string
}

export interface ProgramBulkUploadPreview {
  rows: ProgramBulkUploadRow[]
  errors: ProgramBulkUploadError[]
  totalRows: number
  validRows: number
  errorRows: number
}
```

#### Step 2: 헬퍼 함수 파일 생성

`app/admin/program/bulk-upload/bulkUploadHelpers.ts` 생성:

```typescript
import type { GroupKey } from '@/components/admin/common-code/types'
import { 
  getProgramSessionCodes, 
  getProgramTypeCodes,
  getProgramSessionByValue,
  getProgramTypeByValue
} from '@/lib/commonCodeStore'
import type { ProgramBulkUploadRow, ProgramBulkUploadError } from './types'

/**
 * 텍스트 정규화 (BOM 제거, 공백 정리, 유니코드 정규화)
 */
export function normalizeText(value: string | undefined | null): string {
  if (!value) return ''
  
  let normalized = value.replace(/^\uFEFF/, '') // BOM 제거
  normalized = normalized.trim()
  normalized = normalized.replace(/\s+/g, ' ') // 공백 정리
  normalized = normalized.normalize('NFC') // 유니코드 정규화
  
  return normalized
}

/**
 * CSV 파싱
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  // 헤더 파싱
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine).map(h => normalizeText(h))
  
  // 헤더 별칭 매핑
  const headerMap: Record<string, string> = {
    '차시': 'session',
    'session': 'session',
    'SESSION': 'session',
    '프로그램 유형': 'programType',
    '프로그램유형': 'programType',
    'programType': 'programType',
    'PROGRAMTYPE': 'programType',
    '상태': 'status',
    'status': 'status',
    'STATUS': 'status',
    '비고': 'note',
    'note': 'note',
    'NOTE': 'note',
  }

  // 헤더 정규화
  const normalizedHeaders = headers.map(h => {
    const lower = h.toLowerCase()
    return headerMap[h] || headerMap[lower] || h
  })

  // 데이터 행 파싱
  const rows: Record<string, string>[] = []
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i])
    const row: Record<string, string> = {}
    
    normalizedHeaders.forEach((header, index) => {
      row[header] = normalizeText(values[index])
    })
    
    rows.push(row)
  }

  return rows
}

/**
 * CSV 라인 파싱 (따옴표 처리)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  result.push(current)
  return result
}

/**
 * 단일 행 검증
 */
export function validateProgramBulkUploadRow(
  row: Record<string, string>,
  rowIndex: number
): { valid: boolean; row?: ProgramBulkUploadRow; errors: ProgramBulkUploadError[] } {
  const errors: ProgramBulkUploadError[] = []
  
  const sessionCodes = getProgramSessionCodes()
  const typeCodes = getProgramTypeCodes()
  
  // 필수 필드 추출
  const sessionText = normalizeText(row.session || row['차시'])
  const programTypeText = normalizeText(row.programType || row['프로그램 유형'] || row['프로그램유형'])
  const statusText = normalizeText(row.status || row['상태'])
  const noteText = normalizeText(row.note || row['비고'])
  
  // 차시 검증
  if (!sessionText) {
    errors.push({ rowIndex, message: '차시가 필요합니다' })
  }
  
  const sessionKey = sessionText 
    ? sessionCodes.find(k => 
        k.value === sessionText || 
        k.label === sessionText || 
        k.label.includes(sessionText) ||
        sessionText.includes(k.label)
      )
    : null
  
  if (!sessionKey && sessionText) {
    errors.push({ rowIndex, message: `차시를 찾을 수 없습니다: ${sessionText}` })
  }
  
  // 프로그램 유형 검증
  if (!programTypeText) {
    errors.push({ rowIndex, message: '프로그램 유형이 필요합니다' })
  }
  
  const typeKey = programTypeText
    ? typeCodes.find(k =>
        k.value === programTypeText ||
        k.label === programTypeText ||
        k.label.includes(programTypeText) ||
        programTypeText.includes(k.label)
      )
    : null
  
  if (!typeKey && programTypeText) {
    errors.push({ rowIndex, message: `프로그램 유형을 찾을 수 없습니다: ${programTypeText}` })
  }
  
  // 상태 검증
  const validStatuses = ['활성', '대기', '비활성']
  if (!statusText) {
    errors.push({ rowIndex, message: '상태가 필요합니다' })
  } else if (!validStatuses.includes(statusText)) {
    errors.push({ rowIndex, message: `유효하지 않은 상태입니다: ${statusText} (활성, 대기, 비활성 중 하나)` })
  }
  
  // 오류가 있으면 조기 반환
  if (errors.length > 0 || !sessionKey || !typeKey) {
    return { valid: false, errors }
  }
  
  // 검증된 행 구성
  const validatedRow: ProgramBulkUploadRow = {
    sessionValue: sessionKey.value,
    sessionLabel: sessionKey.label,
    programTypeValue: typeKey.value,
    programTypeLabel: typeKey.label,
    status: statusText,
    note: noteText || undefined,
  }
  
  return { valid: true, row: validatedRow, errors: [] }
}
```

#### Step 3: 업로드 페이지 생성

`app/admin/program/bulk-upload/page.tsx` 생성:

기존 `app/admin/institutions/bulk-upload/page.tsx`를 참고하여 동일한 구조로 구현합니다.

주요 기능:
- Excel/CSV 파일 업로드
- 파일 파싱 및 검증
- 미리보기 테이블 표시
- 오류 목록 표시
- 템플릿 다운로드 버튼
- 저장 버튼 (API 호출)

#### Step 4: 프로그램 관리 페이지에 일괄 업로드 버튼 추가

`app/admin/program/page.tsx`의 목록 뷰에 "일괄 업로드" 버튼을 추가하고, 클릭 시 `/admin/program/bulk-upload` 페이지로 이동하도록 구현합니다.

---

## 2. 교육기관 관리 일괄 업로드 (기존 구현 확인)

### 2.1 필드 구조

교육기관 일괄 업로드는 이미 구현되어 있습니다 (`app/admin/institutions/bulk-upload/`).

필드 구조:

| Excel 컬럼명 (한글) | Excel 컬럼명 (영문) | 필드명 | 필수 여부 | 설명 |
|-------------------|-------------------|--------|----------|------|
| 권역 | zone | zoneId, zoneName | 필수 | 권역 (Common Code) |
| 지역 | region | regionId, regionName | 필수 | 지역 (Common Code) |
| 기관명 | name | name | 필수 | 교육기관명 |
| 주소 | address | address | 필수 | 주소 |
| 전화번호 | phone | phone | 필수 | 전화번호 |
| 대분류 | mainCategory | mainCategory, mainCategoryName | 필수 | 대분류 (Common Code) |
| 1분류 | subCategory1 | subCategory1, subCategory1Name | 필수 | 1분류 (Common Code) |
| 2분류 | subCategory2 | subCategory2, subCategory2Name | 필수 | 2분류 (Common Code) |
| 학교급 구분 | schoolLevelType | schoolLevelType | 조건부 | 2분류 선택 시 필수 |

### 2.2 Excel 템플릿 예시

```
권역,지역,기관명,주소,전화번호,대분류,1분류,2분류,학교급 구분
1권역,수원시,수원초등학교,경기도 수원시 영통구 월드컵로 206,031-123-4567,일반학교,초등학교,일반초등학교,초등
2권역,성남시,성남중학교,경기도 성남시 분당구 정자일로 95,031-234-5678,일반학교,중학교,일반중학교,중등
```

### 2.3 기존 구현 확인

기존 구현 파일:
- `app/admin/institutions/bulk-upload/page.tsx` - 업로드 페이지
- `app/admin/institutions/bulk-upload/bulkUploadHelpers.ts` - 파싱 및 검증 로직
- `app/admin/institutions/bulk-upload/types.ts` - 타입 정의

**참고:** 교육기관 관리 페이지(`app/admin/reference-info/institution-page.tsx`)에서 일괄 업로드 링크/버튼이 있는지 확인하고, 없다면 추가해야 합니다.

---

## 3. Excel 파일 형식 요구사항

### 3.1 지원 형식

- **.xlsx** (Excel 2007 이상)
- **.xls** (Excel 97-2003)
- **.csv** (쉼표 구분 값)

### 3.2 파일 구조

1. **첫 번째 행은 헤더**여야 합니다.
2. 헤더는 한글 또는 영문 컬럼명을 지원합니다 (별칭 매핑 사용).
3. 데이터는 두 번째 행부터 시작합니다.
4. 빈 행은 무시됩니다.

### 3.3 인코딩

- CSV 파일은 **UTF-8 with BOM** 또는 **UTF-8** 인코딩을 권장합니다.
- Excel 파일은 자동으로 인코딩을 처리합니다.

### 3.4 데이터 검증 규칙

#### 프로그램
- 차시: Common Code에 존재하는 값이어야 합니다.
- 프로그램 유형: Common Code에 존재하는 값이어야 합니다.
- 상태: "활성", "대기", "비활성" 중 하나여야 합니다.

#### 교육기관
- 권역/지역: Common Code에 존재하고, 지역은 권역에 속해야 합니다.
- 대분류/1분류/2분류: Common Code에 존재해야 합니다.
- 2분류 선택 시 학교급 구분이 필수입니다.

---

## 4. 구현 체크리스트

### 프로그램 일괄 업로드

- [ ] `app/admin/program/bulk-upload/types.ts` 생성
- [ ] `app/admin/program/bulk-upload/bulkUploadHelpers.ts` 생성
- [ ] `app/admin/program/bulk-upload/page.tsx` 생성
- [ ] 프로그램 관리 페이지에 "일괄 업로드" 버튼 추가
- [ ] 템플릿 다운로드 기능 구현
- [ ] 파일 업로드 및 파싱 기능 구현
- [ ] 데이터 검증 및 오류 표시 기능 구현
- [ ] 미리보기 테이블 구현
- [ ] 저장 API 연동 (백엔드 구현 필요)

### 교육기관 일괄 업로드 (확인)

- [ ] 교육기관 관리 페이지에 일괄 업로드 링크/버튼 확인
- [ ] 기존 구현이 정상 작동하는지 테스트
- [ ] 필요 시 UI 개선

---

## 5. 백엔드 API 연동

### 5.1 프로그램 일괄 등록 API

**엔드포인트:** `POST /api/v1/programs/bulk`

**요청 본문:**
```json
{
  "programs": [
    {
      "sessionValue": "8",
      "programTypeValue": "BLOCK",
      "status": "활성",
      "note": "초등학교용"
    },
    ...
  ]
}
```

**응답:**
```json
{
  "success": true,
  "data": {
    "created": 10,
    "failed": 2,
    "errors": [
      {
        "rowIndex": 5,
        "message": "차시를 찾을 수 없습니다"
      }
    ]
  }
}
```

### 5.2 교육기관 일괄 등록 API

**엔드포인트:** `POST /api/v1/institutions/bulk`

**요청 본문:**
```json
{
  "institutions": [
    {
      "zoneId": "zone-1",
      "regionId": "region-1",
      "name": "수원초등학교",
      "address": "경기도 수원시 영통구 월드컵로 206",
      "phone": "031-123-4567",
      "mainCategory": "GENERAL",
      "subCategory1": "ELEMENTARY",
      "subCategory2": "GENERAL_ELEMENTARY",
      "schoolLevelType": "ELEMENTARY"
    },
    ...
  ]
}
```

---

## 6. 템플릿 다운로드 기능

각 일괄 업로드 페이지에 "템플릿 다운로드" 버튼을 추가하여, 올바른 형식의 Excel 템플릿을 다운로드할 수 있도록 합니다.

### 6.1 구현 방법

```typescript
const handleDownloadTemplate = () => {
  // CSV 형식으로 템플릿 생성
  const headers = ['차시', '프로그램 유형', '상태', '비고']
  const exampleRow = ['8', '블록코딩', '활성', '초등학교용']
  
  const csvContent = [
    headers.join(','),
    exampleRow.join(',')
  ].join('\n')
  
  // BOM 추가 (한글 깨짐 방지)
  const BOM = '\uFEFF'
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  
  link.setAttribute('href', url)
  link.setAttribute('download', '프로그램_일괄등록_템플릿.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
```

---

## 7. 사용자 가이드

### 7.1 프로그램 일괄 등록 절차

1. 프로그램 관리 페이지(`/admin/program`) 접속
2. "일괄 업로드" 버튼 클릭
3. "템플릿 다운로드" 버튼으로 템플릿 파일 다운로드
4. 템플릿 파일을 Excel로 열어 데이터 입력
5. 저장 후 CSV 형식으로 내보내기 (또는 Excel 파일 그대로 업로드)
6. 업로드 페이지에서 파일 선택
7. 미리보기 확인 및 오류 수정
8. "저장" 버튼 클릭하여 일괄 등록 완료

### 7.2 교육기관 일괄 등록 절차

1. 교육기관 관리 페이지(`/admin/institution`) 접속
2. "일괄 업로드" 버튼 클릭
3. 템플릿 다운로드 및 데이터 입력
4. 파일 업로드 및 검증
5. 저장하여 일괄 등록 완료

---

## 8. 주의사항

1. **Common Code 의존성**: 차시, 프로그램 유형, 권역, 지역, 분류 등은 모두 Common Code에 등록되어 있어야 합니다.
2. **중복 데이터 처리**: 기존 데이터와 중복되는 경우 처리 방식을 결정해야 합니다 (건너뛰기, 업데이트, 오류 표시).
3. **대용량 파일**: 수백 개 이상의 행이 있는 경우 성능 고려가 필요합니다 (청크 단위 처리, 진행률 표시).
4. **오류 처리**: 검증 오류가 있는 행은 저장하지 않고, 오류 목록을 사용자에게 표시합니다.
5. **트랜잭션**: 일부 행만 성공하고 일부는 실패하는 경우를 고려하여 롤백 정책을 결정해야 합니다.

---

## 9. 참고 파일

- 교육기관 일괄 업로드 구현: `app/admin/institutions/bulk-upload/`
- Common Code 조회 함수: `lib/commonCodeStore.ts`
- 프로그램 관리 페이지: `app/admin/program/page.tsx`
- 교육기관 관리 페이지: `app/admin/reference-info/institution-page.tsx`

---

## 10. 다음 단계

1. 프로그램 일괄 업로드 기능 구현
2. 백엔드 API 개발
3. 통합 테스트
4. 사용자 가이드 문서화
5. 오류 처리 및 예외 상황 대응 로직 추가
