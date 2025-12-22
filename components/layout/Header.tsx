'use client'

import { Bell, User, Languages, LogOut, Settings, ChevronDown, Circle, Globe, Sun, Moon } from 'lucide-react'
import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Modal, Form, Input, Select } from 'antd'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Breadcrumb } from '@/components/shared/common'

// Admin menu config
const adminMenuConfig = [
  {
    labelKey: 'sidebar.dashboard',
    items: [
      { labelKey: 'sidebar.overallStatus', href: '/admin' },
    ],
  },
  {
    labelKey: 'sidebar.educationOperations',
    items: [
      { labelKey: 'sidebar.educationManagement', href: '/admin/operations' },
    ],
  },
  {
    labelKey: 'sidebar.instructorAssignment',
    items: [
      { labelKey: 'sidebar.instructorApplication', href: '/admin/instructor-assignment/applications' },
      { labelKey: 'sidebar.instructorAllocation', href: '/admin/instructor-assignment/manual' },
      { labelKey: 'sidebar.teachingConfirmation', href: '/admin/instructor-assignment/confirmations' },
    ],
  },
  {
    labelKey: 'sidebar.referenceInfo',
    items: [
      { labelKey: 'sidebar.institution', href: '/admin/institution' },
      { labelKey: 'sidebar.program', href: '/admin/program' },
      { labelKey: 'sidebar.instructor', href: '/admin/instructor' },
    ],
  },
  {
    labelKey: 'sidebar.systemManagement',
    items: [
      { labelKey: 'sidebar.settings', href: '/admin/system' },
      { labelKey: 'sidebar.systemSettings', href: '/admin/system/settings' },
    ],
  },
]

// Instructor menu config
const instructorMenuConfig = [
  {
    labelKey: 'sidebar.dashboard',
    items: [
      { labelKey: 'sidebar.myDashboard', href: '/instructor/dashboard' },
    ],
  },
  {
    labelKey: 'sidebar.educationManagement',
    items: [
      { labelKey: 'sidebar.educationApplication', href: '/instructor/application' },
      { labelKey: 'sidebar.educationAssignment', href: '/instructor/assignment' },
      { labelKey: 'sidebar.teachingConfirmation', href: '/instructor/confirmation' },
    ],
  },
]

export function Header() {
  const router = useRouter()
  const pathname = usePathname()
  const { locale, setLocale, t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountForm] = Form.useForm()

  // Get current page title based on pathname
  const getPageTitle = () => {
    // Check admin menu
    for (const group of adminMenuConfig) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return t(item.labelKey)
        }
      }
    }
    
    // Check instructor menu
    for (const group of instructorMenuConfig) {
      for (const item of group.items) {
        if (item.href === pathname) {
          return t(item.labelKey)
        }
      }
    }
    
    // Default title
    return t('header.title')
  }

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: '신규 강사 신청',
      description: '홍길동 강사가 강사 신청서를 제출했습니다.',
      time: '5분 전',
      read: false,
    },
    {
      id: 2,
      title: '교육 일정 변경',
      description: '12차시 블록코딩 교육의 일정이 수정되었습니다.',
      time: '1시간 전',
      read: false,
    },
    {
      id: 3,
      title: '시스템 알림',
      description: '일부 데이터가 업데이트되었습니다.',
      time: '어제',
      read: true,
    },
  ])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })))
  }

  const toggleLanguage = () => {
    setLocale(locale === 'ko' ? 'en' : 'ko')
  }

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-20 dark:bg-gray-800 dark:border-gray-700">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{getPageTitle()}</h1>
        <Breadcrumb className="mb-0" />
      </div>
      <div className="flex items-center gap-4">
        {/* Theme toggle */}
        <button 
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
          aria-label={theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
        >
          {theme === 'light' ? (
            <Moon className="w-5 h-5" />
          ) : (
            <Sun className="w-5 h-5" />
          )}
        </button>

        {/* Language toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700"
        >
          {locale === 'ko' ? 'KO' : 'EN'}
          <Globe className="w-4 h-4" />
        </button>

        {/* Notification dropdown */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev)
              setIsProfileOpen(false)
            }}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-[10px] font-semibold text-white shadow-sm">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden dark:bg-gray-800 dark:ring-gray-700">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between dark:border-gray-700">
                <div>
                  <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('header.notifications')}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {locale === 'ko' 
                      ? '최근 시스템 및 신청 관련 알림입니다.' 
                      : 'Recent system and application related notifications.'}
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {locale === 'ko' 
                      ? `새 알림 ${unreadCount}건` 
                      : `${unreadCount} new notifications`}
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-700">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors dark:hover:bg-gray-700/50 ${
                      !item.read ? 'bg-red-50/40 dark:bg-red-900/20' : ''
                    }`}
                    onClick={() => {
                      setNotifications(notifications.map(n => 
                        n.id === item.id ? { ...n, read: true } : n
                      ))
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item.read ? (
                        <Circle className="w-3 h-3 text-gray-300 dark:text-gray-600" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium line-clamp-1 ${
                        !item.read ? 'text-gray-900 dark:text-gray-100' : 'text-gray-600 dark:text-gray-400'
                      }`}>{item.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500 line-clamp-2 dark:text-gray-400">{item.description}</div>
                      <div className="mt-1 text-[11px] text-gray-400 dark:text-gray-500">{item.time}</div>
                    </div>
                  </button>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                    {locale === 'ko' ? '새로운 알림이 없습니다.' : 'No new notifications.'}
                  </div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between dark:border-gray-700 dark:bg-gray-800/50">
                <button className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  {locale === 'ko' ? '알림 설정' : 'Notification Settings'}
                </button>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {locale === 'ko' ? '모두 읽음' : 'Mark all as read'}
                    </button>
                  )}
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                    {locale === 'ko' ? '전체 알림 보기' : 'View all notifications'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:border-gray-600"
            onClick={() => {
              setIsProfileOpen((prev) => !prev)
              setIsNotificationOpen(false)
            }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              KJ
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {locale === 'ko' ? '관리자' : 'Administrator'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {locale === 'ko' ? '경기미래채움 운영팀' : 'Gyeonggi Future Chimae Operations Team'}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden dark:bg-gray-800 dark:ring-gray-700">
              <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {locale === 'ko' ? '관리자' : 'Administrator'}
                </div>
                <div className="text-xs text-gray-500 mt-0.5 dark:text-gray-400">admin@example.com</div>
              </div>
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  onClick={() => {
                    setIsProfileModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <User className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700/50"
                  onClick={() => {
                    accountForm.setFieldsValue({
                      name: locale === 'ko' ? '관리자' : 'Administrator',
                      email: 'admin@example.com',
                      phone: '010-1234-5678',
                      language: locale,
                    })
                    setIsAccountModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  <span>{locale === 'ko' ? '계정 설정' : 'Account Settings'}</span>
                </button>
              </div>
              <div className="border-t border-gray-100 dark:border-gray-700">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                  onClick={() => {
                    // TODO: 실제 로그아웃 로직 연동 (토큰/세션 삭제 등)
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
            KJ
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-gray-900">
              {locale === 'ko' ? '관리자' : 'Administrator'}
            </span>
            <span className="text-sm text-gray-500">admin@example.com</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">
              {locale === 'ko' ? '역할' : 'Role'}
            </div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300">
              {locale === 'ko' ? '시스템 관리자' : 'System Administrator'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">
              {locale === 'ko' ? '소속' : 'Affiliation'}
            </div>
            <div className="text-sm font-medium text-gray-900">
              {locale === 'ko' ? '경기미래채움 운영팀' : 'Gyeonggi Future Chimae Operations Team'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">
              {locale === 'ko' ? '연락처' : 'Contact'}
            </div>
            <div className="text-sm font-medium text-gray-900">010-1234-5678</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">
              {locale === 'ko' ? '언어' : 'Language'}
            </div>
            <div className="text-sm font-medium text-gray-900">
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
    </header>
  )
}