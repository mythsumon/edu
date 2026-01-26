'use client'

export const dynamic = 'force-dynamic'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Table, Button, Card, Form, Select, Space, Switch, Modal, Input, Checkbox } from 'antd'
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

export default function SystemSettingsPage() {
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
      <div className="admin-page p-4 md:p-6">
      {/* System Settings */}
      <Card className="rounded-2xl shadow-lg border border-slate-200 dark:border-gray-700 bg-gradient-to-br from-white to-slate-50/50 dark:from-gray-800 dark:to-gray-800 transition-colors">
        <div className="pt-6">
              <Form
                form={settingsForm}
                layout="vertical"
                onFinish={handleSettingsSubmit}
                className="max-w-4xl mx-auto"
              >
                {/* 일반 설정 */}
                <div className="mb-8">
                  <Card className="rounded-2xl border border-slate-200 dark:border-gray-700 shadow-sm bg-white dark:bg-gray-800 overflow-hidden transition-colors">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-700 dark:to-gray-700 px-6 py-4 border-b border-slate-200 dark:border-gray-600">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg">
                            <Save className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">일반 설정</h3>
                        </div>
                        <Button
                          type="primary"
                          icon={<Save className="w-4 h-4 text-white" />}
                          onClick={() => settingsForm.submit()}
                          style={{
                            color: 'white',
                          }}
                          className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
                        >
                          저장
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">시스템 언어</span>} className="mb-0">
                        <Select
                          defaultValue="ko"
                          options={[
                            { value: 'ko', label: '한국어' },
                            { value: 'en', label: 'English' },
                          ]}
                          className="h-11 rounded-xl [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:hover:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
                        />
                      </Form.Item>
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">시간대</span>} className="mb-0">
                        <Select
                          defaultValue="Asia/Seoul"
                          options={[
                            { value: 'Asia/Seoul', label: 'Asia/Seoul (KST)' },
                            { value: 'UTC', label: 'UTC' },
                          ]}
                          className="h-11 rounded-xl [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:hover:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
                        />
                      </Form.Item>
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">날짜 형식</span>} className="mb-0">
                        <Select
                          defaultValue="YYYY.MM.DD"
                          options={[
                            { value: 'YYYY.MM.DD', label: 'YYYY.MM.DD' },
                            { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
                            { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
                          ]}
                          className="h-11 rounded-xl [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:hover:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
                        />
                      </Form.Item>
                    </div>
                  </Card>
                </div>


                {/* 백업 설정 */}
                <div className="mb-8">
                  <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg">
                            <Save className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">백업 설정</h3>
                        </div>
                        <Button
                          type="primary"
                          icon={<Save className="w-4 h-4 text-white" />}
                          onClick={() => settingsForm.submit()}
                          style={{
                            color: 'white',
                          }}
                          className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
                        >
                          저장
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100 hover:shadow-md transition-all">
                        <div>
                          <div className="text-base font-semibold text-slate-900 mb-1">자동 백업</div>
                          <div className="text-sm text-slate-600">매일 자동으로 데이터를 백업합니다</div>
                        </div>
                        <Switch
                          checked={autoBackup}
                          onChange={setAutoBackup}
                          className="[&_.ant-switch-checked]:bg-blue-600 [&_.ant-switch]:min-w-[44px] [&_.ant-switch]:h-6"
                        />
                      </div>
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">백업 주기</span>} className="mb-0">
                        <Select
                          defaultValue="daily"
                          options={[
                            { value: 'daily', label: '매일' },
                            { value: 'weekly', label: '매주' },
                            { value: 'monthly', label: '매월' },
                          ]}
                          className="h-11 rounded-xl [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:hover:border-blue-400 [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
                        />
                      </Form.Item>
                    </div>
                  </Card>
                </div>

                {/* 보안 설정 */}
                <div className="mb-8">
                  <Card className="rounded-2xl border border-slate-200 shadow-sm bg-white overflow-hidden">
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg">
                            <Save className="w-5 h-5 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900">보안 설정</h3>
                        </div>
                        <Button
                          type="primary"
                          icon={<Save className="w-4 h-4 text-white" />}
                          onClick={() => settingsForm.submit()}
                          style={{
                            color: 'white',
                          }}
                          className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
                        >
                          저장
                        </Button>
                      </div>
                    </div>
                    <div className="p-6 space-y-4">
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">세션 타임아웃 (분)</span>} className="mb-0">
                        <Input
                          type="number"
                          defaultValue="30"
                          className="h-11 rounded-xl border-2 border-slate-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                        />
                      </Form.Item>
                      <Form.Item label={<span className="text-sm font-semibold text-slate-700">비밀번호 최소 길이</span>} className="mb-0">
                        <Input
                          type="number"
                          defaultValue="8"
                          className="h-11 rounded-xl border-2 border-slate-200 hover:border-blue-400 focus:border-blue-500 transition-colors"
                        />
                      </Form.Item>
                      <div className="flex items-center justify-between p-5 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl border border-orange-100 hover:shadow-md transition-all">
                        <div>
                          <div className="text-base font-semibold text-slate-900 mb-1">2단계 인증 필수</div>
                          <div className="text-sm text-slate-600">모든 사용자에게 2단계 인증을 요구합니다</div>
                        </div>
                        <Switch className="[&_.ant-switch-checked]:bg-blue-600 [&_.ant-switch]:min-w-[44px] [&_.ant-switch]:h-6" />
                      </div>
                    </div>
                  </Card>
                </div>

                {/* 저장 버튼 */}
                <div className="flex justify-end gap-3 pt-6 border-t border-slate-200 mt-8">
                  <Button
                    onClick={() => settingsForm.resetFields()}
                    className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white hover:border-blue-600 font-medium transition-all text-slate-700"
                  >
                    초기화
                  </Button>
                  <Button
                    type="primary"
                    icon={<Save className="w-4 h-4 text-white" />}
                    onClick={() => settingsForm.submit()}
                    style={{
                      color: 'white',
                    }}
                    className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
                  >
                    전체 저장
                  </Button>
                </div>
              </Form>
        </div>
      </Card>
      </div>
    </div>
  )
}

