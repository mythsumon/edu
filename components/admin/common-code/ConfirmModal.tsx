'use client'

import { Modal } from 'antd'
import { AlertTriangle } from 'lucide-react'

interface ConfirmModalProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmText?: string
  cancelText?: string
  danger?: boolean
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = '삭제',
  cancelText = '취소',
  danger = true,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onOk={onConfirm}
      onCancel={onCancel}
      okText={confirmText}
      cancelText={cancelText}
      okButtonProps={{
        danger,
        className: 'h-9 px-4 rounded-xl font-medium',
        style: danger
          ? {
              backgroundColor: '#ef4444',
              borderColor: '#ef4444',
            }
          : {
              background: 'linear-gradient(to right, #1E3A8A, #2563EB)',
              borderColor: 'transparent',
            },
      }}
      cancelButtonProps={{
        className: 'h-9 px-4 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium text-slate-700 transition-colors',
      }}
      className="[&_.ant-modal-content]:rounded-2xl [&_.ant-modal-header]:border-b [&_.ant-modal-header]:border-slate-200"
    >
      <div className="flex items-start gap-4 py-4">
        <div className="flex-shrink-0">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
          <p className="text-sm text-slate-600">{message}</p>
        </div>
      </div>
    </Modal>
  )
}

