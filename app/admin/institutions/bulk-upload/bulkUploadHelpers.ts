import type { Group, GroupKey } from '@/components/admin/common-code/types'
import { getKeysByGroupId, getSchoolLevelTypeCodes } from '@/lib/commonCodeStore'
import type { BulkUploadRow, BulkUploadError } from './types'

/**
 * Normalize text: remove BOM, trim, collapse spaces, unicode normalize
 */
export function normalizeText(value: string | undefined | null): string {
  if (!value) return ''
  
  // Remove BOM
  let normalized = value.replace(/^\uFEFF/, '')
  
  // Trim
  normalized = normalized.trim()
  
  // Collapse multiple spaces
  normalized = normalized.replace(/\s+/g, ' ')
  
  // Unicode normalize (NFC)
  normalized = normalized.normalize('NFC')
  
  return normalized
}

/**
 * Parse CSV text into array of objects
 */
export function parseCSV(text: string): Record<string, string>[] {
  const lines = text.split(/\r?\n/).filter(line => line.trim())
  if (lines.length < 2) return []

  // Parse header
  const headerLine = lines[0]
  const headers = parseCSVLine(headerLine).map(h => normalizeText(h))
  
  // Header alias mapping
  const headerMap: Record<string, string> = {
    '권역': 'zone',
    '권역명': 'zone',
    'zone': 'zone',
    'ZONE': 'zone',
    '지역': 'region',
    '지역명': 'region',
    'region': 'region',
    'REGION': 'region',
    '기관명': 'name',
    '주소': 'address',
    '전화번호': 'phone',
    '대분류': 'mainCategory',
    '1분류': 'subCategory1',
    '2분류': 'subCategory2',
    '학교급혼합': 'schoolLevelType',
    '학교급 구분': 'schoolLevelType',
    '학교급_구분': 'schoolLevelType',
  }

  // Normalize headers
  const normalizedHeaders = headers.map(h => {
    const lower = h.toLowerCase()
    return headerMap[h] || headerMap[lower] || h
  })

  // Parse data rows
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
 * Parse a single CSV line (handles quoted values)
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // End of field
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  
  // Add last field
  result.push(current)
  
  return result
}

/**
 * Find zone (권역) by label or value
 */
function findZone(
  zoneText: string,
  regionGroups: Group[]
): { group: Group; key?: GroupKey } | null {
  const normalized = normalizeText(zoneText).toLowerCase()
  
  // Try to match by group name or code
  for (const group of regionGroups) {
    if (
      group.name.toLowerCase().includes(normalized) ||
      group.code.toLowerCase() === normalized ||
      normalized.includes(group.code)
    ) {
      return { group }
    }
  }
  
  return null
}

/**
 * Find region (지역) by label or value within a zone
 */
function findRegion(
  regionText: string,
  zoneGroup: Group
): GroupKey | null {
  const normalized = normalizeText(regionText).toLowerCase()
  const regionKeys = getKeysByGroupId(zoneGroup.id)
  
  for (const key of regionKeys) {
    if (
      key.label.toLowerCase().includes(normalized) ||
      key.value.toLowerCase() === normalized ||
      normalized.includes(key.label.toLowerCase())
    ) {
      return key
    }
  }
  
  return null
}

/**
 * Find classification category by label
 */
function findCategory(
  categoryText: string,
  groups: Group[],
  titleId: string
): { group: Group; key: GroupKey } | null {
  if (groups.length === 0) return null
  
  const group = groups[0] // Single group per title
  const keys = getKeysByGroupId(group.id)
  const normalized = normalizeText(categoryText).toLowerCase()
  
  for (const key of keys) {
    if (
      key.label.toLowerCase().includes(normalized) ||
      key.value.toLowerCase() === normalized ||
      normalized.includes(key.label.toLowerCase())
    ) {
      return { group, key }
    }
  }
  
  return null
}

/**
 * Validate a single row
 */
export function validateBulkUploadRow(
  row: Record<string, string>,
  rowIndex: number,
  regionGroups: Group[],
  mainCategoryGroups: Group[],
  subCategory1Groups: Group[],
  subCategory2Groups: Group[],
  allowAutoCreate: boolean
): { valid: boolean; row?: BulkUploadRow; errors: BulkUploadError[] } {
  const errors: BulkUploadError[] = []

  // Required fields
  const zoneText = row.zone || row['권역'] || row['권역명']
  const regionText = row.region || row['지역'] || row['지역명']
  const name = normalizeText(row.name || row['기관명'])
  const address = normalizeText(row.address || row['주소'])
  const phone = normalizeText(row.phone || row['전화번호'])
  const mainCategoryText = normalizeText(row.mainCategory || row['대분류'])
  const subCategory1Text = normalizeText(row.subCategory1 || row['1분류'])
  const subCategory2Text = normalizeText(row.subCategory2 || row['2분류'])
  const schoolLevelTypeText = normalizeText(
    row.schoolLevelType || 
    row['학교급 구분'] || 
    row['학교급_구분'] || 
    row['학교급혼합']
  )

  // Validate zone
  if (!zoneText) {
    errors.push({ rowIndex, message: '권역이 필요합니다' })
  }

  const zoneMatch = zoneText ? findZone(zoneText, regionGroups) : null
  if (!zoneMatch && zoneText) {
    errors.push({ rowIndex, message: '권역을 찾을 수 없습니다' })
  }

  // Validate region
  if (!regionText) {
    errors.push({ rowIndex, message: '지역이 필요합니다' })
  }

  const regionMatch = zoneMatch && regionText ? findRegion(regionText, zoneMatch.group) : null
  if (!regionMatch && regionText && zoneMatch) {
    errors.push({ rowIndex, message: '해당 권역에 속한 지역이 아닙니다' })
  }

  // Validate required fields
  if (!name) {
    errors.push({ rowIndex, message: '기관명이 필요합니다' })
  }
  if (!address) {
    errors.push({ rowIndex, message: '주소가 필요합니다' })
  }
  if (!phone) {
    errors.push({ rowIndex, message: '전화번호가 필요합니다' })
  }

  // Validate main category
  if (!mainCategoryText) {
    errors.push({ rowIndex, message: '대분류가 필요합니다' })
  }
  const mainCategoryMatch = mainCategoryText
    ? findCategory(mainCategoryText, mainCategoryGroups, 'title-institution-main')
    : null
  if (!mainCategoryMatch) {
    errors.push({ rowIndex, message: '대분류를 찾을 수 없습니다' })
  }

  // Validate sub category 1
  if (!subCategory1Text) {
    errors.push({ rowIndex, message: '1분류가 필요합니다' })
  }
  const subCategory1Match = subCategory1Text
    ? findCategory(subCategory1Text, subCategory1Groups, 'title-institution-sub1')
    : null
  if (!subCategory1Match) {
    errors.push({ rowIndex, message: '1분류를 찾을 수 없습니다' })
  }

  // Validate sub category 2
  if (!subCategory2Text) {
    errors.push({ rowIndex, message: '2분류가 필요합니다' })
  }
  const subCategory2Match = subCategory2Text
    ? findCategory(subCategory2Text, subCategory2Groups, 'title-institution-sub2')
    : null
  
  // Check if it's 도서벽지 (fixed list, no auto-create)
  const isRemoteArea = subCategory2Text && 
    (subCategory2Text.toLowerCase().includes('도서벽지') || 
     subCategory2Text.toLowerCase().includes('remote'))
  
  if (!subCategory2Match) {
    if (allowAutoCreate && !isRemoteArea) {
      // Auto-create allowed (except for 도서벽지)
      // This would require adding to common code store
      errors.push({ 
        rowIndex, 
        message: '2분류를 찾을 수 없습니다 (자동 추가 필요)' 
      })
    } else {
      errors.push({ rowIndex, message: '2분류를 찾을 수 없습니다' })
    }
  }

  // Validate school level type (required when subCategory2 is selected)
  let schoolLevelTypeMatch: GroupKey | null = null
  if (subCategory2Match) {
    if (!schoolLevelTypeText) {
      errors.push({ rowIndex, message: '2분류 선택 시 학교급 구분이 필요합니다' })
    } else {
      const schoolLevelTypeCodes = getSchoolLevelTypeCodes()
      schoolLevelTypeMatch = schoolLevelTypeCodes.find(
        (key: GroupKey) => 
          key.label.toLowerCase() === schoolLevelTypeText.toLowerCase() ||
          key.value.toLowerCase() === schoolLevelTypeText.toLowerCase() ||
          schoolLevelTypeText.toLowerCase().includes(key.label.toLowerCase())
      ) || null
      
      if (!schoolLevelTypeMatch) {
        errors.push({ rowIndex, message: '학교급 구분을 찾을 수 없습니다' })
      }
    }
  }

  // If there are errors, return early
  if (errors.length > 0 || !zoneMatch || !regionMatch || !mainCategoryMatch || !subCategory1Match || !subCategory2Match) {
    return { valid: false, errors }
  }

  // Build validated row
  const validatedRow: BulkUploadRow = {
    zoneId: zoneMatch.group.id,
    zoneName: zoneMatch.group.name,
    regionId: regionMatch.id,
    regionName: regionMatch.label,
    name,
    address,
    phone,
    mainCategory: mainCategoryMatch.key.value,
    mainCategoryName: mainCategoryMatch.key.label,
    subCategory1: subCategory1Match.key.value,
    subCategory1Name: subCategory1Match.key.label,
    subCategory2: subCategory2Match.key.value,
    subCategory2Name: subCategory2Match.key.label,
    schoolLevelType: schoolLevelTypeMatch ? schoolLevelTypeMatch.value : null,
  }

  return { valid: true, row: validatedRow, errors: [] }
}

