export interface BulkUploadRow {
  zoneId: string
  zoneName: string
  regionId: string
  regionName: string
  name: string
  address: string
  phone: string
  mainCategory: string
  mainCategoryName: string
  subCategory1: string
  subCategory1Name: string
  subCategory2: string
  subCategory2Name: string
  educationLevelMix?: '초중' | '중고' | '초중고' | null
}

export interface BulkUploadError {
  rowIndex: number
  message: string
}

export interface BulkUploadPreview {
  rows: BulkUploadRow[]
  errors: BulkUploadError[]
  totalRows: number
  validRows: number
  errorRows: number
}


