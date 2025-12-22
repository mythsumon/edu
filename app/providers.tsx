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
          colorPrimary: '#ff8a65', // Vibrant Peach
          colorInfo: '#3b82f6', // Bright Blue
          colorSuccess: '#4ade80', // Mint Green
          colorWarning: '#f97316', // Orange
          colorError: '#EF4444',
          borderRadius: 32, // Super-elliptical rounding
        },
        components: {
          Button: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 32,
            borderRadiusLG: 32,
            borderRadiusSM: 32,
            primaryShadow: '0 4px 12px rgba(255, 138, 101, 0.25)',
          },
          Input: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 32,
            borderRadiusLG: 32,
            borderRadiusSM: 32,
            colorBgContainer: '#fff5f0', // Soft Peach background
            colorBorder: '#ffeae0', // Pastel Peach border
            colorText: '#3a2e2a', // Deep Cocoa text
            colorTextPlaceholder: '#8d7c77', // Muted Brown placeholder
          },
          Select: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 32,
            borderRadiusLG: 32,
            borderRadiusSM: 32,
            colorBgContainer: '#fff5f0',
            colorBorder: '#ffeae0',
          },
          DatePicker: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 32,
            borderRadiusLG: 32,
            borderRadiusSM: 32,
            colorBgContainer: '#fff5f0',
            colorBorder: '#ffeae0',
          },
          Card: {
            borderRadiusLG: 32,
            boxShadow: '0 2px 8px rgba(255, 138, 101, 0.08), 0 1px 3px rgba(255, 138, 101, 0.12)',
          },
          Table: {
            borderRadiusLG: 32,
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
