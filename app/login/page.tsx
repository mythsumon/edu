'use client'

import { Form, Button, message, Spin } from 'antd'
import { InputField } from '@/components/shared/common'
import { GraduationCap, Shield, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect, useState } from 'react'

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<'instructor' | 'admin' | 'teacher'>('instructor')

  // Set default values for ID and password based on login type
  useEffect(() => {
    const defaultValues = loginType === 'admin'
      ? { email: 'admin@example.com', password: 'Admin@1234' }
      : loginType === 'teacher'
      ? { email: 'teacher@example.com', password: 'Teacher@1234' }
      : { email: 'instructor@example.com', password: 'Instructor@1234' }
    form.setFieldsValue(defaultValues)
  }, [form, loginType])

  const handleSubmit = async (values: any) => {
    setIsLoading(true)
    try {
      // TODO: 실제 API 호출로 로그인 처리
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      // const data = await response.json()
      
      // 임시: 이메일/비밀번호에 따라 역할 결정
      // 실제로는 API 응답에서 역할을 받아와야 함
      const { email, password } = values
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      // Instructor credentials
      if (email === 'instructor@example.com' && password === 'Instructor@1234') {
        login('instructor')
        message.success('강사로 로그인되었습니다.')
        // Add small delay before redirect to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/instructor/dashboard')
        return
      }

      // Admin credentials
      if (email === 'admin@example.com' && password === 'Admin@1234') {
        login('admin')
        message.success('관리자로 로그인되었습니다.')
        // Add small delay before redirect to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/admin')
        return
      }

      // Operator credentials
      if (email === 'operator@example.com' && password === 'Operator@1234') {
        login('operator')
        message.success('운영자로 로그인되었습니다.')
        // Add small delay before redirect to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/admin')
        return
      }

      // Teacher credentials
      if (email === 'teacher@example.com' && password === 'Teacher@1234') {
        login('teacher')
        message.success('학교 선생님으로 로그인되었습니다.')
        // Add small delay before redirect to show success message
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/teacher/dashboard')
        return
      }
      
      // Default: show error
      setIsLoading(false)
      message.error('로그인 정보가 올바르지 않습니다.')
    } catch (error) {
      setIsLoading(false)
      message.error('로그인 정보가 올바르지 않습니다.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-gray-900 p-4 font-sans transition-colors relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center gap-4 shadow-xl">
            <Spin size="large" />
            <p className="text-slate-700 dark:text-gray-300 font-medium">로그인 중...</p>
          </div>
        </div>
      )}
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideUpFade {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradient-shift-admin {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        @keyframes gradient-shift-instructor {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }
        .gradient-admin {
          background: #1e293b;
        }
        .gradient-instructor {
          background: #1e293b;
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite reverse; }
        .animate-float-content { animation: float-subtle 6s ease-in-out infinite; }
        .animate-slide-up { animation: slideUpFade 0.8s ease-out forwards; }
        .animate-slide-up-delay-1 { animation: slideUpFade 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-slide-up-delay-2 { animation: slideUpFade 0.8s ease-out 0.4s forwards; opacity: 0; }
        .animate-gradient-admin {
          animation: gradient-shift-admin 15s ease infinite;
        }
        .animate-gradient-instructor {
          animation: gradient-shift-instructor 15s ease infinite;
        }
      `}</style>
      
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden max-w-md w-full flex flex-col transition-colors">
        
        {/* Login Form */}
        <div className="w-full p-8 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 dark:bg-blue-600 rounded-lg flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-gray-100">EduMatrix</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-gray-100 mb-2">로그인</h2>
            <p className="text-sm text-slate-500 dark:text-gray-400">자격 증명을 사용하여 대시보드에 액세스하세요.</p>

            {/* Login Type Selector */}
            <div className="mt-6 mb-4">
              <div className="text-center mb-3">
                <span className="text-sm font-medium text-slate-600 dark:text-gray-400">로그인 유형 선택</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div
                  className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                    loginType === 'instructor'
                      ? 'border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:border-blue-400 dark:text-blue-300'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setLoginType('instructor')}
                >
                  <User size={18} className="mx-auto mb-1" />
                  <div className="font-medium text-xs">강사</div>
                </div>
                <div
                  className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                    loginType === 'admin'
                      ? 'border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:border-green-400 dark:text-green-300'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setLoginType('admin')}
                >
                  <Shield size={18} className="mx-auto mb-1" />
                  <div className="font-medium text-xs">관리자</div>
                </div>
                <div
                  className={`cursor-pointer rounded-lg border-2 p-3 text-center transition-all duration-200 ${
                    loginType === 'teacher'
                      ? 'border-purple-500 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:border-purple-400 dark:text-purple-300'
                      : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-400 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setLoginType('teacher')}
                >
                  <GraduationCap size={18} className="mx-auto mb-1" />
                  <div className="font-medium text-xs">학교 선생님</div>
                </div>
              </div>
              
              {/* Account Info Display */}
              <div className="mt-3 p-3 bg-slate-50 dark:bg-gray-800 rounded-lg">
                <div className="text-xs text-slate-600 dark:text-gray-400 mb-1">
                  {loginType === 'instructor' && '기본 계정: instructor@example.com / Instructor@1234'}
                  {loginType === 'admin' && '기본 계정: admin@example.com / Admin@1234'}
                  {loginType === 'teacher' && '기본 계정: teacher@example.com / Teacher@1234'}
                </div>
              </div>
            </div>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="space-y-6"
          >
            <Form.Item
              label={<span className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">사용자 ID / Email</span>}
              name="email"
              rules={[
                { required: true, message: '사용자 ID 또는 이메일을 입력해주세요' },
              ]}
            >
              <InputField
                type="text"
                placeholder="사용자 ID 또는 이메일을 입력하세요"
              />
            </Form.Item>
            
            <Form.Item
              label={<span className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Password</span>}
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <InputField
                type="password"
                placeholder="••••••••"
              />
            </Form.Item>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 dark:text-gray-400 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 dark:border-gray-600 text-blue-600 focus:ring-blue-400 mr-2" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium">Forgot Password?</a>
            </div>

            <Button 
              type="primary"
              htmlType="submit" 
              loading={isLoading}
              disabled={isLoading}
              className="w-full h-12 rounded-xl font-semibold text-base text-white hover:text-white active:text-white transition-all bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login to Dashboard
            </Button>
          </Form>
        </div>
      </div>
    </div>
  )
}