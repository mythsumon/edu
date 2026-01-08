'use client'

import { useState, useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Badge, Modal, message, Tooltip, Tabs } from 'antd'
import { Calendar, MapPin, Users, Clock, UserCheck, UserPlus, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { Education, InstructorApplication } from '@/lib/dataStore'

export default function ApplyForEducationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const educationIdParam = searchParams?.get('educationId') || null
  const [activeTab, setActiveTab] = useState<'open' | 'closed'>('open')
  
  const allEducations = dataStore.getEducations()
  const currentInstructorName = '홍길동' // Mock instructor name
  
  // OPEN 상태의 교육 (신청 가능) - Only 강사공개 allows applications
  const openEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status must be 강사공개 (only this status allows instructor applications)
      if (education.status !== '강사공개' && education.educationStatus !== 'OPEN' && education.educationStatus !== '신청 중') {
        return false
      }
      
      // Check if deadline passed
      if (education.applicationDeadline) {
        const deadline = dayjs(education.applicationDeadline)
        if (now.isAfter(deadline)) {
          return false // 마감일이 지난 것은 마감 탭으로
        }
      }
      
      // If educationId param exists, filter by it
      if (educationIdParam && education.educationId !== educationIdParam) {
        return false
      }
      
      return true
    })
  }, [allEducations, educationIdParam])
  
  // 마감된 교육
  const closedEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status is 신청 마감 or deadline passed
      const isStatusClosed = education.educationStatus === '신청 마감'
      const isDeadlinePassed = education.applicationDeadline 
        ? dayjs(education.applicationDeadline).isBefore(now, 'day')
        : false
      
      if (!isStatusClosed && !isDeadlinePassed) {
        return false
      }
      
      // If educationId param exists, filter by it
      if (educationIdParam && education.educationId !== educationIdParam) {
        return false
      }
      
      return true
    })
  }, [allEducations, educationIdParam])

  const canApply = (education: Education): { canApply: boolean; reason?: string } => {
    const now = dayjs()
    
    // Only 강사공개 status allows applications
    if (education.status !== '강사공개' && education.educationStatus !== 'OPEN' && education.educationStatus !== '신청 중') {
      return { canApply: false, reason: '신청 가능한 상태가 아닙니다. (강사공개 상태만 신청 가능)' }
    }
    
    // Check if deadline passed
    if (education.applicationDeadline) {
      const deadline = dayjs(education.applicationDeadline)
      if (now.isAfter(deadline)) {
        return { canApply: false, reason: '신청 마감일이 지났습니다.' }
      }
    }
    
    // Check if status is 마감
    if (education.status === '신청마감' || education.educationStatus === '신청 마감') {
      return { canApply: false, reason: '교육이 마감되었습니다.' }
    }
    
    return { canApply: true }
  }

  const handleApply = (education: Education, role: '주강사' | '보조강사') => {
    const check = canApply(education)
    if (!check.canApply) {
      message.warning(check.reason)
      return
    }

    Modal.confirm({
      title: '출강 신청 확인',
      content: `${education.name}에 ${role}로 신청하시겠습니까?`,
      onOk: async () => {
        try {
          // TODO: Replace with actual API call
          // await instructorService.applyToEducation(education.educationId, role)
          
          // Create application
          const newApplication: InstructorApplication = {
            key: `app-${Date.now()}`,
            educationId: education.educationId,
            educationName: education.name,
            institution: education.institution,
            region: education.region,
            gradeClass: education.gradeClass,
            role: role,
            instructorName: currentInstructorName,
            applicationDate: dayjs().format('YYYY.MM.DD'),
            status: '대기',
            educationStatus: education.educationStatus,
            applicationDeadline: education.applicationDeadline,
          }
          
          dataStore.addInstructorApplication(newApplication)
          
          message.success('신청이 완료되었습니다.')
          router.push('/instructor/apply/mine')
        } catch (error) {
          console.error('Failed to apply:', error)
          message.error('신청 처리 중 오류가 발생했습니다.')
        }
      },
    })
  }

  const getDaysUntilDeadline = (deadline: string) => {
    const deadlineDate = dayjs(deadline)
    const now = dayjs()
    const days = deadlineDate.diff(now, 'day')
    if (days < 0) return '마감됨'
    if (days === 0) return '오늘 마감'
    return `D-${days}`
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              출강 신청하기
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              모집 중인 교육에 출강을 신청하세요.
            </p>
          </div>

          {/* Tabs */}
          <Card className="mb-6">
            <Tabs
              activeKey={activeTab}
              onChange={(key) => setActiveTab(key as 'open' | 'closed')}
              items={[
                {
                  key: 'open',
                  label: `신청 가능 (${openEducations.length})`,
                },
                {
                  key: 'closed',
                  label: `마감 (${closedEducations.length})`,
                },
              ]}
            />
          </Card>

          {/* Education Cards */}
          {activeTab === 'open' ? (
            openEducations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {openEducations.map((education) => {
                const applyCheck = canApply(education)
                
                return (
                  <Card
                    key={education.key}
                    className="hover:shadow-lg transition-shadow"
                    actions={[
                      <Tooltip
                        key="main"
                        title={!applyCheck.canApply ? applyCheck.reason : ''}
                      >
                        <Button
                          type="primary"
                          className="w-full"
                          icon={<UserCheck className="w-4 h-4" />}
                          disabled={!applyCheck.canApply}
                          onClick={() => handleApply(education, '주강사')}
                        >
                          주강사 신청
                        </Button>
                      </Tooltip>,
                      <Tooltip
                        key="assistant"
                        title={!applyCheck.canApply ? applyCheck.reason : ''}
                      >
                        <Button
                          type="default"
                          className="w-full"
                          icon={<UserPlus className="w-4 h-4" />}
                          disabled={!applyCheck.canApply}
                          onClick={() => handleApply(education, '보조강사')}
                        >
                          보조강사 신청
                        </Button>
                      </Tooltip>,
                    ]}
                  >
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                          {education.name}
                        </h3>
                        {education.applicationDeadline && (
                          <div className="flex items-center gap-2 mb-2">
                            <Badge 
                              status={applyCheck.canApply ? "processing" : "error"} 
                              text={
                                applyCheck.canApply 
                                  ? getDaysUntilDeadline(education.applicationDeadline)
                                  : '마감됨'
                              } 
                            />
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{education.institution}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{education.periodStart} ~ {education.periodEnd}</span>
                        </div>
                        {education.applicationDeadline && (
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>신청 마감: {education.applicationDeadline}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{education.gradeClass}</span>
                        </div>
                      </div>

                      {!applyCheck.canApply && (
                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>{applyCheck.reason}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">신청 가능한 교육이 없습니다.</p>
              </Card>
            )
          ) : (
            // 마감된 교육 탭
            closedEducations.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {closedEducations.map((education) => {
                  const applyCheck = canApply(education)
                  
                  return (
                    <Card
                      key={education.key}
                      className="hover:shadow-lg transition-shadow opacity-75"
                      actions={[
                        <Tooltip
                          key="main"
                          title={!applyCheck.canApply ? applyCheck.reason : ''}
                        >
                          <Button
                            type="primary"
                            className="w-full"
                            icon={<UserCheck className="w-4 h-4" />}
                            disabled={true}
                          >
                            주강사 신청
                          </Button>
                        </Tooltip>,
                        <Tooltip
                          key="assistant"
                          title={!applyCheck.canApply ? applyCheck.reason : ''}
                        >
                          <Button
                            type="default"
                            className="w-full"
                            icon={<UserPlus className="w-4 h-4" />}
                            disabled={true}
                          >
                            보조강사 신청
                          </Button>
                        </Tooltip>,
                      ]}
                    >
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                            {education.name}
                          </h3>
                          {education.applicationDeadline && (
                            <div className="flex items-center gap-2 mb-2">
                              <Badge 
                                status="error"
                                text="마감됨"
                              />
                            </div>
                          )}
                        </div>

                        <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4" />
                            <span>{education.institution}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            <span>{education.periodStart} ~ {education.periodEnd}</span>
                          </div>
                          {education.applicationDeadline && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>신청 마감: {education.applicationDeadline}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            <span>{education.gradeClass}</span>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                          <div className="flex items-center gap-2 text-sm text-red-600">
                            <AlertCircle className="w-4 h-4" />
                            <span>신청이 마감되었습니다.</span>
                          </div>
                        </div>
                      </div>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <Card className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">마감된 교육이 없습니다.</p>
              </Card>
            )
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}



