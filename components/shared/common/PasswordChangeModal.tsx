'use client'

import { Modal, Form, Input, message } from 'antd'
import { Key } from 'lucide-react'
import { useState } from 'react'

interface PasswordChangeModalProps {
  open: boolean
  onCancel?: () => void
  onSuccess: (newPassword: string) => void
  isRequired?: boolean // 첫 로그인 시 필수 변경 여부
}

export function PasswordChangeModal({
  open,
  onCancel,
  onSuccess,
  isRequired = false,
}: PasswordChangeModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (values: { currentPassword: string; newPassword: string; confirmPassword: string }) => {
    setLoading(true)
    try {
      // 비밀번호 확인 검증
      if (values.newPassword !== values.confirmPassword) {
        message.error('새 비밀번호가 일치하지 않습니다.')
        setLoading(false)
        return
      }

      // TODO: 실제 API 호출로 비밀번호 변경
      // await changePassword(values.currentPassword, values.newPassword)
      
      // 시뮬레이션 지연
      await new Promise(resolve => setTimeout(resolve, 500))
      
      message.success('비밀번호가 변경되었습니다.')
      form.resetFields()
      onSuccess(values.newPassword)
    } catch (error) {
      message.error('비밀번호 변경에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal
      title={
        <div className="flex items-center gap-2">
          <Key className="w-5 h-5" />
          <span>{isRequired ? '비밀번호 변경 (필수)' : '비밀번호 변경'}</span>
        </div>
      }
      open={open}
      onCancel={isRequired ? undefined : onCancel} // 필수 변경 시 취소 불가
      footer={null}
      width={500}
      closable={!isRequired} // 필수 변경 시 닫기 버튼 숨김
      maskClosable={!isRequired} // 필수 변경 시 배경 클릭으로 닫기 불가
    >
      {isRequired && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            보안을 위해 첫 로그인 시 비밀번호를 변경해주세요.
          </p>
        </div>
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        className="mt-4"
      >
        {!isRequired && (
          <Form.Item
            label="현재 비밀번호"
            name="currentPassword"
            rules={[{ required: true, message: '현재 비밀번호를 입력해주세요' }]}
          >
            <Input.Password placeholder="현재 비밀번호를 입력하세요" className="h-11 rounded-xl" />
          </Form.Item>
        )}
        
        <Form.Item
          label="새 비밀번호"
          name="newPassword"
          rules={[
            { required: true, message: '새 비밀번호를 입력해주세요' },
            { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다' },
            {
              pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
              message: '비밀번호는 대문자, 소문자, 숫자, 특수문자를 포함해야 합니다',
            },
          ]}
        >
          <Input.Password placeholder="새 비밀번호를 입력하세요" className="h-11 rounded-xl" />
        </Form.Item>
        
        <Form.Item
          label="새 비밀번호 확인"
          name="confirmPassword"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '비밀번호 확인을 입력해주세요' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve()
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다'))
              },
            }),
          ]}
        >
          <Input.Password placeholder="새 비밀번호를 다시 입력하세요" className="h-11 rounded-xl" />
        </Form.Item>
        
        <div className="flex justify-end gap-2 mt-6">
          {!isRequired && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              취소
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '변경 중...' : '변경'}
          </button>
        </div>
      </Form>
    </Modal>
  )
}
