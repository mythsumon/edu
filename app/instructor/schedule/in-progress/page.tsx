'use client'

import { useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Badge } from 'antd'
import { Calendar, Clock, MapPin, Users, CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

export default function InProgressEducationPage() {
  const router = useRouter()
  const currentInstructorName = '홍길동' // Mock instructor name
  const allAssignments = dataStore.getInstructorAssignments()
  
  const inProgressAssignments = useMemo(() => {
    const now = dayjs()
    return allAssignments.filter(assignment => {
      // Status must be 진행중 OR current time is between start and end
      if (assignment.status !== '진행중') {
        const start = assignment.periodStart ? dayjs(assignment.periodStart) : null
        const end = assignment.periodEnd ? dayjs(assignment.periodEnd) : null
        if (!start || !end) return false
        if (!now.isAfter(start) || !now.isBefore(end)) return false
      }
      
      // Check if instructor is assigned
      if (!assignment.lessons) return false
      
      return assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) 
          ? lesson.mainInstructors 
          : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors)
          ? lesson.assistantInstructors
          : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName && inst.status === 'confirmed') ||
               assistantInstructors.some(inst => inst.name === currentInstructorName && inst.status === 'confirmed')
      })
    })
  }, [allAssignments, currentInstructorName])

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              진행 중인 교육
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              현재 진행 중인 교육을 확인하고 출석을 관리하세요.
            </p>
          </div>

          {/* Education Cards */}
          {inProgressAssignments.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressAssignments.map((assignment) => (
                <Card
                  key={assignment.key}
                  className="hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      key="attendance"
                      type="primary"
                      className="w-full"
                      onClick={() => {
                        // TODO: Navigate to attendance page
                        router.push(`/instructor/schedule/${assignment.educationId}/attendance`)
                      }}
                    >
                      출석/확인
                    </Button>,
                  ]}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {assignment.educationName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge status="processing" text="진행 중" />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{assignment.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>{assignment.periodStart} ~ {assignment.periodEnd}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{assignment.gradeClass}</span>
                      </div>
                      {assignment.lessons && assignment.lessons.length > 0 && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>
                            {assignment.lessons[0].startTime} ~ {assignment.lessons[0].endTime}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">진행 중인 교육이 없습니다.</p>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}



