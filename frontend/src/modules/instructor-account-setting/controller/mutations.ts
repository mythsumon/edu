import { useMutation } from '@tanstack/react-query'
import { changePassword } from '../model/instructor-account-setting.service'
import type { ChangePasswordRequestDto } from '../model/instructor-account-setting.schema'

/**
 * Mutation hook for changing password
 * Endpoint: POST /api/v1/user/change-password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: ChangePasswordRequestDto) => {
      return await changePassword(data)
    },
  })
}
