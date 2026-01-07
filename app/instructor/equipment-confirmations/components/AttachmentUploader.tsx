'use client'

import { useState, useEffect } from 'react'
import { Button, Upload, message, Image } from 'antd'
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons'
import type { UploadFile, UploadProps } from 'antd/es/upload/interface'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const MAX_COUNT = 20

interface AttachmentUploaderProps {
  attachments: string[] // URLs
  onChange: (attachments: string[]) => void
  disabled?: boolean
  minRequired?: number
}

export function AttachmentUploader({ 
  attachments, 
  onChange, 
  disabled = false,
  minRequired = 1 
}: AttachmentUploaderProps) {
  const [fileList, setFileList] = useState<UploadFile[]>([])
  
  // Ensure attachments is always an array
  const safeAttachments = attachments || []

  useEffect(() => {
    setFileList(
      safeAttachments.map((url, index) => ({
        uid: `attachment-${index}`,
        name: `image-${index + 1}.jpg`,
        status: 'done' as const,
        url,
      }))
    )
  }, [safeAttachments])

  const handleChange: UploadProps['onChange'] = (info) => {
    const { fileList: newFileList } = info
    const newFiles = newFileList.filter(f => 
      (f.status === 'uploading' || f.status === 'done') && 
      !safeAttachments.includes(f.url || '')
    )
    
    if (newFiles.length === 0) {
      setFileList(newFileList.filter(f => f.status !== 'removed'))
      return
    }

    const remainingSlots = MAX_COUNT - safeAttachments.length
    if (remainingSlots <= 0) {
      message.warning(`최대 ${MAX_COUNT}장까지만 업로드 가능합니다.`)
      setFileList(newFileList.filter(f => f.status !== 'removed'))
      return
    }

    const filesToProcess = newFiles.slice(0, remainingSlots)
    if (newFiles.length > remainingSlots) {
      message.warning(`${remainingSlots}장만 업로드됩니다. (최대 ${MAX_COUNT}장)`)
    }

    const processPromises = filesToProcess.map((file) => {
      return new Promise<string | null>((resolve) => {
        if (!file.originFileObj) {
          resolve(null)
          return
        }

        if (!file.type?.startsWith('image/')) {
          message.error(`${file.name}: 이미지 파일만 업로드 가능합니다.`)
          resolve(null)
          return
        }

        if (file.size && file.size > MAX_FILE_SIZE) {
          message.error(`${file.name}: 파일 크기는 10MB 이하여야 합니다.`)
          resolve(null)
          return
        }

        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target?.result as string
          resolve(dataUrl)
        }
        reader.onerror = () => {
          message.error(`${file.name}: 파일 읽기 중 오류가 발생했습니다.`)
          resolve(null)
        }
        reader.readAsDataURL(file.originFileObj)
      })
    })

    Promise.all(processPromises).then((processedUrls) => {
      const validUrls = processedUrls.filter((url): url is string => url !== null)
      if (validUrls.length > 0) {
        const updatedAttachments = [...safeAttachments, ...validUrls]
        onChange(updatedAttachments)
      }
    })

    setFileList(newFileList.filter(f => f.status !== 'removed'))
  }

  const handleRemove = (index: number) => {
    const updated = safeAttachments.filter((_, i) => i !== index)
    onChange(updated)
  }

  const isValid = safeAttachments.length >= minRequired

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            첨부 이미지
          </span>
          <span className={`text-sm font-semibold ${isValid ? 'text-green-600' : 'text-red-600'}`}>
            업로드: {safeAttachments.length}/{minRequired}
          </span>
        </div>
        {!isValid && (
          <span className="text-xs text-red-600 dark:text-red-400">
            최소 {minRequired}장의 이미지가 필요합니다.
          </span>
        )}
      </div>

      <Upload
        listType="picture-card"
        fileList={fileList}
        onChange={handleChange}
        accept="image/*"
        multiple
        maxCount={MAX_COUNT}
        disabled={disabled || safeAttachments.length >= MAX_COUNT}
        beforeUpload={() => false}
      >
        {safeAttachments.length < MAX_COUNT && !disabled && (
          <div>
            <UploadOutlined className="text-2xl" />
            <div className="mt-2 text-sm">업로드</div>
          </div>
        )}
      </Upload>

      {safeAttachments.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mt-4">
          {safeAttachments.map((url, index) => (
            <div
              key={index}
              className="relative group border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-gray-50 dark:bg-gray-800"
            >
              <div className="aspect-square relative">
                <Image
                  src={url}
                  alt={`첨부 ${index + 1}`}
                  className="w-full h-full object-cover"
                  preview={{ mask: '미리보기' }}
                />
                {!disabled && (
                  <button
                    onClick={() => handleRemove(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="삭제"
                  >
                    <DeleteOutlined className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

