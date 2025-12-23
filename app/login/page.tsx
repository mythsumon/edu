'use client'

import { Form, Button } from 'antd'
import { InputField } from '@/components/shared/common'
import { GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import type { UserRole } from '@/contexts/AuthContext'

// Demo account credentials
const DEMO_ACCOUNTS = {
  admin: {
    email: 'admin@example.com',
    password: 'demo1234'
  },
  instructor: {
    email: 'instructor@example.com',
    password: 'demo1234'
  }
}

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { login } = useAuth()
  const [selectedRole, setSelectedRole] = useState<UserRole>('admin')

  // 초기 로드 시 관리자 계정 정보 자동 입력
  useEffect(() => {
    form.setFieldsValue({
      email: DEMO_ACCOUNTS.admin.email,
      password: DEMO_ACCOUNTS.admin.password
    })
  }, [form])

  const handleRoleSelect = (role: 'admin' | 'instructor') => {
    setSelectedRole(role)
    // 선택한 역할의 이메일과 비밀번호 자동 입력
    const account = DEMO_ACCOUNTS[role]
    form.setFieldsValue({
      email: account.email,
      password: account.password
    })
  }

  const handleSubmit = (values: any) => {
    // TODO: 실제 로그인 로직 연동 (인증 성공 시 아래로 이동)
    // 역할이 선택되지 않은 경우 처리
    if (!selectedRole) {
      form.setFields([{ name: 'role', errors: ['역할을 선택해주세요'] }])
      return
    }
    
    // 선택한 역할로 로그인
    login(selectedRole)
    
    // 역할에 따라 적절한 페이지로 리다이렉트
    if (selectedRole === 'instructor') {
      router.push('/instructor/dashboard')
    } else if (selectedRole === 'admin') {
      router.push('/admin')
    } else {
      router.push('/')
    }
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
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float 8s ease-in-out infinite reverse; }
        .animate-float-content { animation: float-subtle 6s ease-in-out infinite; }
        .animate-slide-up { animation: slideUpFade 0.8s ease-out forwards; }
        .animate-slide-up-delay-1 { animation: slideUpFade 0.8s ease-out 0.2s forwards; opacity: 0; }
        .animate-slide-up-delay-2 { animation: slideUpFade 0.8s ease-out 0.4s forwards; opacity: 0; }
      `}</style>
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-6xl w-full flex flex-col md:flex-row min-h-[800px]">
        
        {/* Left Side - Hero / Branding */}
        <div className={`w-full md:w-1/2 p-16 text-white flex flex-col justify-between relative overflow-hidden transition-colors duration-500 ${selectedRole === 'admin' ? 'bg-slate-900' : 'bg-indigo-600'}`}>
          
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
            <h2 className="text-3xl font-bold text-slate-900 mb-3">Sign In</h2>
            <p className="text-base text-slate-500">Access your dashboard using your credentials.</p>
          </div>

          {/* Role Toggle */}
          <div className="flex bg-slate-100 p-1.5 rounded-xl mb-10">
            <button 
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`flex-1 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${selectedRole === 'admin' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Administrator
            </button>
            <button 
              type="button"
              onClick={() => handleRoleSelect('instructor')}
              className={`flex-1 py-3 text-base font-semibold rounded-lg transition-all duration-200 ${selectedRole === 'instructor' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Instructor
            </button>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="space-y-6"
          >
            <Form.Item
              label={<span className="block text-base font-medium text-slate-700 mb-2">Email Address</span>}
              name="email"
              rules={[
                { required: true, message: '이메일을 입력해주세요' },
                { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
              ]}
            >
              <InputField
                type="email"
                placeholder={selectedRole === 'admin' ? "admin@example.com" : "instructor@example.com"}
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
                <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 mr-2" />
                Remember me
              </label>
              <a href="#" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot Password?</a>
            </div>

            <Button 
              type="primary"
              htmlType="submit" 
              className="w-full h-16 rounded-lg font-semibold text-lg text-white transition-all"
              style={{
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                color: '#ffffff',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748'
                e.currentTarget.style.borderColor = '#2d3748'
                e.currentTarget.style.color = '#ffffff'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c'
                e.currentTarget.style.borderColor = '#1a202c'
                e.currentTarget.style.color = '#ffffff'
              }}
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