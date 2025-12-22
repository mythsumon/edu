'use client'

export const dynamic = 'force-dynamic'

import { Card } from 'antd'
import { Plus } from 'lucide-react'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { PageTitle } from '@/components/common/PageTitle'

export default function CreateEducationPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="p-6">
        <PageTitle 
          title="교육 생성"
          subtitle="새로운 교육 프로그램을 생성합니다"
        />
        
        <Card className="rounded-2xl shadow-sm border border-gray-200">
          <div className="text-center py-12">
            <Plus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">교육 생성</h3>
            <p className="text-gray-500">새로운 교육 프로그램을 생성할 수 있습니다</p>
          </div>
        </Card>
      </div>
    </ProtectedRoute>
  )
}