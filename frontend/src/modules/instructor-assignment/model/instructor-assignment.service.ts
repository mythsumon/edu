import type { ApiResponse } from '@/shared/http/types/common'
import type { InstructorAssignment } from './instructor-assignment.types'
import { axiosInstance } from '@/shared/http/axios/instance'

// Placeholder service - to be implemented when API is available
export const getInstructorAssignmentList = async (): Promise<ApiResponse<InstructorAssignment[]>> => {
  const response = await axiosInstance.get('/instructor-assignment')
  return response.data
}

