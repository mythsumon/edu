'use client'

import { Form, Button } from 'antd'
import { InputField } from '@/components/shared/common'
import { Lock, Mail, Shield, Users, ArrowRight, BookOpen, GraduationCap } from 'lucide-react'
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
    <div className="min-h-screen flex items-center justify-center bg-[#fff5f0] p-4 md:p-8">
      {/* Main Container with super-elliptical rounded corners and peach glow */}
      <div 
        className="w-full max-w-7xl bg-white rounded-[40px] shadow-[0_20px_60px_rgba(255,138,101,0.15)] overflow-hidden flex flex-col lg:flex-row"
        style={{
          borderRadius: '40px',
          boxShadow: '0 20px 60px rgba(255, 138, 101, 0.15)'
        }}
      >
        {/* Left Panel - 5/12 width, deep charcoal-brown with peach dot grid */}
        <div className="hidden lg:flex lg:w-[41.67%] relative overflow-hidden bg-[#3a2e2a]">
          {/* Dot Grid Pattern with animation */}
          <div 
            className="absolute inset-0 opacity-20 animate-pulse"
            style={{
              backgroundImage: 'radial-gradient(circle, #ff8a65 1px, transparent 1px)',
              backgroundSize: '24px 24px',
              animation: 'float 20s ease-in-out infinite'
            }}
          />
          
          {/* Floating 3D Book Icon with glow and animation - Centered */}
          <div 
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 opacity-30"
            style={{
              animation: 'floatBook 8s ease-in-out infinite, glow 3s ease-in-out infinite'
            }}
          >
            <BookOpen className="w-full h-full text-[#ff8a65] drop-shadow-[0_0_40px_rgba(255,138,101,0.5)]" />
          </div>
        </div>

        {/* Add CSS animations */}
        <style jsx>{`
          @keyframes float {
            0%, 100% {
              transform: translateY(0px);
            }
            50% {
              transform: translateY(-10px);
            }
          }
          
          @keyframes floatBook {
            0%, 100% {
              transform: translate(-50%, -50%) rotate(0deg) translateY(0px);
            }
            25% {
              transform: translate(-50%, -50%) rotate(5deg) translateY(-10px);
            }
            50% {
              transform: translate(-50%, -50%) rotate(0deg) translateY(0px);
            }
            75% {
              transform: translate(-50%, -50%) rotate(-5deg) translateY(10px);
            }
          }
          
          @keyframes glow {
            0%, 100% {
              opacity: 0.3;
              filter: drop-shadow(0 0 40px rgba(255, 138, 101, 0.5));
            }
            50% {
              opacity: 0.5;
              filter: drop-shadow(0 0 60px rgba(255, 138, 101, 0.8));
            }
          }
          
          @keyframes fadeInDown {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInLeft {
            from {
              opacity: 0;
              transform: translateX(-30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
          
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(30px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @keyframes fadeInRight {
            from {
              opacity: 0;
              transform: translateX(30px);
            }
            to {
              opacity: 1;
              transform: translateX(0);
            }
          }
        `}</style>

        {/* Right Panel - 7/12 width, clean white authentication */}
        <div className="w-full lg:w-[58.33%] flex items-center justify-center px-8 py-12 lg:px-16">
        <div className="w-full max-w-md">
            {/* Role Switcher Toggle with animation */}
            <div 
              className="mb-8"
              style={{
                animation: 'fadeInRight 1s ease-out 0.1s both'
              }}
            >
              <div className="inline-flex bg-[#fff5f0] rounded-[32px] p-1 gap-1">
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('admin')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[32px] font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      selectedRole === 'admin'
                      ? 'bg-[#ff8a65] text-white shadow-peach scale-105'
                      : 'text-[#8d7c77] hover:text-[#3a2e2a]'
                    }`}
                  >
                  <Shield className="w-4 h-4" />
                  Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRoleSelect('instructor')}
                  className={`flex items-center gap-2 px-6 py-3 rounded-[32px] font-semibold text-sm transition-all duration-300 transform hover:scale-105 ${
                      selectedRole === 'instructor'
                      ? 'bg-[#ff8a65] text-white shadow-peach scale-105'
                      : 'text-[#8d7c77] hover:text-[#3a2e2a]'
                  }`}
              >
                  <Users className="w-4 h-4" />
                  Instructor
                </button>
              </div>
            </div>

            {/* Form with fade-in animation */}
            <div 
              className="mb-6"
              style={{
                animation: 'fadeInRight 1s ease-out 0.3s both'
              }}
            >
              <h2 className="text-3xl font-bold text-[#3a2e2a] mb-2">Welcome back</h2>
      </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="space-y-5"
              style={{
                animation: 'fadeInRight 1s ease-out 0.6s both'
              }}
            >
              <Form.Item
                label={<span className="text-sm font-semibold text-[#3a2e2a]">이메일</span>}
                name="email"
                rules={[
                  { required: true, message: '이메일을 입력해주세요' },
                  { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                ]}
              >
                <InputField
                  type="email"
                  prefixIcon={<Mail className="w-5 h-5 text-[#8d7c77]" />}
                  placeholder="이메일 주소를 입력하세요"
                />
              </Form.Item>

              <Form.Item
                label={<span className="text-sm font-semibold text-[#3a2e2a]">비밀번호</span>}
                name="password"
                rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
              >
                <InputField
                  type="password"
                  prefixIcon={<Lock className="w-5 h-5 text-[#8d7c77]" />}
                  placeholder="비밀번호를 입력하세요"
                />
              </Form.Item>

              <div className="flex items-center justify-between text-xs text-[#8d7c77] mb-1">
                <span>비밀번호를 잊으셨나요?</span>
                <button
                  type="button"
                  className="font-medium text-[#ff8a65] hover:text-[#ff7043] transition-colors duration-200"
                >
                  비밀번호 재설정
                </button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-14 mt-4 rounded-[32px] border-0 font-semibold text-base shadow-peach-lg hover:shadow-peach-lg transition-all duration-300 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
                style={{ 
                  borderRadius: '32px',
                  background: 'linear-gradient(135deg, #ff8a65 0%, #ff9e7d 100%)',
                  boxShadow: '0 4px 12px rgba(255, 138, 101, 0.25)'
                }}
              >
                Sign In
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Form>

            <p className="mt-8 text-xs text-[#8d7c77] leading-relaxed">
              본 시스템은 권한이 부여된 사용자만 사용할 수 있습니다. 무단 접속 또는 부정 사용 시
              관련 법령에 따라 처벌될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}