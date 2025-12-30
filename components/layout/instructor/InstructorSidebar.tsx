'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileCheck,
  Calendar,
  ChevronDown,
  Menu,
  BookOpen,
  ClipboardCheck,
  UserCheck,
  Play,
  CheckCircle,
  Clock,
  Settings,
  LogOut,
  User,
} from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Modal, Form, Input, Select } from 'antd'

interface MenuItem {
  labelKey: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  labelKey: string
  icon?: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const instructorMenuConfig: MenuGroup[] = [
  {
    labelKey: 'sidebar.dashboard',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'sidebar.myDashboard', href: '/instructor/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    labelKey: '출강 일정',
    icon: Calendar,
    items: [
      { labelKey: '내 출강 리스트', href: '/instructor/schedule/list', icon: Calendar },
      { labelKey: '확정된 수업 조회', href: '/instructor/schedule/confirmed', icon: FileCheck },
      { labelKey: '진행 중인 교육', href: '/instructor/schedule/in-progress', icon: Play },
      { labelKey: '완료된 교육', href: '/instructor/schedule/completed', icon: CheckCircle },
    ],
  },
  {
    labelKey: '출강 신청',
    icon: BookOpen,
    items: [
      { labelKey: '오픈 예정 교육', href: '/instructor/apply/upcoming', icon: Clock },
      { labelKey: '출강 신청하기', href: '/instructor/apply/open', icon: ClipboardCheck },
      { labelKey: '내가 신청한 교육들', href: '/instructor/apply/mine', icon: UserCheck },
    ],
  },
]

interface InstructorSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function InstructorSidebar({ isCollapsed, setIsCollapsed }: InstructorSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useLanguage()
  const { userRole, logout } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountForm] = Form.useForm()

  // Only show instructor sidebar if user is instructor
  if (userRole !== 'instructor') {
    return null
  }

  // Track active item - only one can be active at a time
  const getActiveItem = () => {
    for (const group of instructorMenuConfig) {
      for (const item of group.items) {
        if (pathname === item.href) {
          return item.href
        }
      }
    }
    return null
  }

  const activeItem = getActiveItem()
  const isItemActive = (href: string) => activeItem === href

  const toggleGroup = (labelKey: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [labelKey]: !prev[labelKey]
    }))
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-slate-900">
              <span className="text-slate-900">SWA</span> <span className="text-blue-600">미래채움</span>
            </h1>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors w-full flex justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {instructorMenuConfig.map((group) => {
            const GroupIcon = group.icon
            const hasActiveItem = group.items.some(item => isItemActive(item.href))
            const isOpen = openGroups[group.labelKey] || hasActiveItem
            const isGroupHovered = hoveredGroup === group.labelKey
            
            return (
              <li 
                key={group.labelKey} 
                className="mb-1"
                onMouseEnter={() => !isCollapsed && setHoveredGroup(group.labelKey)}
                onMouseLeave={() => !isCollapsed && setHoveredGroup(null)}
              >
                {/* Group Header */}
                <button
                  onClick={() => {
                    if (isCollapsed) {
                      setIsCollapsed(false)
                      setOpenGroups(prev => ({
                        ...prev,
                        [group.labelKey]: true
                      }))
                    } else {
                      toggleGroup(group.labelKey)
                    }
                  }}
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                >
                  <div className="flex items-center gap-3">
                    {GroupIcon && <GroupIcon className="w-5 h-5" />}
                    {!isCollapsed && (
                      <span className="font-medium">
                        {group.labelKey.startsWith('sidebar.') ? t(group.labelKey) : group.labelKey}
                      </span>
                    )}
                  </div>
                  {!isCollapsed && (
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                  )}
                </button>

                {/* Group Items */}
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isCollapsed 
                    ? (isGroupHovered ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
                    : (isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')
                }`}>
                  {!isCollapsed ? (
                    <ul className="mt-1 space-y-1 pl-11 pb-2">
                      {group.items.map((item) => {
                        const isActive = isItemActive(item.href)
                        
                        return (
                          <li key={item.href}>
                            <Link
                              href={item.href}
                              className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-medium hover:bg-blue-600 hover:text-white'
                                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span>{item.labelKey.startsWith('sidebar.') ? t(item.labelKey) : item.labelKey}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    isGroupHovered && (
                      <div className="fixed left-20 ml-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2 border border-slate-200">
                        {group.items.map((item) => {
                          const isActive = isItemActive(item.href)
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors mx-2 ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                              }`}
                            >
                              <span>{item.labelKey.startsWith('sidebar.') ? t(item.labelKey) : item.labelKey}</span>
                            </Link>
                          )
                        })}
                      </div>
                    )
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section at Bottom */}
      <div className="border-t border-slate-200 p-4">
        <div className="relative">
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            onClick={() => {
              setIsProfileOpen((prev) => !prev)
            }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              홍
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-slate-900 truncate w-full">
                    {locale === 'ko' ? '홍길동' : 'Hong Gildong'}
                  </span>
                  <span className="text-xs text-slate-500 truncate w-full">
                    {locale === 'ko' ? '강사' : 'Instructor'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {isProfileOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-lg bg-white shadow-lg ring-1 ring-black/5 overflow-hidden border border-slate-200">
              <div className="px-4 py-3 border-b border-slate-100">
                <div className="text-sm font-semibold text-slate-900">
                  {locale === 'ko' ? '홍길동' : 'Hong Gildong'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">instructor@example.com</div>
              </div>
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    setIsProfileModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  onClick={() => {
                    accountForm.setFieldsValue({
                      name: locale === 'ko' ? '홍길동' : 'Hong Gildong',
                      email: 'instructor@example.com',
                      phone: '010-1234-5678',
                      language: locale,
                    })
                    setIsAccountModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 text-slate-400" />
                  <span>{locale === 'ko' ? '계정 설정' : 'Account Settings'}</span>
                </button>
              </div>
              <div className="border-t border-slate-100">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    logout()
                    router.push('/login')
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>{locale === 'ko' ? '로그아웃' : 'Logout'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        title={locale === 'ko' ? '프로필 정보' : 'Profile Information'}
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
        centered
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-lg font-semibold">
            홍
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900">
              {locale === 'ko' ? '홍길동' : 'Hong Gildong'}
            </span>
            <span className="text-sm text-slate-500">instructor@example.com</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">
              {locale === 'ko' ? '역할' : 'Role'}
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
              {locale === 'ko' ? '강사' : 'Instructor'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">
              {locale === 'ko' ? '소속' : 'Affiliation'}
            </div>
            <div className="text-sm font-medium text-slate-900">
              {locale === 'ko' ? '경기미래채움' : 'Gyeonggi Future Chimae'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">
              {locale === 'ko' ? '연락처' : 'Contact'}
            </div>
            <div className="text-sm font-medium text-slate-900">010-1234-5678</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-slate-500">
              {locale === 'ko' ? '언어' : 'Language'}
            </div>
            <div className="text-sm font-medium text-slate-900">
              {locale === 'ko' ? '한국어' : 'English'}
            </div>
          </div>
        </div>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        title={locale === 'ko' ? '계정 설정' : 'Account Settings'}
        open={isAccountModalOpen}
        onCancel={() => setIsAccountModalOpen(false)}
        okText={locale === 'ko' ? '저장' : 'Save'}
        cancelText={locale === 'ko' ? '취소' : 'Cancel'}
        onOk={() => {
          accountForm
            .validateFields()
            .then((values) => {
              console.log('Account settings:', values)
              setIsAccountModalOpen(false)
            })
            .catch(() => {})
        }}
        centered
      >
        <Form
          form={accountForm}
          layout="vertical"
          requiredMark={false}
          className="pt-2"
        >
          <Form.Item
            label={locale === 'ko' ? '이름' : 'Name'}
            name="name"
            rules={[{ required: true, message: locale === 'ko' ? '이름을 입력해주세요' : 'Please enter your name' }]}
          >
            <Input className="h-10 rounded-lg" />
          </Form.Item>
          <Form.Item
            label="Email"
            name="email"
            rules={[{ required: true, message: locale === 'ko' ? '이메일을 입력해주세요' : 'Please enter your email' }]}
          >
            <Input className="h-10 rounded-lg" disabled />
          </Form.Item>
          <Form.Item
            label={locale === 'ko' ? '전화번호' : 'Phone Number'}
            name="phone"
          >
            <Input className="h-10 rounded-lg" />
          </Form.Item>
          <Form.Item
            label={locale === 'ko' ? '인터페이스 언어' : 'Interface Language'}
            name="language"
          >
            <Select
              className="h-10 rounded-lg"
              options={[
                { value: 'ko', label: '한국어' },
                { value: 'en', label: 'English' },
              ]}
              onChange={(value) => setLocale(value as 'ko' | 'en')}
            />
          </Form.Item>
          <Form.Item
            label={locale === 'ko' ? '새 비밀번호' : 'New Password'}
            name="password"
          >
            <Input.Password className="h-10 rounded-lg" placeholder={locale === 'ko' ? '변경 시에만 입력하세요' : 'Enter only when changing'} />
          </Form.Item>
          <Form.Item
            label={locale === 'ko' ? '새 비밀번호 확인' : 'Confirm New Password'}
            name="passwordConfirm"
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error(locale === 'ko' ? '비밀번호가 일치하지 않습니다' : 'Passwords do not match'))
                },
              }),
            ]}
          >
            <Input.Password className="h-10 rounded-lg" />
          </Form.Item>
        </Form>
      </Modal>
    </aside>
  )
}

