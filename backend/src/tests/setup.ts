import { beforeAll } from '@jest/globals'
import dotenv from 'dotenv'

// Load test environment variables
dotenv.config({ path: '.env.test' })

// Set test environment variables
process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-jwt-secret'
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret'
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-chars-long'
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/studymate_test'

beforeAll(() => {
  // Set up test environment
  console.log('Setting up test environment...')
}) 