'use client'

import { useState } from 'react'
import { Button, Modal, Input, Upload, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { Edit, X } from 'lucide-react'
import { getSignatureUrl } from '../storage'
import type { EquipmentSignatures } from '../types'
import dayjs from 'dayjs'

type Signature = NonNullable<EquipmentSignatures['manager']>

interface SignatureSlotProps {
  label: string
  signature?: Signature
  signerName: string // Name to look up in signature bank
  onApply: (signature: Signature) => void
  onDelete: () => void
  disabled?: boolean
  userProfile?: { userId: string; name: string; signatureImageUrl?: string }
}

export function SignatureSlot({
  label,
  signature,
  signerName,
  onApply,
  onDelete,
  disabled = false,
  userProfile,
}: SignatureSlotProps) {
  const [modalVisible, setModalVisible] = useState(false)
  const [tempUrl, setTempUrl] = useState<string>('')
  const [tempName, setTempName] = useState<string>('')

  const handleOpenModal = () => {
    // Auto-load from signature bank if available
    if (signerName) {
      const bankUrl = getSignatureUrl(signerName)
      if (bankUrl) {
        setTempUrl(bankUrl)
        setTempName(signerName)
      } else if (userProfile?.signatureImageUrl && signerName === userProfile.name) {
        setTempUrl(userProfile.signatureImageUrl)
        setTempName(userProfile.name)
      } else {
        setTempUrl('')
        setTempName(signerName || '')
      }
    } else {
      // If no signer name, try to use user profile signature
      if (userProfile?.signatureImageUrl) {
        setTempUrl(userProfile.signatureImageUrl)
        setTempName(userProfile.name || '')
      } else {
        setTempUrl('')
        setTempName('')
      }
    }
    setModalVisible(true)
  }

  const handleApply = () => {
    if (!tempUrl) {
      message.warning('서명 이미지를 선택해주세요.')
      return
    }
    if (!tempName) {
      message.warning('서명자 이름을 입력해주세요.')
      return
    }
    const sig: Signature = {
      signedByUserId: userProfile?.userId || 'unknown',
      signedByUserName: tempName,
      signedAt: dayjs().toISOString(),
      signatureImageUrl: tempUrl,
    }
    onApply(sig)
    setModalVisible(false)
    setTempUrl('')
    setTempName('')
    message.success('서명이 적용되었습니다.')
  }

  return (
    <>
      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-500 dark:text-gray-400">{label}</div>
        {signature ? (
          <div className="space-y-2">
            <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
              <img
                src={signature.signatureImageUrl}
                alt={label}
                className="max-w-[200px] max-h-[80px] object-contain"
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {dayjs(signature.signedAt).format('YYYY-MM-DD HH:mm')}
            </div>
            <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
              {signature.signedByUserName}
            </div>
            {!disabled && (
              <div className="flex gap-2">
                <Button
                  size="small"
                  icon={<Edit className="w-3 h-3" />}
                  onClick={handleOpenModal}
                  className="flex-1"
                >
                  수정
                </Button>
                <Button
                  size="small"
                  danger
                  icon={<X className="w-3 h-3" />}
                  onClick={onDelete}
                  className="flex-1"
                >
                  삭제
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
              <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
            </div>
            {!disabled && (
              <Button
                size="small"
                type="default"
                icon={<Edit className="w-3 h-3" />}
                onClick={handleOpenModal}
                className="w-full"
              >
                서명 선택/적용
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal
        title={`${label} 서명 선택`}
        open={modalVisible}
        onOk={handleApply}
        onCancel={() => {
          setModalVisible(false)
          setTempUrl('')
          setTempName('')
        }}
        okText="적용"
        cancelText="취소"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            서명 이미지를 선택하거나 업로드하세요.
          </p>

          {tempUrl && (
            <div className="border border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col items-center justify-center">
              <img
                src={tempUrl}
                alt="선택된 서명"
                className="max-w-[200px] max-h-[80px] object-contain mb-2"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                선택된 서명 미리보기
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              서명자 이름 <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="서명자 이름을 입력하세요"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
            />
          </div>

          {userProfile?.signatureImageUrl && (
            <Button
              onClick={() => {
                setTempUrl(userProfile.signatureImageUrl || '')
                setTempName(userProfile.name || '')
              }}
              className="w-full"
              type={tempUrl === userProfile.signatureImageUrl ? 'primary' : 'default'}
            >
              내 서명 사용 ({userProfile.name})
            </Button>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              서명 이미지 업로드
            </label>
            <Upload
              beforeUpload={(file) => {
                const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/jpg'
                if (!isJpgOrPng) {
                  message.error('JPG/PNG 파일만 업로드 가능합니다!')
                  return false
                }
                const isLt2M = file.size / 1024 / 1024 < 2
                if (!isLt2M) {
                  message.error('이미지 크기는 2MB 미만이어야 합니다!')
                  return false
                }

                const reader = new FileReader()
                reader.onload = (e) => {
                  const result = e.target?.result as string
                  setTempUrl(result)
                }
                reader.readAsDataURL(file)
                return false
              }}
              accept=".png,.jpg,.jpeg"
              maxCount={1}
              onRemove={() => {
                setTempUrl('')
              }}
            >
              <Button icon={<UploadOutlined />} className="w-full">
                서명 이미지 업로드 (JPG/PNG, 최대 2MB)
              </Button>
            </Upload>
          </div>
        </div>
      </Modal>
    </>
  )
}

