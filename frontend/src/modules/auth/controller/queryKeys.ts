/**
 * React Query keys for auth module
 */
export const authQueryKeys = {
  all: ['auth'] as const,
  login: () => [...authQueryKeys.all, 'login'] as const,
  logout: () => [...authQueryKeys.all, 'logout'] as const,
  refresh: () => [...authQueryKeys.all, 'refresh'] as const,
}
