'use client'

import { ReactNode, useEffect } from 'react'
import { ConfigProvider, theme } from 'antd'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/components/localization/LanguageContext'
import { ErrorBoundary } from './error-boundary'
import { GlobalErrorHandler } from './error-handler'
import { educationScheduler } from '@/lib/educationScheduler'

interface AppProvidersProps {
  children: ReactNode
}

function ThemedConfigProvider({ children }: { children: ReactNode }) {
  const { theme: appTheme } = useTheme()
  const { defaultAlgorithm, darkAlgorithm } = theme

  return (
    <ConfigProvider
      theme={{
        algorithm: appTheme === 'dark' ? darkAlgorithm : defaultAlgorithm,
        token: {
          colorPrimary: appTheme === 'dark' ? '#60a5fa' : '#0f172a',
          colorInfo: '#3b82f6',
          colorSuccess: '#10b981',
          colorWarning: '#f59e0b',
          colorError: '#ef4444',
          borderRadius: 12,
          colorBgContainer: appTheme === 'dark' ? '#1f2937' : '#ffffff',
          colorBgElevated: appTheme === 'dark' ? '#374151' : '#ffffff',
          colorText: appTheme === 'dark' ? '#f9fafb' : '#0f172a',
          colorTextSecondary: appTheme === 'dark' ? '#d1d5db' : '#64748b',
          colorBorder: appTheme === 'dark' ? '#4b5563' : '#e2e8f0',
        },
        components: {
          Button: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            primaryShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            colorPrimary: appTheme === 'dark' ? '#60a5fa' : '#0f172a',
            colorPrimaryHover: appTheme === 'dark' ? '#3b82f6' : '#1e293b',
            colorPrimaryActive: appTheme === 'dark' ? '#2563eb' : '#0f172a',
          },
          Input: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: appTheme === 'dark' ? '#374151' : '#f8fafc',
            colorBorder: appTheme === 'dark' ? '#4b5563' : '#e2e8f0',
            colorText: appTheme === 'dark' ? '#f9fafb' : '#0f172a',
            colorTextPlaceholder: appTheme === 'dark' ? '#9ca3af' : '#94a3b8',
            hoverBorderColor: appTheme === 'dark' ? '#60a5fa' : '#cbd5e1',
            activeBorderColor: '#60a5fa',
            activeShadow: '0 0 0 2px rgba(96, 165, 250, 0.2)',
          },
          Select: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: appTheme === 'dark' ? '#374151' : '#ffffff',
            colorBorder: appTheme === 'dark' ? '#4b5563' : '#e2e8f0',
            hoverBorderColor: appTheme === 'dark' ? '#60a5fa' : '#cbd5e1',
            activeBorderColor: '#60a5fa',
            optionSelectedBg: appTheme === 'dark' ? '#1e3a8a' : '#dbeafe',
            optionActiveBg: appTheme === 'dark' ? '#1e40af' : '#eff6ff',
            optionSelectedColor: appTheme === 'dark' ? '#ffffff' : '#1e40af',
          },
          DatePicker: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: appTheme === 'dark' ? '#374151' : '#ffffff',
            colorBorder: appTheme === 'dark' ? '#4b5563' : '#e2e8f0',
            hoverBorderColor: appTheme === 'dark' ? '#60a5fa' : '#cbd5e1',
            activeBorderColor: '#60a5fa',
          },
          Card: {
            borderRadiusLG: 16,
            colorBgContainer: appTheme === 'dark' ? '#1f2937' : '#ffffff',
            colorBorderSecondary: appTheme === 'dark' ? '#374151' : '#e2e8f0',
            boxShadow: appTheme === 'dark' 
              ? '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2)'
              : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
          Table: {
            borderRadiusLG: 16,
            colorBgContainer: appTheme === 'dark' ? '#1f2937' : '#ffffff',
            colorText: appTheme === 'dark' ? '#f9fafb' : '#0f172a',
            colorTextHeading: appTheme === 'dark' ? '#f9fafb' : '#0f172a',
            colorBorderSecondary: appTheme === 'dark' ? '#374151' : '#e2e8f0',
            headerBg: appTheme === 'dark' ? '#111827' : '#f8fafc',
          },
          Modal: {
            colorBgElevated: appTheme === 'dark' ? '#1f2937' : '#ffffff',
            colorText: appTheme === 'dark' ? '#f9fafb' : '#0f172a',
          },
          Tabs: {
            colorText: appTheme === 'dark' ? '#d1d5db' : '#64748b',
            itemSelectedColor: appTheme === 'dark' ? '#60a5fa' : '#0f172a',
            itemHoverColor: appTheme === 'dark' ? '#93c5fd' : '#1e293b',
            inkBarColor: appTheme === 'dark' ? '#60a5fa' : '#0f172a',
          },
        },
      }}
    >
      {children}
    </ConfigProvider>
  )
}

function SchedulerInitializer({ children }: { children: ReactNode }) {
  useEffect(() => {
    // 스케줄러 시작
    educationScheduler.start()

    // 상태 업데이트 이벤트 리스너
    const handleStatusUpdate = (event: CustomEvent) => {
      // 이벤트가 발생하면 페이지가 자동으로 리렌더링되도록 함
      window.dispatchEvent(new Event('storage'))
    }

    window.addEventListener('educationStatusUpdated', handleStatusUpdate as EventListener)

    return () => {
      educationScheduler.stop()
      window.removeEventListener('educationStatusUpdated', handleStatusUpdate as EventListener)
    }
  }, [])

  return <>{children}</>
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <GlobalErrorHandler>
      <ErrorBoundary>
        <AuthProvider>
          <ThemeProvider>
            <ThemedConfigProvider>
              <LanguageProvider>
                <SchedulerInitializer>
                  {children}
                </SchedulerInitializer>
              </LanguageProvider>
            </ThemedConfigProvider>
          </ThemeProvider>
        </AuthProvider>
      </ErrorBoundary>
    </GlobalErrorHandler>
  )
}
