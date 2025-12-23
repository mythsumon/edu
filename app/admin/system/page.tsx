'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo } from 'react'
import { Table, Button, Card, Form, Select, Space, Switch, Tabs } from 'antd'
import { Input } from '@/components/shared/common'
import type { ColumnsType } from 'antd/es/table'
import { ChevronRight, Save, Trash2, RotateCcw, Eye, UserPlus, ArrowLeft, Search } from 'lucide-react'

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
  관리자: { bg: 'bg-red-50', text: 'text-red-700' },
  운영자: { bg: 'bg-blue-50', text: 'text-blue-700' },
  사용자: { bg: 'bg-gray-50', text: 'text-gray-700' },
}

const statusStyle: Record<string, { bg: string; text: string }> = {
  활성: { bg: 'bg-green-50', text: 'text-green-700' },
  비활성: { bg: 'bg-gray-50', text: 'text-gray-700' },
}

export default function SystemSettingsPage() {
  const [activeTab, setActiveTab] = useState<'settings' | 'users'>('settings')
  const [viewMode, setViewMode] = useState<'list' | 'register' | 'detail'>('list')
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create')
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null)
  const [detailTab, setDetailTab] = useState<'basic' | 'permissions'>('basic')
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [form] = Form.useForm()
  const [settingsForm] = Form.useForm()
  
  // Filters
  const [searchText, setSearchText] = useState<string>('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')

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
    setViewMode('register')
    setFormMode('create')
    form.resetFields()
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
  }

  const handleFormSubmit = (values: any) => {
    console.log('Form values:', values)
    // Handle form submission
    handleBackToList()
  }

  const handleEditFromDetail = () => {
    if (!selectedUser) return
    setViewMode('register')
    setFormMode('edit')
    form.setFieldsValue({
      name: selectedUser.name,
      email: selectedUser.email,
      phone: selectedUser.phone,
      role: selectedUser.role,
      department: selectedUser.department,
      status: selectedUser.status,
    })
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
        const config = roleStyle[role] || { bg: 'bg-gray-50', text: 'text-gray-700' }
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
        const config = statusStyle[status] || { bg: 'bg-gray-50', text: 'text-gray-700' }
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
      title: '상세',
      key: 'action',
      width: 90,
      fixed: 'right' as const,
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
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">일반 설정</h3>
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
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">알림 설정</h3>
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
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">백업 설정</h3>
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
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">보안 설정</h3>
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
                    className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                  >
                    초기화
                  </Button>
                  <Button
                    type="primary"
                    icon={<Save className="w-4 h-4" />}
                    onClick={() => settingsForm.submit()}
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
              {viewMode === 'list' ? (
                <>
              {/* Modern Search Toolbar */}
              <div className="flex items-center h-16 px-4 py-3 bg-white border border-[#ECECF3] rounded-2xl shadow-[0_8px_24px_rgba(15,15,30,0.06)] mb-4 gap-3 flex-wrap">
                {/* Search Input - Primary, flex-grow */}
                <div className="flex-1 min-w-[200px]">
                  <div className="relative h-11 rounded-xl bg-white border border-[#E6E6EF] transition-all duration-200">
                    <Input
                      placeholder="Search by name, email, or user ID..."
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                      onPressEnter={handleSearch}
                      prefix={<Search className="w-4 h-4 text-[#9AA0AE]" />}
                      className="h-11 border-0 bg-transparent rounded-xl text-[#151827] placeholder:text-[#9AA0AE] [&_.ant-input]:!h-11 [&_.ant-input]:!px-4 [&_.ant-input]:!py-0 [&_.ant-input]:!bg-transparent [&_.ant-input]:!border-0 [&_.ant-input]:!outline-none [&_.ant-input]:!shadow-none [&_.ant-input-wrapper]:!border-0 [&_.ant-input-wrapper]:!shadow-none [&_.ant-input-prefix]:!mr-2"
                    />
                  </div>
                </div>
                
                {/* Role Filter */}
                <div className="w-[220px]">
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
                <div className="w-[220px]">
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

              {/* Table Card */}
              <Card className="rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm text-gray-600">
                    총 <span className="font-semibold text-gray-900">{filteredUsers.length}</span>건
                  </div>
                  <Space>
                    <Button
                      type="primary"
                      icon={<UserPlus className="w-4 h-4" />}
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
                      + 사용자 등록
                    </Button>
                    {selectedRowKeys.length > 0 && (
                      <Button
                        danger
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => {
                          console.log('Delete users:', selectedRowKeys)
                          setSelectedRowKeys([])
                        }}
                        className="h-11 px-6 rounded-xl font-medium transition-all"
                      >
                        삭제 ({selectedRowKeys.length})
                      </Button>
                    )}
                  </Space>
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
                  className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:sticky [&_.ant-table-thead>tr>th]:top-0 [&_.ant-table-thead>tr>th]:z-10 [&_.ant-pagination]:!mt-4 [&_.ant-pagination]:!mb-0 [&_.ant-pagination-item]:!rounded-lg [&_.ant-pagination-item]:!border-[#E6E6EF] [&_.ant-pagination-item]:!h-9 [&_.ant-pagination-item]:!min-w-[36px] [&_.ant-pagination-item-active]:!border-[#ff8a65] [&_.ant-pagination-item-active]:!bg-[#ff8a65] [&_.ant-pagination-item-active>a]:!text-white [&_.ant-pagination-prev]:!rounded-lg [&_.ant-pagination-prev]:!border-[#E6E6EF] [&_.ant-pagination-next]:!rounded-lg [&_.ant-pagination-next]:!border-[#E6E6EF] [&_.ant-pagination-options]:!ml-4 [&_.ant-select-selector]:!rounded-lg [&_.ant-select-selector]:!border-[#E6E6EF] [&_.ant-pagination-total-text]:!text-[#151827] [&_.ant-pagination-total-text]:!mr-4"
                />
              </Card>
                </>
              ) : viewMode === 'detail' && selectedUser ? (
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
                        <h2 className="text-2xl md:text-3xl font-bold text-[#3a2e2a] leading-tight">{selectedUser.name}</h2>
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
                                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
                            }`}
                            onClick={() => setDetailTab('basic')}
                          >
                            기본 정보
                          </span>
                          <span
                            className={`inline-flex items-center rounded-full px-4 h-9 border cursor-pointer transition-colors ${
                              detailTab === 'permissions'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-white border-gray-200 text-gray-800 hover:bg-gray-50'
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
                      </div>
                    </div>
                  </div>

                  {detailTab === 'basic' && (
                    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
                      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500" />
                          <h3 className="text-lg font-semibold text-[#3a2e2a]">기본 정보</h3>
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
                          <h3 className="text-lg font-semibold text-[#3a2e2a]">권한 정보</h3>
                        </div>
                      </div>
                      <div className="px-6 py-6">
                        <div className="flex flex-wrap gap-2">
                          {selectedUser.permissions && selectedUser.permissions.length > 0 ? (
                            selectedUser.permissions.map((permission, index) => (
                              <span
                                key={index}
                                className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200"
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
              ) : (
                /* Register/Edit View */
                <div className="space-y-6">
                  {/* Form Card */}
                  <Card className="rounded-2xl shadow-sm border border-gray-200">
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={handleFormSubmit}
                      className="max-w-2xl"
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

                      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
                        <Button
                          icon={<ArrowLeft className="w-4 h-4" />}
                          onClick={handleBackToList}
                          className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
                        >
                          취소
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
                          {formMode === 'create' ? '등록하기' : '저장하기'}
                        </Button>
                      </div>
                    </Form>
                  </Card>
                </div>
              )}
            </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

