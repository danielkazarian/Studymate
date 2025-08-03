"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { apiClient } from '@/lib/api'

interface User {
  id: string
  email: string
  name: string
  googleId?: string
}

interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }

const initialState: AuthState = {
  user: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
}

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

interface AuthContextType {
  state: AuthState
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  clearError: () => void
  refreshToken: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Check for existing token on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = apiClient.getTokens()
        if (tokens.accessToken) {
          // Try to get user profile to validate token
          const user = await apiClient.getUserProfile()
          dispatch({ type: 'SET_USER', payload: user })
        } else {
          dispatch({ type: 'SET_LOADING', payload: false })
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
        apiClient.clearTokens()
        dispatch({ type: 'SET_LOADING', payload: false })
      }
    }

    initAuth()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await apiClient.login(email, password)
      apiClient.setTokens(response.tokens)
      
      // Use the user data from the login response
      dispatch({ type: 'SET_USER', payload: response.user })
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Login failed' })
      throw error
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const response = await apiClient.register(email, password, name)
      apiClient.setTokens(response.tokens)
      
      // Use the user data from the registration response
      dispatch({ type: 'SET_USER', payload: response.user })
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Registration failed' })
      throw error
    }
  }

  const logout = async () => {
    try {
      await apiClient.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      apiClient.clearTokens()
      dispatch({ type: 'LOGOUT' })
    }
  }

  const refreshToken = async () => {
    try {
      const tokens = apiClient.getTokens()
      if (tokens.refreshToken) {
        const response = await apiClient.refreshToken(tokens.refreshToken)
        // Response now directly contains the tokens since API client extracts data
        apiClient.setTokens(response)
      }
    } catch (error) {
      console.error('Token refresh error:', error)
      apiClient.clearTokens()
      dispatch({ type: 'LOGOUT' })
      throw error
    }
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const value: AuthContextType = {
    state,
    login,
    register,
    logout,
    clearError,
    refreshToken,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 