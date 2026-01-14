'use client'

import { useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Badge } from 'antd'
import { Calendar, MapPin, Users, Award, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'

export default function CompletedEducationPage() {
  const router = useRouter()
  const currentInstructorName = '홍길동' // Mock instructor name
  const allAssignments = dataStore.getInstructorAssignments()
  
  const completedAssignments = useMemo(() => {
    const now = dayjs()
    return allAssignments.filter(assignment => {
      // Status is 완료 OR end date is past
      if (assignment.status === '완료') return true
      
      const end = assignment.periodEnd ? dayjs(assignment.periodEnd) : null
      if (end && now.isAfter(end)) return true
      
      return false
    }).filter(assignment => {
      // Check if instructor was assigned
      if (!assignment.lessons) return false
      
      return assignment.lessons.some(lesson => {
        const mainInstructors = Array.isArray(lesson.mainInstructors) 
          ? lesson.mainInstructors 
          : []
        const assistantInstructors = Array.isArray(lesson.assistantInstructors)
          ? lesson.assistantInstructors
          : []
        
        return mainInstructors.some(inst => inst.name === currentInstructorName) ||
               assistantInstructors.some(inst => inst.name === currentInstructorName)
      })
    })
  }, [allAssignments, currentInstructorName])

  const allCount = completedAssignments.length

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              완료된 교육
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              완료된 교육 내역을 확인하세요.
            </p>
          </div>

          {/* Statistics Card */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="rounded-xl">
              <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">전체</div>
              <div className="text-3xl font-bold text-slate-600">{allCount}</div>
            </Card>
          </div>

          {/* Education Cards */}
          <Card className="rounded-xl">
            {completedAssignments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedAssignments.map((assignment) => (
                <Card
                  key={assignment.key}
                  className="hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      key="review"
                      type="default"
                      className="w-full"
                      onClick={() => {
                        // TODO: Navigate to review/settlement page
                        router.push(`/instructor/schedule/${assignment.educationId}/review`)
                      }}
                    >
                      후기/정산
                    </Button>,
                  ]}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {assignment.educationName}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge status="success" text="완료" />
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
                    </div>

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">교육 요약</span>
                        <Award className="w-4 h-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">완료된 교육이 없습니다.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}



