import { prisma } from '../config/database'

export default async function globalTeardown() {
  console.log('🧹 Cleaning up test environment...')

  try {
    // Clean up test data
    await prisma.$transaction([
      prisma.chatMessage.deleteMany(),
      prisma.chatSession.deleteMany(),
      prisma.question.deleteMany(),
      prisma.test.deleteMany(),
      prisma.studyGuide.deleteMany(),
      prisma.flashcard.deleteMany(),
      prisma.file.deleteMany(),
      prisma.contentGeneration.deleteMany(),
      prisma.aPIKey.deleteMany(),
      prisma.refreshToken.deleteMany(),
      prisma.page.deleteMany(),
      prisma.user.deleteMany(),
    ])

    // Disconnect from database
    await prisma.$disconnect()
    console.log('✅ Test cleanup complete')
  } catch (error) {
    console.error('❌ Test cleanup failed:', error)
    await prisma.$disconnect()
  }
} 