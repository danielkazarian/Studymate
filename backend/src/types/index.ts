export interface AuthUser {
  id: string
  email: string
  name: string
  googleId?: string
}

export interface JWTPayload {
  sub: string
  email: string
  name: string
  iat?: number
  exp?: number
}

export interface APIResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends APIResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface FileUploadResult {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
}

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'google'
  apiKey: string
}

export interface ContentGenerationOptions {
  provider: AIProvider
  difficulty?: 'easy' | 'medium' | 'hard'
  count?: number
  focusAreas?: string[]
}

export interface FlashcardGenerationResult {
  front: string
  back: string
  difficulty?: string
  tags?: string[]
}

export interface StudyGuideGenerationResult {
  title: string
  content: string
  sections: {
    title: string
    content: string
  }[]
}

export interface TestGenerationResult {
  title: string
  questions: {
    type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false'
    prompt: string
    options?: string[]
    correctAnswer?: string
    points: number
  }[]
}

export interface ChatCompletionOptions {
  provider: AIProvider
  context?: string[]
  maxTokens?: number
  temperature?: number
}

export interface ChatCompletionResult {
  content: string
  usage?: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
}

export interface FileProcessingResult {
  text: string
  metadata: {
    title?: string
    author?: string
    subject?: string
    pages?: number
  }
}

export interface EncryptionConfig {
  algorithm: string
  key: string
  iv: string
}

export interface S3UploadConfig {
  bucket: string
  region: string
  accessKeyId: string
  secretAccessKey: string
}

export interface RedisConfig {
  url: string
  password?: string
  db?: number
}

export interface QueueJobData {
  id: string
  type: 'content_generation' | 'file_processing' | 'email_notification'
  data: any
  userId: string
  pageId?: string
}

export interface ContentGenerationJob extends QueueJobData {
  type: 'content_generation'
  data: {
    contentType: 'flashcards' | 'study_guide' | 'test'
    sourceFiles: string[]
    options: ContentGenerationOptions
  }
}

export interface FileProcessingJob extends QueueJobData {
  type: 'file_processing'
  data: {
    fileId: string
    s3Key: string
    mimeType: string
  }
}

export * from '@prisma/client' 