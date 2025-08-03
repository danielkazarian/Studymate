"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

interface AuthRedirectProps {
  children: React.ReactNode
}

export function AuthRedirect({ children }: AuthRedirectProps) {
  const { state } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // If not loading and authenticated, redirect to dashboard
    if (!state.isLoading && state.isAuthenticated) {
      router.push('/dashboard')
    }
  }, [state.isLoading, state.isAuthenticated, router])

  // Show loading spinner while checking authentication
  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If authenticated, show nothing (redirect will happen)
  if (state.isAuthenticated) {
    return null
  }

  // If not authenticated, render the auth content
  return <>{children}</>
} 