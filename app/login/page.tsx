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
      
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full flex flex-col">
        
        {/* Login Form */}
        <div className="w-full p-8 flex flex-col justify-center">
          <div className="mb-6 text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-10 h-10 bg-slate-900 rounded-lg flex items-center justify-center">
                <GraduationCap size={24} className="text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-slate-900">EduMatrix</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">로그인</h2>
            <p className="text-sm text-slate-500">자격 증명을 사용하여 대시보드에 액세스하세요.</p>
          </div>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            requiredMark={false}
            className="space-y-6"
          >
            <Form.Item
              label={<span className="block text-sm font-medium text-slate-700 mb-2">사용자 ID / Email</span>}
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
              label={<span className="block text-sm font-medium text-slate-700 mb-2">Password</span>}
              name="password"
              rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
            >
              <InputField
                type="password"
                placeholder="••••••••"
              />
            </Form.Item>
            
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-400 mr-2" />
                Remember me
              </label>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Forgot Password?</a>
            </div>

            <Button 
              type="primary"
              htmlType="submit" 
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