'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, Form, Descriptions, Tag, Checkbox } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { 
  ChevronRight, 
  RotateCcw, 
  Plus, 
  Search, 
  Eye, 
  ArrowLeft,
  Trash2,
  Save
} from 'lucide-react'
import { useRouter } from 'next/navigation'

const { TextArea } = Input

interface ProgramItem {
  key: string
  status: string
  programId: string
  name: string
  note: string
  registeredAt: string
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
  const [detailTab, setDetailTab] = useState<'basic'>('basic')
  const sectionRefs = useState<{ [key: string]: HTMLDivElement | null }>({})[0]

  const router = useRouter()

  const handleRegisterClick = () => {
    setViewMode('register')
    form.resetFields()
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setSelectedProgram(null)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    handleBackToList()
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
    setDetailTab('basic')
  }

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
          '활성': { bg: 'bg-blue-50', text: 'text-blue-700' },
          '대기': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
          '비활성': { bg: 'bg-red-50', text: 'text-red-700' },
        }
        const config = statusConfig[status] || { bg: 'bg-gray-50', text: 'text-gray-700' }
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
          className="h-8 px-3 rounded-lg border border-gray-300 hover:bg-gray-50"
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
      <div className="p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        {viewMode === 'list' ? (
          <Space>
            <Button
              type="primary"
              onClick={handleRegisterClick}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
              style={{
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748'
                e.currentTarget.style.borderColor = '#2d3748'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c'
                e.currentTarget.style.borderColor = '#1a202c'
              }}
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
        ) : viewMode === 'register' ? (
          <div className="flex items-center justify-between w-full">
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToList}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              뒤로
            </Button>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={() => form.submit()}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
              style={{
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                color: '#ffffff',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748'
                e.currentTarget.style.borderColor = '#2d3748'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c'
                e.currentTarget.style.borderColor = '#1a202c'
              }}
            >
              등록하기
            </Button>
          </div>
        ) : (
          <Space>
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={handleBackToList}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              목록으로
            </Button>
          </Space>
        )}
      </div>

      {viewMode === 'list' ? (
        /* List View */
        <div className="space-y-4">
          {/* Modern Search Toolbar */}
          <div className="flex items-center h-16 px-4 py-3 bg-white border border-[#ECECF3] rounded-2xl shadow-[0_8px_24px_rgba(15,15,30,0.06)] mb-4 gap-3 flex-wrap">
            {/* Search Input - Primary, flex-grow */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                <Input
                  placeholder="Search by name, ID, or email..."
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  allowClear
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Status Filter */}
            <div className="w-[220px]">
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
            
            {/* Refresh Button */}
            <div className="flex items-center gap-2 ml-auto">
              <Button
                type="text"
                icon={<RotateCcw className="w-4 h-4 text-[#151827]" />}
                onClick={handleResetFilters}
                className="w-10 h-10 p-0 rounded-full bg-transparent border border-[#EDEDF5] hover:bg-[#FFF3ED] flex items-center justify-center transition-all"
              />
            </div>
          </div>

          {/* Table */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            <Table
              columns={columns}
              dataSource={filteredData}
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
              }}
              rowKey="key"
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
              onRow={(record) => ({
                onClick: () => handleViewDetail(record),
                className: 'cursor-pointer',
              })}
            />
          </Card>
        </div>
      ) : viewMode === 'detail' && selectedProgram ? (
        /* Detail View */
        <div className="space-y-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <Button
                type="text"
                icon={<ArrowLeft className="w-4 h-4" />}
                onClick={handleBackToList}
                className="text-gray-600 hover:text-gray-900 px-0"
              >
                프로그램 관리
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">상세 정보</span>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                  No. {selectedProgram.programId.replace('PROG-', '')}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedProgram.status === '활성'
                    ? 'bg-blue-50 text-blue-700'
                    : selectedProgram.status === '대기'
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-red-50 text-red-700'
                }`}>
                  {selectedProgram.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold text-[#3a2e2a] leading-tight">{selectedProgram.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">프로그램 ID</span>
                    <span className="text-gray-900 font-medium">{selectedProgram.programId}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">등록일시</span>
                    <span className="text-gray-900 font-medium">{selectedProgram.registeredAt}</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 text-sm">
                <span
                  className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                    detailTab === 'basic'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setDetailTab('basic')}
                >
                  기본 정보
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                <h3 className="text-lg font-semibold text-[#3a2e2a]">프로그램 정보</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
              {[
                { label: '프로그램 ID', value: selectedProgram.programId },
                { label: '프로그램명', value: selectedProgram.name },
                {
                  label: '상태',
                  value: (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedProgram.status === '활성'
                        ? 'bg-blue-50 text-blue-700'
                        : selectedProgram.status === '대기'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                    }`}>
                      {selectedProgram.status}
                    </span>
                  ),
                },
                { label: '등록일시', value: selectedProgram.registeredAt },
                { label: '비고', value: selectedProgram.note || '-' },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                  <div className="text-base font-medium text-gray-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* Register View */
        <div className="flex gap-6">
          {/* Sticky Section Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="rounded-xl shadow-sm border border-gray-200 sticky top-6">
              <div className="space-y-2">
                {sections.map((section) => (
                  <button
                    key={section.key}
                    onClick={() => scrollToSection(section.key)}
                    className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                      activeSection === section.key
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {section.label}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Form Content */}
          <div className="flex-1">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              className="space-y-6"
            >
              {/* 프로그램 정보 */}
              <Card
                ref={(el) => {
                  if (el) {
                    sectionRefs['program'] = el;
                  }
                }}
                id="program"
                className="rounded-xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">프로그램 정보</span>}
              >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="프로그램명"
                  name="name"
                  rules={[{ required: true, message: '프로그램명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="프로그램명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label="상태"
                  name="status"
                  rules={[{ required: true, message: '상태를 선택해주세요' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="상태를 선택하세요"
                    options={programStatusOptions}
                    className="h-11 rounded-xl"
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
              </Card>
            </Form>
          </div>
        </div>
      )}
      </div>
    </ProtectedRoute>
  )
}

