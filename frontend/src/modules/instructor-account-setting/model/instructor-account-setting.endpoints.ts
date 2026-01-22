/**
 * API endpoint constants for instructor account setting module
 */
export const INSTRUCTOR_ACCOUNT_SETTING_ENDPOINTS = {
  /**
   * User endpoints
   */
  user: {
    /**
     * Change password for current authenticated user
     * POST /api/v1/user/change-password
     */
    changePassword: () => '/user/change-password',
  },
} as const
