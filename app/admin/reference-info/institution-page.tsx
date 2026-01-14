'use client'

export const dynamic = 'force-dynamic'

import { useState, useRef, useMemo, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Form, Input, Select, Checkbox, Space } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Download, ArrowLeft, Save, Trash2, RotateCcw, Eye, Plus, Search, Filter } from 'lucide-react'
import { 
  PageHeaderSticky,
  DetailPageHeaderSticky,
  InstitutionSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  SectionAccordion
} from '@/components/admin/operations'
import {
  getInstitutionMainCategoryCodes,
  getInstitutionSubCategory1Codes,
  getInstitutionSubCategory2Codes,
  getSchoolLevelTypeCodes,
} from '@/lib/commonCodeStore'

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
  classMain?: string // 대분류 code
  classLv1?: string // 1분류 code
  classLv2?: string // 2분류 code
  schoolLevelType?: string | null // 학교급 구분 code
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

// 시/군별 권역 매핑
const cityToRegionMap: Record<string, string> = {
  '수원시': '1권역',
  '성남시': '2권역',
  '고양시': '3권역',
  '용인시': '4권역',
  '부천시': '5권역',
  '안산시': '5권역',
  '안양시': '1권역',
  '평택시': '6권역',
  '시흥시': '5권역',
  '김포시': '3권역',
  '광명시': '5권역',
  '광주시': '4권역',
  '군포시': '1권역',
  '하남시': '2권역',
  '오산시': '6권역',
  '이천시': '4권역',
  '안성시': '6권역',
  '의정부시': '3권역',
  '양주시': '3권역',
  '구리시': '2권역',
  '남양주시': '2권역',
  '파주시': '3권역',
  '의왕시': '1권역',
  '화성시': '6권역',
  '양평군': '4권역',
  '여주시': '4권역',
  '동두천시': '3권역',
  '과천시': '1권역',
  '가평군': '2권역',
  '연천군': '3권역',
}

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
  
  // Classification options from Common Code
  const mainCategoryOptions = useMemo(() => {
    return getInstitutionMainCategoryCodes().map(key => ({
      label: key.label,
      value: key.value,
    }))
  }, [])
  
  const subCategory1Options = useMemo(() => {
    return getInstitutionSubCategory1Codes().map(key => ({
      label: key.label,
      value: key.value,
    }))
  }, [])
  
  const subCategory2Options = useMemo(() => {
    return getInstitutionSubCategory2Codes().map(key => ({
      label: key.label,
      value: key.value,
    }))
  }, [])
  
  const schoolLevelTypeOptions = useMemo(() => {
    return getSchoolLevelTypeCodes().map(key => ({
      label: key.label,
      value: key.value,
    }))
  }, [])
  
  // Watch classLv2 to show/hide schoolLevelType
  const classLv2Value = Form.useWatch('classLv2', form)

  // 시/군 선택 시 권역 자동 설정
  const handleCityChange = (city: string) => {
    const region = cityToRegionMap[city] || ''
    form.setFieldsValue({
      city,
      region,
    })
  }

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
      classMain: selectedInstitution.classMain,
      classLv1: selectedInstitution.classLv1,
      classLv2: selectedInstitution.classLv2,
      schoolLevelType: selectedInstitution.schoolLevelType,
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

  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)

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

  // Filtered data with useMemo
  const filteredData = useMemo(() => {
    return dummyData.filter((item) => {
      const matchesRegion = regionFilter === 'all' || item.region === regionFilter
      const matchesName = !nameSearch || item.name.toLowerCase().includes(nameSearch.toLowerCase())
      const matchesManager = !managerSearch || item.manager.toLowerCase().includes(managerSearch.toLowerCase())
      return matchesRegion && matchesName && matchesManager
    })
  }, [regionFilter, nameSearch, managerSearch])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [regionFilter, nameSearch, managerSearch])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-page">
      {viewMode === 'detail' && selectedInstitution ? (
        /* Detail View - Redesigned to match other pages */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
            onEdit={handleEditFromDetail}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <InstitutionSummaryCard
              institutionId={selectedInstitution.institutionId}
              name={selectedInstitution.name}
              region={selectedInstitution.region}
              address={selectedInstitution.address}
              phone={selectedInstitution.phone}
              manager={selectedInstitution.manager}
            />

            {/* Institution Basic Info Section */}
            <DetailSectionCard title="교육기관 정보">
              <DefinitionListGrid
                items={[
                  { label: '기관 ID', value: selectedInstitution.institutionId },
                  { label: '기관명', value: selectedInstitution.name },
                  {
                    label: '권역',
                    value: (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                        {selectedInstitution.region}
                      </span>
                    )
                  },
                  { label: '주소', value: selectedInstitution.address },
                  { label: '상세 주소', value: selectedInstitution.detailAddress },
                  { label: '전화번호', value: selectedInstitution.phone },
                  { 
                    label: '대분류', 
                    value: selectedInstitution.classMain 
                      ? mainCategoryOptions.find(opt => opt.value === selectedInstitution.classMain)?.label || selectedInstitution.classMain
                      : '-' 
                  },
                  { 
                    label: '1분류', 
                    value: selectedInstitution.classLv1 
                      ? subCategory1Options.find(opt => opt.value === selectedInstitution.classLv1)?.label || selectedInstitution.classLv1
                      : '-' 
                  },
                  { 
                    label: '2분류', 
                    value: selectedInstitution.classLv2 
                      ? subCategory2Options.find(opt => opt.value === selectedInstitution.classLv2)?.label || selectedInstitution.classLv2
                      : '-' 
                  },
                  { 
                    label: '학교급 구분', 
                    value: selectedInstitution.schoolLevelType 
                      ? schoolLevelTypeOptions.find(opt => opt.value === selectedInstitution.schoolLevelType)?.label || selectedInstitution.schoolLevelType
                      : '-' 
                  },
                ]}
              />
            </DetailSectionCard>

            {/* Manager Info Section */}
            <DetailSectionCard title="담당자 정보">
              <DefinitionListGrid
                items={[
                  { label: '담당자명', value: selectedInstitution.manager },
                  { label: '담당자 이메일', value: selectedInstitution.email || '미등록' },
                  { label: '담당자 전화', value: selectedInstitution.phone },
                ]}
              />
            </DetailSectionCard>
                  </div>
              </div>
      ) : viewMode === 'register' || viewMode === 'edit' ? (
        /* Register/Edit View - Redesigned to match other pages */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <PageHeaderSticky
            mode={viewMode === 'edit' ? 'edit' : 'create'}
            onCancel={handleBackToList}
            onTempSave={() => {
              const values = form.getFieldsValue()
              console.log('Temp save:', values)
            }}
            onSave={() => form.submit()}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
            >
              <SectionAccordion
                sections={[
                  {
                    key: 'institution',
                    title: '교육기관 정보',
                    helperText: '교육기관의 기본 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Form.Item
                          label={
                            <span>
                              교육기관명 <span className="text-red-500">*</span>
                            </span>
                          }
                  name="name"
                  rules={[{ required: true, message: '교육기관명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="교육기관명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                          label={
                            <span>
                              교육기관 유형 <span className="text-red-500">*</span>
                            </span>
                          }
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
                          label={
                            <span>
                              전화번호 <span className="text-red-500">*</span>
                            </span>
                          }
                  name="phone"
                  rules={[{ required: true, message: '전화번호를 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="전화번호를 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <div className="md:col-span-2">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
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
                                <span className="text-sm text-gray-600 font-medium">지역(시/군) <span className="text-red-500">*</span></span>
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
                                  onChange={handleCityChange}
                          />
                        </Form.Item>
                      </div>
                            <div className="flex-1">
                              <div className="mb-2">
                                <span className="text-sm text-gray-600 font-medium">권역</span>
                              </div>
                              <Form.Item
                                name="region"
                                className="mb-0"
                              >
                                <Input
                                  disabled
                                  className="bg-gray-50 h-11 rounded-xl"
                                  placeholder="지역(시/군) 선택 시 자동 설정됩니다"
                                />
                              </Form.Item>
                    </div>
                  </div>
                </div>

                <Form.Item
                          label={
                            <span>
                              도로명 <span className="text-red-500">*</span>
                            </span>
                          }
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
                  label={
                    <span>
                      대분류 <span className="text-red-500">*</span>
                    </span>
                  }
                  name="classMain"
                  rules={[{ required: true, message: '대분류를 선택해주세요' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="대분류를 선택하세요"
                    options={mainCategoryOptions}
                    className="h-11 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span>
                      1분류 <span className="text-red-500">*</span>
                    </span>
                  }
                  name="classLv1"
                  rules={[{ required: true, message: '1분류를 선택해주세요' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="1분류를 선택하세요"
                    options={subCategory1Options}
                    className="h-11 rounded-xl"
                  />
                </Form.Item>

                <Form.Item
                  label={
                    <span>
                      2분류 <span className="text-red-500">*</span>
                    </span>
                  }
                  name="classLv2"
                  rules={[{ required: true, message: '2분류를 선택해주세요' }]}
                  className="mb-0"
                >
                  <Select
                    placeholder="2분류를 선택하세요"
                    options={subCategory2Options}
                    className="h-11 rounded-xl"
                    onChange={() => {
                      // Reset schoolLevelType when classLv2 changes
                      form.setFieldsValue({ schoolLevelType: null })
                    }}
                  />
                </Form.Item>

                {classLv2Value && (
                  <Form.Item
                    label={
                      <span>
                        학교급 구분 <span className="text-red-500">*</span>
                      </span>
                    }
                    name="schoolLevelType"
                    rules={[{ required: true, message: '학교급 구분을 선택해주세요' }]}
                    className="mb-0"
                  >
                    <Select
                      placeholder="학교급 구분을 선택하세요"
                      options={schoolLevelTypeOptions}
                      className="h-11 rounded-xl"
                    />
                  </Form.Item>
                )}

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
                    ),
                  },
                  {
                    key: 'manager',
                    title: '담당자 정보',
                    helperText: '담당자 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <Form.Item
                          label={
                            <span>
                              담당자명 <span className="text-red-500">*</span>
                            </span>
                          }
                  name="manager"
                  rules={[{ required: true, message: '담당자명을 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="담당자명을 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                          label={
                            <span>
                              담당자 전화 <span className="text-red-500">*</span>
                            </span>
                          }
                  name="managerPhone"
                  rules={[{ required: true, message: '담당자 전화를 입력해주세요' }]}
                  className="mb-0"
                >
                  <Input placeholder="담당자 전화를 입력하세요" className="h-11 rounded-xl" />
                </Form.Item>

                <Form.Item
                          label={
                            <span>
                              담당자 이메일 <span className="text-red-500">*</span>
                            </span>
                          }
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
                    ),
                  },
                ]}
              />
            </Form>
          </div>
        </div>
      ) : (
        /* List View */
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            {viewMode === 'list' ? (
              <Space>
                <Button
                  type="primary"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleRegisterClick}
                  className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  기관 등록
                </Button>
                {selectedRowKeys.length > 0 && (
                  <Button
                    danger
                    icon={<Trash2 className="w-4 h-4" />}
                    onClick={handleBulkDelete}
                    className="h-11 px-4 rounded-xl font-medium transition-all"
                  >
                    삭제
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
                    value={nameSearch || managerSearch}
                    onChange={(e) => {
                      setNameSearch(e.target.value)
                      setManagerSearch(e.target.value)
                    }}
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
                        {/* Region Filter */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">권역</label>
                          <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                            <Select
                              placeholder="ALL REGIONS"
                              value={regionFilter}
                              onChange={setRegionFilter}
                              options={regionOptions}
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
                rowSelection={{
                  selectedRowKeys,
                  onChange: (selectedKeys) => {
                    setSelectedRowKeys(selectedKeys)
                  },
                }}
                onRow={(record) => ({
                  onClick: () => handleViewDetail(record),
                  className: 'cursor-pointer',
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

