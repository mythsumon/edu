'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'instructor' | 'operator' | null

export interface UserProfile {
  userId: string
  name: string
  email: string
  phone?: string
  signatureImageUrl?: string
}

interface AuthContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  isAuthenticated: boolean
  isLoading: boolean
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void
  login: (role: UserRole) => void
  logout: () => void
  updateProfile: (profile: Partial<UserProfile>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user role and profile are stored in localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') as UserRole
      if (storedRole) {
        setUserRole(storedRole)
      }
      
      const storedProfile = localStorage.getItem('userProfile')
      if (storedProfile) {
        try {
          setUserProfile(JSON.parse(storedProfile))
        } catch (e) {
          console.error('Failed to parse user profile', e)
        }
      } else {
        // Initialize default profile based on role
        if (storedRole === 'instructor') {
          const defaultProfile: UserProfile = {
            userId: 'instructor-1',
            name: '홍길동',
            email: 'instructor@example.com',
            phone: '010-1234-5678',
          }
          setUserProfile(defaultProfile)
          localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
        } else if (storedRole === 'admin') {
          const defaultProfile: UserProfile = {
            userId: 'admin-1',
            name: '관리자',
            email: 'admin@example.com',
            phone: '010-1234-5678',
          }
          setUserProfile(defaultProfile)
          localStorage.setItem('userProfile', JSON.stringify(defaultProfile))
        }
      }
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = (role: UserRole) => {
    setUserRole(role)
    if (typeof window !== 'undefined') {
      localStorage.setItem('userRole', role || '')
    }
  }

  const logout = () => {
    setUserRole(null)
    setUserProfile(null)
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole')
      localStorage.removeItem('userProfile')
    }
  }

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (userProfile) {
      const updatedProfile = { ...userProfile, ...updates }
      setUserProfile(updatedProfile)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userProfile', JSON.stringify(updatedProfile))
      }
    }
  }

  const value = {
    userRole,
    setUserRole,
    isAuthenticated: !!userRole,
    isLoading,
    userProfile,
    setUserProfile,
    login,
    logout,
    updateProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}