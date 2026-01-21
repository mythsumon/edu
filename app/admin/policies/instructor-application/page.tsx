'use client'

import { useState, useEffect } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Form, InputNumber, Switch, Button, Space, message, Divider, Typography, Alert } from 'antd'
import { Save, RotateCcw, Info } from 'lucide-react'
import { 
  getGlobalPolicy, 
  saveGlobalPolicy,
  type ApplicationPolicy 
} from '@/lib/policyStore'

const { Title, Text } = Typography

export default function InstructorApplicationPolicyPage() {
  const [form] = Form.useForm<ApplicationPolicy>()
  const [loading, setLoading] = useState(false)
  const [initialValues, setInitialValues] = useState<ApplicationPolicy | null>(null)

  useEffect(() => {
    loadPolicy()
    
    // Listen for policy updates
    const handlePolicyUpdate = () => {
      loadPolicy()
    }
    window.addEventListener('policyUpdated', handlePolicyUpdate)
    
    return () => {
      window.removeEventListener('policyUpdated', handlePolicyUpdate)
    }
  }, [])

  const loadPolicy = () => {
    try {
      const policy = getGlobalPolicy()
      setInitialValues(policy)
      form.setFieldsValue(policy)
    } catch (error) {
      console.error('Failed to load policy:', error)
      message.error('정책을 불러오는데 실패했습니다.')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const values = await form.validateFields()
      
      saveGlobalPolicy(values)
      
      message.success('정책이 저장되었습니다.')
      loadPolicy()
    } catch (error) {
      console.error('Failed to save policy:', error)
      message.error('정책 저장에 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = () => {
    if (initialValues) {
      form.setFieldsValue(initialValues)
      message.info('변경사항이 초기화되었습니다.')
    }
  }

  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <Title level={2} className="!mb-2">
              강사 신청 정책 관리
            </Title>
            <Text type="secondary">
              강사 신청 시 적용되는 전역 정책을 설정합니다. 교육별 또는 강사별 오버라이드는 각각의 관리 페이지에서 설정할 수 있습니다.
            </Text>
          </div>

          {/* Info Alert */}
          <Alert
            message="정책 우선순위"
            description={
              <div className="mt-2">
                <p>정책은 다음 우선순위로 적용됩니다:</p>
                <ol className="list-decimal list-inside mt-2 space-y-1">
                  <li>강사별 월별 오버라이드 (최우선)</li>
                  <li>교육별 오버라이드</li>
                  <li>전역 정책 (이 페이지에서 설정)</li>
                </ol>
              </div>
            }
            type="info"
            icon={<Info className="w-4 h-4" />}
            className="mb-6"
            showIcon
          />

          {/* Policy Form */}
          <Card className="rounded-xl shadow-sm border border-gray-200">
            <Form
              form={form}
              layout="vertical"
              initialValues={initialValues || undefined}
              onFinish={handleSave}
            >
              {/* Monthly Session Hours Limits */}
              <div className="mb-6">
                <Title level={4} className="!mb-4">
                  월별 시간 제한
                </Title>
                <Text type="secondary" className="block mb-4">
                  강사가 한 달에 신청할 수 있는 최대 시간을 역할별로 설정합니다. 
                  PENDING, ACCEPTED, ASSIGNED 상태의 모든 신청이 포함됩니다.
                </Text>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Form.Item
                    label="주강사 월별 최대 시간 (시간)"
                    name="mainInstructorMonthlyMaxHours"
                    rules={[
                      { required: true, message: '주강사 월별 최대 시간을 입력해주세요.' },
                      { type: 'number', min: 0, message: '0 이상의 값을 입력해주세요.' },
                    ]}
                    tooltip="주강사 역할로 한 달에 신청할 수 있는 최대 시간"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      max={999}
                      step={0.5}
                      precision={1}
                      placeholder="예: 20.0"
                      addonAfter="시간"
                    />
                  </Form.Item>

                  <Form.Item
                    label="보조강사 월별 최대 시간 (시간)"
                    name="assistantInstructorMonthlyMaxHours"
                    rules={[
                      { required: true, message: '보조강사 월별 최대 시간을 입력해주세요.' },
                      { type: 'number', min: 0, message: '0 이상의 값을 입력해주세요.' },
                    ]}
                    tooltip="보조강사 역할로 한 달에 신청할 수 있는 최대 시간"
                  >
                    <InputNumber
                      className="w-full"
                      min={0}
                      max={999}
                      step={0.5}
                      precision={1}
                      placeholder="예: 30.0"
                      addonAfter="시간"
                    />
                  </Form.Item>
                </div>
              </div>

              <Divider />

              {/* Daily Application Limits */}
              <div className="mb-6">
                <Title level={4} className="!mb-4">
                  일일 신청 제한
                </Title>
                <Text type="secondary" className="block mb-4">
                  강사가 하루에 신청할 수 있는 교육 수를 제한합니다.
                </Text>

                <Form.Item
                  label="일일 최대 신청 수"
                  name="dailyMaxApplications"
                  rules={[
                    { required: true, message: '일일 최대 신청 수를 입력해주세요.' },
                    { type: 'number', min: 1, message: '1 이상의 값을 입력해주세요.' },
                  ]}
                  tooltip="하루에 신청할 수 있는 최대 교육 수"
                >
                  <InputNumber
                    className="w-full"
                    min={1}
                    max={10}
                    placeholder="예: 1"
                    addonAfter="개"
                  />
                </Form.Item>

                <Form.Item
                  label="하루에 여러 수업 허용"
                  name="allowMultipleSessionsPerDay"
                  valuePropName="checked"
                  tooltip="체크하면 오전과 오후에 각각 다른 교육을 신청할 수 있습니다. 체크 해제 시 하루에 하나의 교육만 신청 가능합니다."
                >
                  <Switch 
                    checkedChildren="허용" 
                    unCheckedChildren="제한"
                  />
                </Form.Item>

                <Alert
                  message="참고"
                  description={
                    <div>
                      <p className="mb-2">
                        <strong>여러 수업 허용 OFF:</strong> 하루에 하나의 교육만 신청 가능합니다.
                      </p>
                      <p>
                        <strong>여러 수업 허용 ON:</strong> 일일 최대 신청 수까지 여러 교육을 신청할 수 있지만, 시간이 겹치지 않아야 합니다.
                      </p>
                    </div>
                  }
                  type="info"
                  className="mt-4"
                  showIcon={false}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                <Button
                  icon={<RotateCcw className="w-4 h-4" />}
                  onClick={handleReset}
                  disabled={loading}
                >
                  초기화
                </Button>
                <Button
                  type="primary"
                  icon={<Save className="w-4 h-4" />}
                  onClick={handleSave}
                  loading={loading}
                  className="bg-slate-900 hover:bg-slate-800"
                >
                  저장
                </Button>
              </div>
            </Form>
          </Card>

          {/* Additional Info */}
          <Card className="mt-6 rounded-xl shadow-sm border border-gray-200">
            <Title level={5} className="!mb-3">
              정책 적용 범위
            </Title>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>월별 시간 제한:</strong> 각 교육의 수업 시간을 합산하여 계산됩니다. 
                예를 들어, 4시간 수업 2개 = 8시간으로 계산됩니다.
              </p>
              <p>
                <strong>일일 신청 제한:</strong> 캘린더 날짜 기준으로 적용됩니다. 
                같은 날 여러 교육을 신청하는 경우, 시간이 겹치지 않아야 합니다.
              </p>
              <p>
                <strong>상태 포함:</strong> PENDING(대기), ACCEPTED(수락됨), ASSIGNED(배정됨) 상태의 
                모든 신청이 제한 계산에 포함됩니다.
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
