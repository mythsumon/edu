'use client'

import { useState } from 'react'
import { Button, Input, Modal, message, Upload, Image } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
import { Edit, X } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import dayjs from 'dayjs'
import type { UploadFile } from 'antd/es/upload/interface'

export interface InstitutionContact {
  name: string
  phone?: string
  email?: string
}

export interface Signature {
  signedByUserId: string
  signedByUserName: string
  signedAt: string
  signatureImageUrl: string
}

export interface AttendanceSignatures {
  school?: Signature // 학교 담당자 서명
  session1MainInstructor?: Signature // 1회차 주강사 서명
  session1AssistantInstructor?: Signature // 1회차 보조강사 서명
  session2MainInstructor?: Signature // 2회차 주강사 서명
  session2AssistantInstructor?: Signature // 2회차 보조강사 서명
}

interface InstitutionContactAndSignaturesProps {
  institutionContact: InstitutionContact
  signatures: AttendanceSignatures
  session1MainInstructorName: string
  session1AssistantInstructorName: string
  session2MainInstructorName: string
  session2AssistantInstructorName: string
  isEditMode: boolean
  onInstitutionContactChange: (contact: InstitutionContact) => void
  onSignatureApply: (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor', signature: Signature) => void
  onSignatureDelete: (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => void
}

// Mock signature images - In production, these would come from user accounts
const MOCK_SIGNATURES: Record<string, string> = {
  'school-contact-1': '/api/placeholder/200/80',
  'instructor-1': '/api/placeholder/200/80',
  'instructor-2': '/api/placeholder/200/80',
}

// Get current user info from auth context
const getCurrentUserId = (userProfile: any) => {
  return userProfile?.userId || 'instructor-1'
}

const getCurrentUserName = (userProfile: any) => {
  return userProfile?.name || '홍길동'
}

const getCurrentUserSignature = (userProfile: any) => {
  return userProfile?.signatureImageUrl || null
}

export function InstitutionContactAndSignatures({
  institutionContact,
  signatures,
  session1MainInstructorName,
  session1AssistantInstructorName,
  session2MainInstructorName,
  session2AssistantInstructorName,
  isEditMode,
  onInstitutionContactChange,
  onSignatureApply,
  onSignatureDelete,
}: InstitutionContactAndSignaturesProps) {
  const { userRole, userProfile } = useAuth()
  const [signatureModalVisible, setSignatureModalVisible] = useState<string | null>(null)
  const [selectedSignatureUrl, setSelectedSignatureUrl] = useState<string>('')
  const [uploadedSignatureName, setUploadedSignatureName] = useState<string>('')
  const [uploadFileList, setUploadFileList] = useState<UploadFile[]>([])

  const isAdmin = userRole === 'admin'
  const currentUserId = getCurrentUserId(userProfile)
  const currentUserName = getCurrentUserName(userProfile)
  const currentUserSignature = getCurrentUserSignature(userProfile)

  // Check if current user can sign for a role
  const canSignForRole = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor'): boolean => {
    if (isAdmin) return true
    // Instructors can sign as main or assistant instructor
    if (role === 'session1MainInstructor' || role === 'session1AssistantInstructor' || 
        role === 'session2MainInstructor' || role === 'session2AssistantInstructor') {
      return userRole === 'instructor'
    }
    // School contact signing would require additional role check
    return false
  }

  const handleSignatureSelect = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => {
    // Reset modal state
    setSelectedSignatureUrl('')
    setUploadedSignatureName('')
    setUploadFileList([])
    setSignatureModalVisible(role)
  }

  const handleSignatureConfirm = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => {
    if (!selectedSignatureUrl) {
      message.warning('서명 이미지를 선택해주세요.')
      return
    }

    // 서명자 이름이 없으면 현재 사용자 이름 사용
    const signatureName = uploadedSignatureName || currentUserName || '서명자'
    if (!signatureName) {
      message.warning('서명자 이름을 입력해주세요.')
      return
    }

    const signature: Signature = {
      signedByUserId: currentUserId,
      signedByUserName: signatureName,
      signedAt: dayjs().toISOString(),
      signatureImageUrl: selectedSignatureUrl,
    }

    onSignatureApply(role, signature)
    setSignatureModalVisible(null)
    setSelectedSignatureUrl('')
    setUploadedSignatureName('')
    setUploadFileList([])
    message.success('서명이 적용되었습니다.')
  }

  const handleSignatureUpload = (file: File): boolean => {
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

    // Read file as data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      if (result) {
        setSelectedSignatureUrl(result)
        setUploadFileList([{
          uid: '-1',
          name: file.name,
          status: 'done',
          url: result,
        }])
      }
    }
    reader.onerror = () => {
      message.error('파일을 읽는 중 오류가 발생했습니다.')
    }
    reader.readAsDataURL(file)
    return false // Prevent default upload behavior
  }

  const handleSignatureDelete = (role: 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor') => {
    const signature = signatures[role]
    if (!signature) return

    const canDelete = isAdmin || signature.signedByUserId === currentUserId
    if (!canDelete) {
      message.warning('서명을 삭제할 권한이 없습니다.')
      return
    }

    Modal.confirm({
      title: '서명 삭제',
      content: '정말 이 서명을 삭제하시겠습니까?',
      onOk: () => {
        onSignatureDelete(role)
        message.success('서명이 삭제되었습니다.')
      },
    })
  }

  const formatSignatureDate = (dateString: string) => {
    return dayjs(dateString).format('YYYY-MM-DD HH:mm')
  }

  return (
    <div className="space-y-6">
      {/* 서명 영역 - 회차별 주강사 및 보조강사 서명 */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">서명</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 1회차 주강사 서명 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1회차 주강사 ({session1MainInstructorName})
            </div>
            {signatures.session1MainInstructor ? (
              <div className="space-y-2">
                <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                  <img
                    src={signatures.session1MainInstructor.signatureImageUrl}
                    alt="1회차 주강사 서명"
                    className="max-w-[200px] max-h-[80px] object-contain"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {formatSignatureDate(signatures.session1MainInstructor.signedAt)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {signatures.session1MainInstructor.signedByUserName}
                </div>
                {isEditMode && (isAdmin || signatures.session1MainInstructor.signedByUserId === currentUserId) && (
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleSignatureDelete('session1MainInstructor')}
                    className="w-full mt-2"
                  >
                    삭제
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                  <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                </div>
                {isEditMode && canSignForRole('session1MainInstructor') && (
                  <Button
                    size="small"
                    type="default"
                    icon={<Edit className="w-3 h-3" />}
                    onClick={() => handleSignatureSelect('session1MainInstructor')}
                    className="w-full"
                  >
                    서명 선택/적용
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 1회차 보조강사 서명 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              1회차 보조강사 ({session1AssistantInstructorName})
            </div>
            {signatures.session1AssistantInstructor ? (
              <div className="space-y-2">
                <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                  <img
                    src={signatures.session1AssistantInstructor.signatureImageUrl}
                    alt="1회차 보조강사 서명"
                    className="max-w-[200px] max-h-[80px] object-contain"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {formatSignatureDate(signatures.session1AssistantInstructor.signedAt)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {signatures.session1AssistantInstructor.signedByUserName}
                </div>
                {isEditMode && (isAdmin || signatures.session1AssistantInstructor.signedByUserId === currentUserId) && (
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleSignatureDelete('session1AssistantInstructor')}
                    className="w-full mt-2"
                  >
                    삭제
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                  <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                </div>
                {isEditMode && canSignForRole('session1AssistantInstructor') && (
                  <Button
                    size="small"
                    type="default"
                    icon={<Edit className="w-3 h-3" />}
                    onClick={() => handleSignatureSelect('session1AssistantInstructor')}
                    className="w-full"
                  >
                    서명 선택/적용
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 2회차 주강사 서명 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2회차 주강사 ({session2MainInstructorName})
            </div>
            {signatures.session2MainInstructor ? (
              <div className="space-y-2">
                <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                  <img
                    src={signatures.session2MainInstructor.signatureImageUrl}
                    alt="2회차 주강사 서명"
                    className="max-w-[200px] max-h-[80px] object-contain"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {formatSignatureDate(signatures.session2MainInstructor.signedAt)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {signatures.session2MainInstructor.signedByUserName}
                </div>
                {isEditMode && (isAdmin || signatures.session2MainInstructor.signedByUserId === currentUserId) && (
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleSignatureDelete('session2MainInstructor')}
                    className="w-full mt-2"
                  >
                    삭제
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                  <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                </div>
                {isEditMode && canSignForRole('session2MainInstructor') && (
                  <Button
                    size="small"
                    type="default"
                    icon={<Edit className="w-3 h-3" />}
                    onClick={() => handleSignatureSelect('session2MainInstructor')}
                    className="w-full"
                  >
                    서명 선택/적용
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* 2회차 보조강사 서명 */}
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              2회차 보조강사 ({session2AssistantInstructorName})
            </div>
            {signatures.session2AssistantInstructor ? (
              <div className="space-y-2">
                <div className="border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-900 p-2 flex items-center justify-center min-h-[80px]">
                  <img
                    src={signatures.session2AssistantInstructor.signatureImageUrl}
                    alt="2회차 보조강사 서명"
                    className="max-w-[200px] max-h-[80px] object-contain"
                  />
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                  {formatSignatureDate(signatures.session2AssistantInstructor.signedAt)}
                </div>
                <div className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  {signatures.session2AssistantInstructor.signedByUserName}
                </div>
                {isEditMode && (isAdmin || signatures.session2AssistantInstructor.signedByUserId === currentUserId) && (
                  <Button
                    size="small"
                    danger
                    icon={<X className="w-3 h-3" />}
                    onClick={() => handleSignatureDelete('session2AssistantInstructor')}
                    className="w-full mt-2"
                  >
                    삭제
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded bg-gray-50 dark:bg-gray-900 p-4 flex items-center justify-center min-h-[80px]">
                  <span className="text-sm text-gray-400 dark:text-gray-500">서명 없음</span>
                </div>
                {isEditMode && canSignForRole('session2AssistantInstructor') && (
                  <Button
                    size="small"
                    type="default"
                    icon={<Edit className="w-3 h-3" />}
                    onClick={() => handleSignatureSelect('session2AssistantInstructor')}
                    className="w-full"
                  >
                    서명 선택/적용
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 서명 선택 모달 */}
      <Modal
        title="서명 선택"
        open={signatureModalVisible !== null}
        onOk={() => {
          if (signatureModalVisible) {
            handleSignatureConfirm(signatureModalVisible as 'school' | 'session1MainInstructor' | 'session1AssistantInstructor' | 'session2MainInstructor' | 'session2AssistantInstructor')
          }
        }}
        onCancel={() => {
          setSignatureModalVisible(null)
          setSelectedSignatureUrl('')
          setUploadedSignatureName('')
          setUploadFileList([])
        }}
        okText="적용"
        cancelText="취소"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            서명 이미지를 선택하거나 업로드하세요.
          </p>
          
          {/* 서명 이미지 미리보기 */}
          {selectedSignatureUrl && (
            <div className="border border-gray-300 dark:border-gray-600 rounded p-4 flex flex-col items-center justify-center">
              <img
                src={selectedSignatureUrl}
                alt="선택된 서명"
                className="max-w-[200px] max-h-[80px] object-contain mb-2"
              />
              <div className="text-xs text-gray-500 dark:text-gray-400">
                선택된 서명 미리보기
              </div>
            </div>
          )}

          {/* 내 서명 사용 버튼 */}
          {currentUserSignature && (
            <Button
              onClick={() => {
                setSelectedSignatureUrl(currentUserSignature)
                setUploadedSignatureName(currentUserName || '')
                setUploadFileList([])
              }}
              className="w-full"
              type={selectedSignatureUrl === currentUserSignature ? 'primary' : 'default'}
            >
              내 서명 사용 ({currentUserName || '내 서명'})
            </Button>
          )}

          {/* 서명자 이름 입력 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              서명자 이름 {!uploadedSignatureName && <span className="text-red-500">*</span>}
            </label>
            <Input
              placeholder={currentUserName ? `기본값: ${currentUserName}` : "서명자 이름을 입력하세요"}
              value={uploadedSignatureName}
              onChange={(e) => setUploadedSignatureName(e.target.value)}
            />
            {!uploadedSignatureName && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {currentUserName ? `입력하지 않으면 "${currentUserName}"이 사용됩니다.` : '서명자 이름을 입력해주세요.'}
              </p>
            )}
          </div>

          {/* 서명 이미지 업로드 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              서명 이미지 업로드
            </label>
            <Upload
              beforeUpload={handleSignatureUpload}
              fileList={uploadFileList}
              accept=".png,.jpg,.jpeg"
              maxCount={1}
              onRemove={() => {
                setSelectedSignatureUrl('')
                setUploadFileList([])
                setUploadedSignatureName('')
              }}
            >
              <Button icon={<UploadOutlined />} className="w-full">
                서명 이미지 업로드 (JPG/PNG, 최대 2MB)
              </Button>
            </Upload>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              다른 사람의 서명을 업로드할 수 있습니다.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  )
}

