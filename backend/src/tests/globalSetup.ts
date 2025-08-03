import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export default async function globalSetup() {
  console.log('🏗️ Setting up test environment...')

  try {
    // Set test environment variables
    process.env.NODE_ENV = 'test'
    process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/studymate_test'
    
    // Generate Prisma client for tests
    console.log('🔧 Generating Prisma client for tests...')
    await execAsync('npx prisma generate')

    // Create test database if it doesn't exist
    console.log('🗄️ Setting up test database...')
    try {
      await execAsync('npx prisma db push --force-reset')
      console.log('✅ Test database setup complete')
    } catch (error) {
      console.log('⚠️ Test database setup failed, tests may fail:', error)
    }

  } catch (error) {
    console.error('❌ Global setup failed:', error)
    throw error
  }
} 