'use client'

import { ReactNode } from 'react'
import { AppShell } from '@/components/layout/AppShell'

export default function InstructorLayout({
  children,
}: {
  children: ReactNode
}) {
  return <AppShell>{children}</AppShell>
}




