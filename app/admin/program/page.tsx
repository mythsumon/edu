'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useRef, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, Form, Descriptions, Tag, Checkbox, Input } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { 
  ChevronRight, 
  RotateCcw, 
  Plus, 
  Search, 
  Eye, 
  ArrowLeft,
  Trash2,
  Save,
  Filter
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { 
  DetailPageHeaderSticky,
  PageHeaderSticky,
  ProgramSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  SectionAccordion
} from '@/components/admin/operations'
import {
  getProgramSessionCodes,
  getProgramTypeCodes,
  getProgramSessionByValue,
  getProgramTypeByValue,
} from '@/lib/commonCodeStore'
import { Alert } from 'antd'

const { TextArea } = Input

/**
 * TODO: After feature stabilization, UI must be redesigned to avoid dependency 
 * on legacy system look & feel.
 */

interface ProgramItem {
  key: string
  status: string
  programId: string
  name: string // Legacy: plain string, New: computed from sessionValue + programTypeValue
  note: string
  registeredAt: string
  // New structured fields (optional for backward compatibility)
  sessionValue?: string // Common Code value (e.g., "8", "16", "50")
  programTypeValue?: string // Common Code value (e.g., "BLOCK", "TEXT", "AGREE")
  programDisplayName?: string
}

const dummyData: ProgramItem[] = [
  {
    key: '1',
    status: '활성',
    programId: 'PROG-2025-001',
    name: '도서벽지 프로그램',
    note: '도서벽지 지역 특별 교육 프로그램',
    registeredAt: '2025.01.15 10:30',
  },
  {
    key: '2',
    status: '활성',
    programId: 'PROG-2025-002',
    name: '50차시 프로그램',
    note: '50차시 교육 프로그램',
    registeredAt: '2025.01.10 14:20',
  },
  {
    key: '3',
    status: '대기',
    programId: 'PROG-2025-003',
    name: '특수학급 프로그램',
    note: '특수학급 교사 역량 강화 프로그램',
    registeredAt: '2025.01.05 09:15',
  },
  {
    key: '4',
    status: '비활성',
    programId: 'PROG-2024-001',
    name: '신규 강사 교육 프로그램',
    note: '2024년 신규 강사 교육',
    registeredAt: '2024.12.20 16:45',
  },
  {
    key: '5',
    status: '활성',
    programId: 'PROG-2025-004',
    name: '온라인 교육 프로그램',
    note: '온라인 기반 교육 프로그램',
    registeredAt: '2025.01.20 11:00',
  },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '활성', label: '활성' },
  { value: '대기', label: '대기' },
  { value: '비활성', label: '비활성' },
]

const programStatusOptions = [
  { value: '대기', label: '대기' },
  { value: '활성', label: '활성' },
  { value: '비활성', label: '비활성' },
]

export default function ProgramManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [nameSearch, setNameSearch] = useState<string>('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [activeSection, setActiveSection] = useState<string>('program')
  const [selectedProgram, setSelectedProgram] = useState<ProgramItem | null>(null)
  const sectionRefs = useState<{ [key: string]: HTMLDivElement | null }>({})[0]
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

  // Program codes from Common Code
  const sessionCodes = useMemo(() => getProgramSessionCodes(), [])
  const typeCodes = useMemo(() => getProgramTypeCodes(), [])

  // Check if Common Codes are available
  const hasCommonCodes = sessionCodes.length > 0 && typeCodes.length > 0

  // Computed program display name from form values
  const [computedProgramName, setComputedProgramName] = useState<string>('')

  // Close filter dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterDropdownRef.current && !filterDropdownRef.current.contains(event.target as Node)) {
        setFilterDropdownOpen(false)
      }
    }

    if (filterDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [filterDropdownOpen])

  const router = useRouter()

  const handleRegisterClick = () => {
    setViewMode('register')
    form.resetFields()
    setComputedProgramName('')
    // Set default status to "대기"
    form.setFieldsValue({ status: '대기' })
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setSelectedProgram(null)
  }

  const handleFormSubmit = (values: any) => {
    // Store structured data
    const programData = {
      ...values,
      // For backward compatibility: also store as 'name' field
      name: computedProgramName || values.programDisplayName,
      programDisplayName: computedProgramName,
      // Store structured fields (values are Common Code values)
      sessionValue: values.sessionValue,
      programTypeValue: values.programTypeValue,
    }
    console.log('Form values:', programData)
    handleBackToList()
  }

  // Handle program selection changes to compute display name
  const handleProgramSelectionChange = () => {
    const sessionValue = form.getFieldValue('sessionValue')
    const programTypeValue = form.getFieldValue('programTypeValue')
    
    if (sessionValue && programTypeValue) {
      const sessionKey = getProgramSessionByValue(sessionValue)
      const typeKey = getProgramTypeByValue(programTypeValue)
      
      if (sessionKey && typeKey) {
        // 괄호 제거: "8차시 블록코딩" 형식으로 표시
        const displayName = `${sessionKey.label} ${typeKey.label}`
        setComputedProgramName(displayName)
        form.setFieldsValue({ programDisplayName: displayName })
      } else {
        setComputedProgramName('')
        form.setFieldsValue({ programDisplayName: '' })
      }
    } else {
      setComputedProgramName('')
      form.setFieldsValue({ programDisplayName: '' })
    }
  }

  const handleDelete = () => {
    console.log('Delete programs:', selectedRowKeys)
    // Handle delete
    setSelectedRowKeys([])
  }

  const handleResetFilters = () => {
    setNameSearch('')
    setStatusFilter('all')
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleViewDetail = (record: ProgramItem) => {
    setSelectedProgram(record)
    setViewMode('detail')
    
    // For backward compatibility: try to parse legacy programName
    // Format: "(8차시) 텍스트코딩"
    if (record.name && !record.sessionValue && !record.programTypeValue) {
      const match = record.name.match(/^\((\d+)차시\)\s+(.+)$/)
      if (match) {
        const sessionCount = parseInt(match[1], 10)
        const programTypeName = match[2]
        
        // Try to find matching Common Code values
        const sessionKey = sessionCodes.find((k) => k.value === String(sessionCount) || k.label === `${sessionCount}차시`)
        const typeKey = typeCodes.find((k) => k.label === programTypeName)
        
        if (sessionKey) record.sessionValue = sessionKey.value
        if (typeKey) record.programTypeValue = typeKey.value
      }
    }
  }

  // Build detail view items
  const detailViewItems = useMemo(() => {
    if (!selectedProgram) return []
    
    const items: Array<{ label: string; value: string | React.ReactNode; help?: string }> = [
      { label: '프로그램 ID', value: selectedProgram.programId },
    ]

    // Program name - handle both legacy and new format
    const isLegacy = selectedProgram.name && 
      !selectedProgram.programDisplayName && 
      !selectedProgram.name.match(/^\(\d+차시\)\s+.+$/)
    
    items.push({
      label: '프로그램명',
      value: selectedProgram.programDisplayName || selectedProgram.name,
      ...(isLegacy ? { help: '레거시 데이터 (읽기 전용)' } : {}),
    })

    // Add structured fields if available
    if (selectedProgram.sessionValue && selectedProgram.programTypeValue) {
      const sessionKey = getProgramSessionByValue(selectedProgram.sessionValue)
      const typeKey = getProgramTypeByValue(selectedProgram.programTypeValue)
      
      if (sessionKey) {
        items.push({ label: '차시', value: sessionKey.label })
      }
      if (typeKey) {
        items.push({ label: '프로그램 유형', value: typeKey.label })
      }
    }

    // Add remaining fields
    items.push(
      {
        label: '상태',
        value: (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
            selectedProgram.status === '활성'
              ? 'bg-blue-100 text-blue-700'
              : selectedProgram.status === '대기'
                ? 'bg-amber-100 text-amber-700'
                : 'bg-red-100 text-red-700'
          }`}>
            {selectedProgram.status}
          </span>
        ),
      },
      { label: '등록일시', value: selectedProgram.registeredAt },
      { label: '비고', value: selectedProgram.note || '-' }
    )

    return items
  }, [selectedProgram, sessionCodes, typeCodes])

  const sections = [
    { key: 'program', label: '프로그램 정보' },
  ]

  // Scroll to section when clicking navigation
  const scrollToSection = (sectionKey: string) => {
    setActiveSection(sectionKey)
    if (sectionRefs[sectionKey]) {
      sectionRefs[sectionKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesName = !nameSearch || item.name.toLowerCase().includes(nameSearch.toLowerCase())
      return matchesStatus && matchesName
    })
  }, [statusFilter, nameSearch])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, nameSearch])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  const columns: ColumnsType<ProgramItem> = useMemo(() => [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length > 0 && selectedRowKeys.length === filteredData.length}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < filteredData.length}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRowKeys(filteredData.map(item => item.key))
            } else {
              setSelectedRowKeys([])
            }
          }}
        />
      ),
      key: 'selection',
      width: 50,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.key])
            } else {
              setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.key))
            }
          }}
        />
      ),
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
      title: '프로그램ID',
      dataIndex: 'programId',
      key: 'programId',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '프로그램명',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '비고',
      dataIndex: 'note',
      key: 'note',
      width: 300,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text || '-'}</span>,
    },
    {
      title: '등록일시',
      dataIndex: 'registeredAt',
      key: 'registeredAt',
      width: 180,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '상세',
      key: 'action',
      width: 90,
      render: (_, record) => (
        <Button
          size="small"
          icon={<Eye className="w-3 h-3" />}
          className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
          onClick={(e) => {
            e.stopPropagation()
            handleViewDetail(record)
          }}
        >
          상세
        </Button>
      ),
    },
  ], [filteredData, selectedRowKeys, setSelectedRowKeys])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-page">
      {viewMode === 'detail' && selectedProgram ? (
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <ProgramSummaryCard
              programId={selectedProgram.programId}
              name={selectedProgram.name}
              status={selectedProgram.status}
              registeredAt={selectedProgram.registeredAt}
            />

            {/* Program Basic Info Section */}
            <DetailSectionCard title="프로그램 정보">
              <DefinitionListGrid items={detailViewItems} />
            </DetailSectionCard>
          </div>
        </div>
      ) : viewMode === 'register' ? (
        /* Register View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <PageHeaderSticky
            mode="create"
            onCancel={handleBackToList}
            onTempSave={() => {
              const values = form.getFieldsValue()
              console.log('Temp save:', values)
            }}
            onSave={() => {
              if (!hasCommonCodes) {
                return // Disable save if Common Codes are missing
              }
              form.submit()
            }}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12">
            <Form
              form={form}
              layout="vertical"
              onFinish={(values) => {
                if (!hasCommonCodes) {
                  return // Prevent submission if Common Codes are missing
                }
                handleFormSubmit(values)
              }}
            >
              <SectionAccordion
                sections={[
                  {
                    key: 'program',
                    title: '프로그램 정보',
                    helperText: '프로그램의 기본 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="space-y-4 pt-4">
                        {!hasCommonCodes && (
                          <Alert
                            message="공통코드 미등록"
                            description="차시/프로그램 유형 공통코드가 등록되어 있지 않습니다. Common Code 메뉴에서 등록해 주세요."
                            type="warning"
                            showIcon
                            className="mb-4"
                          />
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <Form.Item
                            label={
                              <span>
                                차시 <span className="text-red-500">*</span>
                              </span>
                            }
                            name="sessionValue"
                            rules={[{ required: true, message: '차시를 선택해주세요' }]}
                            className="mb-0"
                          >
                            <Select
                              placeholder="차시를 선택하세요"
                              options={sessionCodes.map((key) => ({
                                value: key.value,
                                label: key.label,
                              }))}
                              className="h-11 rounded-xl"
                              onChange={handleProgramSelectionChange}
                              disabled={!hasCommonCodes}
                            />
                          </Form.Item>

                          <Form.Item
                            label={
                              <span>
                                프로그램 유형 <span className="text-red-500">*</span>
                              </span>
                            }
                            name="programTypeValue"
                            rules={[{ required: true, message: '프로그램 유형을 선택해주세요' }]}
                            className="mb-0"
                          >
                            <Select
                              placeholder="프로그램 유형을 선택하세요"
                              options={typeCodes.map((key) => ({
                                value: key.value,
                                label: key.label,
                              }))}
                              className="h-11 rounded-xl"
                              onChange={handleProgramSelectionChange}
                              disabled={!hasCommonCodes}
                            />
                          </Form.Item>

                          <Form.Item
                            label="프로그램명"
                            name="programDisplayName"
                            className="mb-0 md:col-span-2"
                          >
                            <Input
                              value={computedProgramName}
                              placeholder="차시와 프로그램 유형을 선택하면 자동으로 생성됩니다"
                              className="h-11 rounded-xl"
                              readOnly
                              disabled
                            />
                          </Form.Item>

                          <Form.Item
                            label="상태"
                            name="status"
                            className="mb-0"
                            initialValue="대기"
                          >
                            <Select
                              placeholder="상태"
                              options={programStatusOptions}
                              className="h-11 rounded-xl"
                              disabled
                            />
                          </Form.Item>

                          <Form.Item
                            label="비고"
                            name="note"
                            className="mb-0 md:col-span-2"
                          >
                            <TextArea
                              rows={4}
                              placeholder="비고를 입력하세요"
                              className="rounded-xl"
                            />
                          </Form.Item>
                        </div>
                      </div>
                    ),
                  },
                ]}
              />
            </Form>
          </div>
        </div>
      ) : (
      <div className="p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        {viewMode === 'list' ? (
          <Space>
            <Button
              type="primary"
              onClick={handleRegisterClick}
              className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              + 프로그램 등록
            </Button>
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                className="h-11 px-6 rounded-xl font-medium transition-all"
              >
                삭제 ({selectedRowKeys.length})
              </Button>
            )}
          </Space>
        ) : null}
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <Card className="rounded-xl shadow-sm border border-gray-200">
            {/* Search Toolbar */}
            <div className="flex items-center h-16 px-4 py-3 border-b border-gray-200 gap-3">
              {/* Search Input - Left Side */}
              <div className="w-full max-w-[420px]">
                <Input
                  placeholder="검색어를 입력하세요..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="h-5 w-5 text-slate-400" />}
                  className="admin-search-input h-11 w-full rounded-xl border border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300"
                />
              </div>
              
              {/* Filter Button with Dropdown - Right Side */}
              <div className="relative ml-auto" ref={filterDropdownRef}>
                <Button
                  icon={<Filter className="w-4 h-4" />}
                  onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all flex items-center gap-2"
                >
                  필터
                  <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                </Button>
                
                {/* Filter Dropdown */}
                {filterDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                        <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                          <Select
                            placeholder="ALL STATUS"
                            value={statusFilter}
                            onChange={setStatusFilter}
                            options={statusOptions}
                            className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                            suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                          />
                        </div>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-200">
                        <Button
                          type="text"
                          icon={<RotateCcw className="w-4 h-4" />}
                          onClick={() => {
                            handleResetFilters()
                            setFilterDropdownOpen(false)
                          }}
                          className="h-9 px-4 text-sm"
                        >
                          초기화
                        </Button>
                        <Button
                          type="primary"
                          onClick={() => {
                            setCurrentPage(1)
                            setFilterDropdownOpen(false)
                          }}
                          className="h-9 px-4 text-sm bg-slate-900 hover:bg-slate-800 active:bg-slate-900 border-0 text-white hover:text-white active:text-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                        >
                          적용
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <Table
              columns={columns}
              dataSource={paginatedData}
              pagination={{
                current: currentPage,
                pageSize: pageSize,
                total: filteredData.length,
                showSizeChanger: true,
                showTotal: (total) => `총 ${total}건`,
                onChange: (page, size) => {
                  setCurrentPage(page)
                  setPageSize(size)
                },
                onShowSizeChange: (current, size) => {
                  setCurrentPage(1)
                  setPageSize(size)
                },
              }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
            />
          </Card>
      ) : null}
      </div>
    )}
      </div>
    </ProtectedRoute>
  )
}

