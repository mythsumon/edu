'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Form, Input, Button, message } from 'antd'
import { Save, User } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { teacherProfileStore } from '@/lib/teacherStore'
import type { TeacherProfile } from '@/lib/teacherStore'

export default function TeacherProfilePage() {
  const { userProfile, updateProfile } = useAuth()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        name: userProfile.name,
        email: userProfile.email,
        phone: userProfile.phone || '',
      })
    }
  }, [userProfile, form])

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()

      // Update auth context
      updateProfile({
        name: values.name,
        phone: values.phone,
      })

      // Update teacher profile store
      const teacherProfile: TeacherProfile = {
        teacherId: userProfile?.userId || 'teacher-1',
        name: values.name,
        email: values.email,
        phone: values.phone,
        institutionId: 'INST-001', // TODO: Get from actual profile
        institutionName: '평택안일초등학교', // TODO: Get from actual profile
        signatureImageUrl: userProfile?.signatureImageUrl,
      }
      teacherProfileStore.set(teacherProfile)

      message.success('프로필이 저장되었습니다.')
    } catch (error) {
      console.error('Failed to save profile:', error)
      message.error('프로필 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              내 정보
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              프로필 정보를 확인하고 수정하세요.
            </p>
          </div>

          {/* Profile Form */}
          <Card className="rounded-xl">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSave}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <User className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {userProfile?.name || '학교선생님'}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {userProfile?.email || 'teacher@example.com'}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Form.Item
                  label="이름"
                  name="name"
                  rules={[{ required: true, message: '이름을 입력해주세요' }]}
                >
                  <Input placeholder="이름" />
                </Form.Item>
                <Form.Item
                  label="이메일"
                  name="email"
                  rules={[
                    { required: true, message: '이메일을 입력해주세요' },
                    { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                  ]}
                >
                  <Input type="email" placeholder="email@example.com" disabled />
                </Form.Item>
                <Form.Item
                  label="전화번호"
                  name="phone"
                  rules={[{ required: true, message: '전화번호를 입력해주세요' }]}
                >
                  <Input placeholder="010-1234-5678" />
                </Form.Item>
                <Form.Item label="학교(기관)">
                  <Input value="평택안일초등학교" disabled />
                </Form.Item>
              </div>

              <Form.Item className="mt-6">
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  loading={loading}
                  size="large"
                >
                  저장하기
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
