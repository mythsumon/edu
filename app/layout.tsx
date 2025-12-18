import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { LanguageProvider } from '@/components/localization/LanguageContext'
import { AppShell } from '@/components/layout/AppShell'

export const metadata: Metadata = {
  title: '교육 프로그램 현황',
  description: '경기 미래채움 권역별 데이터 한 눈에 보기',
}

export default function RootLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <html lang="ko">
      <body className="bg-slate-50">
        <LanguageProvider>
          <AppShell>{children}</AppShell>
        </LanguageProvider>
      </body>
    </html>
  )
}