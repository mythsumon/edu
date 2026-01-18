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
