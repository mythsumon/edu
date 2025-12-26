'use client'

import { Button, Space } from 'antd'
import { ArrowLeft, Save, FileText } from 'lucide-react'

interface PageHeaderStickyProps {
  mode: 'create' | 'edit'
  onCancel: () => void
  onTempSave: () => void
  onSave: () => void
}

export function PageHeaderSticky({ mode, onCancel, onTempSave, onSave }: PageHeaderStickyProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Cancel Button */}
        <Button
          icon={<ArrowLeft className="w-4 h-4" />}
          onClick={onCancel}
          className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
        >
          취소
        </Button>

        {/* Right: Actions */}
        <Space>
          <Button
            icon={<FileText className="w-4 h-4" />}
            onClick={onTempSave}
            className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
          >
            임시저장
          </Button>
          <Button
            type="primary"
            icon={<Save className="w-4 h-4" />}
            onClick={onSave}
            className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            저장
          </Button>
        </Space>
      </div>
    </div>
  )
}
