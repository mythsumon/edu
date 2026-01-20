export const instructorAccountSettingQueryKeys = {
  all: ['instructor-account-setting'] as const,
  user: () => [...instructorAccountSettingQueryKeys.all, 'user'] as const,
  changePassword: () => [...instructorAccountSettingQueryKeys.user(), 'change-password'] as const,
} as const
