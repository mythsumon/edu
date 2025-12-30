'use client'

import { Form, Button, Card, message } from 'antd'
import { InputField } from '@/components/shared/common'
import { GraduationCap, Copy, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/contexts/AuthContext'

// Demo account credentials
const DEMO_ACCOUNTS = {
  admin: {
    id: 'admin_demo',
    email: 'admin_demo',
    password: 'Admin@1234'
  },
  instructor: {
    id: 'instructor_demo',
    email: 'instructor_demo',
    password: 'Teacher@1234'
  }
}

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)

  // 초기 로드 시 선택된 역할의 계정 정보 자동 입력
  useEffect(() => {
    const account = DEMO_ACCOUNTS[selectedRole]
    form.setFieldsValue({
      email: account.email,
      password: account.password
    })
  }, [form, selectedRole])

  const handleSubmit = (values: any) => {
    // TODO: 실제 로그인 로직 연동 (인증 성공 시 아래로 이동)
    // Check if credentials match demo accounts
    // Accept both ID and email (they are the same for demo accounts)
    const account = DEMO_ACCOUNTS[selectedRole]
    const inputIdOrEmail = values.email?.trim()
    const isValidCredentials = 
      (inputIdOrEmail === account.id || inputIdOrEmail === account.email) &&
      values.password === account.password
    
    if (isValidCredentials) {
      login(selectedRole)
      if (selectedRole === 'admin') {
        router.push('/admin')
      } else {
        router.push('/instructor/dashboard')
      }
    } else {
      message.error('로그인 정보가 올바르지 않습니다.')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    // TODO: Show success message
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
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
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-[800px]">
        
        {/* Left Side - Hero / Branding */}
        <div className={`w-full md:w-1/2 p-16 text-white flex flex-col justify-between relative overflow-hidden transition-all duration-500 ${selectedRole === 'admin' ? 'gradient-admin' : 'gradient-instructor'}`}>
          
          {/* Animated Background Elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-white opacity-10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-[10%] left-[-10%] w-48 h-48 bg-white opacity-10 rounded-full blur-2xl animate-float-slow"></div>

          <div className="absolute top-0 left-0 w-full h-full opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
          
          {/* Main Content with Continuous Float */}
          <div className="relative z-10 animate-float-content">
            <div className="flex items-center gap-3 mb-10 animate-slide-up">
              <div className="w-12 h-12 bg-white bg-opacity-20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                <GraduationCap size={28} className="text-white" />
              </div>
              <span className="text-3xl font-bold tracking-tight">EduMatrix</span>
            </div>
            <h1 className="text-5xl font-bold leading-tight mb-6 animate-slide-up-delay-1">
              Welcome to the Future of Learning.
            </h1>
            <p className="text-xl opacity-80 animate-slide-up-delay-2">
              Streamline your educational journey with our comprehensive management dashboard.
            </p>
          </div>
          <div className="relative z-10 text-sm opacity-60 animate-slide-up-delay-2">
            © 2024 EduMatrix Inc.
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full md:w-1/2 p-16 flex flex-col justify-center">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">로그인</h2>
            <p className="text-base text-slate-500">자격 증명을 사용하여 대시보드에 액세스하세요.</p>
          </div>

          {/* Role Selection */}
          <div className="mb-6">
            <label className="block text-base font-medium text-slate-700 mb-2">역할 선택</label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setSelectedRole('admin')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'admin'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                관리자
              </button>
              <button
                type="button"
                onClick={() => setSelectedRole('instructor')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 transition-all ${
                  selectedRole === 'instructor'
                    ? 'border-blue-600 bg-blue-50 text-blue-700 font-medium'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                }`}
              >
                강사
              </button>
            </div>
          </div>

          {/* Demo Accounts Section */}
          <Card className="mb-6 border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">데모 계정</h3>
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                {showDemoAccounts ? '숨기기' : '보기'}
              </button>
            </div>
            {showDemoAccounts && (
              <div className="space-y-3">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">관리자</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('admin')
                        form.setFieldsValue({
                          email: DEMO_ACCOUNTS.admin.id,
                          password: DEMO_ACCOUNTS.admin.password
                        })
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      사용
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID: {DEMO_ACCOUNTS.admin.email}</div>
                    <div>PW: {DEMO_ACCOUNTS.admin.password}</div>
                  </div>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-gray-600">강사</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedRole('instructor')
                        form.setFieldsValue({
                          email: DEMO_ACCOUNTS.instructor.id,
                          password: DEMO_ACCOUNTS.instructor.password
                        })
                      }}
                      className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      사용
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 space-y-1">
                    <div>ID: {DEMO_ACCOUNTS.instructor.email}</div>
                    <div>PW: {DEMO_ACCOUNTS.instructor.password}</div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="space-y-6"
          >
            <Form.Item
              label={<span className="block text-base font-medium text-slate-700 mb-2">사용자 ID / Email</span>}
              name="email"
              rules={[
                { required: true, message: '사용자 ID 또는 이메일을 입력해주세요' },
              ]}
            >
              <InputField
                type="text"
                placeholder="admin_demo 또는 admin@example.com"
              />
            </Form.Item>
            
            <Form.Item
              label={<span className="block text-base font-medium text-slate-700 mb-2">Password</span>}
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <InputField
                type="password"
                placeholder="••••••••"
              />
            </Form.Item>
            
            <div className="flex items-center justify-between text-base">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-400 mr-2" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
            </div>

            <Button 
              type="primary"
              htmlType="submit" 
              className="w-full h-16 rounded-xl font-semibold text-lg text-white hover:text-white active:text-white transition-all bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              Login to Dashboard
            </Button>
          </Form>

          <div className="mt-10 text-center text-base text-slate-400">
            Don't have an account? <a href="#" className="text-slate-600 font-medium hover:underline">Contact Support</a>
          </div>
        </div>
      </div>
    </div>
  )
}