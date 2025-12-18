'use client'

import { Bell, User, Languages, LogOut, Settings, ChevronDown, Circle, Globe } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Modal, Form, Input, Select } from 'antd'
import { useLanguage } from '@/components/localization/LanguageContext'

export function Header() {
  const router = useRouter()
  const { locale, setLocale, t } = useLanguage()
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false)
  const [accountForm] = Form.useForm()

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
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 relative z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">{t('header.title')}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Language toggle */}
        <button 
          onClick={toggleLanguage}
          className="flex items-center gap-2 h-8 px-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
        >
          {locale === 'ko' ? 'KO' : 'EN'}
          <Globe className="w-4 h-4" />
        </button>

        {/* Notification dropdown */}
        <div className="relative">
          <button
            className="relative flex items-center justify-center w-9 h-9 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
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
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-gray-900">알림</div>
                  <div className="text-xs text-gray-500">최근 시스템 및 신청 관련 알림입니다.</div>
                </div>
                {unreadCount > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-blue-50 text-xs font-medium text-blue-700">
                    새 알림 {unreadCount}건
                  </span>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                {notifications.map((item) => (
                  <button
                    key={item.id}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                      !item.read ? 'bg-red-50/40' : ''
                    }`}
                    onClick={() => {
                      setNotifications(notifications.map(n => 
                        n.id === item.id ? { ...n, read: true } : n
                      ))
                    }}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {item.read ? (
                        <Circle className="w-3 h-3 text-gray-300" />
                      ) : (
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium line-clamp-1 ${
                        !item.read ? 'text-gray-900' : 'text-gray-600'
                      }`}>{item.title}</div>
                      <div className="mt-0.5 text-xs text-gray-500 line-clamp-2">{item.description}</div>
                      <div className="mt-1 text-[11px] text-gray-400">{item.time}</div>
                    </div>
                  </button>
                ))}
                {notifications.length === 0 && (
                  <div className="px-4 py-6 text-center text-sm text-gray-500">새로운 알림이 없습니다.</div>
                )}
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                <button className="text-xs text-gray-500 hover:text-gray-700">알림 설정</button>
                <div className="flex items-center gap-3">
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllAsRead}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      모두 읽음
                    </button>
                  )}
                  <button className="text-xs font-medium text-blue-600 hover:text-blue-700">전체 알림 보기</button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Profile dropdown */}
        <div className="relative">
          <button
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-full transition-colors border border-transparent hover:border-gray-200"
            onClick={() => {
              setIsProfileOpen((prev) => !prev)
              setIsNotificationOpen(false)
            }}
          >
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-semibold">
              KJ
            </div>
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-medium text-gray-900">관리자</span>
              <span className="text-xs text-gray-500">경기미래채움 운영팀</span>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white shadow-lg ring-1 ring-black/5 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="text-sm font-semibold text-gray-900">관리자</div>
                <div className="text-xs text-gray-500 mt-0.5">admin@example.com</div>
              </div>
              <div className="py-1">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    setIsProfileModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>프로필 보기</span>
                </button>
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  onClick={() => {
                    accountForm.setFieldsValue({
                      name: '관리자',
                      email: 'admin@example.com',
                      phone: '010-1234-5678',
                      language: locale === 'ko' ? 'ko' : 'en',
                    })
                    setIsAccountModalOpen(true)
                    setIsProfileOpen(false)
                  }}
                >
                  <Settings className="w-4 h-4 text-gray-400" />
                  <span>계정 설정</span>
                </button>
              </div>
              <div className="border-t border-gray-100">
                <button
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                  onClick={() => {
                    // TODO: 실제 로그아웃 로직 연동 (토큰/세션 삭제 등)
                    router.push('/login')
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Modal */}
      <Modal
        title="프로필 정보"
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
            <span className="text-base font-semibold text-gray-900">관리자</span>
            <span className="text-sm text-gray-500">admin@example.com</span>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">역할</div>
            <div className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
              시스템 관리자
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">소속</div>
            <div className="text-sm font-medium text-gray-900">경기미래채움 운영팀</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">연락처</div>
            <div className="text-sm font-medium text-gray-900">010-1234-5678</div>
          </div>
          <div className="space-y-1">
            <div className="text-xs font-semibold text-gray-500">언어</div>
            <div className="text-sm font-medium text-gray-900">{locale === 'ko' ? '한국어' : 'English'}</div>
          </div>
        </div>
      </Modal>

      {/* Account Settings Modal */}
      <Modal
        title="계정 설정"
        open={isAccountModalOpen}
        onCancel={() => setIsAccountModalOpen(false)}
        okText="저장"
        cancelText="취소"
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
            label="이름"
            name="name"
            rules={[{ required: true, message: '이름을 입력해주세요' }]}
          >
            <Input className="h-10 rounded-lg" />
          </Form.Item>
          <Form.Item
            label="이메일"
            name="email"
            rules={[{ required: true, message: '이메일을 입력해주세요' }]}
          >
            <Input className="h-10 rounded-lg" disabled />
          </Form.Item>
          <Form.Item
            label="전화번호"
            name="phone"
          >
            <Input className="h-10 rounded-lg" />
          </Form.Item>
          <Form.Item
            label="인터페이스 언어"
            name="language"
          >
            <Select
              className="h-10 rounded-lg"
              options={[
                { value: 'ko', label: '한국어' },
                { value: 'en', label: 'English' },
              ]}
            />
          </Form.Item>
          <Form.Item
            label="새 비밀번호"
            name="password"
          >
            <Input.Password className="h-10 rounded-lg" placeholder="변경 시에만 입력하세요" />
          </Form.Item>
          <Form.Item
            label="새 비밀번호 확인"
            name="passwordConfirm"
            dependencies={['password']}
            rules={[
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve()
                  }
                  return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
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