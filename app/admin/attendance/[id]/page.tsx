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

const { TextArea } = Input

export default function AttendanceDetailPage() {
  const params = useParams() as { id?: string } | null
  const router = useRouter()
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
          setStudents(attendanceData.students)
        }
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
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
      setError('데이터 저장 중 오류가 발생했습니다.')
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
      attendance3_5: '',
      attendance3_6: '',
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
        <Alert message="오류" description={error} type="error" showIcon />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6">
        <Alert message="데이터 없음" description="출석부 데이터를 찾을 수 없습니다." type="warning" showIcon />
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
          />

          {/* Basic Info Section */}
          <DetailSectionCard title="기본 정보">
            <DefinitionListGrid
              items={[
                { label: '출석부 코드', value: data.attendanceCode },
                { label: '프로그램명', value: data.programName },
                { label: '교육기관명', value: data.institutionName },
                { label: '학년/학급', value: `${data.grade}학년 ${data.class}반` },
              ]}
            />
          </DetailSectionCard>

          {/* Statistics Section */}
          <DetailSectionCard title="통계 정보">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 신청자 수</p>
                <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}명</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">총 수료자 수</p>
                <p className="text-2xl font-bold text-green-600">{data.totalGraduates}명</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">남자 수료자</p>
                <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}명</p>
              </div>
              <div className="bg-pink-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">여자 수료자</p>
                <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}명</p>
              </div>
            </div>
          </DetailSectionCard>

          {/* Instructor Info Section */}
          <DetailSectionCard title="강사 정보">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {data.instructors.map((instructor, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {instructor.role}
                    </span>
                  </div>
                  <p className="text-base font-medium text-gray-900">{instructor.name}</p>
                </div>
              ))}
            </div>
          </DetailSectionCard>

          {/* Student Attendance Info Section */}
          <DetailSectionCard title="학생 출석 정보">
            <Table
              columns={[
                {
                  title: '번호',
                  dataIndex: 'number',
                  key: 'number',
                  width: 80,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: '이름',
                  dataIndex: 'name',
                  key: 'name',
                  width: 120,
                  render: (text) => text,
                },
                {
                  title: '성별',
                  dataIndex: 'gender',
                  key: 'gender',
                  width: 80,
                  render: (text) => text,
                },
                {
                  title: '3월 5일 출석',
                  dataIndex: 'attendance3_5',
                  key: 'attendance3_5',
                  width: 100,
                  render: (text) =>
                    text === 'O' ? (
                      <span className="text-green-600 font-medium">출석</span>
                    ) : text === 'X' ? (
                      <span className="text-red-600 font-medium">결석</span>
                    ) : (
                      <span className="text-gray-400 font-medium">-</span>
                    ),
                },
                {
                  title: '3월 6일 출석',
                  dataIndex: 'attendance3_6',
                  key: 'attendance3_6',
                  width: 100,
                  render: (text) =>
                    text === 'O' ? (
                      <span className="text-green-600 font-medium">출석</span>
                    ) : text === 'X' ? (
                      <span className="text-red-600 font-medium">결석</span>
                    ) : (
                      <span className="text-gray-400 font-medium">-</span>
                    ),
                },
                {
                  title: '비고',
                  dataIndex: 'note',
                  key: 'note',
                  render: (text) => text || '-',
                },
              ]}
              dataSource={students}
              pagination={{
                pageSize: 10,
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
              }}
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
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
            취소
          </Button>
          <Space>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              className="h-11 px-6 rounded-lg border-0 font-medium transition-all shadow-sm hover:shadow-md text-white hover:text-white active:text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              저장
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
        />

        {/* Basic Info Section */}
        <DetailSectionCard title="기본 정보">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">출석부 코드</label>
              <Input
                value={data.attendanceCode}
                onChange={(e) => setData({ ...data, attendanceCode: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">프로그램명</label>
              <Input
                value={data.programName}
                onChange={(e) => setData({ ...data, programName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">교육기관명</label>
              <Input
                value={data.institutionName}
                onChange={(e) => setData({ ...data, institutionName: e.target.value })}
                className="h-11 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-500 mb-2">학년/학급</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={parseInt(data.grade)}
                  onChange={(e) => setData({ ...data, grade: e.target.value })}
                  className="h-11 rounded-xl flex-1"
                />
                <span className="text-gray-500">학년</span>
                <Input
                  type="number"
                  value={parseInt(data.class)}
                  onChange={(e) => setData({ ...data, class: e.target.value })}
                  className="h-11 rounded-xl flex-1"
                />
                <span className="text-gray-500">반</span>
              </div>
            </div>
          </div>
        </DetailSectionCard>

        {/* Statistics Section */}
        <DetailSectionCard title="통계 정보">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 신청자 수</p>
              <p className="text-2xl font-bold text-blue-600">{data.totalApplicants}명</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">총 수료자 수</p>
              <p className="text-2xl font-bold text-green-600">{data.totalGraduates}명</p>
            </div>
            <div className="bg-indigo-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">남자 수료자</p>
              <p className="text-2xl font-bold text-indigo-600">{data.maleGraduates}명</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-1">여자 수료자</p>
              <p className="text-2xl font-bold text-pink-600">{data.femaleGraduates}명</p>
            </div>
          </div>
        </DetailSectionCard>

        {/* Instructor Info Section */}
        <DetailSectionCard title="강사 정보">
          <div className="space-y-4">
            {data.instructors.map((instructor, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {instructor.role}
                  </span>
                </div>
                <Input
                  value={instructor.name}
                  onChange={(e) => {
                    const updatedInstructors = [...data.instructors];
                    updatedInstructors[index].name = e.target.value;
                    setData({ ...data, instructors: updatedInstructors });
                  }}
                  className="h-11 rounded-xl"
                />
              </div>
            ))}
          </div>
        </DetailSectionCard>

        {/* Student Attendance Info Section */}
        <DetailSectionCard title="학생 출석 정보">
          <div className="space-y-4">
            <div className="flex justify-end">
              <Button
                type="dashed"
                icon={<UserPlus className="w-4 h-4" />}
                onClick={handleAddStudent}
                className="h-9 px-4 rounded-lg border-dashed"
              >
                학생 추가
              </Button>
            </div>
            <Table
              columns={[
                {
                  title: '번호',
                  dataIndex: 'number',
                  key: 'number',
                  width: 80,
                  render: (_, __, index) => index + 1,
                },
                {
                  title: '이름',
                  dataIndex: 'name',
                  key: 'name',
                  width: 120,
                  render: (text, record) => (
                    <Input
                      value={text}
                      onChange={(e) => handleStudentChange(record.id, 'name', e.target.value)}
                      className="h-8 rounded-lg"
                    />
                  ),
                },
                {
                  title: '성별',
                  dataIndex: 'gender',
                  key: 'gender',
                  width: 80,
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
                  title: '3월 5일 출석',
                  dataIndex: 'attendance3_5',
                  key: 'attendance3_5',
                  width: 100,
                  render: (text, record) => (
                    <Select
                      value={text}
                      onChange={(value) => handleStudentChange(record.id, 'attendance3_5', value)}
                      className="h-8 rounded-lg w-full"
                      options={[
                        { value: 'O', label: '출석' },
                        { value: 'X', label: '결석' },
                        { value: '', label: '미정' },
                      ]}
                    />
                  ),
                },
                {
                  title: '3월 6일 출석',
                  dataIndex: 'attendance3_6',
                  key: 'attendance3_6',
                  width: 100,
                  render: (text, record) => (
                    <Select
                      value={text}
                      onChange={(value) => handleStudentChange(record.id, 'attendance3_6', value)}
                      className="h-8 rounded-lg w-full"
                      options={[
                        { value: 'O', label: '출석' },
                        { value: 'X', label: '결석' },
                        { value: '', label: '미정' },
                      ]}
                    />
                  ),
                },
                {
                  title: '비고',
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
                  title: '작업',
                  key: 'action',
                  width: 80,
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
              scroll={{ x: 'max-content' }}
              className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
            />
          </div>
        </DetailSectionCard>
      </div>
    </div>
  )
}