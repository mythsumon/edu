import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { LanguageProvider } from '@/components/localization/LanguageContext'

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
          <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 overflow-hidden">
              <Header />
              <main className="flex-1 overflow-y-auto bg-slate-50">
                {children}
              </main>
            </div>
          </div>
        </LanguageProvider>
      </body>
    </html>
  )
}