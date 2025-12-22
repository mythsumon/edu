import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { AppProviders } from './providers'

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
    <html lang="ko" suppressHydrationWarning>
      <body className="bg-slate-50" suppressHydrationWarning>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  )
}