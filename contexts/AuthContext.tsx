'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

export type UserRole = 'admin' | 'instructor' | 'operator' | null

interface AuthContextType {
  userRole: UserRole
  setUserRole: (role: UserRole) => void
  isAuthenticated: boolean
  login: (role: UserRole) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [userRole, setUserRole] = useState<UserRole>(null)

  useEffect(() => {
    // Check if user role is stored in localStorage
    if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole') as UserRole
      if (storedRole) {
        setUserRole(storedRole)
      }
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
    if (typeof window !== 'undefined') {
      localStorage.removeItem('userRole')
    }
  }

  const value = {
    userRole,
    setUserRole,
    isAuthenticated: !!userRole,
    login,
    logout
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