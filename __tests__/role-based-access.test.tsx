/**
 * @jest-environment jsdom
 */

import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

describe('Role-Based Access Control', () => {
  it('renders children when user has required role', () => {
    const TestComponent = () => (
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthProvider>
    )

    // Mock localStorage to simulate admin user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'admin'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    render(<TestComponent />)
    
    expect(screen.getByText('Admin Content')).toBeInTheDocument()
  })

  it('redirects when user does not have required role', () => {
    const TestComponent = () => (
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthProvider>
    )

    // Mock localStorage to simulate instructor user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'instructor'),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    render(<TestComponent />)
    
    // Should show access denied message
    expect(screen.getByText('접근 권한이 없습니다')).toBeInTheDocument()
  })

  it('redirects unauthenticated users to login', () => {
    const TestComponent = () => (
      <AuthProvider>
        <ProtectedRoute requiredRole="admin">
          <div>Admin Content</div>
        </ProtectedRoute>
      </AuthProvider>
    )

    // Mock localStorage to simulate unauthenticated user
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
      },
      writable: true,
    })

    render(<TestComponent />)
    
    // Should show loading spinner
    expect(screen.getByRole('status')).toBeInTheDocument()
  })
})