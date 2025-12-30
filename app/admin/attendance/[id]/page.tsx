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
      <div className="bg-slate-50 min-h-screen px-6 pt-0">
        {/* Sticky Header */}
        <DetailPageHeaderSticky
          onBack={handleBack}
          onEdit={handleEditFromDetail}
          onDelete={handleDelete}
          title={t('attendance.title')}
        />

        {/* Main Content Container */}
        <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
          {/* Summary Card */}
          <AttendanceSummaryCard
            attendanceCode={data.attendanceCode}
            programName={data.programName}
            institutionName={data.institutionName}
            grade={data.grade}
            class={data.class}
            totalApplicants={data.totalApplicants}
            totalGraduates={data.totalGraduates}
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

          {/* Statistics Section */}
          <DetailSectionCard title={t('attendance.statistics')}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{t('attendance.totalApplicants')}</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}{t('attendance.person')}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{t('attendance.totalGraduates')}</p>
                <p className="text-2xl font-bold text-green-600">{data.totalGraduates}{t('attendance.person')}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{t('attendance.maleGraduates')}</p>
                <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}{t('attendance.person')}</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">{t('attendance.femaleGraduates')}</p>
                <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}{t('attendance.person')}</p>
              </div>
            </div>
          </DetailSectionCard>

          {/* Instructor Info Section */}
          <DetailSectionCard title={t('attendance.instructorInfo')}>
            <div className="border border-gray-200 rounded-xl overflow-hidden">
              <table className="w-full">
                <tbody>
                  {data.instructors.map((instructor, index) => (
                    <tr key={index} className="border-b border-gray-200 last:border-b-0">
                      <td className="py-3 px-4 bg-gray-50 text-sm font-medium text-gray-700 w-1/4">
                        {instructor.role}
                      </td>
                      <td className="py-3 px-4 text-base font-medium text-gray-900">
                        {instructor.name}{t('attendance.instructor')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSectionCard>

          {/* Student Attendance Info Section */}
          <DetailSectionCard title={t('attendance.studentAttendance')}>
            <Table
              columns={[
                {
                  title: t('attendance.number'),
                  dataIndex: 'number',
                  key: 'number',
                  width: 80,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: t('attendance.name'),
                  dataIndex: 'name',
                  key: 'name',
                  width: 120,
                  render: (text) => <span className="text-base font-medium text-gray-900">{text}</span>,
                },
                {
                  title: t('attendance.gender'),
                  dataIndex: 'gender',
                  key: 'gender',
                  width: 80,
                  render: (text) => <span className="text-base font-medium text-gray-900">{text}</span>,
                },
                {
                  title: t('attendance.tardiness'),
                  dataIndex: 'tardiness',
                  key: 'tardiness',
                  width: 100,
                  render: (text) => (
                    <span className="text-base font-medium text-gray-900">{text || '-'}</span>
                  ),
                },
                {
                  title: t('attendance.absence'),
                  dataIndex: 'absence',
                  key: 'absence',
                  width: 100,
                  render: (text) => (
                    <span className="text-base font-medium text-gray-900">{text || '-'}</span>
                  ),
                },
                {
                  title: t('attendance.note'),
                  dataIndex: 'note',
                  key: 'note',
                  render: (text) => <span className="text-base font-medium text-gray-900">{text || '-'}</span>,
                },
              ]}
              dataSource={students}
              pagination={false}
              className="w-full [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table-thead>tr>th]:text-xs [&_.ant-table-thead>tr>th]:font-semibold [&_.ant-table]:text-sm [&_.ant-table]:table-fixed"
            />
          </DetailSectionCard>
        </div>
      </div>
    )
  }

  // Edit Mode
  return (
    <div className="bg-slate-50 min-h-screen px-6 pt-0">
      {/* Sticky Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <Button
            icon={<X className="w-4 h-4" />}
            onClick={handleCancel}
            className="h-11 px-6 rounded-xl border border-slate-200 hover:bg-blue-600 hover:text-white font-medium transition-all text-slate-700"
          >
            {t('attendance.cancel')}
          </Button>
          <Space>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {t('attendance.save')}
            </Button>
          </Space>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="max-w-5xl mx-auto pt-6 pb-12 space-y-4">
        {/* Summary Card */}
        <AttendanceSummaryCard
          attendanceCode={data.attendanceCode}
          programName={data.programName}
          institutionName={data.institutionName}
          grade={data.grade}
          class={data.class}
          totalApplicants={data.totalApplicants}
          totalGraduates={data.totalGraduates}
          programId={data.id}
          isEditMode={true}
          onAttendanceCodeChange={(value) => setData({ ...data, attendanceCode: value })}
          onProgramNameChange={(value) => setData({ ...data, programName: value })}
        />

        {/* Basic Info Section */}
        <DetailSectionCard title={t('attendance.basicInfo')}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

        {/* Statistics Section */}
        <DetailSectionCard title={t('attendance.statistics')}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('attendance.totalApplicants')}</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}{t('attendance.person')}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('attendance.totalGraduates')}</p>
              <p className="text-2xl font-bold text-green-600">{data.totalGraduates}{t('attendance.person')}</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('attendance.maleGraduates')}</p>
              <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}{t('attendance.person')}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">{t('attendance.femaleGraduates')}</p>
              <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}{t('attendance.person')}</p>
            </div>
          </div>
        </DetailSectionCard>

        {/* Instructor Info Section */}
        <DetailSectionCard title={t('attendance.instructorInfo')}>
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <table className="w-full">
              <tbody>
                {data.instructors.map((instructor, index) => (
                  <tr key={index} className="border-b border-gray-200 last:border-b-0">
                    <td className="py-3 px-4 bg-gray-50 text-sm font-medium text-gray-700 w-1/4">
                      {instructor.role}
                    </td>
                    <td className="py-3 px-4">
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </DetailSectionCard>

        {/* Student Attendance Info Section */}
        <DetailSectionCard title={t('attendance.studentAttendance')}>
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="dashed"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={handleAddStudent}
                className="h-9 px-4 rounded-lg border-dashed"
              >
                {t('attendance.addStudent')}
              </Button>
            </div>
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
              className="w-full [&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm [&_.ant-table]:table-fixed"
            />
          </div>
        </DetailSectionCard>
      </div>
    </div>
  )
}