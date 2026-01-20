import { Card } from '@/shared/ui/card'
import { Building2, BookOpen, GraduationCap, Users, TrendingUp, FileText } from 'lucide-react'

export const StaffDashboardPage = () => {
  // Dummy data for the dashboard
  const stats = [
    {
      title: 'Total Institutions',
      value: '24',
      description: 'Institutions under management',
      icon: Building2,
      trend: '+3 this month',
    },
    {
      title: 'Active Programs',
      value: '18',
      description: 'Programs currently running',
      icon: BookOpen,
      trend: '+5 new programs',
    },
    {
      title: 'Training Modules',
      value: '42',
      description: 'Training modules available',
      icon: GraduationCap,
      trend: '+8 new modules',
    },
    {
      title: 'Total Participants',
      value: '1,245',
      description: 'Participants across all programs',
      icon: Users,
      trend: '+120 new participants',
    },
  ]

  const recentActivities = [
    { id: 1, title: 'New institution registered: ABC School', time: '2 hours ago', type: 'institution' },
    { id: 2, title: 'Program "AI Basics" started', time: '5 hours ago', type: 'program' },
    { id: 3, title: 'Training module updated: Software Development', time: '1 day ago', type: 'training' },
    { id: 4, title: 'Institution profile updated: XYZ Academy', time: '2 days ago', type: 'institution' },
  ]

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Staff Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back! Here's an overview of your management activities.</p>
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
            <p className="text-sm text-muted-foreground">Your latest management activities and updates</p>
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
              <div className="font-medium text-sm">Manage Institutions</div>
              <div className="text-xs text-muted-foreground mt-1">View and manage institutions</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Manage Programs</div>
              <div className="text-xs text-muted-foreground mt-1">Create and edit programs</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">Training Modules</div>
              <div className="text-xs text-muted-foreground mt-1">Manage training modules</div>
            </button>
            <button className="w-full text-left px-4 py-3 rounded-lg border hover:bg-muted transition-colors">
              <div className="font-medium text-sm">View Reports</div>
              <div className="text-xs text-muted-foreground mt-1">Access management reports</div>
            </button>
          </div>
        </Card>
      </div>

      {/* Additional Info Card */}
      <Card>
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Upcoming Events</h2>
          <p className="text-sm text-muted-foreground">Important dates and deadlines</p>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Program Review Meeting</p>
              <p className="text-xs text-muted-foreground">Quarterly program review</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">Oct 25, 2024</p>
              <p className="text-xs text-muted-foreground">5 days remaining</p>
            </div>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg border">
            <div>
              <p className="font-medium text-sm">Training Module Deadline</p>
              <p className="text-xs text-muted-foreground">New module submission</p>
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
