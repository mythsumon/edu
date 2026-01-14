'use client'

export const dynamic = 'force-dynamic'

import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { CommonCodePage } from '@/components/admin/common-code'

export default function CommonCodeManagementPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        <div className="admin-page p-4 md:p-6">
          <CommonCodePage />
        </div>
      </div>
    </ProtectedRoute>
  )
}
