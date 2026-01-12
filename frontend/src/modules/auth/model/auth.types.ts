/**
 * Login request DTO
 */
export interface LoginRequestDto {
  username: string
  password: string
}

/**
 * Login response DTO
 */
export interface LoginResponseDto {
  token: string
  user: {
    id: string
    email: string
    name: string
  }
}

/**
 * Refresh token request DTO
 */
export interface RefreshTokenRequestDto {
  refreshToken: string
}

/**
 * Refresh token response DTO
 */
export interface RefreshTokenResponseDto {
  token: string
}
