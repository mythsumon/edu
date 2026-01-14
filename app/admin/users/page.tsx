'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Table, Button, Card, Form, Select, Space, Modal, Input, Checkbox } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Save, Trash2, RotateCcw, Eye, UserPlus, ArrowLeft, Search, Filter, X } from 'lucide-react'
import { 
  DetailPageHeaderSticky,
  UserSummaryCard,
  DetailSectionCard,
  DefinitionListGrid
} from '@/components/admin/operations'

const { TextArea } = Input

interface UserItem {
  key: string
  userId: string
  name: string
  email: string
  phone?: string
  role: string
  department: string
  status: string
  lastLogin: string
  createdAt: string
  permissions?: string[]
}

const dummyUsers: UserItem[] = [
  {
    key: '1',
    userId: 'USER-001',
    name: '홍길동',
    email: 'hong@example.com',
    phone: '010-1234-5678',
    role: '관리자',
    department: '시스템 관리팀',
    status: '활성',
    lastLogin: '2025.01.15 14:30',
    createdAt: '2024.01.10',
    permissions: ['교육 관리', '사용자 관리', '시스템 설정'],
  },
  {
    key: '2',
    userId: 'USER-002',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-2345-6789',
    role: '운영자',
    department: '교육 운영팀',
    status: '활성',
    lastLogin: '2025.01.15 10:20',
    createdAt: '2024.02.15',
    permissions: ['교육 관리', '강사 관리'],
  },
  {
    key: '3',
    userId: 'USER-003',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-3456-7890',
    role: '사용자',
    department: '교육 기획팀',
    status: '비활성',
    lastLogin: '2025.01.10 09:15',
    createdAt: '2024.03.20',
    permissions: ['교육 조회'],
  },
]

const roleOptions = [
  { value: 'all', label: '전체' },
  { value: '관리자', label: '관리자' },
  { value: '운영자', label: '운영자' },
  { value: '사용자', label: '사용자' },
]

const statusOptions = [
  { value: 'all', label: '전체' },
  { value: '활성', label: '활성' },
  { value: '비활성', label: '비활성' },
]

const roleStyle: Record<string, { bg: string; text: string }> = {
  관리자: { bg: 'bg-blue-100', text: 'text-blue-700' },
  운영자: { bg: 'bg-blue-100', text: 'text-blue-700' },
  사용자: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  활성: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  비활성: { bg: 'bg-slate-100', text: 'text-slate-600' },
}

export default function UserManagementPage() {
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [detailTab, setDetailTab] = useState<'basic' | 'permissions'>('basic')
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  
  // Filters
  const [searchText, setSearchText] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
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

  const handleResetFilters = () => {
    setSearchText('')
    setRoleFilter('all')
    setStatusFilter('all')
  }
  
  const handleSearch = () => {
    setCurrentPage(1)
  }

  const filteredUsers = useMemo(() => {
    return dummyUsers.filter((item) => {
      const searchLower = searchText.toLowerCase()
      const matchesSearch = !searchText || 
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.userId.toLowerCase().includes(searchLower)
      const matchesRole = roleFilter === 'all' || item.role === roleFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchText, roleFilter, statusFilter])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchText, roleFilter, statusFilter])

  // Paginated data
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return filteredUsers.slice(startIndex, endIndex)
  }, [filteredUsers, currentPage, pageSize])

  const handleRegisterClick = () => {
    setFormMode('create')
    setSelectedUser(null)
    form.resetFields()
    setUserModalOpen(true)
  }

  const handleViewDetail = (record: UserItem) => {
    setSelectedUser(record)
    setViewMode('detail')
    setDetailTab('basic')
  }

  const handleBackToList = () => {
    setViewMode('list')
    form.resetFields()
    setSelectedUser(null)
    setUserModalOpen(false)
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    // Handle form submission
    handleBackToList()
  }

  const handleEditFromDetail = () => {
    if (!selectedUser) return
    setFormMode('edit')
    form.setFieldsValue({
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      role: selectedUser.role,
      department: selectedUser.department,
      status: selectedUser.status,
    })
    setUserModalOpen(true)
  }

  const handleEditUser = (record: UserItem) => {
    setSelectedUser(record)
    setFormMode('edit')
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      phone: record.phone,
      role: record.role,
      department: record.department,
      status: record.status,
    })
    setUserModalOpen(true)
  }

  const columns: ColumnsType<UserItem> = [
    {
      title: (
        <Checkbox
          checked={selectedRowKeys.length > 0 && selectedRowKeys.length === filteredUsers.length}
          indeterminate={selectedRowKeys.length > 0 && selectedRowKeys.length < filteredUsers.length}
          onChange={(e: any) => {
            if (e.target.checked) {
              setSelectedRowKeys(filteredUsers.map(item => item.key))
            } else {
              setSelectedRowKeys([])
            }
          }}
        />
      ),
      key: 'selection',
      width: 50,
      fixed: 'left' as const,
      render: (_, record) => (
        <Checkbox
          checked={selectedRowKeys.includes(record.key)}
          onChange={(e: any) => {
            e.stopPropagation()
            if (e.target.checked) {
              setSelectedRowKeys([...selectedRowKeys, record.key])
            } else {
              setSelectedRowKeys(selectedRowKeys.filter(key => key !== record.key))
            }
          }}
          onClick={(e: any) => {
            e.stopPropagation()
          }}
        />
      ),
    },
    {
      title: '사용자ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '이름',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '이메일',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '역할',
      dataIndex: 'role',
      key: 'role',
      width: 120,
      render: (role: string) => {
        const config = roleStyle[role] || { bg: 'bg-slate-100', text: 'text-slate-600' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {role}
          </span>
        )
      },
    },
    {
      title: '부서',
      dataIndex: 'department',
      key: 'department',
      width: 150,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const config = statusStyle[status] || { bg: 'bg-slate-100', text: 'text-slate-600' }
        return (
          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
            {status}
          </span>
        )
      },
    },
    {
      title: '최종 로그인',
      dataIndex: 'lastLogin',
      key: 'lastLogin',
      width: 180,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: '가입일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 120,
      render: (text: string) => <span className="text-base font-medium text-gray-900">{text}</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right' as const,
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            icon={<Eye className="w-3 h-3" />}
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-slate-700 hover:text-white text-slate-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleViewDetail(record)
            }}
          >
            상세
          </Button>
          <Button
            size="small"
            icon={<Save className="w-3 h-3" />}
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-slate-700 hover:text-white text-slate-700 transition-colors"
            onClick={(e) => {
              e.stopPropagation()
              handleEditUser(record)
            }}
          >
            수정
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="admin-page p-4 md:p-6">
          {viewMode === 'list' && (
            <>
              {/* Search and Table Card */}
              <Card className="rounded-2xl shadow-lg border border-slate-200 bg-white">
                {/* Search Toolbar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center h-auto sm:h-16 px-4 md:px-6 py-4 border-b border-slate-200 gap-3">
                  {/* Add User Button */}
                  <Button
                    type="primary"
                    icon={<UserPlus className="w-4 h-4" />}
                    onClick={handleRegisterClick}
                    className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    사용자 추가
                  </Button>
                  
                  {/* Search Input - Left Side */}
                  <div className="w-full sm:max-w-[420px]">
                    <Input
                      placeholder="검색어를 입력하세요..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      onPressEnter={handleSearch}
                      prefix={<Search className="h-5 w-5 text-slate-400" />}
                      className="admin-search-input h-11 w-full rounded-xl border-2 border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 transition hover:border-blue-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-400"
                    />
                  </div>
                  
                  {/* Filter Button with Dropdown - Right Side */}
                  <div className="relative ml-auto w-full sm:w-auto" ref={filterDropdownRef}>
                    <Button
                      icon={<Filter className="w-4 h-4" />}
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                      className="h-11 px-6 rounded-xl border-2 border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-medium transition-all flex items-center gap-2 text-slate-700"
                    >
                      필터
                      <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                    </Button>
                    
                    {/* Filter Dropdown */}
                    {filterDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border-2 border-slate-200 rounded-xl shadow-xl z-50 p-4">
                        <div className="space-y-4">
                          {/* Role Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">역할</label>
                            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                              <Select
                                placeholder="ALL ROLES"
                                value={roleFilter === 'all' ? undefined : roleFilter}
                                onChange={(value) => setRoleFilter(value || 'all')}
                                options={roleOptions.filter((opt) => opt.value !== 'all')}
                                className="w-full [&_.ant-select-selector]:!h-11 [&_.ant-select-selector]:!border-0 [&_.ant-select-selector]:!bg-transparent [&_.ant-select-selector]:!rounded-xl [&_.ant-select-selector]:!shadow-none [&_.ant-select-selector]:!px-4 [&_.ant-select-selection-item]:!text-[#151827] [&_.ant-select-selection-item]:!font-medium [&_.ant-select-selection-placeholder]:!text-[#9AA0AE]"
                                suffixIcon={<ChevronRight className="w-4 h-4 text-[#9AA0AE] rotate-90" />}
                              />
                            </div>
                          </div>
                          
                          {/* Status Filter */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">상태</label>
                            <div className="h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200 hover:border-[#D3D3E0]">
                              <Select
                                placeholder="ALL STATUS"
                                value={statusFilter === 'all' ? undefined : statusFilter}
                                onChange={(value) => setStatusFilter(value || 'all')}
                                options={statusOptions.filter((opt) => opt.value !== 'all')}
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
                  dataSource={paginatedUsers}
                  onRow={(record) => ({
                    onClick: () => handleViewDetail(record),
                    className: 'cursor-pointer hover:bg-gray-50',
                  })}
                  pagination={{
                    current: currentPage,
                    pageSize: pageSize,
                    total: filteredUsers.length,
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
                  className="overflow-x-auto [&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-slate-100 [&_.ant-table-tbody>tr]:hover:bg-blue-50/50 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
                />
              </Card>
            </>
          )}
          
          {viewMode === 'detail' && selectedUser ? (
            /* Detail View - Redesigned to match other detail pages */
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 -mx-6 -mt-6 px-6 pt-0">
              {/* Sticky Header */}
              <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 md:py-4">
                <DetailPageHeaderSticky
                  onBack={handleBackToList}
                  onEdit={handleEditFromDetail}
                />
              </div>

              {/* Main Content Container */}
              <div className="max-w-7xl mx-auto pt-6 pb-12 space-y-6">
                {/* Summary Card */}
                <UserSummaryCard
                  userId={selectedUser.userId}
                  name={selectedUser.name}
                  email={selectedUser.email}
                  role={selectedUser.role}
                  status={selectedUser.status}
                  department={selectedUser.department}
                  phone={selectedUser.phone}
                />

                {/* Tab Navigation */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-2 inline-flex gap-2">
                  <button
                    onClick={() => setDetailTab('basic')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      detailTab === 'basic'
                        ? 'bg-slate-800 text-white shadow-lg scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    기본 정보
                  </button>
                  <button
                    onClick={() => setDetailTab('permissions')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      detailTab === 'permissions'
                        ? 'bg-slate-800 text-white shadow-lg scale-105'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    권한 정보
                  </button>
                </div>

                {/* Basic Info Section */}
                {detailTab === 'basic' && (
                  <DetailSectionCard title="기본 정보">
                    <DefinitionListGrid
                      items={[
                        { label: '사용자ID', value: selectedUser.userId },
                        { label: '이름', value: selectedUser.name },
                        { label: '이메일', value: selectedUser.email },
                        { label: '전화번호', value: selectedUser.phone || '-' },
                        {
                          label: '역할',
                          value: (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              roleStyle[selectedUser.role]?.bg || 'bg-gray-50'
                            } ${roleStyle[selectedUser.role]?.text || 'text-gray-700'}`}>
                              {selectedUser.role}
                            </span>
                          ),
                        },
                        { label: '부서', value: selectedUser.department },
                        {
                          label: '상태',
                          value: (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                              statusStyle[selectedUser.status]?.bg || 'bg-gray-50'
                            } ${statusStyle[selectedUser.status]?.text || 'text-gray-700'}`}>
                              {selectedUser.status}
                            </span>
                          ),
                        },
                        { label: '최종 로그인', value: selectedUser.lastLogin },
                        { label: '가입일', value: selectedUser.createdAt },
                      ]}
                    />
                  </DetailSectionCard>
                )}

                {/* Permissions Section */}
                {detailTab === 'permissions' && (
                  <DetailSectionCard title="권한 정보">
                    <div className="space-y-2">
                      {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                        selectedUser.permissions.map((permission, index) => (
                          <div key={index} className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                            <span className="text-sm font-medium text-slate-900">{permission}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-sm text-slate-500">권한이 없습니다.</div>
                      )}
                    </div>
                  </DetailSectionCard>
                )}
              </div>
            </div>
          ) : null}

          {/* User Modal */}
          <Modal
            title={formMode === 'create' ? '사용자 추가' : '사용자 수정'}
            open={userModalOpen}
            onCancel={handleBackToList}
            footer={null}
            width={600}
            centered
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={handleFormSubmit}
              className="pt-4"
            >
              <Form.Item
                label="이름"
                name="name"
                rules={[{ required: true, message: '이름을 입력해주세요' }]}
              >
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item
                label="이메일"
                name="email"
                rules={[{ required: true, message: '이메일을 입력해주세요' }, { type: 'email', message: '올바른 이메일 형식이 아닙니다' }]}
              >
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item
                label="전화번호"
                name="phone"
              >
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item
                label="역할"
                name="role"
                rules={[{ required: true, message: '역할을 선택해주세요' }]}
              >
                <Select
                  className="h-11 rounded-xl"
                  options={roleOptions.filter((opt) => opt.value !== 'all')}
                />
              </Form.Item>
              <Form.Item
                label="부서"
                name="department"
                rules={[{ required: true, message: '부서를 입력해주세요' }]}
              >
                <Input className="h-11 rounded-xl" />
              </Form.Item>
              <Form.Item
                label="상태"
                name="status"
                rules={[{ required: true, message: '상태를 선택해주세요' }]}
              >
                <Select
                  className="h-11 rounded-xl"
                  options={statusOptions.filter((opt) => opt.value !== 'all')}
                />
              </Form.Item>
              <div className="flex justify-end gap-3 pt-6 border-t-2 border-slate-200 mt-8">
                <Button
                  icon={<X className="w-4 h-4" />}
                  onClick={handleBackToList}
                  className="h-11 px-6 rounded-xl border-2 border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-medium transition-all text-slate-700"
                >
                  취소
                </Button>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4 text-white" />}
                  onClick={() => form.submit()}
                  style={{
                    color: 'white',
                  }}
                  className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
                >
                  {formMode === 'create' ? '등록하기' : '저장하기'}
                </Button>
              </div>
            </Form>
          </Modal>
        </div>
      </div>
    </ProtectedRoute>
  )
}
