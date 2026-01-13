import { InstructorAccountTable } from '../components/InstructorAccountTable'
import type { InstructorAccount } from '../../model/account-management.types'

// Placeholder data - to be replaced with API data
const mockInstructorAccounts: InstructorAccount[] = [
  {
    id: 101,
    name: 'Robert Anderson',
    username: 'robert.anderson',
    affiliation: 'University of Technology',
    region: 'Seoul, South Korea',
    instructorClassification: 'Senior Instructor',
  },
  {
    id: 102,
    name: 'Lisa Park',
    username: 'lisa.park',
    affiliation: 'Seoul National University',
    region: 'Seoul, South Korea',
    instructorClassification: 'Associate Instructor',
  },
  {
    id: 103,
    name: 'James Kim',
    username: 'james.kim',
    affiliation: 'Korea University',
    region: 'Busan, South Korea',
    instructorClassification: 'Instructor',
  },
  {
    id: 104,
    name: 'Maria Garcia',
    username: 'maria.garcia',
    affiliation: 'Yonsei University',
    region: 'Seoul, South Korea',
    instructorClassification: 'Senior Instructor',
  },
  {
    id: 105,
    name: 'Thomas Lee',
    username: 'thomas.lee',
    affiliation: 'Sungkyunkwan University',
    region: 'Incheon, South Korea',
    instructorClassification: 'Associate Instructor',
  },
  {
    id: 106,
    name: 'Jennifer Brown',
    username: 'jennifer.brown',
    affiliation: 'Hanyang University',
    region: 'Seoul, South Korea',
    instructorClassification: 'Instructor',
  },
]

export const InstructorAccountManagementPage = () => {
  const handleDetailClick = (instructor: InstructorAccount) => {
    // TODO: Implement detail view/navigation
    console.log('View details for instructor:', instructor)
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-3xl font-bold mb-4">Instructor Account Management</h1>
        <p className="text-muted-foreground">Manage instructor accounts</p>
      </div>
      <InstructorAccountTable data={mockInstructorAccounts} onDetailClick={handleDetailClick} />
    </div>
  )
}
