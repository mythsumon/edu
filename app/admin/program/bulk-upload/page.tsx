'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, Upload, Table, Checkbox, Space, message, Alert } from 'antd'
import type { UploadProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UploadOutlined, DownloadOutlined } from '@ant-design/icons'
import { PageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { normalizeText, parseCSV, validateProgramBulkUploadRow } from './bulkUploadHelpers'
import type { ProgramBulkUploadRow, ProgramBulkUploadPreview, ProgramBulkUploadError } from './types'

const { Dragger } = Upload

export default function ProgramBulkUploadPage() {
  const router = useRouter()
  const [fileList, setFileList] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<ProgramBulkUploadPreview | null>(null)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [loading, setLoading] = useState(false)

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    setLoading(true)

    try {
      const text = await (file as File).text()
      const parsed = parseCSV(text)
      
      // Validate and process rows
      const rows: ProgramBulkUploadRow[] = []
      const errors: ProgramBulkUploadError[] = []

      for (let i = 0; i < parsed.length; i++) {
        const row = parsed[i]
        const validation = validateProgramBulkUploadRow(
          row,
          i + 2 // Row number (1-indexed, +1 for header)
        )

        if (validation.valid) {
          rows.push(validation.row!)
        } else {
          errors.push(...validation.errors)
        }
      }

      setPreviewData({
        rows,
        errors,
        totalRows: parsed.length,
        validRows: rows.length,
        errorRows: errors.length,
      })

      if (errors.length > 0) {
        message.warning(`${errors.length}개의 오류가 발견되었습니다.`)
      } else {
        message.success('파일이 성공적으로 파싱되었습니다.')
      }

      onSuccess?.(true)
    } catch (error: any) {
      message.error(`파일 처리 중 오류가 발생했습니다: ${error.message}`)
      onError?.(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!previewData || previewData.errorRows > 0) {
      message.error('모든 오류를 수정한 후 저장할 수 있습니다.')
      return
    }

    try {
      setLoading(true)
      
      // Get existing programs from localStorage
      const existing = localStorage.getItem('programs')
      const programs: any[] = existing ? JSON.parse(existing) : []

      // Process rows
      const newPrograms = previewData.rows.map((row) => {
        // Generate program display name
        const programDisplayName = `${row.sessionLabel} ${row.programTypeLabel}`
        
        // Check for duplicates if skipDuplicates is enabled
        if (skipDuplicates) {
          const duplicate = programs.find(
            (prog) => 
              prog.sessionValue === row.sessionValue && 
              prog.programTypeValue === row.programTypeValue
          )
          if (duplicate) {
            return null // Skip duplicate
          }
        }

        // Generate program ID
        const programId = `PROG-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

        return {
          key: programId,
          programId,
          status: row.status,
          name: programDisplayName,
          programDisplayName,
          sessionValue: row.sessionValue,
          programTypeValue: row.programTypeValue,
          note: row.note || '',
          registeredAt: new Date().toLocaleString('ko-KR', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }),
        }
      }).filter(Boolean)

      // Save to localStorage
      const updated = [...programs, ...newPrograms]
      localStorage.setItem('programs', JSON.stringify(updated))
      
      // Clear preview
      setPreviewData(null)
      setFileList([])

      message.success(`${newPrograms.length}개의 프로그램이 등록되었습니다.`)
      router.push('/admin/program')
    } catch (error: any) {
      message.error(`저장 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const handleDownloadTemplate = () => {
    // Create CSV template with headers and example data
    const headers = [
      '차시',
      '프로그램 유형',
      '상태',
      '비고'
    ]

    // Example data rows
    const exampleRows = [
      [
        '8',
        '블록코딩',
        '활성',
        '초등학교용'
      ],
      [
        '16',
        '텍스트코딩',
        '대기',
        '중학교용'
      ],
      [
        '50',
        '앱인벤터',
        '활성',
        '고등학교용'
      ],
      [
        '4',
        '블록코딩',
        '활성',
        '온라인 교육용'
      ]
    ]

    // Create CSV content
    const csvContent = [
      headers.join(','),
      ...exampleRows.map(row => row.map(cell => {
        // Escape commas and quotes in cell values
        if (cell.includes(',') || cell.includes('"') || cell.includes('\n')) {
          return `"${cell.replace(/"/g, '""')}"`
        }
        return cell
      }).join(','))
    ].join('\n')

    // Add BOM for Excel compatibility
    const BOM = '\uFEFF'
    const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' })
    
    // Create download link
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', '프로그램_일괄등록_템플릿.csv')
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)

    message.success('템플릿 파일이 다운로드되었습니다.')
  }

  const previewColumns: ColumnsType<ProgramBulkUploadRow> = [
    {
      title: '상태',
      key: 'status',
      width: 80,
      render: (_, record, index) => {
        const hasError = previewData?.errors.some(
          (err) => err.rowIndex === index + 2
        )
        return hasError ? (
          <span className="text-red-600 font-medium">오류</span>
        ) : (
          <span className="text-green-600 font-medium">정상</span>
        )
      },
    },
    {
      title: '차시',
      dataIndex: 'sessionLabel',
      key: 'sessionLabel',
      width: 100,
    },
    {
      title: '프로그램 유형',
      dataIndex: 'programTypeLabel',
      key: 'programTypeLabel',
      width: 150,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const statusConfig: Record<string, { bg: string; text: string }> = {
          '활성': { bg: 'bg-blue-100', text: 'text-blue-700' },
          '대기': { bg: 'bg-amber-100', text: 'text-amber-700' },
          '비활성': { bg: 'bg-slate-100', text: 'text-slate-600' },
        }
        const config = statusConfig[status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {status}
          </span>
        )
      },
    },
    {
      title: '비고',
      dataIndex: 'note',
      key: 'note',
      width: 200,
      render: (text: string) => text || '-',
    },
    {
      title: '오류 메시지',
      key: 'errors',
      width: 300,
      render: (_, record, index) => {
        const rowErrors = previewData?.errors.filter(
          (err) => err.rowIndex === index + 2
        ) || []
        return (
          <div className="space-y-1">
            {rowErrors.map((err, i) => (
              <div key={i} className="text-xs text-red-600">
                {err.message}
              </div>
            ))}
          </div>
        )
      },
    },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="bg-slate-50 min-h-screen px-6 pt-0">
        <PageHeaderSticky
          mode="create"
          onCancel={handleBack}
          onSave={handleSave}
          saveDisabled={!previewData || previewData.errorRows > 0 || loading}
        />

        <div className="max-w-7xl mx-auto pt-6 pb-12 space-y-6">
          <DetailSectionCard title="파일 업로드">
            <div className="mb-4 flex items-center justify-end">
              <Button
                icon={<DownloadOutlined />}
                onClick={handleDownloadTemplate}
                className="h-10 px-6 rounded-xl border border-gray-300 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-medium transition-all text-slate-700"
              >
                예시 템플릿 다운로드
              </Button>
            </div>
            <Dragger
              customRequest={handleUpload}
              accept=".csv,.xlsx,.xls"
              fileList={fileList}
              onChange={(info) => {
                setFileList(info.fileList)
                if (info.file.status === 'removed') {
                  setPreviewData(null)
                }
              }}
              beforeUpload={() => false}
              className="rounded-xl"
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined className="text-4xl text-blue-500" />
              </p>
              <p className="ant-upload-text text-lg font-medium">
                CSV 또는 Excel 파일을 업로드하세요
              </p>
              <p className="ant-upload-hint text-sm text-gray-500">
                지원 형식: CSV, Excel (.xlsx, .xls)
              </p>
            </Dragger>

            <div className="mt-6 space-y-4">
              <Alert
                message="필수 컬럼"
                description={
                  <div className="mt-2 space-y-1 text-sm">
                    <div>• 차시 | session</div>
                    <div>• 프로그램 유형 | programType</div>
                    <div>• 상태 | status (활성, 대기, 비활성)</div>
                    <div>• 비고 | note (선택사항)</div>
                  </div>
                }
                type="info"
                showIcon
                className="rounded-xl"
              />
            </div>
          </DetailSectionCard>

          {previewData && (
            <>
              <DetailSectionCard title="옵션">
                <div className="space-y-4">
                  <Checkbox
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                  >
                    중복 프로그램 건너뛰기 (차시 + 프로그램 유형 동일 시)
                  </Checkbox>
                </div>
              </DetailSectionCard>

              <DetailSectionCard title="미리보기">
                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-4 text-sm">
                    <span className="font-medium">
                      총 행: {previewData.totalRows}
                    </span>
                    <span className="text-green-600 font-medium">
                      정상: {previewData.validRows}
                    </span>
                    <span className="text-red-600 font-medium">
                      오류: {previewData.errorRows}
                    </span>
                  </div>
                </div>

                <Table
                  columns={previewColumns}
                  dataSource={previewData.rows}
                  rowKey={(record, index) => `row-${index}`}
                  pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `총 ${total}건`,
                  }}
                  scroll={{ x: 'max-content' }}
                  size="small"
                />
              </DetailSectionCard>
            </>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
