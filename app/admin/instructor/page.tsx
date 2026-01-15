'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Select, Space, Form, Descriptions, Tag, Checkbox, Input, Modal, message, DatePicker } from 'antd'
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
  Filter,
  Key,
  UserSearch,
  Download
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { 
  DetailPageHeaderSticky,
  PageHeaderSticky,
  InstructorSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
  SectionAccordion
} from '@/components/admin/operations'

dayjs.locale('ko')
const { TextArea } = Input

interface InstructorItem {
  key: string
  status: string
  instructorId: string
  name: string
  account: string
  affiliation: string
  region: string
  assignmentZone?: string
  type: string
  category?: '신규강사' | '재채용' | '재고용'
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
    category: '신규강사',
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
    category: '재채용',
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
    category: '재고용',
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

// 지역(시/군)과 배정권역 매핑
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
  '의정부시': '1권역',
  '광명시': '5권역',
  '하남시': '2권역',
  '오산시': '6권역',
  '이천시': '4권역',
  '구리시': '2권역',
  '안성시': '6권역',
  '포천시': '1권역',
  '의왕시': '1권역',
  '양주시': '1권역',
  '여주시': '4권역',
  '양평군': '4권역',
  '동두천시': '1권역',
  '과천시': '1권역',
  '가평군': '4권역',
  '연천군': '1권역',
}

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
  const [filterDropdownOpen, setFilterDropdownOpen] = useState<boolean>(false)
  const filterDropdownRef = useRef<HTMLDivElement>(null)
  const [findIdModalOpen, setFindIdModalOpen] = useState(false)
  const [findPasswordModalOpen, setFindPasswordModalOpen] = useState(false)
  const [findIdForm] = Form.useForm()
  const [findPasswordForm] = Form.useForm()
  const [isPostcodeScriptLoaded, setIsPostcodeScriptLoaded] = useState(false)

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

  // Daum 우편번호 서비스 스크립트 로드
  useEffect(() => {
    if (typeof window !== 'undefined' && !isPostcodeScriptLoaded) {
      const script = document.createElement('script')
      script.src = '//t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js'
      script.async = true
      script.onload = () => {
        setIsPostcodeScriptLoaded(true)
      }
      script.onerror = () => {
        console.error('Daum 우편번호 서비스 스크립트 로드 실패')
        message.error('주소 검색 서비스를 불러올 수 없습니다.')
      }
      document.body.appendChild(script)

      return () => {
        // 컴포넌트 언마운트 시 스크립트 제거하지 않음 (다른 곳에서도 사용 가능)
      }
    }
  }, [isPostcodeScriptLoaded])
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
    // 기본 비밀번호 자동 설정 (모든 강사 동일)
    const defaultPassword = 'Instructor@1234'
    const instructorData = {
      ...values,
      password: defaultPassword,
      passwordChanged: false, // 첫 로그인 시 비밀번호 변경 필요
    }
    console.log('강사 등록:', instructorData)
    message.success('강사가 등록되었습니다. 기본 비밀번호는 Instructor@1234입니다.')
    handleBackToList()
  }

  // 지역(시/군) 변경 시 배정권역 자동 설정
  const handleRegionChange = (region: string) => {
    const assignmentZone = cityToRegionMap[region] || ''
    if (assignmentZone) {
      form.setFieldsValue({ assignmentZone })
    }
  }

  // 주소 검색 핸들러 (Daum 우편번호 서비스)
  const handleAddressSearch = () => {
    if (typeof window === 'undefined' || !(window as any).daum) {
      message.warning('주소 검색 서비스를 불러오는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    new (window as any).daum.Postcode({
      oncomplete: (data: any) => {
        // 주소 선택 시 폼에 자동 입력
        let fullAddress = data.address // 최종 선택한 주소
        let extraAddress = '' // 참고항목 변수

        // 사용자가 선택한 주소 타입에 따라 해당 주소 값을 가져온다.
        if (data.userSelectedType === 'R') {
          // 사용자가 도로명 주소를 선택했을 경우
          fullAddress = data.roadAddress
        } else {
          // 사용자가 지번 주소를 선택했을 경우(J)
          fullAddress = data.jibunAddress
        }

        // 사용자가 선택한 주소가 도로명 타입일때 참고항목을 조합한다.
        if (data.userSelectedType === 'R') {
          // 법정동명이 있을 경우 추가한다. (법정리는 제외)
          // 법정동의 경우 마지막 문자가 "동/로/가"로 끝난다.
          if (data.bname !== '' && /[동|로|가]$/g.test(data.bname)) {
            extraAddress += data.bname
          }
          // 건물명이 있고, 공동주택일 경우 추가한다.
          if (data.buildingName !== '' && data.apartment === 'Y') {
            extraAddress += extraAddress !== '' ? ', ' + data.buildingName : data.buildingName
          }
          // 표시할 참고항목이 있을 경우, 괄호까지 추가한 최종 문자열을 만든다.
          if (extraAddress !== '') {
            extraAddress = ' (' + extraAddress + ')'
          }
        }

        // 우편번호와 주소 정보를 해당 필드에 넣는다.
        form.setFieldsValue({
          address: fullAddress,
          // 우편번호가 필요한 경우
          // postcode: data.zonecode,
        })

        message.success('주소가 입력되었습니다.')
      },
      onresize: (size: any) => {
        // 팝업 크기 조정
      },
      width: '100%',
      height: '100%',
    }).open()
  }

  // CSV 다운로드 기능
  const handleDownload = () => {
    try {
      // 필터링된 데이터 가져오기
      const dataToExport = filteredData
      
      if (dataToExport.length === 0) {
        message.warning('다운로드할 데이터가 없습니다.')
        return
      }

      // CSV 헤더 정의
      const headers = [
        '강사ID',
        '강사명',
        '계정',
        '소속',
        '지역',
        '배정권역',
        '강사 구분',
        '강사 카테고리',
        '이메일',
        '전화번호',
        '성별',
        '생년월일',
        '도시',
        '도로명주소',
        '건물명/호수',
        '상태',
        '등록일시',
      ]

      // CSV 데이터 생성
      const csvRows = [
        headers.join(','),
        ...dataToExport.map((item) => {
          return [
            item.instructorId || '',
            item.name || '',
            item.account || '',
            item.affiliation || '-',
            item.region || '',
            item.assignmentZone || '',
            item.type || '',
            item.category || '',
            '', // 이메일은 더미 데이터에 없을 수 있음
            '', // 전화번호는 더미 데이터에 없을 수 있음
            '', // 성별은 더미 데이터에 없을 수 있음
            '', // 생년월일은 더미 데이터에 없을 수 있음
            '경기도', // 고정값
            '', // 도로명주소는 더미 데이터에 없을 수 있음
            '', // 건물명/호수는 더미 데이터에 없을 수 있음
            item.status || '',
            item.registeredAt || '',
          ]
            .map((field) => {
              // CSV 형식에 맞게 이스케이프 처리
              if (field === null || field === undefined) return ''
              const stringField = String(field)
              // 쉼표, 따옴표, 줄바꿈이 포함된 경우 따옴표로 감싸고 내부 따옴표는 이중화
              if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
                return `"${stringField.replace(/"/g, '""')}"`
              }
              return stringField
            })
            .join(',')
        }),
      ]

      // BOM 추가 (한글 깨짐 방지)
      const BOM = '\uFEFF'
      const csvContent = BOM + csvRows.join('\n')

      // Blob 생성 및 다운로드
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `강사_목록_${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      message.success(`${dataToExport.length}건의 데이터가 다운로드되었습니다.`)
    } catch (error) {
      console.error('다운로드 오류:', error)
      message.error('다운로드 중 오류가 발생했습니다.')
    }
  }

  // ID 찾기
  const handleFindId = (values: any) => {
    console.log('Find ID:', values)
    // TODO: 실제 ID 찾기 로직 구현
    message.success('ID 찾기 요청이 처리되었습니다. 이메일을 확인해주세요.')
    setFindIdModalOpen(false)
    findIdForm.resetFields()
  }

  // 비밀번호 찾기
  const handleFindPassword = (values: any) => {
    console.log('Find Password:', values)
    // TODO: 실제 비밀번호 찾기 로직 구현
    message.success('비밀번호 재설정 링크가 이메일로 전송되었습니다.')
    setFindPasswordModalOpen(false)
    findPasswordForm.resetFields()
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

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [statusFilter, regionFilter, typeFilter, nameSearch])

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredData.slice(startIndex, endIndex)
  }, [filteredData, currentPage, pageSize])

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
  ], [filteredData, selectedRowKeys])

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="admin-page">
      {viewMode === 'detail' && selectedInstructor ? (
        /* Detail View - Redesigned to match Create/Edit page */
        <div className="bg-slate-50 min-h-screen px-6 pt-0">
          {/* Sticky Header */}
          <DetailPageHeaderSticky
            onBack={handleBackToList}
          />

          {/* Main Content Container */}
          <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
            {/* Summary Card */}
            <InstructorSummaryCard
              instructorId={selectedInstructor.instructorId}
              name={selectedInstructor.name}
              account={selectedInstructor.account}
              status={selectedInstructor.status}
              registeredAt={selectedInstructor.registeredAt}
            />

            {/* Instructor Basic Info Section */}
            <DetailSectionCard title="강사 정보">
              <DefinitionListGrid
                items={[
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
                          ? 'bg-amber-100 text-amber-700'
                          : selectedInstructor.type === '일반'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-purple-100 text-purple-700'
                      }`}>
                        {selectedInstructor.type}
                      </span>
                    )
                  },
                  { 
                    label: '강사 카테고리 (2026년용)', 
                    value: selectedInstructor.category ? (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                        selectedInstructor.category === '신규강사'
                          ? 'bg-green-100 text-green-700'
                          : selectedInstructor.category === '재채용'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-orange-100 text-orange-700'
                      }`}>
                        {selectedInstructor.category}
                      </span>
                    ) : (
                      <span className="text-gray-400">미설정</span>
                    )
                  },
                  { label: '등록일시', value: selectedInstructor.registeredAt },
                ]}
              />
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
                    key: 'basic',
                    title: '기본 정보',
                    helperText: '강사의 기본 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Form.Item
                          label={
                            <span>
                              강사 ID <span className="text-red-500">*</span>
                            </span>
                          }
                          name="instructorId"
                          rules={[{ required: true, message: '강사 ID를 입력해주세요' }]}
                          className="mb-0"
                          help="강사 로그인에 사용할 ID입니다"
                        >
                          <Input placeholder="강사 ID를 입력하세요" className="h-11 rounded-xl" />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              강사명 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="name"
                          rules={[{ required: true, message: '강사명을 입력해주세요' }]}
                          className="mb-0"
                        >
                          <Input placeholder="강사명을 입력하세요" className="h-11 rounded-xl" />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              이메일 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="email"
                          rules={[{ required: true, message: '이메일을 입력해주세요' }]}
                          className="mb-0"
                        >
                          <Input placeholder="이메일을 입력하세요" className="h-11 rounded-xl" />
                        </Form.Item>
                        
                        <Form.Item
                          label="기본 비밀번호"
                          className="mb-0"
                          help="모든 강사는 동일한 기본 비밀번호로 생성됩니다. 첫 로그인 시 변경해야 합니다."
                        >
                          <Input 
                            value="Instructor@1234" 
                            disabled 
                            className="h-11 rounded-xl bg-gray-50" 
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              성별 <span className="text-red-500">*</span>
                            </span>
                          }
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

                        <Form.Item
                          label={
                            <span>
                              생년월일 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="birthDate"
                          rules={[{ required: true, message: '생년월일을 선택해주세요' }]}
                          className="mb-0"
                          normalize={(value) => {
                            if (value && dayjs.isDayjs(value)) {
                              return value.format('YYYY-MM-DD')
                            }
                            return value
                          }}
                          getValueProps={(value) => {
                            if (value && typeof value === 'string') {
                              return { value: dayjs(value) }
                            }
                            return { value: null }
                          }}
                        >
                          <DatePicker 
                            placeholder="생년월일을 선택하세요" 
                            className="h-11 rounded-xl w-full"
                            format="YYYY-MM-DD"
                            style={{ width: '100%' }}
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              강사 카테고리 <span className="text-red-500">*</span>
                              <span className="text-xs text-gray-500 ml-2">(2026년용)</span>
                            </span>
                          }
                          name="category"
                          rules={[{ required: true, message: '강사 카테고리를 선택해주세요' }]}
                          className="mb-0"
                          help="강사 수수료 차이에 사용됩니다"
                        >
                          <Select
                            placeholder="강사 카테고리를 선택하세요"
                            options={[
                              { value: '신규강사', label: '신규강사' },
                              { value: '재채용', label: '재채용' },
                              { value: '재고용', label: '재고용' },
                            ]}
                            className="h-11 rounded-xl"
                          />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: 'affiliation',
                    title: '소속/지역 정보',
                    helperText: '소속 및 지역 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Form.Item
                          label="소속"
                          name="affiliation"
                          className="mb-0"
                          help="선택 사항입니다. 미입력 시 '-'로 처리됩니다."
                        >
                          <Input placeholder="소속을 입력하세요 (선택사항)" className="h-11 rounded-xl" />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              지역(시/군) <span className="text-red-500">*</span>
                            </span>
                          }
                          name="region"
                          rules={[{ required: true, message: '지역을 선택해주세요' }]}
                          className="mb-0"
                          help="강사 배정 지역을 선택하세요"
                        >
                          <Select
                            placeholder="지역을 선택하세요"
                            onChange={handleRegionChange}
                            options={[
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
                              { value: '의정부시', label: '의정부시' },
                              { value: '광명시', label: '광명시' },
                              { value: '하남시', label: '하남시' },
                              { value: '오산시', label: '오산시' },
                              { value: '이천시', label: '이천시' },
                              { value: '구리시', label: '구리시' },
                              { value: '안성시', label: '안성시' },
                              { value: '포천시', label: '포천시' },
                              { value: '의왕시', label: '의왕시' },
                              { value: '양주시', label: '양주시' },
                              { value: '여주시', label: '여주시' },
                              { value: '양평군', label: '양평군' },
                              { value: '동두천시', label: '동두천시' },
                              { value: '과천시', label: '과천시' },
                              { value: '가평군', label: '가평군' },
                              { value: '연천군', label: '연천군' },
                            ]}
                            className="h-11 rounded-xl"
                          />
                        </Form.Item>

                        <Form.Item
                          label={
                            <span>
                              배정 권역 <span className="text-red-500">*</span>
                            </span>
                          }
                          name="assignmentZone"
                          rules={[{ required: true, message: '배정 권역을 선택해주세요' }]}
                          className="mb-0"
                          help="지역(시/군) 선택 시 자동으로 설정됩니다"
                        >
                          <Select
                            placeholder="배정 권역 (자동 설정)"
                            disabled
                            options={[
                              { value: '1권역', label: '1권역' },
                              { value: '2권역', label: '2권역' },
                              { value: '3권역', label: '3권역' },
                              { value: '4권역', label: '4권역' },
                              { value: '5권역', label: '5권역' },
                              { value: '6권역', label: '6권역' },
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
                          label={
                            <span>
                              도로명주소 <span className="text-red-500">*</span>
                            </span>
                          }
                          className="mb-0"
                        >
                          <Input.Group compact className="flex gap-2">
                            <Form.Item
                              name="address"
                              noStyle
                              rules={[{ required: true, message: '도로명주소를 입력해주세요' }]}
                            >
                              <Input 
                                placeholder="도로명주소를 검색하세요" 
                                className="h-11 rounded-xl flex-1" 
                                readOnly
                              />
                            </Form.Item>
                            <Button
                              type="default"
                              onClick={handleAddressSearch}
                              className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all whitespace-nowrap"
                            >
                              주소 검색
                            </Button>
                          </Input.Group>
                        </Form.Item>

                        <Form.Item
                          label="건물명/호수"
                          name="buildingDetails"
                          className="mb-0 md:col-span-2"
                        >
                          <Input placeholder="건물명/호수를 입력하세요" className="h-11 rounded-xl" />
                        </Form.Item>
                      </div>
                    ),
                  },
                  {
                    key: 'operation',
                    title: '운영 정보',
                    helperText: '운영 관련 정보를 입력하세요',
                    defaultOpen: true,
                    children: (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                        <Form.Item
                          label={
                            <span>
                              상태 <span className="text-red-500">*</span>
                            </span>
                          }
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
                          label={
                            <span>
                              강사 구분 <span className="text-red-500">*</span>
                            </span>
                          }
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
            <Space>
              <Button
                type="primary"
                icon={<Plus className="w-4 h-4" />}
                onClick={handleRegisterClick}
                className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                강사 등록
              </Button>
              <Button
                icon={<Download className="w-4 h-4" />}
                onClick={handleDownload}
                className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                다운로드
              </Button>
              <Button
                icon={<UserSearch className="w-4 h-4" />}
                onClick={() => setFindIdModalOpen(true)}
                className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                ID 찾기
              </Button>
              <Button
                icon={<Key className="w-4 h-4" />}
                onClick={() => setFindPasswordModalOpen(true)}
                className="h-11 px-4 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                비밀번호 찾기
              </Button>
            </Space>
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
                    
                    {/* Region Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">권역</label>
                      <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
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
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">유형</label>
                      <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
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

      {/* ID 찾기 모달 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <UserSearch className="w-5 h-5" />
            <span>ID 찾기</span>
          </div>
        }
        open={findIdModalOpen}
        onCancel={() => {
          setFindIdModalOpen(false)
          findIdForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={findIdForm}
          layout="vertical"
          onFinish={handleFindId}
          className="mt-4"
        >
          <Form.Item
            label="이메일"
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            ]}
          >
            <Input placeholder="등록된 이메일을 입력하세요" className="h-11 rounded-xl" />
          </Form.Item>
          <Form.Item
            label="강사명"
            name="name"
            rules={[{ required: true, message: '강사명을 입력해주세요' }]}
          >
            <Input placeholder="등록된 강사명을 입력하세요" className="h-11 rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => {
              setFindIdModalOpen(false)
              findIdForm.resetFields()
            }}>
              취소
            </Button>
            <Button type="primary" htmlType="submit" className="bg-slate-900 hover:bg-slate-800">
              찾기
            </Button>
          </div>
        </Form>
      </Modal>

      {/* 비밀번호 찾기 모달 */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5" />
            <span>비밀번호 찾기</span>
          </div>
        }
        open={findPasswordModalOpen}
        onCancel={() => {
          setFindPasswordModalOpen(false)
          findPasswordForm.resetFields()
        }}
        footer={null}
        width={500}
      >
        <Form
          form={findPasswordForm}
          layout="vertical"
          onFinish={handleFindPassword}
          className="mt-4"
        >
          <Form.Item
            label="ID (사용자명)"
            name="username"
            rules={[{ required: true, message: 'ID를 입력해주세요' }]}
          >
            <Input placeholder="등록된 ID를 입력하세요" className="h-11 rounded-xl" />
          </Form.Item>
          <Form.Item
            label="이메일"
            name="email"
            rules={[
              { required: true, message: '이메일을 입력해주세요' },
              { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
            ]}
          >
            <Input placeholder="등록된 이메일을 입력하세요" className="h-11 rounded-xl" />
          </Form.Item>
          <div className="flex justify-end gap-2 mt-6">
            <Button onClick={() => {
              setFindPasswordModalOpen(false)
              findPasswordForm.resetFields()
            }}>
              취소
            </Button>
            <Button type="primary" htmlType="submit" className="bg-slate-900 hover:bg-slate-800">
              비밀번호 재설정 링크 전송
            </Button>
          </div>
        </Form>
      </Modal>
      </div>
    </ProtectedRoute>
  )
}