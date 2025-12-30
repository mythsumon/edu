'use client'

import { useState } from 'react'
import { Form, InputNumber, DatePicker, TimePicker, Card, Button, Space } from 'antd'
import { ChevronDown, ChevronUp, Copy } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'

interface LessonData {
  date?: Dayjs
  startTime?: Dayjs
  endTime?: Dayjs
  mainInstructorCount?: number
  assistantInstructorCount?: number
}

interface ClassInfoGeneralFormProps {
  lessonCount: number
  lessons: LessonData[]
  onLessonCountChange: (count: number) => void
  onLessonsChange: (lessons: LessonData[]) => void
  form: any
}

export function ClassInfoGeneralForm({
  lessonCount,
  lessons,
  onLessonCountChange,
  onLessonsChange,
  form,
}: ClassInfoGeneralFormProps) {
  const [expandedSessions, setExpandedSessions] = useState<Set<number>>(
    new Set(Array.from({ length: lessonCount }, (_, i) => i))
  )
  const [allExpanded, setAllExpanded] = useState(true)

  const toggleSession = (index: number) => {
    const newExpanded = new Set(expandedSessions)
    if (newExpanded.has(index)) {
      newExpanded.delete(index)
    } else {
      newExpanded.add(index)
    }
    setExpandedSessions(newExpanded)
    setAllExpanded(newExpanded.size === lessonCount)
  }

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSessions(new Set())
      setAllExpanded(false)
    } else {
      setExpandedSessions(new Set(Array.from({ length: lessonCount }, (_, i) => i)))
      setAllExpanded(true)
    }
  }

  const copyPreviousSession = (index: number) => {
    if (index === 0) return
    
    const currentLessons = form.getFieldValue('lessons') || []
    const previousLesson = currentLessons[index - 1]
    if (!previousLesson) return

    const updatedLessons = [...currentLessons]
    updatedLessons[index] = { ...previousLesson }
    
    // Update form fields
    form.setFieldsValue({
      lessons: updatedLessons,
    })
  }

  return (
    <div className="space-y-4">
      <Form.Item
        label={
          <span>
            수업 개수 <span className="text-red-500">*</span>
          </span>
        }
        name="lessonCount"
        rules={[{ required: true, message: '수업 개수를 입력해주세요' }]}
        className="mb-0"
        help="총 수업 횟수를 입력하세요"
      >
        <InputNumber
          className="w-full h-11 rounded-xl max-w-xs"
          placeholder="수업 개수"
          min={1}
          value={lessonCount}
          onChange={(value) => {
            const newCount = value || 1
            onLessonCountChange(newCount)
            form.setFieldsValue({ lessonCount: newCount })
            
            // Adjust expanded sessions
            const newExpanded = new Set(expandedSessions)
            if (newCount < lessonCount) {
              // Remove expanded states for removed sessions
              Array.from(newExpanded).forEach(idx => {
                if (idx >= newCount) newExpanded.delete(idx)
              })
            } else {
              // Add new sessions to expanded
              for (let i = lessonCount; i < newCount; i++) {
                newExpanded.add(i)
              }
            }
            setExpandedSessions(newExpanded)
            setAllExpanded(newExpanded.size === newCount)
          }}
        />
      </Form.Item>

      {/* Helper Actions */}
      {lessonCount > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Button
              type="text"
              size="small"
              icon={allExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              onClick={toggleAll}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {allExpanded ? '전체 접기' : '전체 펼치기'}
            </Button>
          </div>
        </div>
      )}

      {/* Session Cards */}
      <div className="space-y-4">
        {Array.from({ length: lessonCount }).map((_, index) => {
          const isExpanded = expandedSessions.has(index)
          return (
            <Card
              key={index}
              className="rounded-xl border border-gray-200 bg-white"
              bodyStyle={{ padding: 0 }}
            >
              <button
                type="button"
                onClick={() => toggleSession(index)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-900">
                    {index + 1}차시 수업
                  </span>
                  {index > 0 && (
                    <Button
                      type="text"
                      size="small"
                      icon={<Copy className="w-3 h-3" />}
                      onClick={(e) => {
                        e.stopPropagation()
                        copyPreviousSession(index)
                      }}
                      className="text-xs text-gray-500 hover:text-gray-700 h-6 px-2"
                    >
                      이전 회차 복사
                    </Button>
                  )}
                </div>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                )}
              </button>
              
              {isExpanded && (
                <div className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Form.Item
                      label={
                        <span>
                          일자 <span className="text-red-500">*</span>
                        </span>
                      }
                      name={['lessons', index, 'date']}
                      rules={[{ required: true, message: '일자를 선택해주세요' }]}
                      className="mb-0"
                    >
                      <DatePicker
                        className="w-full h-11 rounded-xl"
                        placeholder="일자 선택"
                        format="YYYY.MM.DD"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span>
                          시작시간 <span className="text-red-500">*</span>
                        </span>
                      }
                      name={['lessons', index, 'startTime']}
                      rules={[{ required: true, message: '시작시간을 선택해주세요' }]}
                      className="mb-0"
                    >
                      <TimePicker
                        className="w-full h-11 rounded-xl"
                        placeholder="시작시간 선택"
                        format="HH:mm"
                        popupClassName="tp-popup-primary-ok"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span>
                          종료시간 <span className="text-red-500">*</span>
                        </span>
                      }
                      name={['lessons', index, 'endTime']}
                      rules={[
                        { required: true, message: '종료시간을 선택해주세요' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            const startTime = getFieldValue(['lessons', index, 'startTime'])
                            if (!value || !startTime) {
                              return Promise.resolve()
                            }
                            if (value.isBefore(startTime) || value.isSame(startTime)) {
                              return Promise.reject(new Error('종료시간은 시작시간보다 늦어야 합니다'))
                            }
                            return Promise.resolve()
                          },
                        }),
                      ]}
                      className="mb-0"
                    >
                      <TimePicker
                        className="w-full h-11 rounded-xl"
                        placeholder="종료시간 선택"
                        format="HH:mm"
                        popupClassName="tp-popup-primary-ok"
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span>
                          필요 주강사 수 <span className="text-red-500">*</span>
                        </span>
                      }
                      name={['lessons', index, 'mainInstructorCount']}
                      rules={[{ required: true, message: '필요 주강사 수를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        className="w-full h-11 rounded-xl"
                        placeholder="필요 주강사 수"
                        min={1}
                      />
                    </Form.Item>

                    <Form.Item
                      label={
                        <span>
                          필요 보조강사 수 <span className="text-red-500">*</span>
                        </span>
                      }
                      name={['lessons', index, 'assistantInstructorCount']}
                      rules={[{ required: true, message: '필요 보조강사 수를 입력해주세요' }]}
                      className="mb-0"
                    >
                      <InputNumber
                        className="w-full h-11 rounded-xl"
                        placeholder="필요 보조강사 수"
                        min={0}
                      />
                    </Form.Item>
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    </div>
  )
}

