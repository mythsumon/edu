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
  
  // BOM 제거
  let normalized = value.replace(/^\uFEFF/, '')
  
  // Trim
  normalized = normalized.trim()
  
  // 공백 정리
  normalized = normalized.replace(/\s+/g, ' ')
  
  // 유니코드 정규화 (NFC)
  normalized = normalized.normalize('NFC')
  
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
    '프로그램타입': 'programType',
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
        // 이스케이프된 따옴표
        current += '"'
        i++
      } else {
        // 따옴표 상태 토글
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // 필드 끝
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // 마지막 필드 추가
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
    ? sessionCodes.find(k => {
        const normalizedValue = normalizeText(k.value).toLowerCase()
        const normalizedLabel = normalizeText(k.label).toLowerCase()
        const normalizedInput = sessionText.toLowerCase()
        
        return normalizedValue === normalizedInput || 
               normalizedLabel === normalizedInput ||
               normalizedLabel.includes(normalizedInput) ||
               normalizedInput.includes(normalizedLabel) ||
               normalizedLabel.replace(/\s+/g, '') === normalizedInput.replace(/\s+/g, '')
      })
    : null
  
  if (!sessionKey && sessionText) {
    errors.push({ rowIndex, message: `차시를 찾을 수 없습니다: ${sessionText}` })
  }
  
  // 프로그램 유형 검증
  if (!programTypeText) {
    errors.push({ rowIndex, message: '프로그램 유형이 필요합니다' })
  }
  
  const typeKey = programTypeText
    ? typeCodes.find(k => {
        const normalizedValue = normalizeText(k.value).toLowerCase()
        const normalizedLabel = normalizeText(k.label).toLowerCase()
        const normalizedInput = programTypeText.toLowerCase()
        
        return normalizedValue === normalizedInput || 
               normalizedLabel === normalizedInput ||
               normalizedLabel.includes(normalizedInput) ||
               normalizedInput.includes(normalizedLabel) ||
               normalizedLabel.replace(/\s+/g, '') === normalizedInput.replace(/\s+/g, '')
      })
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
