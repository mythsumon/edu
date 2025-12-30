'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { AdminSidebar } from '@/components/layout/admin/AdminSidebar'
import { InstructorSidebar } from '@/components/layout/instructor/InstructorSidebar'
import { Header } from '@/components/layout/Header'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { ScrollToTop } from '@/components/shared/common'

interface AppShellProps {
  children: ReactNode
}

export function AppShell({ children }: AppShellProps) {
  const pathname = usePathname()
  const { userRole } = useAuth()
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  // 로그인 페이지에서는 헤더/사이드바 없이 콘텐츠만 렌더링
  if (pathname === '/login') {
    return <>{children}</>
  }

  // Role-based sidebar selection
  const renderSidebar = () => {
    if (userRole === 'admin') {
      return <AdminSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
    } else if (userRole === 'instructor') {
      return <InstructorSidebar isCollapsed={isSidebarCollapsed} setIsCollapsed={setIsSidebarCollapsed} />
    }
    return null
  }

  return (
    <div className="flex h-screen overflow-hidden bg-white">
      {renderSidebar()}
      <div className={`flex flex-col flex-1 overflow-hidden ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        <Header />
        <main className="flex-1 overflow-y-auto bg-white">
          {children}
          <ScrollToTop />
        </main>
      </div>
    </div>
  )
}
