/**
 * Axios 기본 설정
 * API baseURL을 설정합니다.
 */

import axios from 'axios'

// 개발 환경에서는 백엔드 서버 주소로 설정
// 프로덕션에서는 실제 API 서버 주소로 변경
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 요청 인터셉터
apiClient.interceptors.request.use(
  (config) => {
    // 필요시 인증 토큰 추가
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 응답 인터셉터
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // 공통 에러 처리
    if (error.response?.status === 401) {
      // 인증 오류 처리
      console.error('인증 오류')
    }
    return Promise.reject(error)
  }
)

export default apiClient
