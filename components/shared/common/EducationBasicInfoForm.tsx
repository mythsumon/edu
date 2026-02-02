'use client'

import { Input, Select, DatePicker } from 'antd'
import dayjs from 'dayjs'
import { getAllRegionCityCodes } from '@/lib/commonCodeStore'

const { TextArea } = Input

export interface EducationBasicInfoData {
  className?: string
  regionCity?: string
  startDate?: string
  endDate?: string
  totalSessions?: number
  expectedStudents?: number
  educationType?: string
  institutionType?: string
  institutionTypeEtc?: string
  targetLevel?: string
  learningTech?: string
  textbook?: string
  담당자명?: string
  담당자연락처?: string
}

interface EducationBasicInfoFormProps {
  data: EducationBasicInfoData
  isEditable?: boolean
  isAdmin?: boolean
  onChange?: (field: keyof EducationBasicInfoData, value: any) => void
  className?: string
}

export function EducationBasicInfoForm({
  data,
  isEditable = false,
  isAdmin = false,
  onChange,
  className = '',
}: EducationBasicInfoFormProps) {
  // Region city options
  const regionCityOptions = getAllRegionCityCodes().map(code => ({
    label: code.label,
    value: code.label,
  }))

  const handleChange = (field: keyof EducationBasicInfoData, value: any) => {
    if (onChange) {
      onChange(field, value)
    }
  }

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 ${className}`}>
      {/* 학급명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          학급명 <span className="text-red-500">*</span>
        </label>
        {isEditable && isAdmin ? (
          <Input
            value={data.className || ''}
            onChange={(e) => handleChange('className', e.target.value)}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.className || '-'}
          </div>
        )}
      </div>

      {/* 지역(시/군) */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          지역(시/군) <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Select
            className="w-full"
            value={data.regionCity}
            onChange={(value) => handleChange('regionCity', value)}
            options={regionCityOptions}
            placeholder="지역 선택"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.regionCity || '-'}
          </div>
        )}
      </div>

      {/* 교육시작일 예정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교육시작일 예정 <span className="text-red-500">*</span>
        </label>
        {isEditable && isAdmin ? (
          <DatePicker
            className="w-full"
            value={data.startDate ? dayjs(data.startDate) : null}
            onChange={(date) => handleChange('startDate', date ? date.format('YYYY-MM-DD') : '')}
            format="YYYY-MM-DD"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.startDate ? dayjs(data.startDate).format('YYYY-MM-DD') : '-'}
          </div>
        )}
      </div>

      {/* 교육종료일 예정 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교육종료일 예정 <span className="text-red-500">*</span>
        </label>
        {isEditable && isAdmin ? (
          <DatePicker
            className="w-full"
            value={data.endDate ? dayjs(data.endDate) : null}
            onChange={(date) => handleChange('endDate', date ? date.format('YYYY-MM-DD') : '')}
            format="YYYY-MM-DD"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.endDate ? dayjs(data.endDate).format('YYYY-MM-DD') : '-'}
          </div>
        )}
      </div>

      {/* 총 교육 차시 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          총 교육 차시 <span className="text-red-500">*</span>
        </label>
        {isEditable && isAdmin ? (
          <Input
            type="number"
            value={data.totalSessions}
            onChange={(e) => handleChange('totalSessions', parseInt(e.target.value) || 0)}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.totalSessions || '-'}
          </div>
        )}
      </div>

      {/* 교육인원 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교육인원 <span className="text-red-500">*</span>
        </label>
        {isEditable && isAdmin ? (
          <Input
            type="number"
            value={data.expectedStudents}
            onChange={(e) => handleChange('expectedStudents', parseInt(e.target.value) || 0)}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.expectedStudents || '-'}
          </div>
        )}
      </div>

      {/* 교육구분 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교육구분 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Select
            className="w-full"
            value={data.educationType}
            onChange={(value) => handleChange('educationType', value)}
            options={[
              { label: '센터교육', value: '센터교육' },
              { label: '방문교육', value: '방문교육' },
              { label: '온라인', value: '온라인' },
            ]}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.educationType || '-'}
          </div>
        )}
      </div>

      {/* 기관구분 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          기관구분 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Select
            className="w-full"
            value={data.institutionType}
            onChange={(value) => {
              handleChange('institutionType', value)
              if (value !== '기타') {
                handleChange('institutionTypeEtc', undefined)
              }
            }}
            options={[
              { label: '일반학교', value: '일반학교' },
              { label: '도서관', value: '도서관' },
              { label: '도서벽지', value: '도서벽지' },
              { label: '지역아동센터', value: '지역아동센터' },
              { label: '특수학급', value: '특수학급' },
              { label: '수원센터', value: '수원센터' },
              { label: '의정부센터', value: '의정부센터' },
              { label: '온라인', value: '온라인' },
              { label: '연계거점', value: '연계거점' },
              { label: '기타', value: '기타' },
            ]}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.institutionType || '-'}
          </div>
        )}
      </div>

      {/* 기타 상세 */}
      {data.institutionType === '기타' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            기타 상세 <span className="text-red-500">*</span>
          </label>
          {isEditable ? (
            <Input
              value={data.institutionTypeEtc || ''}
              onChange={(e) => handleChange('institutionTypeEtc', e.target.value)}
              placeholder="기타 상세 입력"
            />
          ) : (
            <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
              {data.institutionTypeEtc || '-'}
            </div>
          )}
        </div>
      )}

      {/* 교육대상 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교육대상 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Select
            className="w-full"
            value={data.targetLevel}
            onChange={(value) => handleChange('targetLevel', value)}
            options={[
              { label: '초등', value: '초등' },
              { label: '중등', value: '중등' },
              { label: '고등', value: '고등' },
              { label: '혼합', value: '혼합' },
            ]}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.targetLevel || '-'}
          </div>
        )}
      </div>

      {/* 학습기술 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          학습기술 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Input
            value={data.learningTech || ''}
            onChange={(e) => handleChange('learningTech', e.target.value)}
            placeholder="예: 엔트리"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.learningTech || '-'}
          </div>
        )}
      </div>

      {/* 교보재 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          교보재 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Input
            value={data.textbook || ''}
            onChange={(e) => handleChange('textbook', e.target.value)}
            placeholder="예: 컴퓨터"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.textbook || '-'}
          </div>
        )}
      </div>

      {/* 기관 담당자명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          기관 담당자명 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Input
            value={data.담당자명 || ''}
            onChange={(e) => handleChange('담당자명', e.target.value)}
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.담당자명 || '-'}
          </div>
        )}
      </div>

      {/* 기관 담당자 연락처 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          기관 담당자 연락처 <span className="text-red-500">*</span>
        </label>
        {isEditable ? (
          <Input
            value={data.담당자연락처 || ''}
            onChange={(e) => handleChange('담당자연락처', e.target.value)}
            placeholder="010-1234-5678"
          />
        ) : (
          <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            {data.담당자연락처 || '-'}
          </div>
        )}
      </div>
    </div>
  )
}
