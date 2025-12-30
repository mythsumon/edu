'use client'

import { useMemo } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card, Button, Badge } from 'antd'
import { Calendar, MapPin, Users, Clock, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import dayjs from 'dayjs'
import { dataStore } from '@/lib/dataStore'
import type { Education } from '@/lib/dataStore'

export default function UpcomingEducationPage() {
  const router = useRouter()
  const allEducations = dataStore.getEducations()
  
  const upcomingEducations = useMemo(() => {
    const now = dayjs()
    return allEducations.filter(education => {
      // Status must be OPEN or 신청 중 (모집중)
      if (education.educationStatus !== 'OPEN' && education.educationStatus !== '신청 중') {
        return false
      }
      
      // Start date must be in the future
      const start = education.periodStart ? dayjs(education.periodStart) : null
      if (!start || !start.isAfter(now)) {
        return false
      }
      
      return true
    })
  }, [allEducations])

  const getDaysUntilStart = (startDate: string) => {
    const start = dayjs(startDate)
    const now = dayjs()
    const days = start.diff(now, 'day')
    return days > 0 ? `${days}일 후` : '곧 시작'
  }

  return (
    <ProtectedRoute requiredRole="instructor">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              오픈 예정 교육
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              곧 시작될 교육 프로그램을 확인하고 신청하세요.
            </p>
          </div>

          {/* Education Cards */}
          {upcomingEducations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEducations.map((education) => (
                <Card
                  key={education.key}
                  className="hover:shadow-lg transition-shadow"
                  actions={[
                    <Button
                      key="apply"
                      type="primary"
                      className="w-full"
                      icon={<ArrowRight className="w-4 h-4" />}
                      onClick={() => router.push(`/instructor/apply/open?educationId=${education.educationId}`)}
                    >
                      신청하기
                    </Button>,
                  ]}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                        {education.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge status="processing" text={getDaysUntilStart(education.periodStart || '')} />
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{education.institution}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{education.region}</span>
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

                    {education.lessons && education.lessons.length > 0 && (
                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="text-sm text-gray-500">
                          모집 역할: 주강사 {typeof education.lessons[0].mainInstructors === 'number' 
                            ? education.lessons[0].mainInstructors 
                            : education.lessons[0].mainInstructorRequired || 0}명, 
                          보조강사 {typeof education.lessons[0].assistantInstructors === 'number'
                            ? education.lessons[0].assistantInstructors
                            : education.lessons[0].assistantInstructorRequired || 0}명
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">오픈 예정 교육이 없습니다.</p>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}


