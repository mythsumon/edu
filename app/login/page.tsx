'use client'

import { Form, Button, message } from 'antd'
import { InputField } from '@/components/shared/common'
import { GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useEffect } from 'react'

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()
  const { login } = useAuth()

  // Set default values for ID and password
  useEffect(() => {
    form.setFieldsValue({
      email: 'admin@example.com',
      password: 'Admin@1234'
    })
  }, [form])

  const handleSubmit = async (values: any) => {
    try {
      // TODO: 실제 API 호출로 로그인 처리
      // const response = await fetch('/api/auth/login', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(values)
      // })
      // const data = await response.json()
      
      // 임시: 로그인 성공 시 관리자로 로그인
      // 실제로는 API 응답에서 역할을 받아와야 함
      login('admin')
      router.push('/admin')
    } catch (error) {
      message.error('로그인 정보가 올바르지 않습니다.')
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
        <div className="w-full md:w-1/2 p-16 text-white flex flex-col justify-between relative overflow-hidden bg-slate-900">
          
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
                placeholder="사용자 ID 또는 이메일을 입력하세요"
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