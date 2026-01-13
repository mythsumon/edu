import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/ui/table'
import { Checkbox } from '@/shared/ui/checkbox'
import { Button } from '@/shared/ui/button'
import { MoreHorizontal } from 'lucide-react'
import type { AdminAccount } from '../../model/account-management.types'

interface AdminAccountTableProps {
  data: AdminAccount[]
  onDetailClick?: (admin: AdminAccount) => void
}

export const AdminAccountTable = ({
  data,
  onDetailClick,
}: AdminAccountTableProps) => {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set())

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(new Set(data.map((admin) => admin.id)))
    } else {
      setSelectedRows(new Set())
    }
  }

  const handleSelectRow = (id: number, checked: boolean) => {
    const newSelected = new Set(selectedRows)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedRows(newSelected)
  }

  const isAllSelected = data.length > 0 && selectedRows.size === data.length

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isAllSelected}
                onCheckedChange={handleSelectAll}
                aria-label="Select all"
              />
            </TableHead>
            <TableHead>Admin ID</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone Number</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                No admin accounts found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((admin) => (
              <TableRow key={admin.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedRows.has(admin.id)}
                    onCheckedChange={(checked) =>
                      handleSelectRow(admin.id, checked === true)
                    }
                    aria-label={`Select ${admin.name}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{admin.id}</TableCell>
                <TableCell>{admin.name}</TableCell>
                <TableCell>{admin.username}</TableCell>
                <TableCell>{admin.email || '-'}</TableCell>
                <TableCell>{admin.phoneNumber || '-'}</TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDetailClick?.(admin)}
                    aria-label="View details"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
