'use client'

import { Search, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ProgramListItem } from '@/types/program'

const mockPrograms: ProgramListItem[] = [
  {
    id: 1,
    name: '창의융합교육 프로그램',
    institution: '서울초등학교',
    mainInstructor: '김교사',
    subInstructor: '이교사',
    createdDate: '2025-01-15',
    lastUpdated: '2025-03-20',
  },
  {
    id: 2,
    name: '디지털 리터러시 교육',
    institution: '인천중학교',
    mainInstructor: '박교사',
    subInstructor: '최교사',
    createdDate: '2025-02-01',
    lastUpdated: '2025-03-18',
  },
  {
    id: 3,
    name: '과학탐구 프로젝트',
    institution: '경기고등학교',
    mainInstructor: '정교사',
    subInstructor: '강교사',
    createdDate: '2025-01-20',
    lastUpdated: '2025-03-19',
  },
  {
    id: 4,
    name: '예술융합 프로그램',
    institution: '수원초등학교',
    mainInstructor: '윤교사',
    subInstructor: '임교사',
    createdDate: '2025-02-10',
    lastUpdated: '2025-03-17',
  },
  {
    id: 5,
    name: '환경교육 캠페인',
    institution: '성남중학교',
    mainInstructor: '조교사',
    subInstructor: '신교사',
    createdDate: '2025-01-25',
    lastUpdated: '2025-03-16',
  },
]

export function ProgramList({ selectedRegion }: { selectedRegion?: number }) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [showAll, setShowAll] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const filteredPrograms = mockPrograms.filter((program) => {
    const matchesSearch =
      program.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.institution.toLowerCase().includes(searchQuery.toLowerCase()) ||
      program.mainInstructor.toLowerCase().includes(searchQuery.toLowerCase())
    
    // In a real app, filter by selectedRegion here
    return matchesSearch
  })

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage)
  const paginatedPrograms = filteredPrograms.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleDetailClick = (type: 'attendance' | 'activity' | 'equipment', programId: number) => {
    if (type === 'attendance') {
      router.push(`/attendance/${programId}`)
    } else if (type === 'activity') {
      router.push(`/activity/${programId}`)
    } else if (type === 'equipment') {
      router.push(`/equipment/${programId}`)
    } else {
      // In a real app, navigate to the appropriate detail page
      console.log(`Opening ${type} detail for program ${programId}`)
    }
  }

  return (
    <div className="bg-white rounded-card shadow-card">
      {/* Section Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">전체 프로그램 리스트</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAll(true)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                showAll
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setShowAll(false)}
              className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                !showAll
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              선택한 권역만
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="프로그램명, 교육기관, 강사명으로 검색"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                프로그램명
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                교육기관
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                주강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                보조강사
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                프로그램 생성날짜
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                교육 출석부
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                교육 활동 일지
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-700 uppercase tracking-wider">
                교구 확인서
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                마지막 수정일
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {paginatedPrograms.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-1">검색 결과가 없습니다</h3>
                    <p className="text-sm text-gray-500">검색어 또는 필터를 다시 확인해 주세요.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedPrograms.map((program) => (
                <tr
                  key={program.id}
                  className="transition-colors cursor-pointer"
                  style={{ 
                    '--hover-bg': 'rgba(15, 23, 42, 0.02)'
                  } as React.CSSProperties}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(15, 23, 42, 0.02)'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent'
                  }}
                  onClick={() => router.push(`/program`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-[14px] font-medium text-primary hover:text-primary-dark cursor-pointer">
                      {program.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700">
                    {program.institution}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700">
                    {program.mainInstructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700">
                    {program.subInstructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-[14px] text-gray-700">
                    {program.createdDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDetailClick('attendance', program.id)
                      }}
                      className="h-8 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-all"
                    >
                      상세보기
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDetailClick('activity', program.id)
                      }}
                      className="h-8 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-all"
                    >
                      상세보기
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDetailClick('equipment', program.id)
                      }}
                      className="h-8 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium text-sm transition-all"
                    >
                      상세보기
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-[12px] text-gray-500">
                    {program.lastUpdated}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {filteredPrograms.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            총 {filteredPrograms.length}개 중 {(currentPage - 1) * itemsPerPage + 1}-
            {Math.min(currentPage * itemsPerPage, filteredPrograms.length)}개 표시
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>이전</span>
            </button>
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
            {totalPages > 10 && <span className="px-2 text-gray-500">...</span>}
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <span>다음</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}