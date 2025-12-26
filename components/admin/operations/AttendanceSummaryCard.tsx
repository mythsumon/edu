'use client'

import { Card, Input } from 'antd'

interface AttendanceSummaryCardProps {
  attendanceCode: string
  programName: string
  institutionName: string
  grade: string
  class: string
  totalApplicants?: number
  totalGraduates?: number
  programId?: string
  isEditMode?: boolean
  onAttendanceCodeChange?: (value: string) => void
  onProgramNameChange?: (value: string) => void
}

export function AttendanceSummaryCard({
  attendanceCode,
  programName,
  institutionName,
  grade,
  class: className,
  totalApplicants,
  totalGraduates,
  programId,
  isEditMode = false,
  onAttendanceCodeChange,
  onProgramNameChange,
}: AttendanceSummaryCardProps) {
  return (
    <Card className="rounded-2xl border border-slate-200 shadow-sm">
      <div className="space-y-6">
        {/* Top Section: Left and Right Panels */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Panel */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">출석부 코드</label>
              {isEditMode ? (
                <Input
                  value={attendanceCode}
                  onChange={(e) => onAttendanceCodeChange?.(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="출석부 코드를 입력하세요"
                />
              ) : (
                <p className="text-base text-gray-900">{attendanceCode || '-'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">프로그램명</label>
              {isEditMode ? (
                <Input
                  value={programName}
                  onChange={(e) => onProgramNameChange?.(e.target.value)}
                  className="h-11 rounded-xl"
                  placeholder="프로그램명을 입력하세요"
                />
              ) : (
                <p className="text-base text-gray-900">{programName}</p>
              )}
            </div>
            {totalApplicants !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">교육 신청인원</label>
                <p className="text-base font-medium text-gray-900">{totalApplicants}명</p>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {programId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">프로그램 ID</label>
                <p className="text-base font-medium text-gray-900">{programId}</p>
              </div>
            )}
            <div className="border border-gray-200 rounded-xl p-4">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-600 font-medium">기관명</td>
                    <td className="py-2 text-gray-900 font-medium">{institutionName}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 font-medium">학년</td>
                    <td className="py-2 text-gray-900 font-medium">{grade}학년</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600 font-medium">반</td>
                    <td className="py-2 text-gray-900 font-medium">{className}반</td>
                  </tr>
                  {totalGraduates !== undefined && (
                    <tr>
                      <td className="py-2 text-gray-600 font-medium">수료 인원</td>
                      <td className="py-2 text-gray-900 font-medium">
                        {totalGraduates}/{totalApplicants || totalGraduates}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Program Name - Center Large Display */}
        <div className="text-center py-4 border-t border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">{programName}</h2>
        </div>

        {/* Remarks Section */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">비고</label>
          <div className="min-h-[100px] bg-gray-50 rounded-xl p-4">
            {/* Remarks content will be displayed here */}
          </div>
        </div>
      </div>
    </Card>
  )
}

