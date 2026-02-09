'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  LayoutDashboard, 
  BookOpen, 
  GraduationCap, 
  Building2, 
  Settings,
  ChevronDown,
  Menu,
  User,
  LogOut,
  Save,
  Receipt,
  ShieldCheck,
  DollarSign,
} from 'lucide-react'
import { useLanguage } from '@/components/localization/LanguageContext'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Modal, Form, Input, Select, Button, Upload, message } from 'antd'
import { Upload as UploadIcon } from 'lucide-react'
import type { UploadFile } from 'antd/es/upload/interface'

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

const adminMenuConfig: MenuGroup[] = [
  {
    labelKey: 'sidebar.dashboard',
    icon: LayoutDashboard,
    items: [
      { labelKey: 'sidebar.overallStatus', href: '/admin' },
    ],
  },
  {
    labelKey: 'sidebar.educationOperations',
    icon: BookOpen,
    items: [
      { labelKey: 'sidebar.educationManagement', href: '/admin/operations' },
      { labelKey: 'sidebar.educationStatusChange', href: '/admin/education-status' },
    ],
  },
  {
    labelKey: 'sidebar.instructorAssignment',
    icon: GraduationCap,
    items: [
      { labelKey: 'sidebar.instructorApplication', href: '/admin/instructor-assignment/applications' },
      { labelKey: 'sidebar.instructorAllocation', href: '/admin/instructor-assignment/manual' },
      { labelKey: 'sidebar.teachingConfirmation', href: '/admin/instructor-assignment/confirmations' },
    ],
  },
  {
    labelKey: 'sidebar.referenceInfo',
    icon: Building2,
    items: [
      { labelKey: 'sidebar.institution', href: '/admin/institution' },
      { labelKey: 'sidebar.program', href: '/admin/program' },
      { labelKey: 'sidebar.instructor', href: '/admin/instructor' },
    ],
  },
  {
    labelKey: 'sidebar.settlementManagement',
    icon: DollarSign,
    items: [
      { labelKey: 'sidebar.instructorSettlement', href: '/admin/settlements/instructor' },
    ],
  },
  {
    labelKey: 'sidebar.systemManagement',
    icon: Settings,
    items: [
      { labelKey: 'sidebar.settings', href: '/admin/system' },
      { labelKey: 'sidebar.userManagement', href: '/admin/users' },
      { labelKey: 'sidebar.commonCode', href: '/admin/common-code' },
      { labelKey: 'sidebar.instructorApplicationPolicy', href: '/admin/policies/instructor-application', icon: ShieldCheck },
    ],
  },
]

interface AdminSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function AdminSidebar({ isCollapsed, setIsCollapsed }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { t, locale, setLocale } = useLanguage()
  const { userRole, userProfile, updateProfile, logout } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [hoveredGroup, setHoveredGroup] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountForm] = Form.useForm()
  const [signatureFileList, setSignatureFileList] = useState<UploadFile[]>([])
  
  // Convert image file to base64 URL
  const getBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }
  
  const handleSignatureUpload = async (file: File) => {
    try {
      const base64Url = await getBase64(file)
      updateProfile({ signatureImageUrl: base64Url })
      message.success(locale === 'ko' ? '서명이 업로드되었습니다.' : 'Signature uploaded successfully.')
      return false // Prevent default upload
    } catch (error) {
      message.error(locale === 'ko' ? '서명 업로드에 실패했습니다.' : 'Failed to upload signature.')
      return false
    }
  }

  // Only show admin sidebar if user is admin
  if (userRole !== 'admin') {
    return null
  }

  const isItemActive = (href: string) => pathname === href

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
    <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-white border-r border-gray-200 flex flex-col h-screen fixed left-0 top-0 z-40 transition-all duration-300 hidden md:flex`}>
      {/* Sidebar Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!isCollapsed ? (
          <>
            <h1 className="text-xl font-bold text-gray-900">{t('sidebar.title')}</h1>
            <button 
              onClick={toggleSidebar}
              className="p-1 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          </>
        ) : (
          <button 
            onClick={toggleSidebar}
            className="p-1 rounded-md text-gray-600 hover:text-[#ff8a65] hover:bg-gray-100 transition-colors w-full flex justify-center"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Scrollable Menu */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {adminMenuConfig.map((group) => {
            const GroupIcon = group.icon
            const isOpen = openGroups[group.labelKey] || group.items.some(item => isItemActive(item.href))
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
                  className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                >
                  <div className="flex items-center gap-3">
                    {GroupIcon && <GroupIcon className="w-5 h-5" />}
                    {!isCollapsed && <span className="font-medium">{t(group.labelKey)}</span>}
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
                                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <span>{t(item.labelKey)}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  ) : (
                    isGroupHovered && (
                      <div className="fixed left-20 ml-2 w-48 bg-white rounded-lg shadow-lg z-50 py-2 border border-gray-200">
                        {group.items.map((item) => {
                          const isActive = isItemActive(item.href)
                          
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors mx-2 ${
                                isActive
                                  ? 'bg-blue-50 text-blue-700 font-medium'
                                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                              }`}
                            >
                              <span>{t(item.labelKey)}</span>
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
      <div className="border-t border-gray-200 p-4">
        <div className="relative">
          <button
            className={`w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors ${
              isCollapsed ? 'justify-center' : ''
            }`}
            onClick={() => {
              setIsProfileOpen((prev) => !prev)
            }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
              KJ
            </div>
            {!isCollapsed && (
              <>
                <div className="flex-1 flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-gray-900 truncate w-full">
                    {locale === 'ko' ? '관리자' : 'Administrator'}
                  </span>
                  <span className="text-xs text-gray-500 truncate w-full">
                    {locale === 'ko' ? '경기미래채움 운영팀' : 'Gyeonggi Future Chimae Operations Team'}
                  </span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </>
            )}
          </button>

          {isProfileOpen && !isCollapsed && (
            <div className="absolute bottom-full left-0 mb-2 w-full rounded-2xl bg-white shadow-xl ring-1 ring-slate-200/50 overflow-hidden border border-slate-100">
              <div className="px-4 py-3 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="text-sm font-semibold text-slate-900">
                  {locale === 'ko' ? '관리자' : 'Administrator'}
                </div>
                <div className="text-xs text-slate-500 mt-0.5">admin@example.com</div>
              </div>
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setIsProfileModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{t('header.profile')}</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    accountForm.setFieldsValue({
                      name: userProfile?.name || (locale === 'ko' ? '관리자' : 'Administrator'),
                      email: userProfile?.email || 'admin@example.com',
                      phone: userProfile?.phone || '010-1234-5678',
                      language: locale,
                    })
                    // Set signature file list if signature exists
                    if (userProfile?.signatureImageUrl) {
                      setSignatureFileList([{
                        uid: '-1',
                        name: 'signature.png',
                        status: 'done',
                        url: userProfile.signatureImageUrl,
                      }])
                    } else {
                      setSignatureFileList([])
                    }
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
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-slate-50 transition-colors"
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
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
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
        footer={[
          <Button
            key="cancel"
            onClick={() => setIsAccountModalOpen(false)}
            className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700 hover:border-blue-600"
          >
            {locale === 'ko' ? '취소' : 'Cancel'}
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<Save className="w-4 h-4 text-white" />}
            onClick={() => {
              accountForm
                .validateFields()
                .then((values) => {
                  // Update profile with form values
                  updateProfile({
                    name: values.name,
                    phone: values.phone,
                  })
                  message.success(locale === 'ko' ? '계정 설정이 저장되었습니다.' : 'Account settings saved.')
                  setIsAccountModalOpen(false)
                })
                .catch(() => {})
            }}
            style={{
              color: 'white',
            }}
            className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
          >
            {locale === 'ko' ? '저장' : 'Save'}
          </Button>,
        ]}
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
          <Form.Item
            label={locale === 'ko' ? '서명 이미지' : 'Signature Image'}
            name="signature"
            extra={locale === 'ko' ? '출석부에 사용할 서명 이미지를 업로드하세요. (PNG 권장)' : 'Upload signature image for attendance sheets. (PNG recommended)'}
          >
            <Upload
              fileList={signatureFileList}
              beforeUpload={handleSignatureUpload}
              onRemove={() => {
                updateProfile({ signatureImageUrl: undefined })
                setSignatureFileList([])
                message.success(locale === 'ko' ? '서명이 삭제되었습니다.' : 'Signature removed.')
              }}
              accept="image/png,image/jpeg,image/jpg"
              maxCount={1}
              listType="picture-card"
            >
              {signatureFileList.length < 1 && (
                <div className="flex flex-col items-center justify-center">
                  <UploadIcon className="w-6 h-6 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">
                    {locale === 'ko' ? '서명 업로드' : 'Upload Signature'}
                  </span>
                </div>
              )}
            </Upload>
            {userProfile?.signatureImageUrl && (
              <div className="mt-2 p-2 border border-gray-200 rounded">
                <div className="text-xs text-gray-500 mb-1">{locale === 'ko' ? '현재 서명 미리보기:' : 'Current signature preview:'}</div>
                <img
                  src={userProfile.signatureImageUrl}
                  alt="서명"
                  className="max-w-full max-h-20 object-contain"
                />
              </div>
            )}
          </Form.Item>
        </Form>
      </Modal>
    </aside>
  )
}

