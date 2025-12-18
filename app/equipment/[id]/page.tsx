'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, TimePicker, Switch, Space, Spin, Alert } from 'antd'
import { ArrowLeft, Save, Trash2, X, Plus } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { EquipmentData, RentalItem } from '@/types/program'
import { PageTitle } from '@/components/common/PageTitle'

const { TextArea } = Input
dayjs.locale('ko')

export default function EquipmentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState<EquipmentData | null>(null)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const id = parseInt(params.id as string)
        const equipmentData = await programService.getEquipmentData(id)
        setData(equipmentData)
        setRentalItems(equipmentData.rentalItems)
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchData()
    }
  }, [params.id])

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    if (data) {
      setRentalItems(data.rentalItems) // Reset to original data
    }
  }

  const handleSave = async () => {
    if (!data) return
    
    try {
      const updatedData = { ...data, rentalItems }
      await programService.updateEquipmentData(updatedData)
      setData(updatedData)
      setIsEditMode(false)
    } catch (err) {
      setError('데이터 저장 중 오류가 발생했습니다.')
      console.error(err)
    }
  }

  const handleDelete = () => {
    // In real app, show confirmation modal and delete
    console.log('Delete equipment:', data?.id)
  }

  const handleAddRentalItem = () => {
    const newItem: RentalItem = {
      id: `new-${Date.now()}`,
      itemName: '',
      quantity: 1,
    }
    setRentalItems([...rentalItems, newItem])
  }

  const handleDeleteRentalItem = (itemId: string) => {
    setRentalItems(rentalItems.filter(item => item.id !== itemId))
  }

  const handleRentalItemChange = (itemId: string, field: keyof RentalItem, value: any) => {
    setRentalItems(
      rentalItems.map(item => 
        item.id === itemId ? { ...item, [field]: value } : item
      )
    )
  }

  const handleBack = () => {
    router.back();
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert message="오류" description={error} type="error" showIcon />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <Alert message="데이터 없음" description="교구 확인서 데이터를 찾을 수 없습니다." type="warning" showIcon />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageTitle
        title="교구 확인서"
        subtitle={`과제번호: ${data.assignmentNumber} | 교육기관: ${data.institution}`}
        actions={
          !isEditMode ? (
            <>
              <Button
                type="primary"
                onClick={handleEdit}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
              >
                수정하기
              </Button>
              <Button
                danger
                icon={<Trash2 className="w-4 h-4" />}
                onClick={handleDelete}
                className="h-11 px-6 rounded-xl font-medium transition-all"
              >
                삭제
              </Button>
            </>
          ) : (
            <>
              <Button
                type="primary"
                icon={<Save className="w-4 h-4" />}
                onClick={handleSave}
                className="h-11 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 border-0 font-medium transition-all shadow-sm hover:shadow-md"
              >
                저장
              </Button>
              <Button
                icon={<X className="w-4 h-4" />}
                onClick={handleCancel}
                className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
              >
                취소
              </Button>
            </>
          )
        }
      />
      
      <Button
        type="text"
        icon={<ArrowLeft className="w-4 h-4" />}
        onClick={handleBack}
        className="text-gray-600 hover:text-gray-900 px-0 mb-6"
      >
        대시보드로 돌아가기
      </Button>

      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Basic Information Card */}
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">기본 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                과제번호
              </label>
              {isEditMode ? (
                <Input
                  value={data.assignmentNumber}
                  onChange={(e) => setData({ ...data, assignmentNumber: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.assignmentNumber}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                교육과정명
              </label>
              {isEditMode ? (
                <Input
                  value={data.courseName}
                  onChange={(e) => setData({ ...data, courseName: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.courseName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                교육기관
              </label>
              {isEditMode ? (
                <Input
                  value={data.institution}
                  onChange={(e) => setData({ ...data, institution: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.institution}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                교육일자
              </label>
              {isEditMode ? (
                <DatePicker
                  value={dayjs(data.educationDate)}
                  onChange={(date) => setData({ ...data, educationDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.educationDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                담당차시 / 총차시
              </label>
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={data.currentSession}
                    onChange={(e) => setData({ ...data, currentSession: parseInt(e.target.value) || 0 })}
                    placeholder="담당차시"
                    className="h-10 rounded-lg flex-1"
                  />
                  <span className="text-gray-500">/</span>
                  <Input
                    type="number"
                    value={data.totalSessions}
                    onChange={(e) => setData({ ...data, totalSessions: parseInt(e.target.value) || 0 })}
                    placeholder="총차시"
                    className="h-10 rounded-lg flex-1"
                  />
                </div>
              ) : (
                <p className="text-base text-gray-900">{data.currentSession} / {data.totalSessions}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                당일 참여 강사
              </label>
              {isEditMode ? (
                <Input
                  value={data.instructorName}
                  onChange={(e) => setData({ ...data, instructorName: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.instructorName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                예상 참가 인원
              </label>
              {isEditMode ? (
                <Input
                  type="number"
                  value={data.expectedParticipants}
                  onChange={(e) => setData({ ...data, expectedParticipants: parseInt(e.target.value) || 0 })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.expectedParticipants}명</p>
              )}
            </div>
          </div>
        </Card>

        {/* Rental Information Card */}
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">대여 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                대여일자
              </label>
              {isEditMode ? (
                <DatePicker
                  value={dayjs(data.rentalDate)}
                  onChange={(date) => setData({ ...data, rentalDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.rentalDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                대여시간
              </label>
              {isEditMode ? (
                <TimePicker
                  value={dayjs(data.rentalTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, rentalTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.rentalTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                대여자
              </label>
              {isEditMode ? (
                <Input
                  value={data.renterName}
                  onChange={(e) => setData({ ...data, renterName: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.renterName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                비고
              </label>
              {isEditMode ? (
                <TextArea
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  rows={1}
                  className="rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.notes || '-'}</p>
              )}
            </div>
          </div>

          {/* Rental Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">교구명</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-700">수량</th>
                  {isEditMode && (
                    <th className="text-center py-3 px-4 text-sm font-medium text-gray-700">삭제</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {rentalItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <Input
                          value={item.itemName}
                          onChange={(e) => handleRentalItemChange(item.id, 'itemName', e.target.value)}
                          className="h-10 rounded-lg"
                        />
                      ) : (
                        item.itemName
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {isEditMode ? (
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleRentalItemChange(item.id, 'quantity', parseInt(e.target.value) || 0)}
                          className="h-10 rounded-lg w-24"
                        />
                      ) : (
                        `${item.quantity}개`
                      )}
                    </td>
                    {isEditMode && (
                      <td className="py-3 px-4 text-center">
                        <Button
                          type="text"
                          icon={<Trash2 className="w-4 h-4 text-red-500" />}
                          onClick={() => handleDeleteRentalItem(item.id)}
                          className="h-8 w-8 p-0 flex items-center justify-center"
                        />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
            {isEditMode && (
              <div className="mt-4">
                <Button
                  type="dashed"
                  icon={<Plus className="w-4 h-4" />}
                  onClick={handleAddRentalItem}
                  className="h-10 px-4 rounded-lg border-dashed"
                >
                  교구 추가
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Return Information Card */}
        <Card className="rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">반납 정보</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납자
              </label>
              {isEditMode ? (
                <Input
                  value={data.returnerName}
                  onChange={(e) => setData({ ...data, returnerName: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnerName}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납일자
              </label>
              {isEditMode ? (
                <DatePicker
                  value={dayjs(data.returnDate)}
                  onChange={(date) => setData({ ...data, returnDate: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnDate}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납시간
              </label>
              {isEditMode ? (
                <TimePicker
                  value={dayjs(data.returnTime, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTime: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납자 확인
              </label>
              {isEditMode ? (
                <Input
                  value={data.returnerNameConfirm}
                  onChange={(e) => setData({ ...data, returnerNameConfirm: e.target.value })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnerNameConfirm}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납일자 확인
              </label>
              {isEditMode ? (
                <DatePicker
                  value={dayjs(data.returnDateConfirm)}
                  onChange={(date) => setData({ ...data, returnDateConfirm: date ? date.format('YYYY-MM-DD') : '' })}
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnDateConfirm}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납시간 확인
              </label>
              {isEditMode ? (
                <TimePicker
                  value={dayjs(data.returnTimeConfirm, 'HH:mm')}
                  onChange={(time) => setData({ ...data, returnTimeConfirm: time ? time.format('HH:mm') : '' })}
                  format="HH:mm"
                  className="w-full h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnTimeConfirm}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납 상태
              </label>
              {isEditMode ? (
                <Select
                  value={data.returnStatus}
                  onChange={(value) => setData({ ...data, returnStatus: value })}
                  className="w-full h-10 rounded-lg"
                  options={[
                    { value: '정상 반납', label: '정상 반납' },
                    { value: '불량 반납', label: '불량 반납' },
                    { value: '분실', label: '분실' },
                  ]}
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnStatus}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                반납 수량
              </label>
              {isEditMode ? (
                <Input
                  type="number"
                  value={data.returnQuantity}
                  onChange={(e) => setData({ ...data, returnQuantity: parseInt(e.target.value) || 0 })}
                  className="h-10 rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.returnQuantity}개</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                대상 적합 여부
              </label>
              {isEditMode ? (
                <Switch
                  checked={data.targetEligible}
                  onChange={(checked) => setData({ ...data, targetEligible: checked })}
                />
              ) : (
                <p className="text-base text-gray-900">
                  {data.targetEligible ? '적합' : '부적합'}
                </p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                비고
              </label>
              {isEditMode ? (
                <TextArea
                  value={data.remarks}
                  onChange={(e) => setData({ ...data, remarks: e.target.value })}
                  rows={3}
                  className="rounded-lg"
                />
              ) : (
                <p className="text-base text-gray-900">{data.remarks || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-1">
                서명 생략
              </label>
              <div className="flex items-center gap-4">
                {isEditMode ? (
                  <Switch
                    checked={data.signatureOmitted}
                    onChange={(checked) => setData({ ...data, signatureOmitted: checked })}
                  />
                ) : (
                  <p className="text-base text-gray-900">
                    {data.signatureOmitted ? '생략' : '필요'}
                  </p>
                )}
                {data.signatureOmitted && (
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      서명자
                    </label>
                    {isEditMode ? (
                      <Input
                        value={data.signatureName}
                        onChange={(e) => setData({ ...data, signatureName: e.target.value })}
                        className="h-10 rounded-lg"
                      />
                    ) : (
                      <p className="text-base text-gray-900">{data.signatureName}</p>
                    )}
                  </div>
                )}
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-500 mb-1">
                  서명일
                </label>
                {isEditMode ? (
                  <DatePicker
                    value={dayjs(data.signatureDate)}
                    onChange={(date) => setData({ ...data, signatureDate: date ? date.format('YYYY-MM-DD') : '' })}
                    className="w-full h-10 rounded-lg"
                  />
                ) : (
                  <p className="text-base text-gray-900">{data.signatureDate}</p>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}