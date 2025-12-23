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
          colorPrimary: '#1a202c', // Dark slate (matching login button)
          colorInfo: '#3b82f6', // Bright Blue
          colorSuccess: '#4ade80', // Mint Green
          colorWarning: '#f97316', // Orange
          colorError: '#EF4444',
          borderRadius: 8, // Rounded corners
        },
        components: {
          Button: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 8,
            borderRadiusLG: 8,
            borderRadiusSM: 8,
            primaryShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            primaryColor: '#1a202c',
            colorPrimaryHover: '#2d3748',
            colorPrimaryActive: '#1a202c',
          },
          Input: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 8,
            borderRadiusLG: 8,
            borderRadiusSM: 8,
            colorBgContainer: '#ffffff', // White background
            colorBorder: '#ffeae0', // Pastel Peach border
            colorText: '#3a2e2a', // Deep Cocoa text
            colorTextPlaceholder: '#8d7c77', // Muted Brown placeholder
            hoverBorderColor: '#ffeae0',
            activeBorderColor: '#ffeae0',
            activeShadow: 'none',
          },
          Select: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 8,
            borderRadiusLG: 8,
            borderRadiusSM: 8,
            colorBgContainer: '#ffffff',
            colorBorder: '#ffeae0',
            hoverBorderColor: '#ffeae0',
            activeBorderColor: '#FF8A65',
            activeShadow: 'none',
          },
          DatePicker: {
            controlHeight: 44,
            controlHeightLG: 52,
            controlHeightSM: 36,
            borderRadius: 8,
            borderRadiusLG: 8,
            borderRadiusSM: 8,
            colorBgContainer: '#ffffff',
            colorBorder: '#ffeae0',
          },
          Card: {
            borderRadiusLG: 8,
            boxShadow: '0 2px 8px rgba(255, 138, 101, 0.08), 0 1px 3px rgba(255, 138, 101, 0.12)',
          },
          Table: {
            borderRadiusLG: 8,
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
