// API Client for StudyMate Frontend

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T = any> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface User {
  id: string
  email: string
  name: string
  googleId?: string
  createdAt: string
  updatedAt: string
}

export interface Page {
  id: string
  title: string
  description?: string
  isPublic: boolean
  shareUrl?: string
  createdAt: string
  updatedAt: string
  counts?: {
    files: number
    flashcards: number
    studyGuides: number
    tests: number
    chatSessions: number
  }
}

export interface FileData {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  uploadedAt: string
}

export interface Flashcard {
  id: string
  front: string
  back: string
  difficulty: 'easy' | 'medium' | 'hard'
  tags: string[]
  isAIGenerated: boolean
  createdAt: string
}

export interface StudyGuide {
  id: string
  title: string
  content: string
  isAIGenerated: boolean
  createdAt: string
}

export interface Test {
  id: string
  title: string
  timeLimit?: number
  isAIGenerated: boolean
  createdAt: string
  questions: Question[]
}

export interface Question {
  id: string
  type: 'multiple_choice' | 'short_answer' | 'essay'
  prompt: string
  options?: string[]
  correctAnswer: string
  points: number
  order: number
}

export interface ChatSession {
  id: string
  title: string
  apiProvider: 'openai' | 'anthropic' | 'google'
  contextFiles: string[]
  createdAt: string
  updatedAt: string
  messages?: ChatMessage[]
}

export interface ChatMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface APIKey {
  id: string
  provider: 'openai' | 'anthropic' | 'google'
  name: string
  createdAt: string
  lastUsed?: string
  maskedKey?: string
}

class APIClient {
  private baseURL: string
  private token: string | null = null

  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
    
    // Try to get token from localStorage on client side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken')
    }
  }

  private async request<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      // Handle token refresh
      if (response.status === 401 && data.error?.includes('expired')) {
        const refreshed = await this.refreshTokenInternal()
        if (refreshed) {
          // Retry original request with new token
          headers.Authorization = `Bearer ${this.token}`
          const retryResponse = await fetch(url, { ...options, headers })
          const retryData = await retryResponse.json()
          
          // Return the extracted data for successful responses
          if (retryData.success) {
            return retryData.data
          }
          throw new Error(retryData.error || 'Request failed')
        }
      }

      // Check if the response was successful
      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`)
      }

      // Return the extracted data for successful responses
      if (data.success) {
        return data.data
      }

      // If not successful, throw an error
      throw new Error(data.error || 'Request failed')
    } catch (error) {
      console.error('API request failed:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Network error or server unavailable')
    }
  }

  async refreshToken(refreshToken: string) {
    return this.request<AuthTokens>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
  }

  private async refreshTokenInternal(): Promise<boolean> {
    if (typeof window === 'undefined') return false

    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) return false

    try {
      const response = await fetch(`${this.baseURL}/api/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })

      const data = await response.json()
      
      if (data.success && data.data.tokens) {
        this.setTokens(data.data.tokens)
        return true
      }
    } catch (error) {
      console.error('Token refresh failed:', error)
    }

    // Clear invalid tokens
    this.clearTokens()
    return false
  }

  setTokens(tokens: AuthTokens) {
    this.token = tokens.accessToken
    if (typeof window !== 'undefined') {
      localStorage.setItem('accessToken', tokens.accessToken)
      localStorage.setItem('refreshToken', tokens.refreshToken)
    }
  }

  getTokens(): AuthTokens {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('accessToken') || '',
        refreshToken: localStorage.getItem('refreshToken') || ''
      }
    }
    return { accessToken: '', refreshToken: '' }
  }

  clearTokens() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
    }
  }

  // Authentication
  async register(email: string, password: string, name: string) {
    return this.request<{ user: User; tokens: AuthTokens }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name })
    })
  }

  async login(email: string, password: string) {
    return this.request<{ user: User; tokens: AuthTokens }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })
  }

  async logout() {
    const refreshToken = typeof window !== 'undefined' 
      ? localStorage.getItem('refreshToken') 
      : null

    const result = await this.request('/api/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken })
    })
    
    this.clearTokens()
    return result
  }

  // User Management
  async getUserProfile() {
    return this.request<User>('/api/users/profile')
  }

  async updateProfile(data: Partial<Pick<User, 'name' | 'email'>>) {
    return this.request<User>('/api/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return this.request('/api/users/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
    })
  }

  // Pages
  async getPages(params?: { page?: number; limit?: number; search?: string }) {
    const query = new URLSearchParams(params as any).toString()
    return this.request<Page[]>(`/api/pages${query ? `?${query}` : ''}`)
  }

  async getPage(id: string) {
    return this.request<Page>(`/api/pages/${id}`)
  }

  async createPage(data: { title: string; description?: string; isPublic?: boolean }) {
    return this.request<Page>('/api/pages', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updatePage(id: string, data: Partial<Pick<Page, 'title' | 'description' | 'isPublic'>>) {
    return this.request<Page>(`/api/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deletePage(id: string) {
    return this.request(`/api/pages/${id}`, { method: 'DELETE' })
  }

  // Files
  async uploadFiles(pageId: string, files: FileList) {
    const formData = new FormData()
    Array.from(files).forEach(file => formData.append('files', file))

    return this.request<FileData[]>(`/api/files/upload/${pageId}`, {
      method: 'POST',
      body: formData,
      headers: {} // Remove Content-Type to let browser set it with boundary
    })
  }

  async getPageFiles(pageId: string) {
    return this.request<FileData[]>(`/api/files/page/${pageId}`)
  }

  async deleteFile(id: string) {
    return this.request(`/api/files/${id}`, { method: 'DELETE' })
  }

  // Content Generation
  async generateFlashcards(pageId: string, options: {
    provider: string
    fileIds?: string[]
    count?: number
    difficulty?: string
    focusAreas?: string[]
  }) {
    return this.request<Flashcard[]>(`/api/content/generate/flashcards/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
  }

  async generateStudyGuide(pageId: string, options: {
    provider: string
    fileIds?: string[]
    title?: string
    difficulty?: string
    focusAreas?: string[]
  }) {
    return this.request<StudyGuide>(`/api/content/generate/study-guide/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
  }

  async generateTest(pageId: string, options: {
    provider: string
    fileIds?: string[]
    title?: string
    count?: number
    difficulty?: string
    focusAreas?: string[]
    timeLimit?: number
  }) {
    return this.request<Test>(`/api/content/generate/test/${pageId}`, {
      method: 'POST',
      body: JSON.stringify(options)
    })
  }

  // Chat
  async getChatSessions(pageId: string) {
    return this.request<ChatSession[]>(`/api/chat/page/${pageId}`)
  }

  async getChatSession(id: string) {
    return this.request<ChatSession>(`/api/chat/${id}`)
  }

  async createChatSession(data: {
    pageId: string
    title: string
    apiProvider: string
    contextFiles?: string[]
  }) {
    return this.request<ChatSession>('/api/chat', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async sendChatMessage(chatId: string, content: string, contextFiles?: string[]) {
    return this.request<{
      userMessage: ChatMessage
      assistantMessage: ChatMessage
      usage: any
    }>(`/api/chat/${chatId}/message`, {
      method: 'POST',
      body: JSON.stringify({ content, contextFiles })
    })
  }

  async deleteChatSession(id: string) {
    return this.request(`/api/chat/${id}`, { method: 'DELETE' })
  }

  // API Keys
  async getAPIKeys() {
    return this.request<APIKey[]>('/api/api-keys')
  }

  async addAPIKey(data: { provider: string; apiKey: string; name: string }) {
    return this.request<APIKey>('/api/api-keys', {
      method: 'POST',
      body: JSON.stringify(data)
    })
  }

  async updateAPIKey(id: string, data: { apiKey?: string; name?: string }) {
    return this.request<APIKey>(`/api/api-keys/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    })
  }

  async deleteAPIKey(id: string) {
    return this.request(`/api/api-keys/${id}`, { method: 'DELETE' })
  }

  async testAPIKey(id: string) {
    return this.request<{ provider: string; valid: boolean; error?: string }>(`/api/api-keys/${id}/test`, {
      method: 'POST'
    })
  }
}

// Create singleton instance
export const apiClient = new APIClient()
export default apiClient 