'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  GraduationCap, 
  FileCheck,
  ClipboardList,
  User,
  Settings,
  LogOut,
  Bell,
} from 'lucide-react'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { Modal, Form, Input, Button, message } from 'antd'

interface MenuItem {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}

interface MenuGroup {
  label: string
  icon?: React.ComponentType<{ className?: string }>
  items: MenuItem[]
}

const teacherMenuConfig: MenuGroup[] = [
  {
    label: '대시보드',
    icon: LayoutDashboard,
    items: [
      { label: '대시보드', href: '/teacher/dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: '수업 관리',
    icon: GraduationCap,
    items: [
      { label: '내 학교 수업 목록', href: '/teacher/classes', icon: GraduationCap },
    ],
  },
  {
    label: '출석부',
    icon: FileCheck,
    items: [
      { label: '출석부 서명/확인', href: '/teacher/attendance-sign', icon: FileCheck },
    ],
  },
  {
    label: '요청함',
    icon: Bell,
    items: [
      { label: '강사 요청', href: '/teacher/requests', icon: ClipboardList },
    ],
  },
  {
    label: '설정',
    icon: Settings,
    items: [
      { label: '내 정보', href: '/teacher/profile', icon: User },
    ],
  },
]

interface TeacherSidebarProps {
  isCollapsed: boolean
  setIsCollapsed: (collapsed: boolean) => void
}

export function TeacherSidebar({ isCollapsed, setIsCollapsed }: TeacherSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, userProfile } = useAuth()
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({})
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [profileForm] = Form.useForm()

  const toggleGroup = (groupLabel: string) => {
    setOpenGroups(prev => ({
      ...prev,
      [groupLabel]: !prev[groupLabel],
    }))
  }

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  const handleProfileUpdate = (values: any) => {
    // TODO: Update profile
    message.success('프로필이 업데이트되었습니다.')
    setIsProfileModalOpen(false)
  }

  const isActive = (href: string) => {
    if (href === '/teacher/dashboard') {
      return pathname === href
    }
    return pathname?.startsWith(href)
  }

  return (
    <>
      <aside
        className={`fixed left-0 top-0 h-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 z-40 ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            {!isCollapsed && (
              <div className="flex items-center gap-2">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                <span className="font-bold text-lg text-gray-900 dark:text-gray-100">학교 선생님</span>
              </div>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isCollapsed ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                )}
              </svg>
            </button>
          </div>

          {/* Menu */}
          <nav className="flex-1 overflow-y-auto p-4">
            {teacherMenuConfig.map((group, groupIndex) => (
              <div key={groupIndex} className="mb-6">
                {!isCollapsed && (
                  <div className="flex items-center gap-2 mb-3 px-2">
                    {group.icon && (
                      <group.icon className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                    )}
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.label}
                    </span>
                  </div>
                )}
                <div className="space-y-1">
                  {group.items.map((item, itemIndex) => {
                    const active = isActive(item.href)
                    const Icon = item.icon
                    return (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                          active
                            ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        {Icon && <Icon className="w-5 h-5 flex-shrink-0" />}
                        {!isCollapsed && (
                          <span className="text-sm font-medium">{item.label}</span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-4">
            {!isCollapsed && userProfile && (
              <div className="mb-3">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                      {userProfile.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {userProfile.email}
                    </p>
                  </div>
                </div>
                <Button
                  type="text"
                  size="small"
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full text-left text-xs text-gray-600 dark:text-gray-400"
                >
                  프로필 수정
                </Button>
              </div>
            )}
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors ${
                isCollapsed ? 'justify-center' : ''
              }`}
            >
              <LogOut className="w-5 h-5" />
              {!isCollapsed && <span className="text-sm font-medium">로그아웃</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Profile Modal */}
      <Modal
        title="프로필 수정"
        open={isProfileModalOpen}
        onCancel={() => setIsProfileModalOpen(false)}
        footer={null}
      >
        <Form
          form={profileForm}
          layout="vertical"
          onFinish={handleProfileUpdate}
          initialValues={userProfile || {}}
        >
          <Form.Item label="이름" name="name">
            <Input />
          </Form.Item>
          <Form.Item label="이메일" name="email">
            <Input type="email" />
          </Form.Item>
          <Form.Item label="전화번호" name="phone">
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              저장
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}
