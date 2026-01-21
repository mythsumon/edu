'use client'

import { useState, useEffect } from 'react'
import { Modal, Form, DatePicker, TimePicker, Space, message, Radio } from 'antd'
import dayjs, { Dayjs } from 'dayjs'
import type { Education } from '@/lib/dataStore'

const { RangePicker } = DatePicker

interface ScheduleTimeModalProps {
  open: boolean
  education: Education | null
  onOk: (openAt: string | null, closeAt: string | null, applicationRestriction?: 'MAIN_ONLY' | 'ASSISTANT_ONLY' | 'ALL') => void
  onCancel: () => void
}

export function ScheduleTimeModal({
  open,
  education,
  onOk,
  onCancel,
}: ScheduleTimeModalProps) {
  const [form] = Form.useForm()
  const [openAtEnabled, setOpenAtEnabled] = useState(false)
  const [closeAtEnabled, setCloseAtEnabled] = useState(false)
  const [applicationRestriction, setApplicationRestriction] = useState<'MAIN_ONLY' | 'ASSISTANT_ONLY' | 'ALL'>('ALL')

  useEffect(() => {
    if (open && education) {
      // 기존 값 설정
      const openAt = education.openAt ? dayjs(education.openAt) : null
      const closeAt = education.closeAt ? dayjs(education.closeAt) : null

      form.setFieldsValue({
        openAt: openAt,
        closeAt: closeAt,
        applicationRestriction: education.applicationRestriction || 'ALL',
      })

      setOpenAtEnabled(!!openAt)
      setCloseAtEnabled(!!closeAt)
      setApplicationRestriction(education.applicationRestriction || 'ALL')
    } else {
      form.resetFields()
      setOpenAtEnabled(false)
      setCloseAtEnabled(false)
    }
  }, [open, education, form])

  const handleOk = () => {
    form.validateFields().then((values) => {
      const now = dayjs()

      // openAt 검증
      let openAt: string | null = null
      if (openAtEnabled && values.openAt) {
        const openAtDate = values.openAt as Dayjs
        if (openAtDate.isBefore(now)) {
          message.error('강사공개 전환 시간은 현재 시간 이후여야 합니다.')
          return
        }
        openAt = openAtDate.toISOString()
      }

      // closeAt 검증
      let closeAt: string | null = null
      if (closeAtEnabled && values.closeAt) {
        const closeAtDate = values.closeAt as Dayjs
        if (closeAtDate.isBefore(now)) {
          message.error('신청마감 전환 시간은 현재 시간 이후여야 합니다.')
          return
        }

        // closeAt이 openAt보다 이후여야 함
        if (openAt && closeAtDate.isBefore(dayjs(openAt))) {
          message.error('신청마감 전환 시간은 강사공개 전환 시간 이후여야 합니다.')
          return
        }
        closeAt = closeAtDate.toISOString()
      }

      const restriction = form.getFieldValue('applicationRestriction') || 'ALL'
      onOk(openAt, closeAt, restriction)
      form.resetFields()
      setOpenAtEnabled(false)
      setCloseAtEnabled(false)
      setApplicationRestriction('ALL')
    })
  }

  const handleCancel = () => {
    form.resetFields()
    setOpenAtEnabled(false)
    setCloseAtEnabled(false)
    setApplicationRestriction('ALL')
    onCancel()
  }

  return (
    <Modal
      title="스케줄 시간 설정"
      open={open}
      onOk={handleOk}
      onCancel={handleCancel}
      okText="설정"
      cancelText="취소"
      width={600}
    >
      <Form form={form} layout="vertical" className="mt-4">
        <div className="mb-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">
            교육 상태를 "오픈예정"으로 변경하고, 자동 전환 시간을 설정할 수 있습니다.
          </p>
          <ul className="text-xs text-gray-500 list-disc list-inside space-y-1">
            <li>강사공개 전환 시간: 오픈예정 → 강사공개로 자동 전환되는 시간</li>
            <li>신청마감 전환 시간: 강사공개 → 신청마감으로 자동 전환되는 시간</li>
            <li>시간을 설정하지 않으면 수동으로 상태를 변경해야 합니다.</li>
          </ul>
        </div>

        <Form.Item label="강사공개 전환 시간 설정">
          <Space direction="vertical" style={{ width: '100%' }}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={openAtEnabled}
                onChange={(e) => setOpenAtEnabled(e.target.checked)}
                className="mr-2"
              />
              <span>강사공개 전환 시간 설정</span>
            </label>
            {openAtEnabled && (
              <Form.Item
                name="openAt"
                rules={[
                  {
                    required: true,
                    message: '강사공개 전환 시간을 선택해주세요.',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve()
                      const selectedTime = dayjs(value)
                      const now = dayjs()
                      if (selectedTime.isBefore(now)) {
                        return Promise.reject(
                          new Error('현재 시간 이후로 설정해주세요.')
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="강사공개 전환 시간 선택"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Form.Item label="신청마감 전환 시간 설정">
          <Space direction="vertical" style={{ width: '100%' }}>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={closeAtEnabled}
                onChange={(e) => setCloseAtEnabled(e.target.checked)}
                className="mr-2"
              />
              <span>신청마감 전환 시간 설정</span>
            </label>
            {closeAtEnabled && (
              <Form.Item
                name="closeAt"
                rules={[
                  {
                    required: true,
                    message: '신청마감 전환 시간을 선택해주세요.',
                  },
                  {
                    validator: (_, value) => {
                      if (!value) return Promise.resolve()
                      const selectedTime = dayjs(value)
                      const now = dayjs()
                      if (selectedTime.isBefore(now)) {
                        return Promise.reject(
                          new Error('현재 시간 이후로 설정해주세요.')
                        )
                      }

                      // openAt과 비교
                      const openAtValue = form.getFieldValue('openAt')
                      if (openAtValue && selectedTime.isBefore(dayjs(openAtValue))) {
                        return Promise.reject(
                          new Error('강사공개 전환 시간 이후로 설정해주세요.')
                        )
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
                style={{ marginBottom: 0 }}
              >
                <DatePicker
                  showTime
                  format="YYYY-MM-DD HH:mm"
                  placeholder="신청마감 전환 시간 선택"
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>
            )}
          </Space>
        </Form.Item>

        <Form.Item
          label="강사 신청 제한"
          name="applicationRestriction"
          initialValue="ALL"
        >
          <Radio.Group
            value={applicationRestriction}
            onChange={(e) => {
              setApplicationRestriction(e.target.value)
              form.setFieldsValue({ applicationRestriction: e.target.value })
            }}
          >
            <Space direction="vertical">
              <Radio value="ALL">모두 신청 가능</Radio>
              <Radio value="MAIN_ONLY">주강사만 신청 가능</Radio>
              <Radio value="ASSISTANT_ONLY">보조강사만 신청 가능</Radio>
            </Space>
          </Radio.Group>
          <div className="mt-2 text-xs text-gray-500">
            <p>• 모두 신청 가능: 주강사와 보조강사 모두 신청할 수 있습니다.</p>
            <p>• 주강사만 신청 가능: 주강사 역할로만 신청할 수 있습니다.</p>
            <p>• 보조강사만 신청 가능: 보조강사 역할로만 신청할 수 있습니다.</p>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  )
}
