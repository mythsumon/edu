'use client'

import { Form, Input, Button } from 'antd'
import { Lock, Mail } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const [form] = Form.useForm()
  const router = useRouter()

  const handleSubmit = (values: any) => {
    // TODO: 실제 로그인 로직 연동 (인증 성공 시 아래로 이동)
    // For demo purposes, we'll check if it's an instructor login
    if (values.email === 'instructor@example.com') {
      router.push('/instructor/dashboard')
    } else {
      router.push('/')
    }
  }

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Left side - visual / animation */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-500 to-sky-400 text-white">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_top,_#ffffff_0,_transparent_60%),_radial-gradient(circle_at_bottom,_#ffffff_0,_transparent_60%)]" />

        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-white/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-sky-200/20 blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />

        <div className="relative z-10 flex flex-col justify-center px-16 gap-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-100 mb-3">
              EDUCATION MANAGEMENT
            </p>
            <h1 className="text-4xl font-bold leading-tight mb-4">
              경기 미래채움
              <br />
              교육 관리 플랫폼
            </h1>
            <p className="text-base text-sky-100/90 max-w-md">
              한 곳에서 교육, 기관, 프로그램, 강사 정보를 통합 관리하고
              권역별 현황을 직관적으로 확인할 수 있습니다.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md text-sm">
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
              <div className="text-xs font-semibold text-sky-100/80 mb-1">실시간 현황</div>
              <div className="text-lg font-semibold">교육 프로그램</div>
              <div className="mt-2 text-xs text-sky-100/80">
                교육 신청부터 강사 배정, 출강 확정까지 한 번에 관리하세요.
              </div>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 p-4">
              <div className="text-xs font-semibold text-sky-100/80 mb-1">권한 기반 관리</div>
              <div className="text-lg font-semibold">안전한 시스템</div>
              <div className="mt-2 text-xs text-sky-100/80">
                역할별 권한 설정으로 민감한 데이터를 안전하게 보호합니다.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
            <p className="text-sm text-gray-500">
              교육 관리 시스템에 접속하려면 계정 정보를 입력해주세요.
            </p>
            <div className="mt-3 inline-flex flex-col gap-1 rounded-xl border border-dashed border-gray-300 bg-gray-50 px-4 py-3 text-xs text-gray-600">
              <span className="font-semibold text-gray-800">데모 계정 정보</span>
              <span>관리자: <span className="font-medium text-gray-900">admin@example.com</span> / <span className="font-medium text-gray-900">demo1234</span></span>
              <span>강사: <span className="font-medium text-gray-900">instructor@example.com</span> / <span className="font-medium text-gray-900">demo1234</span></span>
            </div>
          </div>

          <div className="rounded-2xl bg-white shadow-sm border border-gray-200 p-6 md:p-7">
            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              className="space-y-4"
            >
              <Form.Item
                label="이메일"
                name="email"
                rules={[
                  { required: true, message: '이메일을 입력해주세요' },
                  { type: 'email', message: '올바른 이메일 형식이 아닙니다' },
                ]}
              >
                <Input
                  prefix={<Mail className="w-4 h-4 text-gray-400 mr-1" />}
                  placeholder="이메일 주소를 입력하세요"
                  className="h-11 rounded-xl"
                />
              </Form.Item>

              <Form.Item
                label="비밀번호"
                name="password"
                rules={[{ required: true, message: '비밀번호를 입력해주세요' }]}
              >
                <Input.Password
                  prefix={<Lock className="w-4 h-4 text-gray-400 mr-1" />}
                  placeholder="비밀번호를 입력하세요"
                  className="h-11 rounded-xl"
                />
              </Form.Item>

              <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                <span>비밀번호를 잊으셨나요?</span>
                <button
                  type="button"
                  className="font-medium text-blue-600 hover:text-blue-700"
                >
                  비밀번호 재설정
                </button>
              </div>

              <Button
                type="primary"
                htmlType="submit"
                className="w-full h-11 mt-2 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
              >
                로그인
              </Button>
            </Form>

            <p className="mt-6 text-xs text-gray-400 leading-relaxed">
              본 시스템은 권한이 부여된 사용자만 사용할 수 있습니다. 무단 접속 또는 부정 사용 시
              관련 법령에 따라 처벌될 수 있습니다.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}