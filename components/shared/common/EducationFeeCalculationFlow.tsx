'use client'

import React from 'react'
import { Card, Tooltip } from 'antd'
import { Info } from 'lucide-react'
import type { Education } from '@/lib/dataStore'
import type { InstructorAssignment } from '@/lib/dataStore'
import { getEducationFeeContribution, shouldCountInstructorFee, type FeePolicy } from '@/entities/fee/fee-policy'
import { DEFAULT_ALLOWANCE_POLICY } from '@/entities/settlement/allowance-calculator'
import type { InstitutionCategory } from '@/entities/settlement/settlement-types'

interface EducationFeeCalculationFlowProps {
  education: Education
  assignments: InstructorAssignment[]
  policy?: FeePolicy
}

/**
 * 교육비 계산 흐름을 텍스트로 표시하는 컴포넌트
 */
export const EducationFeeCalculationFlow: React.FC<EducationFeeCalculationFlowProps> = ({
  education,
  assignments,
  policy = 'STATUS_BASED',
}) => {
  // 교육비 계산 여부 확인
  const shouldCount = shouldCountInstructorFee(education, assignments, policy)
  const feeAmount = getEducationFeeContribution(education, assignments, policy)
  
  // 배정 정보 가져오기
  const assignment = assignments.find(a => a.educationId === education.educationId)
  
  // 학교 유형 추론
  const getInstitutionCategory = (institutionName: string): InstitutionCategory => {
    const nameLower = institutionName.toLowerCase()
    if (nameLower.includes('초등') || nameLower.includes('초교')) {
      return 'ELEMENTARY'
    } else if (nameLower.includes('중학교') || nameLower.includes('중학')) {
      return 'MIDDLE'
    } else if (nameLower.includes('고등학교') || nameLower.includes('고등') || nameLower.includes('고교')) {
      return 'HIGH'
    } else if (nameLower.includes('특수') || nameLower.includes('특수학교')) {
      return 'SPECIAL'
    } else if (nameLower.includes('도서') || nameLower.includes('벽지') || nameLower.includes('섬')) {
      return 'ISLAND'
    }
    return 'GENERAL'
  }
  
  const institutionCategory = getInstitutionCategory(education.institution)
  const baseRates = DEFAULT_ALLOWANCE_POLICY.baseRates[institutionCategory] || DEFAULT_ALLOWANCE_POLICY.baseRates.GENERAL
  const mainRatePerSession = baseRates.main
  const assistantRatePerSession = baseRates.assistant
  
  // 차시별 강사 수 계산
  let totalMainSessions = 0
  let totalAssistantSessions = 0
  
  if (assignment && assignment.lessons) {
    assignment.lessons.forEach(lesson => {
      const mainInstructors = Array.isArray(lesson.mainInstructors) ? lesson.mainInstructors : []
      const assistantInstructors = Array.isArray(lesson.assistantInstructors) ? lesson.assistantInstructors : []
      
      if (mainInstructors.length > 0) {
        totalMainSessions += mainInstructors.length
      }
      if (assistantInstructors.length > 0) {
        totalAssistantSessions += assistantInstructors.length
      }
    })
  }
  
  const mainFee = totalMainSessions * mainRatePerSession
  const assistantFee = totalAssistantSessions * assistantRatePerSession
  
  // 학교 유형 한글명
  const categoryNames: Record<InstitutionCategory, string> = {
    ELEMENTARY: '초등',
    MIDDLE: '중등',
    HIGH: '고등',
    SPECIAL: '특수',
    ISLAND: '도서벽지',
    GENERAL: '일반',
    COMMUNITY_CENTER: '지역센터',
    OTHER: '기타',
  }
  const categoryName = categoryNames[institutionCategory]
  
  const status = education.status || education.educationStatus || '대기'
  const policyText = policy === 'STATUS_BASED' 
    ? '상태 기반 (확정/종료 상태만 계산)'
    : '배정 기반 (배정된 교육 모두 계산)'
  
  if (!shouldCount) {
    return (
      <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
        <div className="flex items-center gap-2 mb-2">
          <h4 className="text-sm font-semibold text-slate-700">교육비 계산 흐름</h4>
          <Tooltip title={`현재 정책: ${policyText}`}>
            <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
          </Tooltip>
        </div>
        <div className="text-sm text-slate-600">
          <div className="mb-2">
            <span className="font-medium">교육 상태:</span> {status}
          </div>
          <div className="text-slate-500">
            {policy === 'STATUS_BASED' 
              ? '확정 또는 종료 상태가 아니어서 교육비 계산 대상이 아닙니다.'
              : '강사가 배정되지 않아 교육비 계산 대상이 아닙니다.'}
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
      <div className="flex items-center gap-2 mb-3">
        <h4 className="text-sm font-semibold text-slate-700">교육비 계산 흐름</h4>
        <Tooltip title={`현재 정책: ${policyText}`}>
          <Info className="w-3 h-3 text-slate-400 hover:text-slate-600 transition-colors cursor-help" />
        </Tooltip>
      </div>
      <div className="space-y-2.5 text-sm text-slate-600">
        <div className="flex items-start gap-2">
          <span className="text-slate-400 font-mono">1.</span>
          <div className="flex-1">
            <span className="font-medium text-slate-700">정책 확인</span>
            <div className="text-xs text-slate-500 mt-0.5 ml-4">
              {policy === 'STATUS_BASED' 
                ? `교육 상태가 "확정" 또는 "종료"인 경우에만 계산`
                : `강사가 배정된 교육은 상태와 관계없이 계산`}
            </div>
            <div className="text-slate-700 mt-1 ml-4">
              현재 상태: <span className="font-semibold">{status}</span> → 계산 대상
            </div>
          </div>
        </div>
        
        {totalMainSessions > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-slate-400 font-mono">2.</span>
            <div className="flex-1">
              <span className="font-medium text-slate-700">주강사 교육비</span>
              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                주강사 차시 수 × 차시당 {mainRatePerSession.toLocaleString()}원 ({categoryName} 기준)
              </div>
              <div className="text-slate-700 mt-1 ml-4">
                = {totalMainSessions} × {mainRatePerSession.toLocaleString()} = <span className="font-semibold">{mainFee.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}
        
        {totalAssistantSessions > 0 && (
          <div className="flex items-start gap-2">
            <span className="text-slate-400 font-mono">{totalMainSessions > 0 ? '3.' : '2.'}</span>
            <div className="flex-1">
              <span className="font-medium text-slate-700">보조강사 교육비</span>
              <div className="text-xs text-slate-500 mt-0.5 ml-4">
                보조강사 차시 수 × 차시당 {assistantRatePerSession.toLocaleString()}원 ({categoryName} 기준)
              </div>
              <div className="text-slate-700 mt-1 ml-4">
                = {totalAssistantSessions} × {assistantRatePerSession.toLocaleString()} = <span className="font-semibold">{assistantFee.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex items-start gap-2 pt-2 border-t-2 border-slate-300">
          <span className="text-blue-600 font-bold font-mono">총</span>
          <div className="flex-1">
            <span className="font-bold text-blue-600 text-base">교육비 합계</span>
            <div className="text-blue-600 font-bold mt-1 ml-4 text-base">
              = 주강사 교육비 + 보조강사 교육비
              {totalMainSessions > 0 && totalAssistantSessions > 0 && (
                <span className="ml-1">
                  = {mainFee.toLocaleString()} + {assistantFee.toLocaleString()} = <span className="text-lg">{feeAmount.toLocaleString()}원</span>
                </span>
              )}
              {totalMainSessions > 0 && totalAssistantSessions === 0 && (
                <span className="ml-1">
                  = {mainFee.toLocaleString()}원
                </span>
              )}
              {totalMainSessions === 0 && totalAssistantSessions > 0 && (
                <span className="ml-1">
                  = {assistantFee.toLocaleString()}원
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
