'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button, Card, Upload, Table, Checkbox, Space, message, Alert } from 'antd'
import type { UploadProps } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { UploadOutlined } from '@ant-design/icons'
import { PageHeaderSticky, DetailSectionCard } from '@/components/admin/operations'
import { 
  getGroupsByTitleId, 
  getKeysByGroupId, 
  getGroupById,
  getKeyById 
} from '@/lib/commonCodeStore'
import { normalizeText, parseCSV, validateBulkUploadRow } from './bulkUploadHelpers'
import type { BulkUploadRow, BulkUploadPreview } from './types'

const { Dragger } = Upload

export default function BulkUploadPage() {
  const router = useRouter()
  const [fileList, setFileList] = useState<any[]>([])
  const [previewData, setPreviewData] = useState<BulkUploadPreview | null>(null)
  const [allowAutoCreate, setAllowAutoCreate] = useState(false)
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [loading, setLoading] = useState(false)

  // Get common code data for validation
  const regionGroups = getGroupsByTitleId('title-region')
  const mainCategoryGroups = getGroupsByTitleId('title-institution-main')
  const subCategory1Groups = getGroupsByTitleId('title-institution-sub1')
  const subCategory2Groups = getGroupsByTitleId('title-institution-sub2')

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options
    setLoading(true)

    try {
      const text = await (file as File).text()
      const parsed = parseCSV(text)
      
      // Validate and process rows
      const rows: BulkUploadRow[] = []
      const errors: string[] = []

      for (let i = 0; i < parsed.length; i++) {
        const row = parsed[i]
        const validation = validateBulkUploadRow(
          row,
          i + 2, // Row number (1-indexed, +1 for header)
          regionGroups,
          mainCategoryGroups,
          subCategory1Groups,
          subCategory2Groups,
          allowAutoCreate
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
      
      // Get existing institutions from localStorage
      const existing = localStorage.getItem('institutions')
      const institutions: any[] = existing ? JSON.parse(existing) : []

      // Process rows
      const newInstitutions = previewData.rows.map((row) => {
        // Check for duplicates if skipDuplicates is enabled
        if (skipDuplicates) {
          const duplicate = institutions.find(
            (inst) => inst.name === row.name && inst.address === row.address
          )
          if (duplicate) {
            return null // Skip duplicate
          }
        }

        return {
          id: `inst-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          zoneId: row.zoneId,
          regionId: row.regionId,
          mainCategory: row.mainCategory,
          subCategory1: row.subCategory1,
          subCategory2: row.subCategory2,
          educationLevelMix: row.educationLevelMix || null,
          name: row.name,
          address: row.address,
          phone: row.phone,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      }).filter(Boolean)

      // Save to localStorage
      const updated = [...institutions, ...newInstitutions]
      localStorage.setItem('institutions', JSON.stringify(updated))
      
      // Clear preview
      setPreviewData(null)
      setFileList([])

      message.success(`${newInstitutions.length}개의 기관이 등록되었습니다.`)
      router.push('/admin/institution')
    } catch (error: any) {
      message.error(`저장 중 오류가 발생했습니다: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    router.back()
  }

  const previewColumns: ColumnsType<BulkUploadRow> = [
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
      title: '권역',
      dataIndex: 'zoneName',
      key: 'zoneName',
      width: 100,
    },
    {
      title: '지역',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 100,
    },
    {
      title: '기관명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      width: 250,
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
    },
    {
      title: '대분류',
      dataIndex: 'mainCategoryName',
      key: 'mainCategoryName',
      width: 120,
    },
    {
      title: '1분류',
      dataIndex: 'subCategory1Name',
      key: 'subCategory1Name',
      width: 100,
    },
    {
      title: '2분류',
      dataIndex: 'subCategory2Name',
      key: 'subCategory2Name',
      width: 150,
    },
    {
      title: '학교급 혼합',
      dataIndex: 'educationLevelMix',
      key: 'educationLevelMix',
      width: 120,
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
                    <div>• 권역 | 권역명 | zone</div>
                    <div>• 지역 | 지역명 | region</div>
                    <div>• 기관명</div>
                    <div>• 주소</div>
                    <div>• 전화번호</div>
                    <div>• 대분류</div>
                    <div>• 1분류</div>
                    <div>• 2분류</div>
                    <div>• 학교급혼합 (선택사항)</div>
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
                    checked={allowAutoCreate}
                    onChange={(e) => setAllowAutoCreate(e.target.checked)}
                  >
                    2분류 자동 추가 허용 (도서벽지 제외)
                  </Checkbox>
                  <Checkbox
                    checked={skipDuplicates}
                    onChange={(e) => setSkipDuplicates(e.target.checked)}
                  >
                    중복 기관 건너뛰기 (기관명 + 주소 동일 시)
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

