import { axiosInstance } from '@/shared/http/axios/instance'
import type { ApiResponse } from '@/shared/http/types/common'
import type {
  LoginRequestDto,
  LoginResponseDto,
  RefreshTokenRequestDto,
  RefreshTokenResponseDto,
} from './auth.types'

/**
 * Login service
 */
export async function login(credentials: LoginRequestDto): Promise<LoginResponseDto> {
  const response = await axiosInstance.post<ApiResponse<LoginResponseDto>>(
    '/auth/login',
    credentials
  )
  return response.data.data
}

/**
 * Logout service
 */
export async function logout(): Promise<void> {
  await axiosInstance.post('/auth/logout')
}

/**
 * Refresh token service
 */
export async function refreshToken(
  refreshToken: RefreshTokenRequestDto
): Promise<RefreshTokenResponseDto> {
  const response = await axiosInstance.post<ApiResponse<RefreshTokenResponseDto>>(
    '/auth/refresh',
    refreshToken
  )
  return response.data.data
}
