import { Card } from '@/shared/ui/card'
import { BookOpen, Users, Calendar, Award, TrendingUp, FileText } from 'lucide-react'

export const TeacherDashboardPage = () => {
  // Dummy data for the dashboard
  const stats = [
    {
      title: 'Total Classes',
      value: '12',
      description: 'Active classes this semester',
      icon: BookOpen,
      trend: '+2 from last month',
    },
    {
      title: 'Total Students',
      value: '245',
      description: 'Students across all classes',
      icon: Users,
      trend: '+15 new students',
    },
    {
      title: 'Upcoming Events',
      value: '5',
      description: 'Events scheduled this week',
      icon: Calendar,
      trend: '2 exams, 3 assignments',
    },
    {
      title: 'Completed Trainings',
      value: '8',
      description: 'Training programs completed',
      icon: Award,
      trend: 'All certifications valid',
    },
  ]

  const recentActivities = [
    { id: 1, title: 'Assignment graded: Mathematics Quiz', time: '2 hours ago', type: 'grading' },
    { id: 2, title: 'Class attendance updated for Class A', time: '5 hours ago', type: 'attendance' },
    { id: 3, title: 'New training material added', time: '1 day ago', type: 'material' },
    { id: 4, title: 'Student inquiry responded', time: '2 days ago', type: 'inquiry' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your teaching activities.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="p-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <p className="text-sm font-medium">{stat.title}</p>
                <Icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                {stat.trend}
              </p>
            </Card>
          )
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <Card className="lg:col-span-2">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Recent Activities</h2>
            <p className="text-sm text-muted-foreground">Your latest teaching activities and updates</p>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors">
                <div className="mt-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{activity.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card>
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <p className="text-sm text-muted-foreground">Frequently used actions</p>
          </div>
          <div className="space-y-2">
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">View Class Schedule</div>
              <div className="text-xs text-muted-foreground mt-1">Check your weekly schedule</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Grade Assignments</div>
              <div className="text-xs text-muted-foreground mt-1">Review and grade student work</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Manage Attendance</div>
              <div className="text-xs text-muted-foreground mt-1">Update class attendance records</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Training Materials</div>
              <div className="text-xs text-muted-foreground mt-1">Access training resources</div>
            </button>
          </div>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Upcoming Deadlines</h2>
          <p className="text-sm text-muted-foreground">Important dates and deadlines</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Mid-term Exam</p>
              <p className="text-xs text-muted-foreground">Mathematics - Class A</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Oct 25, 2024</p>
              <p className="text-xs text-muted-foreground">5 days remaining</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Assignment Submission</p>
              <p className="text-xs text-muted-foreground">Science Project - Class B</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Oct 28, 2024</p>
              <p className="text-xs text-muted-foreground">8 days remaining</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}