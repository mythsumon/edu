'use client'

import { Button, Space } from 'antd'
import { ArrowLeft, Edit, Trash2, X } from 'lucide-react'

interface DetailPageHeaderStickyProps {
  onBack?: () => void
  onEdit?: () => void
  onDelete?: () => void
  title?: string
}

export function DetailPageHeaderSticky({ onBack, onEdit, onDelete, title }: DetailPageHeaderStickyProps) {
  return (
    <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left: Title or Back Button */}
        <div className="flex items-center gap-4">
          {onBack && (
            <Button
              icon={<ArrowLeft className="w-4 h-4" />}
              onClick={onBack}
              className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
            >
              뒤로가기
            </Button>
          )}
          {title && (
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          )}
        </div>

        {/* Right: Actions */}
        <Space>
          {onEdit && (
            <Button
              type="primary"
              icon={<Edit className="w-4 h-4" />}
              onClick={onEdit}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              수정
            </Button>
          )}
          {onDelete && (
            <Button
              danger
              icon={<Trash2 className="w-4 h-4" />}
              onClick={onDelete}
              className="h-11 px-6 rounded-xl font-medium transition-all"
            >
              삭제
            </Button>
          )}
        </Space>
      </div>
    </div>
  )
}

