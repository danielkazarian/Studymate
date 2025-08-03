"use client"

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { apiClient, Page } from '@/lib/api'
import { useAuth } from './AuthContext'

interface PagesState {
  pages: Page[]
  isLoading: boolean
  error: string | null
  searchQuery: string
  filterStatus: string
}

type PagesAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_PAGES'; payload: Page[] }
  | { type: 'ADD_PAGE'; payload: Page }
  | { type: 'UPDATE_PAGE'; payload: Page }
  | { type: 'DELETE_PAGE'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTER_STATUS'; payload: string }
  | { type: 'CLEAR_ERROR' }

const initialState: PagesState = {
  pages: [],
  isLoading: false,
  error: null,
  searchQuery: '',
  filterStatus: 'all',
}

const pagesReducer = (state: PagesState, action: PagesAction): PagesState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_PAGES':
      return {
        ...state,
        pages: action.payload,
        isLoading: false,
        error: null,
      }
    case 'ADD_PAGE':
      return {
        ...state,
        pages: [action.payload, ...state.pages],
      }
    case 'UPDATE_PAGE':
      return {
        ...state,
        pages: state.pages.map(page => 
          page.id === action.payload.id ? action.payload : page
        ),
      }
    case 'DELETE_PAGE':
      return {
        ...state,
        pages: state.pages.filter(page => page.id !== action.payload),
      }
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      }
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload }
    case 'SET_FILTER_STATUS':
      return { ...state, filterStatus: action.payload }
    case 'CLEAR_ERROR':
      return { ...state, error: null }
    default:
      return state
  }
}

interface PagesContextType {
  state: PagesState
  loadPages: () => Promise<void>
  createPage: (title: string, description: string) => Promise<Page>
  updatePage: (id: string, data: Partial<Page>) => Promise<void>
  deletePage: (id: string) => Promise<void>
  setSearchQuery: (query: string) => void
  setFilterStatus: (status: string) => void
  clearError: () => void
  getFilteredPages: () => Page[]
}

const PagesContext = createContext<PagesContextType | undefined>(undefined)

export const usePages = () => {
  const context = useContext(PagesContext)
  if (context === undefined) {
    throw new Error('usePages must be used within a PagesProvider')
  }
  return context
}

interface PagesProviderProps {
  children: React.ReactNode
}

export const PagesProvider: React.FC<PagesProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(pagesReducer, initialState)
  const { state: authState } = useAuth()

  const loadPages = async () => {
    if (!authState.isAuthenticated) return
    
    try {
      dispatch({ type: 'SET_LOADING', payload: true })
      dispatch({ type: 'CLEAR_ERROR' })

      const pages = await apiClient.getPages()
      dispatch({ type: 'SET_PAGES', payload: pages })
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to load pages' })
    }
  }

  const createPage = async (title: string, description: string): Promise<Page> => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      const newPage = await apiClient.createPage({ title, description })
      dispatch({ type: 'ADD_PAGE', payload: newPage })
      return newPage
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to create page' })
      throw error
    }
  }

  const updatePage = async (id: string, data: Partial<Page>) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      const updatedPage = await apiClient.updatePage(id, data)
      dispatch({ type: 'UPDATE_PAGE', payload: updatedPage })
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to update page' })
      throw error
    }
  }

  const deletePage = async (id: string) => {
    try {
      dispatch({ type: 'CLEAR_ERROR' })

      await apiClient.deletePage(id)
      dispatch({ type: 'DELETE_PAGE', payload: id })
    } catch (error: any) {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'Failed to delete page' })
      throw error
    }
  }

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query })
  }

  const setFilterStatus = (status: string) => {
    dispatch({ type: 'SET_FILTER_STATUS', payload: status })
  }

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  const getFilteredPages = (): Page[] => {
    return state.pages.filter((page) => {
      const matchesSearch =
        page.title.toLowerCase().includes(state.searchQuery.toLowerCase()) ||
        page.description.toLowerCase().includes(state.searchQuery.toLowerCase())
      const matchesFilter = state.filterStatus === 'all' || page.status === state.filterStatus
      return matchesSearch && matchesFilter
    })
  }

  // Load pages when authenticated
  useEffect(() => {
    if (authState.isAuthenticated) {
      loadPages()
    }
  }, [authState.isAuthenticated])

  const value: PagesContextType = {
    state,
    loadPages,
    createPage,
    updatePage,
    deletePage,
    setSearchQuery,
    setFilterStatus,
    clearError,
    getFilteredPages,
  }

  return (
    <PagesContext.Provider value={value}>
      {children}
    </PagesContext.Provider>
  )
} 