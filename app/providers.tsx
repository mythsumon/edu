'use client'

import { ReactNode } from 'react'
import { ConfigProvider } from 'antd'
import { AuthProvider } from '@/contexts/AuthContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { LanguageProvider } from '@/components/localization/LanguageContext'

interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0f172a', // Dark slate (matching login button)
          colorInfo: '#3b82f6', // Bright Blue
          colorSuccess: '#10b981', // Emerald Green
          colorWarning: '#f59e0b', // Amber
          colorError: '#ef4444',
          borderRadius: 12, // Rounded-xl
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
            primaryColor: '#0f172a',
            colorPrimaryHover: '#1e293b',
            colorPrimaryActive: '#0f172a',
          },
          Input: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: '#f8fafc', // Slate-50 background
            colorBorder: '#e2e8f0', // Slate-200 border
            colorText: '#0f172a', // Slate-900 text
            colorTextPlaceholder: '#94a3b8', // Slate-400 placeholder
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#60a5fa', // Blue-400
            activeShadow: '0 0 0 2px rgba(96, 165, 250, 0.2)',
          },
          Select: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: '#ffffff',
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#60a5fa',
            optionSelectedBg: '#dbeafe', // Blue-100
            optionActiveBg: '#eff6ff', // Blue-50
            optionSelectedColor: '#1e40af', // Blue-800
          },
          DatePicker: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 12,
            borderRadiusLG: 12,
            borderRadiusSM: 12,
            colorBgContainer: '#ffffff',
            colorBorder: '#e2e8f0',
            hoverBorderColor: '#cbd5e1',
            activeBorderColor: '#60a5fa',
          },
          Card: {
            borderRadiusLG: 16,
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          },
          Table: {
            borderRadiusLG: 16,
          },
        },
      }}
    >
      <AuthProvider>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </AuthProvider>
    </ConfigProvider>
  )
}
