'use client'

import { useState, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Form, Select, Checkbox, Space } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, ArrowLeft, Save, Trash2, RotateCcw, Eye, Search } from 'lucide-react'

const { TextArea } = Input

interface InstitutionItem {
  key: string
  region: string
  institutionId: string
  name: string
  address: string
  detailAddress: string
  phone: string
  manager: string
  email?: string
}

const dummyData: InstitutionItem[] = [
  {
    key: '1',
    region: '1권역',
    institutionId: 'INST-2025-001',
    name: '경기교육청',
    address: '경기도 수원시 영통구',
    detailAddress: '월드컵로 206',
    phone: '031-123-4567',
    manager: '김담당',
  },
  {
    key: '2',
    region: '2권역',
    institutionId: 'INST-2025-002',
    name: '수원교육청',
    address: '경기도 수원시 팔달구',
    detailAddress: '중앙대로 123',
    phone: '031-234-5678',
    manager: '이담당',
  },
  {
    key: '3',
    region: '3권역',
    institutionId: 'INST-2025-003',
    name: '성남교육청',
    address: '경기도 성남시 분당구',
    detailAddress: '정자일로 95',
    phone: '031-345-6789',
    manager: '박담당',
  },
  {
    key: '4',
    region: '4권역',
    institutionId: 'INST-2025-004',
    name: '안양교육청',
    address: '경기도 안양시 만안구',
    detailAddress: '안양로 456',
    phone: '031-456-7890',
    manager: '최담당',
  },
  {
    key: '5',
    region: '5권역',
    institutionId: 'INST-2025-005',
    name: '고양교육청',
    address: '경기도 고양시 일산동구',
    detailAddress: '중앙로 789',
    phone: '031-567-8901',
    manager: '정담당',
  },
  {
    key: '6',
    region: '6권역',
    institutionId: 'INST-2025-006',
    name: '용인교육청',
    address: '경기도 용인시 기흥구',
    detailAddress: '신갈로 321',
    phone: '031-678-9012',
    manager: '강담당',
  },
]

const regionOptions = [
  { value: 'all', label: '전체' },
  { value: '1권역', label: '1권역' },
  { value: '2권역', label: '2권역' },
  { value: '3권역', label: '3권역' },
  { value: '4권역', label: '4권역' },
  { value: '5권역', label: '5권역' },
  { value: '6권역', label: '6권역' },
]

const institutionTypeOptions = [
  { value: 'type1', label: '교육청' },
  { value: 'type2', label: '초등학교' },
  { value: 'type3', label: '중학교' },
  { value: 'type4', label: '고등학교' },
  { value: 'type5', label: '특수학교' },
  { value: 'type6', label: '교육지원청' },
  { value: 'type7', label: '교육연수원' },
  { value: 'type8', label: '기타' },
]

const emailDomainOptions = [
  { value: 'gmail.com', label: 'gmail.com' },
  { value: 'naver.com', label: 'naver.com' },
  { value: 'daum.net', label: 'daum.net' },
  { value: 'hanmail.net', label: 'hanmail.net' },
  { value: 'korea.kr', label: 'korea.kr' },
  { value: 'goe.go.kr', label: 'goe.go.kr' },
]

const cityOptions = [
  { value: '수원시', label: '수원시' },
  { value: '성남시', label: '성남시' },
  { value: '고양시', label: '고양시' },
  { value: '용인시', label: '용인시' },
  { value: '부천시', label: '부천시' },
  { value: '안산시', label: '안산시' },
  { value: '안양시', label: '안양시' },
  { value: '평택시', label: '평택시' },
  { value: '시흥시', label: '시흥시' },
  { value: '김포시', label: '김포시' },
  { value: '광명시', label: '광명시' },
  { value: '광주시', label: '광주시' },
  { value: '군포시', label: '군포시' },
  { value: '하남시', label: '하남시' },
  { value: '오산시', label: '오산시' },
  { value: '이천시', label: '이천시' },
  { value: '안성시', label: '안성시' },
  { value: '의정부시', label: '의정부시' },
  { value: '양주시', label: '양주시' },
  { value: '구리시', label: '구리시' },
  { value: '남양주시', label: '남양주시' },
  { value: '파주시', label: '파주시' },
  { value: '의왕시', label: '의왕시' },
  { value: '화성시', label: '화성시' },
  { value: '양평군', label: '양평군' },
  { value: '여주시', label: '여주시' },
  { value: '동두천시', label: '동두천시' },
  { value: '과천시', label: '과천시' },
  { value: '가평군', label: '가평군' },
  { value: '연천군', label: '연천군' },
]

export default function InstitutionManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'edit' | 'detail'>('list')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [regionFilter, setRegionFilter] = useState<string>('all')
  const [nameSearch, setNameSearch] = useState<string>('')
  const [managerSearch, setManagerSearch] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [emailLocal, setEmailLocal] = useState<string>('')
  const [emailDomain, setEmailDomain] = useState<string>('')
  const [activeSection, setActiveSection] = useState<string>('institution')
  const [selectedInstitution, setSelectedInstitution] = useState<InstitutionItem | null>(null)
  const [detailTab, setDetailTab] = useState<'basic' | 'manager'>('basic')
  const sectionRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  const handleRegisterClick = () => {
    setViewMode('register')
    form.resetFields()
    setEmailLocal('')
    setEmailDomain('')
  }

  const handleViewDetail = (record: InstitutionItem) => {
    setSelectedInstitution(record)
    setViewMode('detail')
    setDetailTab('basic')
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setEditingId(null)
    setEmailLocal('')
    setEmailDomain('')
    setSelectedInstitution(null)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    // Handle form submission
    handleBackToList()
  }

  const handleDelete = () => {
    console.log('Delete institution:', editingId)
    // Handle delete
    handleBackToList()
  }

  const handleBulkDelete = () => {
    console.log('Delete institutions:', selectedRowKeys)
    // Handle bulk delete
    setSelectedRowKeys([])
  }

  const handleResetFilters = () => {
    setRegionFilter('all')
    setNameSearch('')
    setManagerSearch('')
  }

  const handleSearch = () => {
    setCurrentPage(1)
  }

  const handleEditFromDetail = () => {
    if (!selectedInstitution) return
    setViewMode('edit')
    setEditingId(selectedInstitution.key)
    setDetailTab('basic')
    setEmailLocal(selectedInstitution.email?.split('@')[0] || '')
    setEmailDomain(selectedInstitution.email?.split('@')[1] || '')
    form.setFieldsValue({
      name: selectedInstitution.name,
      phone: selectedInstitution.phone,
      address: selectedInstitution.address,
      detailAddress: selectedInstitution.detailAddress,
      manager: selectedInstitution.manager,
    })
  }

  const columns: ColumnsType<InstitutionItem> = [
    {
      title: '권역',
      dataIndex: 'region',
      key: 'region',
      width: 100,
      render: (region: string) => {
        const regionColors: Record<string, { bg: string; text: string }> = {
          '1권역': { bg: 'bg-blue-50', text: 'text-blue-700' },
          '2권역': { bg: 'bg-orange-50', text: 'text-orange-700' },
          '3권역': { bg: 'bg-yellow-50', text: 'text-yellow-700' },
          '4권역': { bg: 'bg-green-50', text: 'text-green-700' },
          '5권역': { bg: 'bg-purple-50', text: 'text-purple-700' },
          '6권역': { bg: 'bg-teal-50', text: 'text-teal-700' },
        }
        const config = regionColors[region] || { bg: 'bg-gray-50', text: 'text-gray-700' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {region}
          </span>
        )
      },
    },
    {
      title: '기관ID',
      dataIndex: 'institutionId',
      key: 'institutionId',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '기관명',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '주소',
      dataIndex: 'address',
      key: 'address',
      width: 200,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '상세 주소',
      dataIndex: 'detailAddress',
      key: 'detailAddress',
      width: 200,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '전화번호',
      dataIndex: 'phone',
      key: 'phone',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '담당자',
      dataIndex: 'manager',
      key: 'manager',
      width: 120,
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
  ]

  const filteredData = dummyData.filter((item) => {
    const matchesRegion = regionFilter === 'all' || item.region === regionFilter
    const matchesName = !nameSearch || item.name.toLowerCase().includes(nameSearch.toLowerCase())
    const matchesManager = !managerSearch || item.manager.toLowerCase().includes(managerSearch.toLowerCase())
    return matchesRegion && matchesName && matchesManager
  })

  const sections = [
    { key: 'institution', label: '교육기관 정보' },
    { key: 'manager', label: '담당자 정보' },
  ]

  // Scroll to section when clicking navigation
  const scrollToSection = (sectionKey: string) => {
    setActiveSection(sectionKey)
    if (sectionRefs.current[sectionKey]) {
      sectionRefs.current[sectionKey]?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">

      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">교육기관 관리</h1>
        {viewMode === 'list' ? (
          <div className="flex items-center gap-3">
            <Space>
              {selectedRowKeys.length > 0 && (
                <Button
                  danger
                  icon={<Trash2 className="w-4 h-4" />}
                  onClick={handleBulkDelete}
                  className="h-11 px-6 rounded-xl font-medium transition-all"
                >
                  삭제 ({selectedRowKeys.length})
                </Button>
              )}
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
                + 기관 등록
              </Button>
            </Space>
            <Button
              icon={<Download className="w-4 h-4" />}
              onClick={() => console.log('Export to Excel')}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              엑셀 추출
            </Button>
          </div>
        ) : (
          <Space>
            {viewMode === 'edit' && (
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                className="h-11 px-6 rounded-xl font-medium transition-all"
              >
                삭제
              </Button>
            )}
            {viewMode === 'detail' ? (
              <>
                <Button
                  type="primary"
                  onClick={handleEditFromDetail}
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
                  수정하기
                </Button>
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBackToList}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  목록으로
                </Button>
              </>
            ) : (
              <>
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
                  저장
                </Button>
                <Button
                  icon={<ArrowLeft className="w-4 h-4" />}
                  onClick={handleBackToList}
                  className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                >
                  취소
                </Button>
              </>
            )}
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
                  placeholder="기관명 검색"
                  value={nameSearch}
                  onChange={(e) => setNameSearch(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Manager Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                <Input
                  placeholder="담당자 검색"
                  value={managerSearch}
                  onChange={(e) => setManagerSearch(e.target.value)}
                  allowClear
                  onPressEnter={handleSearch}
                  prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                  className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                />
              </div>
            </div>
            
            {/* Region Filter */}
            <div className="w-[220px]">
              <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                <Select
                  placeholder="권역 선택"
                  value={regionFilter === 'all' ? undefined : regionFilter}
                  onChange={setRegionFilter}
                  options={regionOptions.filter((opt) => opt.value !== 'all')}
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
          <Card className="rounded-2xl shadow-sm border border-gray-200">
            <Table
              columns={columns}
              dataSource={filteredData}
              rowSelection={{
                selectedRowKeys,
                onChange: (selectedKeys) => {
                  setSelectedRowKeys(selectedKeys)
                },
              }}
              onRow={(record) => ({
                onClick: () => handleViewDetail(record),
                className: 'cursor-pointer hover:bg-gray-50',
              })}
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
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10"
            />
          </Card>
        </div>
      ) : viewMode === 'detail' && selectedInstitution ? (
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
                교육기관 관리
              </Button>
              <ChevronRight className="w-4 h-4 text-gray-400" />
              <span className="text-gray-900 font-medium">상세 정보</span>
            </div>

            <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded-full">
                  {selectedInstitution.institutionId}
                </span>
                <span className="inline-flex items-center px-3 py-1 text-xs font-semibold bg-blue-50 text-blue-700 rounded-full">
                  {selectedInstitution.region}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent leading-tight">{selectedInstitution.name}</h2>
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">주소</span>
                    <span className="text-gray-900 font-medium">{selectedInstitution.address}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">전화번호</span>
                    <span className="text-gray-900 font-medium">{selectedInstitution.phone}</span>
                  </div>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1">
                    <span className="text-gray-500">담당자</span>
                    <span className="text-gray-900 font-medium">{selectedInstitution.manager}</span>
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
                <span
                  className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                    detailTab === 'manager'
                      ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                      : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                  }`}
                  onClick={() => setDetailTab('manager')}
                >
                  담당자 정보
                </span>
              </div>
            </div>
          </div>

          {detailTab === 'basic' && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">교육기관 정보</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                {[
                  { label: '기관ID', value: selectedInstitution.institutionId },
                  { label: '기관명', value: selectedInstitution.name },
                  {
                    label: '권역',
                    value: (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {selectedInstitution.region}
                      </span>
                    ),
                  },
                  { label: '주소', value: selectedInstitution.address },
                  { label: '상세 주소', value: selectedInstitution.detailAddress },
                  { label: '전화번호', value: selectedInstitution.phone },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                    <div className="text-base font-medium text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {detailTab === 'manager' && (
            <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">담당자 정보</h3>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                {[
                  { label: '담당자명', value: selectedInstitution.manager },
                  { label: '담당자 이메일', value: selectedInstitution.email || '미등록' },
                  { label: '담당자 전화', value: selectedInstitution.phone },
                ].map((item) => (
                  <div key={item.label} className="space-y-1">
                    <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                    <div className="text-base font-medium text-gray-900">{item.value}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Register/Edit View */
        <div className="flex gap-6">
          {/* Sticky Section Navigation */}
          <div className="w-64 flex-shrink-0">
            <Card className="rounded-2xl shadow-sm border border-gray-200 sticky top-6">
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
              {/* 교육기관 정보 */}
              <Card
                ref={(el) => {
                  sectionRefs.current['institution'] = el
                }}
                id="institution"
                className="rounded-2xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">교육기관 정보</span>}
              >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="교육기관명"
                  name="name"
                  rules={[{ required: true, message: '교육기관명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="교육기관명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label="교육기관 유형"
                  name="institutionType"
                  rules={[{ required: true, message: '교육기관 유형을 선택해주세요' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="교육기관 유형을 선택하세요"
                    options={institutionTypeOptions}
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

                <div className="md:col-span-2">
                  <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-4">
                    <div className="hidden md:flex md:items-center">
                      <span className="text-sm text-gray-600 font-medium">지역(시/군)</span>
                    </div>
                    <div className="flex gap-4 items-end">
                      <div className="flex-shrink-0">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 font-medium">도시</span>
                        </div>
                        <Form.Item
                          name="province"
                          className="mb-0"
                          initialValue="경기도"
                        >
                          <Input
                            value="경기도"
                            disabled
                            className="bg-gray-50 h-11 rounded-xl w-32"
                          />
                        </Form.Item>
                      </div>
                      <div className="flex-1">
                        <div className="mb-2">
                          <span className="text-sm text-gray-600 font-medium">지역(시/군)</span>
                        </div>
                        <Form.Item
                          name="city"
                          rules={[{ required: true, message: '지역(시/군)을 선택해주세요' }]}
                          className="mb-0"
                        >
                          <Select
                            placeholder="지역(시/군)을 선택하세요"
                            options={cityOptions}
                            className="h-11 rounded-xl"
                          />
                        </Form.Item>
                      </div>
                    </div>
                  </div>
                </div>

                <Form.Item
                  label="도로명"
                  name="address"
                  rules={[{ required: true, message: '도로명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="도로명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label="상세주소"
                  name="detailAddress"
                  className="mb-0"
                >
                  <Input placeholder="상세주소를 입력하세요" className="h-11 rounded-xl" />
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

              {/* 담당자 정보 */}
              <Card
                ref={(el) => {
                  sectionRefs.current['manager'] = el
                }}
                id="manager"
                className="rounded-2xl shadow-sm border border-gray-200"
                title={<span className="text-lg font-semibold">담당자 정보</span>}
              >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="담당자명"
                  name="manager"
                  rules={[{ required: true, message: '담당자명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="담당자명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label="담당자 전화"
                  name="managerPhone"
                  rules={[{ required: true, message: '담당자 전화를 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="담당자 전화를 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                  label="담당자 이메일"
                  name="managerEmail"
                  rules={[
                    { required: true, message: '담당자 이메일을 입력해주세요' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                  ]}
                  className="mb-0 md:col-span-2"
                >
                  <div className="flex gap-2">
                    <Input
                      placeholder="이메일"
                      value={emailLocal}
                      onChange={(e) => {
                        setEmailLocal(e.target.value)
                        form.setFieldsValue({
                          managerEmail: `${e.target.value}@${emailDomain}`,
                        })
                      }}
                      className="flex-1 h-11 rounded-xl"
                    />
                    <span className="flex items-center text-gray-500">@</span>
                    <Select
                      placeholder="도메인"
                      value={emailDomain}
                      onChange={(value) => {
                        setEmailDomain(value)
                        form.setFieldsValue({
                          managerEmail: `${emailLocal}@${value}`,
                        })
                      }}
                      options={emailDomainOptions}
                      className="flex-1 h-11 rounded-xl"
                    />
                  </div>
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

