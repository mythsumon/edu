'use client'

import { useState, useMemo } from 'react'
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

interface InstructorItem {
  key: string
  status: string
  instructorId: string
  name: string
  account: string
  affiliation: string
  region: string
  type: string
  registeredAt: string
}

const dummyData: InstructorItem[] = [
  {
    key: '1',
    status: '활성',
    instructorId: 'INST-2025-001',
    name: '김강사',
    account: 'kim.teacher',
    affiliation: '서울교육청',
    region: '서울시',
    type: '일반',
    registeredAt: '2025.01.15 10:30',
  },
  {
    key: '2',
    status: '활성',
    instructorId: 'INST-2025-002',
    name: '이강사',
    account: 'lee.teacher',
    affiliation: '인천교육청',
    region: '인천시',
    type: '고급',
    registeredAt: '2025.01.10 14:20',
  },
  {
    key: '3',
    status: '비활성',
    instructorId: 'INST-2025-003',
    name: '박강사',
    account: 'park.teacher',
    affiliation: '경기교육청',
    region: '경기도',
    type: '예비',
    registeredAt: '2025.01.05 09:15',
  },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '활성', label: '활성' },
  { value: '비활성', label: '비활성' },
]

const regionOptions = [
  { value: 'all', label: '전체' },
  { value: '서울시', label: '서울시' },
  { value: '인천시', label: '인천시' },
  { value: '경기도', label: '경기도' },
]

const typeOptions = [
  { value: 'all', label: '전체' },
  { value: '예비', label: '예비' },
  { value: '일반', label: '일반' },
  { value: '고급', label: '고급' },
]

export default function InstructorManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [nameSearch, setNameSearch] = useState<string>('')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [activeSection, setActiveSection] = useState<string>('basic')
  const [selectedInstructor, setSelectedInstructor] = useState<InstructorItem | null>(null)
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
    setSelectedInstructor(null)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    handleBackToList()
  }

  const handleDelete = () => {
    console.log('Delete instructors:', selectedRowKeys)
    // Handle delete
    setSelectedRowKeys([])
  }

  const handleResetFilters = () => {
    setNameSearch('')
    setStatusFilter('all')
    setRegionFilter('all')
    setTypeFilter('all')
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleViewDetail = (record: InstructorItem) => {
    setSelectedInstructor(record)
    setViewMode('detail')
    setDetailTab('basic')
  }

  const sections = [
    { key: 'basic', label: '기본 정보' },
    { key: 'affiliation', label: '소속/지역 정보' },
    { key: 'operation', label: '운영 정보' },
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
      const matchesRegion = regionFilter === 'all' || item.region === regionFilter
      const matchesType = typeFilter === 'all' || item.type === typeFilter
      const matchesName = !nameSearch || 
        item.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
        item.account.toLowerCase().includes(nameSearch.toLowerCase())
      return matchesStatus && matchesRegion && matchesType && matchesName
    })
  }, [statusFilter, regionFilter, typeFilter, nameSearch])

  const columns: ColumnsType<InstructorItem> = useMemo(() => [
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
      title: '강사ID',
      dataIndex: 'instructorId',
      key: 'instructorId',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '강사명',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '계정',
      dataIndex: 'account',
      key: 'account',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '소속',
      dataIndex: 'affiliation',
      key: 'affiliation',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '지역',
      dataIndex: 'region',
      key: 'region',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '강사 구분',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => {
        const typeConfig: Record<string, { bg: string; text: string }> = {
          '예비': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
          '일반': { bg: 'bg-blue-50', text: 'text-blue-700' },
          '고급': { bg: 'bg-purple-50', text: 'text-purple-700' },
        }
        const config = typeConfig[type] || { bg: 'bg-gray-50', text: 'text-gray-700' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {type}
          </span>
        )
      },
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
            {selectedRowKeys.length > 0 && (
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                className="h-11 px-4 rounded-xl font-medium transition-all"
              >
                삭제
              </Button>
            )}
            <Button
              type="primary"
              icon={<Plus className="w-4 h-4" />}
              onClick={handleRegisterClick}
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
            >
              강사 등록
            </Button>
          </Space>
        ) : viewMode === 'register' ? (
          <Space>
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
              className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
            >
              등록하기
            </Button>
          </Space>
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
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
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
            
            {/* Region Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
                <Select
                  placeholder="REGION"
                  value={regionFilter}
                  onChange={setRegionFilter}
                  options={regionOptions}
                  className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                  suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                />
              </div>
            </div>
            
            {/* Type Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 focus-within:border-[#ff8a65] focus-within:shadow-[0_0_0_4px_rgba(255,122,89,0.18)] hover:border-[#D3D3E0]">
                <Select
                  placeholder="TYPE"
                  value={typeFilter}
                  onChange={setTypeFilter}
                  options={typeOptions}
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
      ) : viewMode === 'detail' && selectedInstructor ? (
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
                강사 관리
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">상세 정보</span>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                  No. {selectedInstructor.instructorId.replace('INST-', '')}
                </span>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                  selectedInstructor.status === '활성'
                    ? 'bg-blue-50 text-blue-700'
                    : 'bg-red-50 text-red-700'
                }`}>
                  {selectedInstructor.status}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">{selectedInstructor.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">계정</span>
                    <span className="text-gray-900 font-medium">{selectedInstructor.account}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">등록일시</span>
                    <span className="text-gray-900 font-medium">{selectedInstructor.registeredAt}</span>
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
                <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">강사 정보</h3>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
              {[
                { label: '강사 ID', value: selectedInstructor.instructorId },
                { label: '강사명', value: selectedInstructor.name },
                { label: '계정', value: selectedInstructor.account },
                { label: '소속', value: selectedInstructor.affiliation },
                { label: '지역', value: selectedInstructor.region },
                { 
                  label: '강사 구분', 
                  value: (
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      selectedInstructor.type === '예비'
                        ? 'bg-yellow-50 text-yellow-700'
                        : selectedInstructor.type === '일반'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-purple-50 text-purple-700'
                    }`}>
                      {selectedInstructor.type}
                    </span>
                  )
                },
                { label: '등록일시', value: selectedInstructor.registeredAt },
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
              {/* 기본 정보 */}
              <Card
                ref={(el) => {
                  if (el) {
                    sectionRefs['basic'] = el;
                  }
                }}
                id="basic"
                className="rounded-xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">기본 정보</span>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="사용자명"
                    name="username"
                    rules={[{ required: true, message: '사용자명을 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="사용자명을 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="비밀번호"
                    name="password"
                    rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input.Password placeholder="비밀번호를 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="강사명"
                    name="name"
                    rules={[{ required: true, message: '강사명을 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="강사명을 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="이메일"
                    name="email"
                    rules={[{ required: true, message: '이메일을 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="이메일을 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="성별"
                    name="gender"
                    rules={[{ required: true, message: '성별을 선택해주세요' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="성별을 선택하세요"
                      options={[
                        { value: '남', label: '남' },
                        { value: '여', label: '여' },
                      ]}
                      className="h-11 rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    label="전화번호"
                    name="phone"
                    rules={[{ required: true, message: '전화번호를 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="전화번호를 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="생년월일"
                    name="birthDate"
                    rules={[{ required: true, message: '생년월일을 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="생년월일을 입력하세요 (YYYY-MM-DD)" className="h-11 rounded-xl" />
                  </Form.Item>
                </div>
              </Card>

              {/* 소속/지역 정보 */}
              <Card
                ref={(el) => {
                  if (el) {
                    sectionRefs['affiliation'] = el;
                  }
                }}
                id="affiliation"
                className="rounded-xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">소속/지역 정보</span>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="소속"
                    name="affiliation"
                    rules={[{ required: true, message: '소속을 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="소속을 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="지역(시/군)"
                    name="region"
                    rules={[{ required: true, message: '지역을 선택해주세요' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="지역을 선택하세요"
                      options={[
                        { value: '서울시', label: '서울시' },
                        { value: '인천시', label: '인천시' },
                        { value: '경기도', label: '경기도' },
                      ]}
                      className="h-11 rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    label="도시"
                    name="city"
                    initialValue="경기도"
                    className="mb-0"
                  >
                    <Input placeholder="도시를 입력하세요" className="h-11 rounded-xl" disabled />
                  </Form.Item>

                  <Form.Item
                    label="도로명주소"
                    name="address"
                    rules={[{ required: true, message: '도로명주소를 입력해주세요' }]}
                    className="mb-0"
                  >
                    <Input placeholder="도로명주소를 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>

                  <Form.Item
                    label="건물명/호수"
                    name="buildingDetails"
                    className="mb-0 md:col-span-2"
                  >
                    <Input placeholder="건물명/호수를 입력하세요" className="h-11 rounded-xl" />
                  </Form.Item>
                </div>
              </Card>

              {/* 운영 정보 */}
              <Card
                ref={(el) => {
                  if (el) {
                    sectionRefs['operation'] = el;
                  }
                }}
                id="operation"
                className="rounded-xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">운영 정보</span>}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Form.Item
                    label="상태"
                    name="status"
                    rules={[{ required: true, message: '상태를 선택해주세요' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="상태를 선택하세요"
                      options={[
                        { value: '활성', label: '활성' },
                        { value: '비활성', label: '비활성' },
                      ]}
                      className="h-11 rounded-xl"
                    />
                  </Form.Item>

                  <Form.Item
                    label="강사 구분"
                    name="type"
                    rules={[{ required: true, message: '강사 구분을 선택해주세요' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="강사 구분을 선택하세요"
                      options={[
                        { value: '예비', label: '예비' },
                        { value: '일반', label: '일반' },
                        { value: '고급', label: '고급' },
                      ]}
                      className="h-11 rounded-xl"
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