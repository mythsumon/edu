'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Card } from 'antd'
import { FileCheck, ClipboardList, GraduationCap } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { dataStore } from '@/lib/dataStore'
import { teacherEducationInfoStore, attendanceInfoRequestStore, teacherAttendanceSignatureStore } from '@/lib/teacherStore'
import { getAttendanceDocs } from '@/app/instructor/schedule/[educationId]/attendance/storage'
import dayjs from 'dayjs'

export default function TeacherDashboard() {
  const router = useRouter()
  const { userProfile } = useAuth()
  const [stats, setStats] = useState({
    signatureRequired: 0,
    infoRequestCount: 0,
    inProgressCount: 0,
    scheduledCount: 0,
  })

  const currentTeacherId = userProfile?.userId || 'teacher-1'
  const currentInstitutionId = 'INST-001' // TODO: Get from teacher profile
  const currentInstitutionName = '평택안일초등학교' // TODO: Get from teacher profile

  const loadStats = useCallback(() => {
    try {
      // Count signature required (attendance docs without teacher signature)
      const attendanceDocs = getAttendanceDocs() || []
      const signatures = teacherAttendanceSignatureStore.getAll() || []
      const signatureRequired = attendanceDocs.filter(doc => {
        if (!doc || !doc.educationId) return false
        // Check if this education belongs to teacher's institution
        const education = dataStore.getEducationById(doc.educationId)
        if (!education || education.institution !== currentInstitutionName) return false
        
        // Check if teacher has signed
        const hasSigned = signatures.some(sig => 
          sig && sig.educationId === doc.educationId && sig.teacherId === currentTeacherId
        )
        return !hasSigned
      }).length

      // Count open requests
      const openRequests = attendanceInfoRequestStore.getOpenRequests(currentInstitutionId) || []

      // Count educations by status
      const allEducations = dataStore.getEducations() || []
      const myEducations = allEducations.filter(edu => edu && edu.institution === currentInstitutionName)
      const now = dayjs()
      
      const inProgress = myEducations.filter(edu => {
        if (!edu) return false
        if (edu.periodStart && edu.periodEnd) {
          try {
            const start = dayjs(edu.periodStart)
            const end = dayjs(edu.periodEnd)
            return now.isAfter(start) && now.isBefore(end)
          } catch {
            return false
          }
        }
        return false
      }).length

      const scheduled = myEducations.filter(edu => {
        if (!edu) return false
        if (edu.periodStart) {
          try {
            return dayjs(edu.periodStart).isAfter(now)
          } catch {
            return false
          }
        }
        return false
      }).length

      setStats({
        signatureRequired,
        infoRequestCount: openRequests.length,
        inProgressCount: inProgress,
        scheduledCount: scheduled,
      })
    } catch (error) {
      console.error('Error loading teacher dashboard stats:', error)
      // Set default stats on error
      setStats({
        signatureRequired: 0,
        infoRequestCount: 0,
        inProgressCount: 0,
        scheduledCount: 0,
      })
    }
  }, [currentTeacherId, currentInstitutionId, currentInstitutionName])

  useEffect(() => {
    loadStats()

    // Listen for updates
    const handleUpdate = () => {
      loadStats()
    }

    window.addEventListener('teacherEducationInfoUpdated', handleUpdate)
    window.addEventListener('attendanceInfoRequestUpdated', handleUpdate)
    window.addEventListener('teacherAttendanceSigned', handleUpdate)
    window.addEventListener('attendanceUpdated', handleUpdate)

    return () => {
      window.removeEventListener('teacherEducationInfoUpdated', handleUpdate)
      window.removeEventListener('attendanceInfoRequestUpdated', handleUpdate)
      window.removeEventListener('teacherAttendanceSigned', handleUpdate)
      window.removeEventListener('attendanceUpdated', handleUpdate)
    }
  }, [loadStats])

  return (
    <ProtectedRoute requiredRole="teacher">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 transition-colors">
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              대시보드
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              학교 선생님 대시보드입니다.
            </p>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/teacher/attendance-sign')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">서명 필요</div>
                  <div className="text-3xl font-bold text-red-600">{stats.signatureRequired}</div>
                </div>
                <FileCheck className="w-8 h-8 text-red-500" />
              </div>
            </Card>
            <Card 
              className="rounded-xl cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => router.push('/teacher/requests')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">출석부 작성 요청</div>
                  <div className="text-3xl font-bold text-blue-600">{stats.infoRequestCount}</div>
                </div>
                <ClipboardList className="w-8 h-8 text-blue-500" />
              </div>
            </Card>
            <Card className="rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">진행중</div>
                  <div className="text-3xl font-bold text-green-600">{stats.inProgressCount}</div>
                </div>
                <GraduationCap className="w-8 h-8 text-green-500" />
              </div>
            </Card>
            <Card className="rounded-xl">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">예정</div>
                  <div className="text-3xl font-bold text-purple-600">{stats.scheduledCount}</div>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card className="rounded-xl">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">빠른 작업</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={() => router.push('/teacher/attendance-sign')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors text-left"
              >
                <FileCheck className="w-6 h-6 text-purple-600 mb-2" />
                <div className="font-semibold text-gray-900 dark:text-gray-100">출석부 서명</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">서명이 필요한 출석부 확인</div>
              </button>
              <button
                onClick={() => router.push('/teacher/requests')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-left"
              >
                <ClipboardList className="w-6 h-6 text-blue-600 mb-2" />
                <div className="font-semibold text-gray-900 dark:text-gray-100">요청함</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">강사의 출석부 정보 요청</div>
              </button>
              <button
                onClick={() => router.push('/teacher/classes')}
                className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors text-left"
              >
                <GraduationCap className="w-6 h-6 text-green-600 mb-2" />
                <div className="font-semibold text-gray-900 dark:text-gray-100">수업 목록</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">내 학교 수업 목록 보기</div>
              </button>
            </div>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
