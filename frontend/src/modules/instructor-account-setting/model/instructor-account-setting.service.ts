import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse } from '@/shared/http/types/common'
import type { ChangePasswordRequestDto, ChangePasswordResponseDto } from './instructor-account-setting.schema'
import { INSTRUCTOR_ACCOUNT_SETTING_ENDPOINTS } from './instructor-account-setting.endpoints'

/**
 * Change password for current authenticated user
 * Endpoint: POST /api/v1/user/change-password
 */
export const changePassword = async (
  data: ChangePasswordRequestDto
): Promise<ChangePasswordResponseDto> => {
  const response = await axiosInstance.post<ApiResponse<null>>(
    INSTRUCTOR_ACCOUNT_SETTING_ENDPOINTS.user.changePassword(),
    {
      currentPassword: data.currentPassword,
      newPassword: data.newPassword,
    }
  )
  return {
    success: response.data.success,
    message: response.data.message || 'Password changed successfully',
    data: response.data.data,
  }
}
