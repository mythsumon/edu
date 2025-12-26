'use client'

import { useState, useRef } from 'react'
import { Button, Radio, Space } from 'antd'
import { Download, Upload, X, FileSpreadsheet } from 'lucide-react'
import { ExcelPreviewTable, ExcelRowData, ValidationError } from './ExcelPreviewTable'

interface ClassInfoExcelImportProps {
  onApply: (lessons: ExcelRowData[], mode: 'replace' | 'append') => void
}

// Mock parser - in production, this would use a library like xlsx or exceljs
const parseExcelFile = async (file: File): Promise<ExcelRowData[]> => {
  // Mock implementation - returns sample data
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockData: ExcelRowData[] = [
        {
          회차: 1,
          일자: '2025-01-15',
          시작시간: '10:00',
          종료시간: '12:00',
          주강사수: 1,
          보조강사수: 1,
          _rowIndex: 0,
        },
        {
          회차: 2,
          일자: '2025-01-22',
          시작시간: '10:00',
          종료시간: '12:00',
          주강사수: 1,
          보조강사수: 1,
          _rowIndex: 1,
        },
      ]
      resolve(mockData)
    }, 500)
  })
}

// Validation function
const validateExcelData = (data: ExcelRowData[]): ValidationError[] => {
  const errors: ValidationError[] = []

  data.forEach((row, index) => {
    const rowIndex = row._rowIndex ?? index

    // Validate date
    if (!row.일자) {
      errors.push({ rowIndex, field: '일자', message: '일자가 필요합니다' })
    } else if (!dayjs(row.일자).isValid()) {
      errors.push({ rowIndex, field: '일자', message: '유효하지 않은 날짜 형식입니다' })
    }

    // Validate start time
    if (!row.시작시간) {
      errors.push({ rowIndex, field: '시작시간', message: '시작시간이 필요합니다' })
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(row.시작시간)) {
      errors.push({ rowIndex, field: '시작시간', message: '유효하지 않은 시간 형식입니다 (HH:mm)' })
    }

    // Validate end time
    if (!row.종료시간) {
      errors.push({ rowIndex, field: '종료시간', message: '종료시간이 필요합니다' })
    } else if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(row.종료시간)) {
      errors.push({ rowIndex, field: '종료시간', message: '유효하지 않은 시간 형식입니다 (HH:mm)' })
    } else if (row.시작시간 && row.종료시간) {
      const start = dayjs(row.일자 + ' ' + row.시작시간)
      const end = dayjs(row.일자 + ' ' + row.종료시간)
      if (end.isBefore(start) || end.isSame(start)) {
        errors.push({ rowIndex, field: '종료시간', message: '종료시간은 시작시간보다 늦어야 합니다' })
      }
    }

    // Validate main instructor count
    if (row.주강사수 === undefined || row.주강사수 === null) {
      errors.push({ rowIndex, field: '주강사수', message: '주강사수가 필요합니다' })
    } else if (typeof row.주강사수 !== 'number' || row.주강사수 < 1) {
      errors.push({ rowIndex, field: '주강사수', message: '주강사수는 1 이상의 숫자여야 합니다' })
    }

    // Validate assistant instructor count
    if (row.보조강사수 === undefined || row.보조강사수 === null) {
      errors.push({ rowIndex, field: '보조강사수', message: '보조강사수가 필요합니다' })
    } else if (typeof row.보조강사수 !== 'number' || row.보조강사수 < 0) {
      errors.push({ rowIndex, field: '보조강사수', message: '보조강사수는 0 이상의 숫자여야 합니다' })
    }
  })

  return errors
}

// Import dayjs for validation
import dayjs from 'dayjs'

export function ClassInfoExcelImport({ onApply }: ClassInfoExcelImportProps) {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [previewData, setPreviewData] = useState<ExcelRowData[]>([])
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDownloadTemplate = () => {
    // Create a simple CSV template
    const template = `회차,일자,시작시간,종료시간,주강사수,보조강사수
1,2025-01-15,10:00,12:00,1,1
2,2025-01-22,10:00,12:00,1,1`

    const blob = new Blob(['\uFEFF' + template], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = '수업정보_템플릿.csv'
    link.click()
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv', // .csv
    ]
    const validExtensions = ['.xlsx', '.xls', '.csv']

    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase()
    if (!validExtensions.includes(fileExtension) && !validTypes.includes(file.type)) {
      alert('엑셀 파일(.xlsx, .xls) 또는 CSV 파일만 업로드 가능합니다.')
      return
    }

    setUploadedFile(file)
    setIsLoading(true)

    try {
      // Parse file (mock implementation)
      const parsedData = await parseExcelFile(file)
      setPreviewData(parsedData)
      
      // Validate data
      const errors = validateExcelData(parsedData)
      setValidationErrors(errors)
    } catch (error) {
      console.error('File parsing error:', error)
      alert('파일을 읽는 중 오류가 발생했습니다.')
      setUploadedFile(null)
      setPreviewData([])
      setValidationErrors([])
    } finally {
      setIsLoading(false)
    }

    e.target.value = ''
  }

  const handleRemoveFile = () => {
    setUploadedFile(null)
    setPreviewData([])
    setValidationErrors([])
  }

  const handleApply = () => {
    if (validationErrors.length === 0 && previewData.length > 0) {
      onApply(previewData, importMode)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-6">
      {/* Template Download */}
      <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-1">엑셀 템플릿 다운로드</h4>
            <p className="text-xs text-gray-600">템플릿 형식을 유지해주세요. 열 이름 변경 금지</p>
          </div>
          <Button
            icon={<Download className="w-4 h-4" />}
            onClick={handleDownloadTemplate}
            className="h-9 px-4 rounded-lg border border-gray-300 hover:bg-white font-medium transition-all"
          >
            템플릿 다운로드
          </Button>
        </div>
      </div>

      {/* Upload Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          파일 업로드
        </label>
        {!uploadedFile ? (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-gray-300 rounded-xl hover:border-gray-400 transition-colors cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <Upload className="w-10 h-10 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 mb-1">
                <span className="font-semibold text-blue-600">클릭하여 파일 선택</span> 또는 드래그 앤 드롭
              </p>
              <p className="text-xs text-gray-500">.xlsx, .xls, .csv 파일만 가능</p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileSpreadsheet className="w-5 h-5 text-blue-600" />
                <div>
                  <div className="text-sm font-medium text-gray-900">{uploadedFile.name}</div>
                  <div className="text-xs text-gray-500">{formatFileSize(uploadedFile.size)}</div>
                </div>
              </div>
              <Space>
                <Button
                  size="small"
                  onClick={() => fileInputRef.current?.click()}
                  className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
                >
                  교체
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<X className="w-3 h-3" />}
                  onClick={handleRemoveFile}
                  className="h-8 px-3 rounded-lg border border-red-300 hover:bg-red-50"
                >
                  삭제
                </Button>
              </Space>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        )}
      </div>

      {/* Preview Table */}
      {previewData.length > 0 && (
        <div>
          <ExcelPreviewTable
            data={previewData}
            errors={validationErrors}
          />
        </div>
      )}

      {/* Import Mode & Apply */}
      {previewData.length > 0 && (
        <div className="space-y-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              가져오기 방식
            </label>
            <Radio.Group
              value={importMode}
              onChange={(e) => setImportMode(e.target.value)}
            >
              <Radio value="replace">덮어쓰기</Radio>
              <Radio value="append">추가</Radio>
            </Radio.Group>
          </div>

          <Button
            type="primary"
            onClick={handleApply}
            disabled={validationErrors.length > 0 || isLoading}
            className="w-full h-11 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
            style={{
              backgroundColor: validationErrors.length === 0 ? '#1a202c' : '#9ca3af',
              borderColor: validationErrors.length === 0 ? '#1a202c' : '#9ca3af',
            }}
          >
            {isLoading ? '처리 중...' : '업로드 내용 적용'}
          </Button>

          {validationErrors.length > 0 && (
            <p className="text-sm text-red-600 text-center">
              오류를 수정한 후 적용할 수 있습니다 ({validationErrors.length}건)
            </p>
          )}
        </div>
      )}
    </div>
  )
}

