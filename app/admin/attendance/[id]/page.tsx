'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button, Card, Input, Select, Space, Spin, Alert, Table, Checkbox } from 'antd'
import { ArrowLeft, Save, Trash2, X, UserPlus, CheckCircle, XCircle } from 'lucide-react'
import { programService } from '@/services/programService'
import { AttendanceData, Student, Instructor } from '@/types/program'
import {
  DetailPageHeaderSticky,
  AttendanceSummaryCard,
  DetailSectionCard,
  DefinitionListGrid,
} from '@/components/admin/operations'
import { useLanguage } from '@/components/localization/LanguageContext'
import { API_ENDPOINTS } from '@/entities/endpoints'

const { TextArea } = Input

export default function AttendanceDetailPage() {
  const params = useParams() as { id?: string } | null
  const router = useRouter()
  const { t } = useLanguage()
  const [isEditMode, setIsEditMode] = useState(false)
  const [data, setData] = useState<AttendanceData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [institutionOptions, setInstitutionOptions] = useState<{ value: string; label: string }[]>([])

  // Fetch institutions list
  useEffect(() => {
    const fetchInstitutions = async () => {
      try {
        const response = await fetch(API_ENDPOINTS.INSTITUTIONS)
        if (response.ok) {
          const institutions = await response.json()
          const options = institutions.map((inst: any) => ({
            value: inst.name || inst.institutionName,
            label: inst.name || inst.institutionName,
          }))
          setInstitutionOptions(options)
        } else {
          // Fallback to dummy data if API fails
          const dummyInstitutions = [
            { value: '경기교육청', label: '경기교육청' },
            { value: '수원교육청', label: '수원교육청' },
            { value: '성남교육청', label: '성남교육청' },
            { value: '안양교육청', label: '안양교육청' },
            { value: '고양교육청', label: '고양교육청' },
            { value: '용인교육청', label: '용인교육청' },
          ]
          setInstitutionOptions(dummyInstitutions)
        }
      } catch (err) {
        // Fallback to dummy data on error
        const dummyInstitutions = [
          { value: '경기교육청', label: '경기교육청' },
          { value: '수원교육청', label: '수원교육청' },
          { value: '성남교육청', label: '성남교육청' },
          { value: '안양교육청', label: '안양교육청' },
          { value: '고양교육청', label: '고양교육청' },
          { value: '용인교육청', label: '용인교육청' },
        ]
        setInstitutionOptions(dummyInstitutions)
      }
    }

    fetchInstitutions()
  }, [])

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        if (params && params.id) {
          const id = parseInt(params.id as string)
          const attendanceData = await programService.getAttendanceData(id)
          setData(attendanceData)
          // Convert legacy attendance fields to new structure if needed
          const convertedStudents: Student[] = attendanceData.students.map((student) => ({
            ...student,
            tardiness: (student.tardiness || student.attendance3_5 || '') as 'O' | 'X' | '',
            absence: (student.absence || student.attendance3_6 || '') as 'O' | 'X' | '',
          }))
          setStudents(convertedStudents)
        }
      } catch (err) {
        setError(t('attendance.loadError'))
        // console.error(err)
      } finally {
        setLoading(false)
      }
    }

    if (params && params.id) {
      fetchData()
    }
  }, [params?.id])

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleCancel = () => {
    setIsEditMode(false)
    if (data) {
      setStudents(data.students) // Reset to original data
    }
  }

  const handleSave = async () => {
    if (!data) return
    
    try {
      const updatedData = { ...data, students }
      await programService.updateAttendanceData(updatedData)
      setData(updatedData)
      setIsEditMode(false)
    } catch (err) {
      setError(t('attendance.saveError'))
      // console.error(err)
    }
  }

  const handleDelete = () => {
    // In real app, show confirmation modal and delete
    // console.log('Delete attendance:', data?.id)
  }

  const handleAddStudent = () => {
    const newStudent: Student = {
      id: `new-${Date.now()}`,
      number: students.length + 1,
      name: '',
      gender: '남',
      tardiness: '',
      absence: '',
      note: '',
    }
    setStudents([...students, newStudent])
  }

  const handleDeleteStudent = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId))
  }

  const handleStudentChange = (studentId: string, field: keyof Student, value: any) => {
    setStudents(
      students.map((s) => (s.id === studentId ? { ...s, [field]: value } : s))
    )
  }

  const handleBack = () => {
    router.back();
  }

  const handleEditFromDetail = () => {
    setIsEditMode(true)
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <Spin size="large" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message={t('attendance.error')} description={error} type="error" showIcon />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <Alert message={t('attendance.noData')} description={t('attendance.noDataDescription')} type="warning" showIcon />
      </div>
    )
  }

  if (!isEditMode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
        {/* Sticky Header */}
        <DetailPageHeaderSticky
          onBack={handleBack}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
        />

        {/* Attendance Book Title */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-6 py-6">
            <div className="relative text-center">
              {/* Decorative Background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl opacity-30"></div>
              
              {/* Title Content */}
              <div className="relative">
                <div className="inline-block mb-3">
                  <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                    <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                  </div>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                  2025 소프트웨어(SW) 미래채움 교육 출석부
                </h1>
                <div className="flex items-center justify-center gap-4">
                  <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300"></div>
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Container */}
        <div className="max-w-7xl mx-auto px-6 pt-8 pb-12 space-y-6">
          {/* Summary Card */}
          <AttendanceSummaryCard
            attendanceCode={data.attendanceCode}
            programName={data.programName}
            institutionName={data.institutionName}
            grade={data.grade}
            class={data.class}
            totalApplicants={data.totalApplicants}
            totalGraduates={data.totalGraduates}
            maleGraduates={data.maleGraduates}
            femaleGraduates={data.femaleGraduates}
            programId={data.id}
          />

          {/* Basic Info Section */}
          <DetailSectionCard title={t('attendance.basicInfo')}>
            <DefinitionListGrid
              items={[
                { label: t('attendance.attendanceCode'), value: data.attendanceCode },
                { label: t('attendance.programName'), value: data.programName },
                { label: t('attendance.institutionName'), value: data.institutionName },
                { label: t('attendance.gradeClass'), value: `${data.grade}${t('attendance.grade')} ${data.class}${t('attendance.class')}` },
              ]}
            />
          </DetailSectionCard>

          {/* Statistics Section - Enhanced Design */}
          <DetailSectionCard title={t('attendance.statistics')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-blue-100 mb-2 font-medium">{t('attendance.totalApplicants')}</p>
                  <p className="text-3xl font-bold text-white">{data.totalApplicants}</p>
                  <p className="text-xs text-blue-100 mt-1">{t('attendance.person')}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-emerald-100 mb-2 font-medium">{t('attendance.totalGraduates')}</p>
                  <p className="text-3xl font-bold text-white">{data.totalGraduates}</p>
                  <p className="text-xs text-emerald-100 mt-1">{t('attendance.person')}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-indigo-100 mb-2 font-medium">{t('attendance.maleGraduates')}</p>
                  <p className="text-3xl font-bold text-white">{data.maleGraduates}</p>
                  <p className="text-xs text-indigo-100 mt-1">{t('attendance.person')}</p>
                </div>
              </div>
              <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
                <div className="relative">
                  <p className="text-sm text-purple-100 mb-2 font-medium">{t('attendance.femaleGraduates')}</p>
                  <p className="text-3xl font-bold text-white">{data.femaleGraduates}</p>
                  <p className="text-xs text-purple-100 mt-1">{t('attendance.person')}</p>
                </div>
              </div>
            </div>
          </DetailSectionCard>

          {/* Instructor Info Section - Enhanced Design */}
          <DetailSectionCard title={t('attendance.instructorInfo')}>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100">
                {data.instructors.map((instructor, index) => (
                  <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-20 flex-shrink-0">
                        <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                          {instructor.role}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-base font-semibold text-slate-900">
                          {instructor.name}{t('attendance.instructor')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </DetailSectionCard>

          {/* Student Attendance Info Section - Enhanced Design */}
          <DetailSectionCard title={t('attendance.studentAttendance')}>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
              <Table
                columns={[
                  {
                    title: t('attendance.number'),
                    dataIndex: 'number',
                    key: 'number',
                    width: 80,
                    align: 'center',
                    render: (_, __, index) => (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-medium text-sm">
                        {index + 1}
                      </span>
                    ),
                  },
                  {
                    title: t('attendance.name'),
                    dataIndex: 'name',
                    key: 'name',
                    width: 120,
                    render: (text) => <span className="text-base font-semibold text-slate-900">{text}</span>,
                  },
                  {
                    title: t('attendance.gender'),
                    dataIndex: 'gender',
                    key: 'gender',
                    width: 80,
                    align: 'center',
                    render: (text) => (
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        text === '남' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'
                      }`}>
                        {text}
                      </span>
                    ),
                  },
                  {
                    title: t('attendance.tardiness'),
                    dataIndex: 'tardiness',
                    key: 'tardiness',
                    width: 100,
                    align: 'center',
                    render: (text) => (
                      text === 'O' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : text === 'X' ? (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )
                    ),
                  },
                  {
                    title: t('attendance.absence'),
                    dataIndex: 'absence',
                    key: 'absence',
                    width: 100,
                    align: 'center',
                    render: (text) => (
                      text === 'O' ? (
                        <CheckCircle className="w-5 h-5 text-green-500 mx-auto" />
                      ) : text === 'X' ? (
                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                      ) : (
                        <span className="text-slate-400">-</span>
                      )
                    ),
                  },
                  {
                    title: t('attendance.note'),
                    dataIndex: 'note',
                    key: 'note',
                    render: (text) => (
                      <span className="text-sm text-slate-600">{text || <span className="text-slate-400">-</span>}</span>
                    ),
                  },
                ]}
                dataSource={students}
                pagination={false}
                rowClassName="hover:bg-blue-50/50 transition-colors"
                className="w-full [&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100"
              />
            </div>
          </DetailSectionCard>
        </div>
      </div>
    )
  }

  // Edit Mode
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-slate-50">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm px-4 md:px-6 py-3 md:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <Button
            icon={<X className="w-4 h-4" />}
            onClick={handleCancel}
            className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700 hover:border-blue-600"
          >
            {t('attendance.cancel')}
          </Button>
          <Space>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4 text-white" />}
              onClick={handleSave}
              style={{
                color: 'white',
              }}
              className="h-11 px-6 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 border-0 shadow-md hover:shadow-lg !text-white hover:!text-white [&_.anticon]:!text-white [&_.anticon]:hover:!text-white [&>span]:!text-white [&>span]:hover:!text-white [&:hover>span]:!text-white [&:hover_.anticon]:!text-white [&:hover]:!text-white"
            >
              {t('attendance.save')}
            </Button>
          </Space>
        </div>
      </div>

      {/* Attendance Book Title */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 md:py-6">
          <div className="relative text-center">
            {/* Decorative Background */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-50 via-purple-50 to-indigo-50 rounded-2xl opacity-30"></div>
            
            {/* Title Content */}
            <div className="relative">
              <div className="inline-block mb-3">
                <div className="px-5 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-md">
                  <span className="text-xs font-semibold text-white uppercase tracking-wider">2025</span>
                </div>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold mb-3 bg-gradient-to-r from-blue-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent">
                2025 소프트웨어(SW) 미래채움 교육 출석부
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-300 to-slate-300"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-300 to-slate-300"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 pt-6 md:pt-8 pb-8 md:pb-12 space-y-4 md:space-y-6">
        {/* Summary Card */}
        <AttendanceSummaryCard
          attendanceCode={data.attendanceCode}
          programName={data.programName}
          institutionName={data.institutionName}
          grade={data.grade}
          class={data.class}
          totalApplicants={data.totalApplicants}
          totalGraduates={data.totalGraduates}
          maleGraduates={data.maleGraduates}
          femaleGraduates={data.femaleGraduates}
          programId={data.id}
          isEditMode={true}
          institutionOptions={institutionOptions}
          onProgramNameChange={(value) => setData({ ...data, programName: value })}
          onInstitutionNameChange={(value) => setData({ ...data, institutionName: value })}
          onGradeChange={(value) => setData({ ...data, grade: value })}
          onClassChange={(value) => setData({ ...data, class: value })}
        />

        {/* Basic Info Section */}
        <DetailSectionCard title={t('attendance.basicInfo')}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">{t('attendance.attendanceCode')}</label>
              <Input
                value={data.attendanceCode}
                onChange={(e) => setData({ ...data, attendanceCode: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">{t('attendance.programName')}</label>
              <Input
                value={data.programName}
                onChange={(e) => setData({ ...data, programName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">{t('attendance.institutionName')}</label>
              <Input
                value={data.institutionName}
                onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">{t('attendance.gradeClass')}</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={parseInt(data.grade)}
                  onChange={(e) => setData({ ...data, grade: e.target.value })}
                  className="h-11 rounded-xl flex-1"
                />
                <span className="text-gray-500">{t('attendance.grade')}</span>
                <Input
                  type="number"
                  value={parseInt(data.class)}
                  onChange={(e) => setData({ ...data, class: e.target.value })}
                  className="h-11 rounded-xl flex-1"
                />
                <span className="text-gray-500">{t('attendance.class')}</span>
              </div>
            </div>
          </div>
        </DetailSectionCard>

        {/* Statistics Section - Enhanced Design */}
        <DetailSectionCard title={t('attendance.statistics')}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <div className="group relative overflow-hidden bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <div className="relative">
                <p className="text-sm text-blue-100 mb-2 font-medium">{t('attendance.totalApplicants')}</p>
                <p className="text-3xl font-bold text-white">{data.totalApplicants}</p>
                <p className="text-xs text-blue-100 mt-1">{t('attendance.person')}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <div className="relative">
                <p className="text-sm text-emerald-100 mb-2 font-medium">{t('attendance.totalGraduates')}</p>
                <p className="text-3xl font-bold text-white">{data.totalGraduates}</p>
                <p className="text-xs text-emerald-100 mt-1">{t('attendance.person')}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <div className="relative">
                <p className="text-sm text-indigo-100 mb-2 font-medium">{t('attendance.maleGraduates')}</p>
                <p className="text-3xl font-bold text-white">{data.maleGraduates}</p>
                <p className="text-xs text-indigo-100 mt-1">{t('attendance.person')}</p>
              </div>
            </div>
            <div className="group relative overflow-hidden bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-full" />
              <div className="relative">
                <p className="text-sm text-purple-100 mb-2 font-medium">{t('attendance.femaleGraduates')}</p>
                <p className="text-3xl font-bold text-white">{data.femaleGraduates}</p>
                <p className="text-xs text-purple-100 mt-1">{t('attendance.person')}</p>
              </div>
            </div>
          </div>
        </DetailSectionCard>

        {/* Instructor Info Section - Enhanced Design */}
        <DetailSectionCard title={t('attendance.instructorInfo')}>
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="divide-y divide-slate-100">
              {data.instructors.map((instructor, index) => (
                <div key={index} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-20 flex-shrink-0">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-100 text-blue-700">
                        {instructor.role}
                      </span>
                    </div>
                    <div className="flex-1">
                      <Input
                        value={instructor.name}
                        onChange={(e) => {
                          const updatedInstructors = [...data.instructors];
                          updatedInstructors[index].name = e.target.value;
                          setData({ ...data, instructors: updatedInstructors });
                        }}
                        className="h-11 rounded-xl"
                        suffix={t('attendance.instructor')}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </DetailSectionCard>

        {/* Student Attendance Info Section - Enhanced Design */}
        <DetailSectionCard title={t('attendance.studentAttendance')}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="dashed"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={handleAddStudent}
                className="h-10 px-5 rounded-xl border-2 border-dashed border-blue-300 text-blue-600 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 font-medium transition-all"
              >
                {t('attendance.addStudent')}
              </Button>
            </div>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm overflow-x-auto">
              <Table
              columns={[
                {
                  title: t('attendance.number'),
                  dataIndex: 'number',
                  key: 'number',
                  render: (_, __, index) => index + 1,
                },
                {
                  title: t('attendance.name'),
                  dataIndex: 'name',
                  key: 'name',
                  render: (text, record) => (
                    <Input
                      value={text}
                      onChange={(e) => handleStudentChange(record.id, 'name', e.target.value)}
                      className="h-8 rounded-lg"
                    />
                  ),
                },
                {
                  title: t('attendance.gender'),
                  dataIndex: 'gender',
                  key: 'gender',
                  render: (text, record) => (
                    <Select
                      value={text}
                      onChange={(value) => handleStudentChange(record.id, 'gender', value)}
                      className="h-8 rounded-lg w-full"
                      options={[
                        { value: '남', label: '남' },
                        { value: '여', label: '여' },
                      ]}
                    />
                  ),
                },
                {
                  title: t('attendance.tardiness'),
                  dataIndex: 'tardiness',
                  key: 'tardiness',
                  render: (text, record) => (
                    <Select
                      value={text}
                      onChange={(value) => handleStudentChange(record.id, 'tardiness', value)}
                      className="h-8 rounded-lg w-full"
                      options={[
                        { value: 'O', label: 'O' },
                        { value: 'X', label: 'X' },
                        { value: '', label: '-' },
                      ]}
                    />
                  ),
                },
                {
                  title: t('attendance.absence'),
                  dataIndex: 'absence',
                  key: 'absence',
                  render: (text, record) => (
                    <Select
                      value={text}
                      onChange={(value) => handleStudentChange(record.id, 'absence', value)}
                      className="h-8 rounded-lg w-full"
                      options={[
                        { value: 'O', label: 'O' },
                        { value: 'X', label: 'X' },
                        { value: '', label: '-' },
                      ]}
                    />
                  ),
                },
                {
                  title: t('attendance.note'),
                  dataIndex: 'note',
                  key: 'note',
                  render: (text, record) => (
                    <Input
                      value={text}
                      onChange={(e) => handleStudentChange(record.id, 'note', e.target.value)}
                      className="h-8 rounded-lg"
                    />
                  ),
                },
                {
                  title: t('attendance.action'),
                  key: 'action',
                  render: (_, record) => (
                    <Button
                      danger
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => handleDeleteStudent(record.id)}
                      className="h-8 px-3"
                    />
                  ),
                },
              ]}
              dataSource={students}
                pagination={{
                  pageSize: 10,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                }}
                rowClassName="hover:bg-blue-50/50 transition-colors"
                className="w-full [&_.ant-table-thead>tr>th]:bg-gradient-to-r [&_.ant-table-thead>tr>th]:from-slate-50 [&_.ant-table-thead>tr>th]:to-slate-100 [&_.ant-table-thead>tr>th]:text-slate-700 [&_.ant-table-thead>tr>th]:text-sm [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table-thead>tr>th]:border-b-2 [&_.ant-table-thead>tr>th]:border-slate-200 [&_.ant-table-tbody>tr>td]:border-b [&_.ant-table-tbody>tr>td]:border-slate-100 [&_.ant-table]:text-sm [&_.ant-table]:table-fixed"
              />
            </div>
          </div>
        </DetailSectionCard>
      </div>
    </div>
  )
}