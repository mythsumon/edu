'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button, Card, Input, Select, DatePicker, TimePicker, Switch, Space, Spin, Alert, Table, Checkbox, Tabs, Upload } from 'antd'
import { ArrowLeft, Save, Trash2, X, Plus, ChevronRight, UserPlus, Upload as UploadIcon } from 'lucide-react'
import dayjs, { Dayjs } from 'dayjs'
import 'dayjs/locale/ko'
import { programService } from '@/services/programService'
import { AttendanceData, ActivityData, EquipmentData, Student, Instructor, Session, Photo, RentalItem } from '@/types/program'
import { PageTitle } from '@/components/common/PageTitle'

const { TextArea } = Input
const { TabPane } = Tabs

dayjs.locale('ko')

export default function UnifiedEditPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('attendance')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Attendance state
  const [attendanceData, setAttendanceData] = useState<AttendanceData | null>(null)
  const [students, setStudents] = useState<Student[]>([])
  
  // Activity state
  const [activityData, setActivityData] = useState<ActivityData | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])
  
  // Equipment state
  const [equipmentData, setEquipmentData] = useState<EquipmentData | null>(null)
  const [rentalItems, setRentalItems] = useState<RentalItem[]>([])

  // Fetch all data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        
        // In a real app, you would fetch actual data based on IDs
        // For now, we'll create sample data
        const sampleAttendance: AttendanceData = {
          id: '1',
          title: '샘플 출석부',
          attendanceCode: 'ATT-001',
          programName: '샘플 프로그램',
          institutionName: '샘플 교육기관',
          grade: '3',
          class: '2',
          totalApplicants: 30,
          totalGraduates: 28,
          maleGraduates: 15,
          femaleGraduates: 13,
          students: [
            { id: '1', number: 1, name: '홍길동', gender: '남', tardiness: 'O', absence: 'O', note: '' },
            { id: '2', number: 2, name: '김철수', gender: '남', tardiness: 'O', absence: 'X', note: '' },
          ],
          instructors: [
            { role: '주강사', name: '박선생님' },
            { role: '보조강사', name: '이선생님' },
          ]
        }
        
        const sampleActivity: ActivityData = {
          id: '1',
          title: '샘플 활동 일지',
          activityCode: 'ACT-001',
          educationType: '정규교육',
          institutionType: '초등학교',
          region: '서울',
          institutionName: '샘플 초등학교',
          grade: '4',
          class: '1',
          startDate: '2023-01-01',
          endDate: '2023-12-31',
          totalApplicants: 25,
          totalGraduates: 23,
          maleGraduates: 12,
          femaleGraduates: 11,
          sessions: [
            { id: '1', sessionNumber: 1, date: '2023-01-15', startTime: '09:00', endTime: '12:00', activityName: '첫 번째 활동' },
          ],
          photos: [],
          createdAt: '2023-01-01',
          createdBy: '관리자'
        }
        
        const sampleEquipment: EquipmentData = {
          id: '1',
          assignmentNumber: 'EQP-001',
          courseName: '샘플 과정',
          institution: '샘플 교육기관',
          educationDate: '2023-01-15',
          currentSession: 1,
          totalSessions: 12,
          instructorName: '박선생님',
          expectedParticipants: 30,
          rentalDate: '2023-01-14',
          rentalTime: '08:00',
          renterName: '김관리자',
          returnerName: '',
          returnDate: '',
          returnTime: '',
          notes: '',
          rentalItems: [
            { id: '1', itemName: '칠판', quantity: 2 },
            { id: '2', itemName: ' markers', quantity: 10 },
          ],
          returnerNameConfirm: '',
          returnDateConfirm: '',
          returnTimeConfirm: '',
          returnStatus: '',
          returnQuantity: 0,
          targetEligible: true,
          remarks: '',
          signatureOmitted: false,
          signatureName: '',
          signatureDate: ''
        }
        
        setAttendanceData(sampleAttendance)
        setStudents(sampleAttendance.students)
        
        setActivityData(sampleActivity)
        setSessions(sampleActivity.sessions)
        setPhotos(sampleActivity.photos)
        
        setEquipmentData(sampleEquipment)
        setRentalItems(sampleEquipment.rentalItems)
      } catch (err) {
        setError('데이터를 불러오는 중 오류가 발생했습니다.')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSave = async () => {
    try {
      // In a real app, you would save all data to the backend
      console.log('Saving all data...')
      alert('모든 데이터가 저장되었습니다.')
    } catch (err) {
      setError('데이터 저장 중 오류가 발생했습니다.')
      console.error(err)
    }
  }

  const handleBack = () => {
    router.back()
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <PageTitle
        title="통합 편집"
        subtitle="출석부, 활동 일지, 교구 확인서를 한 화면에서 편집합니다"
        actions={
          <>
            <Button
              type="primary"
              icon={<Save className="w-4 h-4" />}
              onClick={handleSave}
              className="h-11 px-6 rounded-lg font-semibold text-white transition-all hover:opacity-90 shadow-sm hover:shadow-md"
              style={{
                backgroundColor: '#1a202c',
                borderColor: '#1a202c',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2d3748'
                e.currentTarget.style.borderColor = '#2d3748'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#1a202c'
                e.currentTarget.style.borderColor = '#1a202c'
              }}
            >
              모두 저장
            </Button>
            <Button
              icon={<X className="w-4 h-4" />}
              onClick={handleBack}
              className="h-11 px-6 rounded-xl border border-gray-300 hover:bg-gray-50 font-medium transition-all"
            >
              취소
            </Button>
          </>
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

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="custom-tabs">
        <TabPane tab="출석부 정보" key="attendance">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Program & School Information Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 프로그램 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">프로그램 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        출석부 코드
                      </label>
                      <Input
                        value={attendanceData?.attendanceCode || ''}
                        onChange={(e) => attendanceData && setAttendanceData({...attendanceData, attendanceCode: e.target.value})}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        프로그램명
                      </label>
                      <Input
                        value={attendanceData?.programName || ''}
                        onChange={(e) => attendanceData && setAttendanceData({...attendanceData, programName: e.target.value})}
                        className="h-10 rounded-lg"
                      />
                    </div>
                  </div>
                </div>

                {/* 교육기관 정보 */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">교육기관 정보</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        교육기관명
                      </label>
                      <Input
                        value={attendanceData?.institutionName || ''}
                        onChange={(e) => attendanceData && setAttendanceData({...attendanceData, institutionName: e.target.value})}
                        className="h-10 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">
                        학년/학급
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={parseInt(attendanceData?.grade || '0')}
                          onChange={(e) => attendanceData && setAttendanceData({...attendanceData, grade: e.target.value})}
                          className="h-10 rounded-lg flex-1"
                        />
                        <span className="text-gray-500">학년</span>
                        <Input
                          type="number"
                          value={parseInt(attendanceData?.class || '0')}
                          onChange={(e) => attendanceData && setAttendanceData({...attendanceData, class: e.target.value})}
                          className="h-10 rounded-lg flex-1"
                        />
                        <span className="text-gray-500">반</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">통계 정보</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 신청자 수</p>
                  <Input
                    type="number"
                    value={attendanceData?.totalApplicants || 0}
                    onChange={(e) => attendanceData && setAttendanceData({...attendanceData, totalApplicants: parseInt(e.target.value) || 0})}
                    className="text-2xl font-bold text-blue-600 w-full border-0 p-0 bg-transparent"
                  />
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 수료자 수</p>
                  <Input
                    type="number"
                    value={attendanceData?.totalGraduates || 0}
                    onChange={(e) => attendanceData && setAttendanceData({...attendanceData, totalGraduates: parseInt(e.target.value) || 0})}
                    className="text-2xl font-bold text-green-600 w-full border-0 p-0 bg-transparent"
                  />
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">남자 수료자</p>
                  <Input
                    type="number"
                    value={attendanceData?.maleGraduates || 0}
                    onChange={(e) => attendanceData && setAttendanceData({...attendanceData, maleGraduates: parseInt(e.target.value) || 0})}
                    className="text-2xl font-bold text-indigo-600 w-full border-0 p-0 bg-transparent"
                  />
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">여자 수료자</p>
                  <Input
                    type="number"
                    value={attendanceData?.femaleGraduates || 0}
                    onChange={(e) => attendanceData && setAttendanceData({...attendanceData, femaleGraduates: parseInt(e.target.value) || 0})}
                    className="text-2xl font-bold text-pink-600 w-full border-0 p-0 bg-transparent"
                  />
                </div>
              </div>
            </Card>

            {/* Instructor Information Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3a2e2a]">강사 정보</h3>
                <Button
                  type="dashed"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {
                    if (attendanceData) {
                      const newInstructor: Instructor = { role: '새 역할', name: '새 강사' }
                      setAttendanceData({
                        ...attendanceData,
                        instructors: [...attendanceData.instructors, newInstructor]
                      })
                    }
                  }}
                  className="h-9 px-4 rounded-lg border-dashed"
                >
                  강사 추가
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {attendanceData?.instructors.map((instructor, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Input
                        value={instructor.role}
                        onChange={(e) => {
                          if (attendanceData) {
                            const updatedInstructors = [...attendanceData.instructors]
                            updatedInstructors[index].role = e.target.value
                            setAttendanceData({...attendanceData, instructors: updatedInstructors})
                          }
                        }}
                        className="h-8 rounded-lg text-xs font-medium bg-blue-100 text-blue-800"
                      />
                    </div>
                    <Input
                      value={instructor.name}
                      onChange={(e) => {
                        if (attendanceData) {
                          const updatedInstructors = [...attendanceData.instructors]
                          updatedInstructors[index].name = e.target.value
                          setAttendanceData({...attendanceData, instructors: updatedInstructors})
                        }
                      }}
                      className="h-10 rounded-lg"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Student Attendance Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[#3a2e2a] m-0">학생 출석 정보</h3>
                <Button
                  type="dashed"
                  icon={<UserPlus className="w-4 h-4" />}
                  onClick={() => {
                    const newStudent: Student = {
                      id: `new-${Date.now()}`,
                      number: students.length + 1,
                      name: '',
                      gender: '남',
                      tardiness: '',
                      absence: '',
                      note: ''
                    }
                    setStudents([...students, newStudent])
                  }}
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
                    render: (text, record, index) => (
                      <Input
                        type="number"
                        value={text}
                        onChange={(e) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].number = parseInt(e.target.value) || 0
                          setStudents(updatedStudents)
                        }}
                        className="h-8 rounded-lg w-full"
                      />
                    ),
                  },
                  {
                    title: '이름',
                    dataIndex: 'name',
                    key: 'name',
                    width: 120,
                    render: (text, record, index) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].name = e.target.value
                          setStudents(updatedStudents)
                        }}
                        className="h-8 rounded-lg"
                      />
                    ),
                  },
                  {
                    title: '성별',
                    dataIndex: 'gender',
                    key: 'gender',
                    width: 80,
                    render: (text, record, index) => (
                      <Select
                        value={text}
                        onChange={(value) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].gender = value
                          setStudents(updatedStudents)
                        }}
                        className="h-8 rounded-lg w-full"
                        options={[
                          { value: '남', label: '남' },
                          { value: '여', label: '여' },
                        ]}
                      />
                    ),
                  },
                  {
                    title: '지각(회)',
                    dataIndex: 'tardiness',
                    key: 'tardiness',
                    width: 100,
                    render: (text, record, index) => (
                      <Select
                        value={text}
                        onChange={(value) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].tardiness = value as 'O' | 'X' | ''
                          setStudents(updatedStudents)
                        }}
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
                    title: '결석(수)',
                    dataIndex: 'absence',
                    key: 'absence',
                    width: 100,
                    render: (text, record, index) => (
                      <Select
                        value={text}
                        onChange={(value) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].absence = value as 'O' | 'X' | ''
                          setStudents(updatedStudents)
                        }}
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
                    title: '비고',
                    dataIndex: 'note',
                    key: 'note',
                    render: (text, record, index) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const updatedStudents = [...students]
                          updatedStudents[index].note = e.target.value
                          setStudents(updatedStudents)
                        }}
                        className="h-8 rounded-lg"
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
            </Card>
          </div>
        </TabPane>
        
        <TabPane tab="활동 일지 정보" key="activity">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Basic Information Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      활동 일지 코드
                    </label>
                    <Input
                      value={activityData?.activityCode || ''}
                      onChange={(e) => activityData && setActivityData({...activityData, activityCode: e.target.value})}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      교육 유형
                    </label>
                    <Select
                      value={activityData?.educationType || ''}
                      onChange={(value) => activityData && setActivityData({...activityData, educationType: value})}
                      className="w-full h-10 rounded-lg"
                      options={[
                        { value: '정규교육', label: '정규교육' },
                        { value: '특별교육', label: '특별교육' },
                        { value: '방과후교육', label: '방과후교육' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      교육기관 유형
                    </label>
                    <Select
                      value={activityData?.institutionType || ''}
                      onChange={(value) => activityData && setActivityData({...activityData, institutionType: value})}
                      className="w-full h-10 rounded-lg"
                      options={[
                        { value: '초등학교', label: '초등학교' },
                        { value: '중학교', label: '중학교' },
                        { value: '고등학교', label: '고등학교' },
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      지역
                    </label>
                    <Input
                      value={activityData?.region || ''}
                      onChange={(e) => activityData && setActivityData({...activityData, region: e.target.value})}
                      className="h-10 rounded-lg"
                    />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      교육기관명
                    </label>
                    <Input
                      value={activityData?.institutionName || ''}
                      onChange={(e) => activityData && setActivityData({...activityData, institutionName: e.target.value})}
                      className="h-10 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      학년/학급
                    </label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={parseInt(activityData?.grade || '0')}
                        onChange={(e) => activityData && setActivityData({...activityData, grade: e.target.value})}
                        className="h-10 rounded-lg flex-1"
                      />
                      <span className="text-gray-500">학년</span>
                      <Input
                        type="number"
                        value={parseInt(activityData?.class || '0')}
                        onChange={(e) => activityData && setActivityData({...activityData, class: e.target.value})}
                        className="h-10 rounded-lg flex-1"
                      />
                      <span className="text-gray-500">반</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      교육 기간
                    </label>
                    <div className="flex items-center gap-2">
                      <DatePicker
                        value={activityData?.startDate ? dayjs(activityData.startDate) : null}
                        onChange={(date) => activityData && setActivityData({...activityData, startDate: date ? date.format('YYYY-MM-DD') : ''})}
                        className="h-10 rounded-lg flex-1"
                      />
                      <span className="text-gray-500">~</span>
                      <DatePicker
                        value={activityData?.endDate ? dayjs(activityData.endDate) : null}
                        onChange={(date) => activityData && setActivityData({...activityData, endDate: date ? date.format('YYYY-MM-DD') : ''})}
                        className="h-10 rounded-lg flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      작성일/작성자
                    </label>
                    <p className="text-base text-gray-900">{activityData?.createdAt} / {activityData?.createdBy}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Statistics Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">통계 정보</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">총 활동 차시</p>
                  <p className="text-2xl font-bold text-blue-600">{sessions.length}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">참여 학생 수</p>
                  <Input
                    type="number"
                    value={activityData?.totalApplicants || 0}
                    onChange={(e) => activityData && setActivityData({...activityData, totalApplicants: parseInt(e.target.value) || 0})}
                    className="text-2xl font-bold text-green-600 w-full border-0 p-0 bg-transparent"
                  />
                </div>
                <div className="bg-indigo-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">활동 사진 수</p>
                  <p className="text-2xl font-bold text-indigo-600">{photos.length}</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 mb-1">강사 수</p>
                  <p className="text-2xl font-bold text-purple-600">2</p>
                </div>
              </div>
            </Card>

            {/* Session Details Card */}
            <Card
              className="rounded-xl shadow-sm border border-gray-200"
              title={
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#3a2e2a] m-0">차시별 활동 정보</h3>
                  <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      const newSession: Session = {
                        id: `new-${Date.now()}`,
                        sessionNumber: sessions.length + 1,
                        date: dayjs().format('YYYY-MM-DD'),
                        startTime: '09:00',
                        endTime: '12:00',
                        activityName: ''
                      }
                      setSessions([...sessions, newSession])
                    }}
                    className="h-9 px-4 rounded-lg"
                  >
                    차시 추가
                  </Button>
                </div>
              }
            >
              <Table
                columns={[
                  {
                    title: '차시',
                    dataIndex: 'sessionNumber',
                    key: 'sessionNumber',
                    width: 100,
                    render: (text, record, index) => (
                      <Input
                        type="number"
                        value={text}
                        onChange={(e) => {
                          const updatedSessions = [...sessions]
                          updatedSessions[index].sessionNumber = parseInt(e.target.value) || 0
                          setSessions(updatedSessions)
                        }}
                        className="h-10 rounded-lg w-full"
                      />
                    ),
                  },
                  {
                    title: '활동 내용',
                    dataIndex: 'activityName',
                    key: 'activityName',
                    render: (text, record, index) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const updatedSessions = [...sessions]
                          updatedSessions[index].activityName = e.target.value
                          setSessions(updatedSessions)
                        }}
                        className="h-10 rounded-lg"
                      />
                    ),
                  },
                  {
                    title: '일자',
                    dataIndex: 'date',
                    key: 'date',
                    width: 120,
                    render: (text, record, index) => (
                      <DatePicker
                        value={text ? dayjs(text) : null}
                        onChange={(date) => {
                          const updatedSessions = [...sessions]
                          updatedSessions[index].date = date ? date.format('YYYY-MM-DD') : ''
                          setSessions(updatedSessions)
                        }}
                        className="h-10 rounded-lg w-full"
                      />
                    ),
                  },
                  {
                    title: '시간',
                    dataIndex: 'time',
                    key: 'time',
                    width: 180,
                    render: (_, record, index) => (
                      <div className="flex items-center gap-2">
                        <Input
                          value={record.startTime}
                          onChange={(e) => {
                            const updatedSessions = [...sessions]
                            updatedSessions[index].startTime = e.target.value
                            setSessions(updatedSessions)
                          }}
                          className="h-10 rounded-lg flex-1"
                          placeholder="시작시간"
                        />
                        <span className="text-gray-500">~</span>
                        <Input
                          value={record.endTime}
                          onChange={(e) => {
                            const updatedSessions = [...sessions]
                            updatedSessions[index].endTime = e.target.value
                            setSessions(updatedSessions)
                          }}
                          className="h-10 rounded-lg flex-1"
                          placeholder="종료시간"
                        />
                      </div>
                    ),
                  },
                  {
                    title: '삭제',
                    key: 'action',
                    width: 80,
                    render: (_: any, record: any) => (
                      <Button
                        type="text"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => {
                          setSessions(sessions.filter(s => s.id !== record.id))
                        }}
                        className="text-red-500 hover:text-red-700"
                      />
                    ),
                  },
                ]}
                dataSource={sessions}
                pagination={{
                  pageSize: 5,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                }}
                scroll={{ x: 'max-content' }}
                className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
              />
            </Card>

            {/* Photos Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">활동 사진</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((photo) => (
                  <div key={photo.id} className="relative group">
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="mt-2 text-sm text-gray-700 truncate">{photo.name}</div>
                    <Button
                      type="text"
                      icon={<Trash2 className="w-4 h-4" />}
                      onClick={() => {
                        setPhotos(photos.filter(p => p.id !== photo.id))
                      }}
                      className="absolute top-2 right-2 h-8 w-8 p-0 flex items-center justify-center bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    />
                  </div>
                ))}
                <Upload.Dragger
                  beforeUpload={() => false} // Prevent automatic upload
                  showUploadList={false}
                  multiple
                >
                  <div className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors">
                    <UploadIcon className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">사진 추가</span>
                  </div>
                </Upload.Dragger>
              </div>
            </Card>
          </div>
        </TabPane>
        
        <TabPane tab="교구 확인서 정보" key="equipment">
          <div className="space-y-6 max-w-7xl mx-auto">
            {/* Basic Information Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">기본 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    과제번호
                  </label>
                  <Input
                    value={equipmentData?.assignmentNumber || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, assignmentNumber: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    교육과정명
                  </label>
                  <Input
                    value={equipmentData?.courseName || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, courseName: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    교육기관
                  </label>
                  <Input
                    value={equipmentData?.institution || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, institution: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    교육일자
                  </label>
                  <DatePicker
                    value={equipmentData?.educationDate ? dayjs(equipmentData.educationDate) : null}
                    onChange={(date) => equipmentData && setEquipmentData({...equipmentData, educationDate: date ? date.format('YYYY-MM-DD') : ''})}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    담당차시 / 총차시
                  </label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={equipmentData?.currentSession || 0}
                      onChange={(e) => equipmentData && setEquipmentData({...equipmentData, currentSession: parseInt(e.target.value) || 0})}
                      placeholder="담당차시"
                      className="h-10 rounded-lg flex-1"
                    />
                    <span className="text-gray-500">/</span>
                    <Input
                      type="number"
                      value={equipmentData?.totalSessions || 0}
                      onChange={(e) => equipmentData && setEquipmentData({...equipmentData, totalSessions: parseInt(e.target.value) || 0})}
                      placeholder="총차시"
                      className="h-10 rounded-lg flex-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    당일 참여 강사
                  </label>
                  <Input
                    value={equipmentData?.instructorName || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, instructorName: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    예상 참가 인원
                  </label>
                  <Input
                    type="number"
                    value={equipmentData?.expectedParticipants || 0}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, expectedParticipants: parseInt(e.target.value) || 0})}
                    className="h-10 rounded-lg"
                  />
                </div>
              </div>
            </Card>

            {/* Rental Information Card */}
            <Card
              className="rounded-xl shadow-sm border border-gray-200"
              title={
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-[#3a2e2a] m-0">대여 정보</h3>
                  <Button
                    type="primary"
                    icon={<Plus className="w-4 h-4" />}
                    onClick={() => {
                      const newItem: RentalItem = {
                        id: `new-${Date.now()}`,
                        itemName: '',
                        quantity: 1,
                      }
                      setRentalItems([...rentalItems, newItem])
                    }}
                    className="h-9 px-4 rounded-lg"
                  >
                    교구 추가
                  </Button>
                </div>
              }
            >
              <Table
                columns={[
                  {
                    title: '교구명',
                    dataIndex: 'itemName',
                    key: 'itemName',
                    render: (text, record, index) => (
                      <Input
                        value={text}
                        onChange={(e) => {
                          const updatedItems = [...rentalItems]
                          updatedItems[index].itemName = e.target.value
                          setRentalItems(updatedItems)
                        }}
                        className="h-10 rounded-lg"
                      />
                    ),
                  },
                  {
                    title: '수량',
                    dataIndex: 'quantity',
                    key: 'quantity',
                    width: 150,
                    render: (text, record, index) => (
                      <Input
                        type="number"
                        value={text}
                        onChange={(e) => {
                          const updatedItems = [...rentalItems]
                          updatedItems[index].quantity = parseInt(e.target.value) || 0
                          setRentalItems(updatedItems)
                        }}
                        className="h-10 rounded-lg"
                      />
                    ),
                  },
                  {
                    title: '삭제',
                    key: 'action',
                    width: 80,
                    render: (_: any, record: any) => (
                      <Button
                        type="text"
                        icon={<Trash2 className="w-4 h-4" />}
                        onClick={() => {
                          setRentalItems(rentalItems.filter(item => item.id !== record.id))
                        }}
                        className="text-red-500 hover:text-red-700"
                      />
                    ),
                  },
                ]}
                dataSource={rentalItems}
                pagination={{
                  pageSize: 5,
                  showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} results`,
                }}
                scroll={{ x: 'max-content' }}
                className="[&_.ant-table-thead>tr>th]:bg-gray-50 [&_.ant-table-thead>tr>th]:text-gray-700 [&_.ant-table]:text-sm"
              />
            </Card>

            {/* Return Information Card */}
            <Card className="rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-[#3a2e2a] mb-4">반납 정보</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납일자
                  </label>
                  <DatePicker
                    value={equipmentData?.returnDate ? dayjs(equipmentData.returnDate) : null}
                    onChange={(date) => equipmentData && setEquipmentData({...equipmentData, returnDate: date ? date.format('YYYY-MM-DD') : ''})}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납시간
                  </label>
                  <TimePicker
                    value={equipmentData?.returnTime ? dayjs(equipmentData.returnTime, 'HH:mm') : null}
                    onChange={(time) => equipmentData && setEquipmentData({...equipmentData, returnTime: time ? time.format('HH:mm') : ''})}
                    format="HH:mm"
                    className="w-full h-10 rounded-lg"
                    popupClassName="tp-popup-primary-ok"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납자
                  </label>
                  <Input
                    value={equipmentData?.returnerName || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, returnerName: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납자 확인
                  </label>
                  <Input
                    value={equipmentData?.returnerNameConfirm || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, returnerNameConfirm: e.target.value})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납일자 확인
                  </label>
                  <DatePicker
                    value={equipmentData?.returnDateConfirm ? dayjs(equipmentData.returnDateConfirm) : null}
                    onChange={(date) => equipmentData && setEquipmentData({...equipmentData, returnDateConfirm: date ? date.format('YYYY-MM-DD') : ''})}
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납시간 확인
                  </label>
                  <TimePicker
                    value={equipmentData?.returnTimeConfirm ? dayjs(equipmentData.returnTimeConfirm, 'HH:mm') : null}
                    onChange={(time) => equipmentData && setEquipmentData({...equipmentData, returnTimeConfirm: time ? time.format('HH:mm') : ''})}
                    format="HH:mm"
                    className="w-full h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납 상태
                  </label>
                  <Select
                    value={equipmentData?.returnStatus || ''}
                    onChange={(value) => equipmentData && setEquipmentData({...equipmentData, returnStatus: value})}
                    className="w-full h-10 rounded-lg"
                    options={[
                      { value: '정상 반납', label: '정상 반납' },
                      { value: '불량 반납', label: '불량 반납' },
                      { value: '분실', label: '분실' },
                    ]}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    반납 수량
                  </label>
                  <Input
                    type="number"
                    value={equipmentData?.returnQuantity || 0}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, returnQuantity: parseInt(e.target.value) || 0})}
                    className="h-10 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    대상 적합 여부
                  </label>
                  <Switch
                    checked={equipmentData?.targetEligible || false}
                    onChange={(checked) => equipmentData && setEquipmentData({...equipmentData, targetEligible: checked})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    비고
                  </label>
                  <TextArea
                    value={equipmentData?.remarks || ''}
                    onChange={(e) => equipmentData && setEquipmentData({...equipmentData, remarks: e.target.value})}
                    rows={3}
                    className="rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">
                    서명 생략
                  </label>
                  <div className="flex items-center gap-4">
                    <Switch
                      checked={equipmentData?.signatureOmitted || false}
                      onChange={(checked) => equipmentData && setEquipmentData({...equipmentData, signatureOmitted: checked})}
                    />
                    <span className="text-base text-gray-900">
                      {equipmentData?.signatureOmitted ? '생략' : '필요'}
                    </span>
                    {equipmentData?.signatureOmitted && (
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-500 mb-1">
                          서명자
                        </label>
                        <Input
                          value={equipmentData?.signatureName || ''}
                          onChange={(e) => equipmentData && setEquipmentData({...equipmentData, signatureName: e.target.value})}
                          className="h-10 rounded-lg"
                        />
                      </div>
                    )}
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-1">
                      서명일
                    </label>
                    <DatePicker
                      value={equipmentData?.signatureDate ? dayjs(equipmentData.signatureDate) : null}
                      onChange={(date) => equipmentData && setEquipmentData({...equipmentData, signatureDate: date ? date.format('YYYY-MM-DD') : ''})}
                      className="w-full h-10 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </TabPane>
      </Tabs>
    </div>
  )
}