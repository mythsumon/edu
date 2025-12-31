'use client'

import { Card, Input, Select } from 'antd'
import { Hash, BookOpen, Users, Building2, GraduationCap, FileText } from 'lucide-react'

interface InstitutionOption {
  value: string
  label: string
}

interface AttendanceSummaryCardProps {
  attendanceCode: string
  programName: string
  institutionName: string
  grade: string
  class: string
  totalApplicants?: number
  totalGraduates?: number
  maleGraduates?: number
  femaleGraduates?: number
  programId?: string
  isEditMode?: boolean
  institutionOptions?: InstitutionOption[]
  onAttendanceCodeChange?: (value: string) => void
  onProgramNameChange?: (value: string) => void
  onInstitutionNameChange?: (value: string) => void
  onGradeChange?: (value: string) => void
  onClassChange?: (value: string) => void
}

export function AttendanceSummaryCard({
  attendanceCode,
  programName,
  institutionName,
  grade,
  class: className,
  totalApplicants,
  totalGraduates,
  maleGraduates,
  femaleGraduates,
  programId,
  isEditMode = false,
  institutionOptions = [],
  onAttendanceCodeChange,
  onProgramNameChange,
  onInstitutionNameChange,
  onGradeChange,
  onClassChange,
}: AttendanceSummaryCardProps) {
  const completionRate = totalApplicants && totalGraduates 
    ? Math.round((totalGraduates / totalApplicants) * 100) 
    : 0

  return (
    <Card className="rounded-2xl border-0 shadow-xl bg-white overflow-hidden">
      <div className="space-y-8 p-6">
        {/* Top Section: Left and Right Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Panel */}
          <div className="space-y-5">
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <Hash className="w-4 h-4" />
                출석부 코드
              </label>
              <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                <p className="text-lg font-bold text-slate-900">{attendanceCode || '-'}</p>
              </div>
            </div>
            
            <div className="group">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <BookOpen className="w-4 h-4" />
                프로그램명
              </label>
              {isEditMode ? (
                <Input
                  value={programName}
                  onChange={(e) => onProgramNameChange?.(e.target.value)}
                  className="h-12 rounded-xl border-2 border-slate-200 focus:border-blue-500 transition-colors"
                  placeholder="프로그램명을 입력하세요"
                />
              ) : (
                <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-100">
                  <p className="text-lg font-bold text-slate-900">{programName}</p>
                </div>
              )}
            </div>
            
            {totalApplicants !== undefined && (
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <Users className="w-4 h-4" />
                  교육 신청인원
                </label>
                <div className="px-4 py-3 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl border border-emerald-100">
                  <p className="text-2xl font-bold text-emerald-700">{totalApplicants}<span className="text-base font-medium text-emerald-600 ml-1">명</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="space-y-5">
            {programId && (
              <div className="group">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  <Hash className="w-4 h-4" />
                  프로그램 ID
                </label>
                <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <p className="text-lg font-bold text-slate-900">#{programId}</p>
                </div>
              </div>
            )}
            
            <div className="bg-gradient-to-br from-white to-slate-50 rounded-2xl border-2 border-slate-200 p-5 shadow-sm">
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-slate-200">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">기관명</p>
                    {isEditMode ? (
                      <Select
                        value={institutionName}
                        onChange={(value) => onInstitutionNameChange?.(value)}
                        className="w-full h-10 rounded-xl [&_.ant-select-selector]:rounded-xl [&_.ant-select-selector]:border-2 [&_.ant-select-selector]:border-slate-200 [&_.ant-select-selector]:h-10 [&_.ant-select-selector]:flex [&_.ant-select-selector]:items-center [&_.ant-select-focused_.ant-select-selector]:border-blue-500"
                        placeholder="기관을 선택하세요"
                        showSearch
                        filterOption={(input, option) =>
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                        }
                        options={institutionOptions}
                      />
                    ) : (
                      <p className="text-base font-bold text-slate-900 mt-1">{institutionName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">학년</p>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={grade}
                        onChange={(e) => onGradeChange?.(e.target.value)}
                        className="h-10 rounded-xl border-2 border-slate-200 focus:border-indigo-500 transition-colors"
                        placeholder="학년"
                        suffix="학년"
                      />
                    ) : (
                      <div className="inline-flex items-center px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-lg font-bold">
                        {grade}학년
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">반</p>
                    {isEditMode ? (
                      <Input
                        type="number"
                        value={className}
                        onChange={(e) => onClassChange?.(e.target.value)}
                        className="h-10 rounded-xl border-2 border-slate-200 focus:border-purple-500 transition-colors"
                        placeholder="반"
                        suffix="반"
                      />
                    ) : (
                      <div className="inline-flex items-center px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg font-bold">
                        {className}반
                      </div>
                    )}
                  </div>
                </div>
                
                {totalGraduates !== undefined && (
                  <div className="pt-3 border-t border-slate-200 space-y-3">
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">수료 인원</p>
                      <div className="flex items-end gap-3">
                        <div>
                          <p className="text-3xl font-bold text-emerald-600">
                            {totalGraduates}<span className="text-lg text-slate-600">/{totalApplicants || totalGraduates}</span>
                          </p>
                        </div>
                        <div className="flex-1">
                          <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all duration-500"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{completionRate}% 완료</p>
                        </div>
                      </div>
                    </div>
                    {(maleGraduates !== undefined || femaleGraduates !== undefined) && (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">수료 남/여</p>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                            <span className="text-sm font-medium text-slate-700">남</span>
                            <span className="text-lg font-bold text-indigo-600">{maleGraduates || 0}</span>
                          </div>
                          <span className="text-slate-400">/</span>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                            <span className="text-sm font-medium text-slate-700">여</span>
                            <span className="text-lg font-bold text-purple-600">{femaleGraduates || 0}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Program Name - Center Large Display */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-gradient-to-r from-transparent via-blue-200 to-transparent"></div>
          </div>
          <div className="relative flex justify-center py-6">
            <div className="px-8 py-4 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl border-2 border-blue-100 shadow-sm">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                {programName}
              </h2>
            </div>
          </div>
        </div>

        {/* Remarks Section */}
        <div className="border-t-2 border-slate-200 pt-6">
          <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">
            <FileText className="w-4 h-4" />
            비고
          </label>
          <div className="min-h-[120px] bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-6 border-2 border-slate-200 shadow-inner">
            <p className="text-sm text-slate-400 italic">비고 내용이 여기에 표시됩니다.</p>
          </div>
        </div>
      </div>
    </Card>
  )
}

