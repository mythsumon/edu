'use client'

import { Card } from 'antd'
import { Edit3 } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PageTitle } from '@/components/common/PageTitle'

export default function EducationStatusPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <PageTitle 
          title="교육 상태 변경"
          subtitle="교육 프로그램의 상태를 변경합니다"
        />
        
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <Edit3 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">교육 상태 변경</h3>
            <p className="text-gray-500">교육 프로그램의 상태를 변경할 수 있습니다</p>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  )
}