'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Card, Form, Select, Space, Switch, Tabs, Modal } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Save, Trash2, RotateCcw, Eye, UserPlus, ArrowLeft, Search, Filter, X } from 'lucide-react'
import { CommonCodePage } from '@/components/admin/common-code'

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

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'users' | 'common-code'>('settings')
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [detailTab, setDetailTab] = useState<'basic' | 'permissions'>('basic')
  const [userModalOpen, setUserModalOpen] = useState(false)
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [settingsForm] = Form.useForm()
  
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

  // Settings state
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [smsNotifications, setSmsNotifications] = useState(false)
  const [autoBackup, setAutoBackup] = useState(true)

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

  const handleSettingsSubmit = (values: any) => {
    console.log('Settings values:', values)
    // Handle settings save
  }


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
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
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
            className="h-8 px-3 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white text-slate-700 transition-colors"
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

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedKeys: React.Key[]) => {
      setSelectedRowKeys(selectedKeys)
    },
  }

  return (
    <div className="p-6">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
      </div>

      {/* Tabs */}
      <Card className="rounded-xl shadow-sm border border-gray-200">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => setActiveTab(key as 'settings' | 'users')}
          className="[&_.ant-tabs-nav]:mb-0 [&_.ant-tabs-tab]:px-6 [&_.ant-tabs-tab]:h-12 [&_.ant-tabs-tab-btn]:text-base [&_.ant-tabs-content-holder]:pt-6"
          items={[
            {
              key: 'settings',
              label: '시스템 설정',
              children: (
            <div className="pt-6">
              <Form
                form={settingsForm}
                layout="vertical"
                onFinish={handleSettingsSubmit}
                className="max-w-3xl"
              >
                {/* 일반 설정 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">일반 설정</h3>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => settingsForm.submit()}
                      className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      저장
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Form.Item label="시스템 언어" className="mb-0">
                      <Select
                        defaultValue="ko"
                        options={[
                          { value: 'ko', label: '한국어' },
                          { value: 'en', label: 'English' },
                        ]}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                    <Form.Item label="시간대" className="mb-0">
                      <Select
                        defaultValue="Asia/Seoul"
                        options={[
                          { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
                          { value: 'UTC', label: 'UTC' },
                        ]}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                    <Form.Item label="날짜 형식" className="mb-0">
                      <Select
                        defaultValue="YYYY.MM.DD"
                        options={[
                          { value: 'YYYY.MM.DD', label: 'YYYY.MM.DD' },
                          { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                          { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                        ]}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* 알림 설정 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">알림 설정</h3>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => settingsForm.submit()}
                      className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      저장
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-base font-medium text-gray-900">이메일 알림</div>
                        <div className="text-sm text-gray-500">중요한 알림을 이메일로 받습니다</div>
                      </div>
                      <Switch
                        checked={emailNotifications}
                        onChange={setEmailNotifications}
                        className="[&_.ant-switch-checked]:bg-blue-600"
                      />
                    </div>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-base font-medium text-gray-900">SMS 알림</div>
                        <div className="text-sm text-gray-500">긴급 알림을 SMS로 받습니다</div>
                      </div>
                      <Switch
                        checked={smsNotifications}
                        onChange={setSmsNotifications}
                        className="[&_.ant-switch-checked]:bg-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* 백업 설정 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">백업 설정</h3>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => settingsForm.submit()}
                      className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      저장
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-base font-medium text-gray-900">자동 백업</div>
                        <div className="text-sm text-gray-500">매일 자동으로 데이터를 백업합니다</div>
                      </div>
                      <Switch
                        checked={autoBackup}
                        onChange={setAutoBackup}
                        className="[&_.ant-switch-checked]:bg-blue-600"
                      />
                    </div>
                    <Form.Item label="백업 주기" className="mb-0">
                      <Select
                        defaultValue="daily"
                        options={[
                          { value: 'daily', label: '매일' },
                          { value: 'weekly', label: '매주' },
                          { value: 'monthly', label: '매월' },
                        ]}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                  </div>
                </div>

                {/* 보안 설정 */}
                <div className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900">보안 설정</h3>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => settingsForm.submit()}
                      className="h-9 px-4 rounded-xl border-0 font-medium text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      저장
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Form.Item label="세션 타임아웃 (분)" className="mb-0">
                      <Input
                        type="number"
                        defaultValue="30"
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                    <Form.Item label="비밀번호 최소 길이" className="mb-0">
                      <Input
                        type="number"
                        defaultValue="8"
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                      <div>
                        <div className="text-base font-medium text-gray-900">2단계 인증 필수</div>
                        <div className="text-sm text-gray-500">모든 사용자에게 2단계 인증을 요구합니다</div>
                      </div>
                      <Switch className="[&_.ant-switch-checked]:bg-blue-600" />
                    </div>
                  </div>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                  <Button
                    onClick={() => settingsForm.resetFields()}
                    className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                  >
                    초기화
                  </Button>
                  <Button
                    type="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => settingsForm.submit()}
                    className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  >
                    저장
                  </Button>
                </div>
              </Form>
            </div>
              ),
            },
            {
              key: 'users',
              label: '사용자 관리',
              children: (
            <div className="pt-6">
              {viewMode === 'list' && (
                <>
              {/* Search and Table Card */}
              <Card className="rounded-xl shadow-sm border border-gray-200">
                {/* Search Toolbar */}
                <div className="flex items-center h-16 px-4 py-3 border-b border-gray-200 gap-3">
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
                  <div className="relative w-full max-w-[420px]">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400 z-10" />
                    <Input
                      placeholder="검색어를 입력하세요..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      onPressEnter={handleSearch}
                      className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition hover:border-slate-300 focus:border-slate-300 focus:ring-2 focus:ring-slate-300 [&_.ant-input]:!h-11 [&_.ant-input]:!px-0 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input]:!text-sm [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-wrapper]:!bg-transparent [&_.ant-input-clear-icon]:!text-slate-400"
                    />
                  </div>
                  
                  {/* Filter Button with Dropdown - Right Side */}
                  <div className="relative ml-auto" ref={filterDropdownRef}>
                    <Button
                      icon={<Filter className="w-4 h-4" />}
                      onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
                      className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-blue-600 hover:text-white font-medium transition-all flex items-center gap-2 text-slate-700"
                    >
                      필터
                      <ChevronRight className={`w-4 h-4 transition-transform ${filterDropdownOpen ? 'rotate-90' : ''}`} />
                    </Button>
                    
                    {/* Filter Dropdown */}
                    {filterDropdownOpen && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-lg z-50 p-4">
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
                  dataSource={filteredUsers}
                  rowSelection={rowSelection}
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
                  }}
                  rowKey="key"
                  scroll={{ x: 'max-content' }}
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-table-tbody>tr]:border-b [&_.ant-table-tbody>tr]:border-gray-100 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#3b82f6] [&_.ant-pagination-item-active]:!bg-[#3b82f6] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
                />
              </Card>
                </>
              )}
              
              {viewMode === 'detail' && selectedUser && (
                /* Detail View */
                <div className="space-y-6">
                  {/* Top actions */}
                  <div className="flex flex-col gap-3">
                    <div className="rounded-2xl bg-white border border-gray-200 shadow-sm p-5 md:p-6 flex flex-col gap-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center px-3 py-1 text-xs font-semibold text-gray-700 bg-gray-100 rounded-full">
                          {selectedUser.userId}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          roleStyle[selectedUser.role]?.bg || 'bg-gray-50'
                        } ${roleStyle[selectedUser.role]?.text || 'text-gray-700'}`}>
                          {selectedUser.role}
                        </span>
                        <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full ${
                          statusStyle[selectedUser.status]?.bg || 'bg-gray-50'
                        } ${statusStyle[selectedUser.status]?.text || 'text-gray-700'}`}>
                          {selectedUser.status}
                        </span>
                      </div>

                      <div className="flex flex-col gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 leading-tight">{selectedUser.name}</h2>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">이메일</span>
                            <span className="text-gray-900 font-medium">{selectedUser.email}</span>
                          </div>
                          {selectedUser.phone && (
                            <>
                              <div className="h-4 w-px bg-gray-200" />
                              <div className="flex items-center gap-1">
                                <span className="text-gray-500">전화번호</span>
                                <span className="text-gray-900 font-medium">{selectedUser.phone}</span>
                              </div>
                            </>
                          )}
                          <div className="h-4 w-px bg-gray-200" />
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500">부서</span>
                            <span className="text-gray-900 font-medium">{selectedUser.department}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-2 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                              detailTab === 'basic'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white'
                            }`}
                            onClick={() => setDetailTab('basic')}
                          >
                            기본 정보
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                              detailTab === 'permissions'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:bg-blue-600 hover:text-white'
                            }`}
                            onClick={() => setDetailTab('permissions')}
                          >
                            권한 정보
                          </span>
                        </div>
                        <Button
                          type="primary"
                          onClick={handleEditFromDetail}
                          className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white"
                    style={{
                      background: '#0f172a',
                      borderColor: 'transparent',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                      color: '#ffffff',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#1e293b'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = '#0f172a'
                    }}
                        >
                          수정하기
                        </Button>
                      </div>
                    </div>
                  </div>

                  {detailTab === 'basic' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <h3 className="text-lg font-semibold text-slate-900">기본 정보</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4 px-6 py-6">
                        {[
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
                        ].map((item) => (
                          <div key={item.label} className="space-y-1">
                            <div className="text-sm font-semibold text-gray-500">{item.label}</div>
                            <div className="text-base font-medium text-gray-900">{item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {detailTab === 'permissions' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                          <h3 className="text-lg font-semibold text-slate-900">권한 정보</h3>
                        </div>
                      </div>
                      <div className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                            selectedUser.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200"
                              >
                                {permission}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-gray-500">권한이 없습니다.</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* User Registration/Edit Modal */}
              <Modal
                open={userModalOpen}
                onCancel={handleBackToList}
                footer={null}
                width={800}
                className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-slate-200"
                title={
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-slate-900">
                      {formMode === 'create' ? '사용자 등록' : '사용자 수정'}
                    </h3>
                    <Button
                      type="text"
                      icon={<X className="w-4 h-4" />}
                      onClick={handleBackToList}
                      className="h-8 w-8 p-0"
                    />
                  </div>
                }
              >
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleFormSubmit}
                  className="mt-4"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label="이름"
                      name="name"
                      rules={[{ required: true, message: '이름을 입력해주세요' }]}
                      className="mb-0"
                    >
                      <Input placeholder="이름을 입력하세요" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label="이메일"
                      name="email"
                      rules={[
                        { required: true, message: '이메일을 입력해주세요' },
                        { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                      ]}
                      className="mb-0"
                    >
                      <Input placeholder="이메일을 입력하세요" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label="전화번호"
                      name="phone"
                      className="mb-0"
                    >
                      <Input placeholder="전화번호를 입력하세요" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label="역할"
                      name="role"
                      rules={[{ required: true, message: '역할을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="역할을 선택하세요"
                        options={roleOptions.filter(opt => opt.value !== 'all')}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>

                    <Form.Item
                      label="부서"
                      name="department"
                      rules={[{ required: true, message: '부서를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <Input placeholder="부서를 입력하세요" className="h-11 rounded-xl" />
                    </Form.Item>

                    <Form.Item
                      label="상태"
                      name="status"
                      rules={[{ required: true, message: '상태를 선택해주세요' }]}
                      className="mb-0"
                    >
                      <Select
                        placeholder="상태를 선택하세요"
                        options={statusOptions.filter(opt => opt.value !== 'all')}
                        className="h-11 rounded-xl"
                      />
                    </Form.Item>
                  </div>

                  <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-6">
                    <Button
                      icon={<X className="w-4 h-4" />}
                      onClick={handleBackToList}
                      className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
                    >
                      취소
                    </Button>
                    <Button
                      type="primary"
                      icon={<Save className="w-4 h-4" />}
                      onClick={() => form.submit()}
                      className="h-11 px-6 rounded-xl border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    >
                      {formMode === 'create' ? '등록하기' : '저장하기'}
                    </Button>
                  </div>
                </Form>
              </Modal>
            </div>
              ),
            },
            {
              key: 'common-code',
              label: 'Common Code',
              children: (
                <div className="pt-6">
                  <CommonCodePage />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

