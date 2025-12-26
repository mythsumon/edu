'use client'

import { useState } from 'react'
import { Radio, Modal } from 'antd'
import { FileSpreadsheet, Edit3 } from 'lucide-react'

type InputMode = 'general' | 'excel'

interface ClassInfoModeSwitcherProps {
  mode: InputMode
  onChange: (mode: InputMode, clearData?: boolean) => void
  hasData: boolean
}

export function ClassInfoModeSwitcher({ mode, onChange, hasData }: ClassInfoModeSwitcherProps) {
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingMode, setPendingMode] = useState<InputMode | null>(null)

  const handleModeChange = (newMode: InputMode) => {
    if (newMode === mode) return

    if (hasData) {
      setPendingMode(newMode)
      setShowConfirmModal(true)
    } else {
      onChange(newMode, false)
    }
  }

  const handleConfirm = (action: 'keep' | 'clear' | 'cancel') => {
    setShowConfirmModal(false)
    
    if (action === 'cancel' || !pendingMode) {
      setPendingMode(null)
      return
    }

    if (action === 'clear') {
      // Clear data and switch mode
      onChange(pendingMode, true)
    } else if (action === 'keep') {
      // Keep data and switch mode
      onChange(pendingMode, false)
    }
    
    setPendingMode(null)
  }

  return (
    <>
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          입력 방식
        </label>
        <Radio.Group
          value={mode}
          onChange={(e) => handleModeChange(e.target.value)}
          className="w-full flex gap-4"
        >
          <Radio.Button
            value="general"
            className="flex-1 h-14 rounded-lg border border-gray-300 hover:border-gray-400 transition-all px-6 flex items-center justify-center"
            style={{
              ...(mode === 'general' && {
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                color: '#ffffff',
              }),
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <Edit3 className="w-5 h-5" />
              <span className="text-base font-medium">일반 입력</span>
            </div>
          </Radio.Button>
          <Radio.Button
            value="excel"
            className="flex-1 h-14 rounded-lg border border-gray-300 hover:border-gray-400 transition-all px-6 flex items-center justify-center"
            style={{
              ...(mode === 'excel' && {
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                color: '#ffffff',
              }),
            }}
          >
            <div className="flex items-center justify-center gap-3">
              <FileSpreadsheet className="w-5 h-5" />
              <span className="text-base font-medium">엑셀 업로드</span>
            </div>
          </Radio.Button>
        </Radio.Group>
      </div>

      <Modal
        open={showConfirmModal}
        onCancel={() => handleConfirm('cancel')}
        footer={null}
        className="[&_.ant-modal-content]:rounded-2xl"
      >
        <div className="py-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">입력 방식 변경</h3>
          <p className="text-sm text-gray-600 mb-6">
            입력된 수업 정보가 있습니다. 모드를 변경하면 기존 입력을 유지할까요?
          </p>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => handleConfirm('cancel')}
              className="px-4 py-2 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-colors text-slate-700"
            >
              취소
            </button>
            <button
              onClick={() => handleConfirm('clear')}
              className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors text-red-600 hover:text-red-700"
            >
              초기화
            </button>
            <button
              onClick={() => handleConfirm('keep')}
              className="px-4 py-2 rounded-lg bg-gray-900 text-white hover:bg-gray-800 font-medium transition-colors"
            >
              유지
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

