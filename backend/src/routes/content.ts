import { Router } from 'express'
import { body, validationResult } from 'express-validator'

import { prisma } from '@/config/database'
import { authenticate, authorize, AuthenticatedRequest } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { APIResponse } from '@/types'
import { logger } from '@/utils/logger'
import { AIService } from '@/services/ai'
import { FileProcessingService } from '@/services/fileProcessing'

const router = Router()

// Generate flashcards from page content
router.post('/generate/flashcards/:pageId', authenticate, authorize('page'), [
  body('provider').isIn(['openai', 'anthropic', 'google']),
  body('fileIds').optional().isArray(),
  body('count').optional().isInt({ min: 1, max: 50 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('focusAreas').optional().isArray()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: APIResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    }
    return res.status(400).json(response)
  }

  const pageId = req.params.pageId
  const { provider, fileIds, count = 10, difficulty = 'medium', focusAreas = [] } = req.body

  try {
    // Get page content
    let content = ''
    
    if (fileIds && fileIds.length > 0) {
      // Get content from specific files
      const files = await prisma.file.findMany({
        where: {
          id: { in: fileIds },
          pageId: pageId
        }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    } else {
      // Get content from all files in the page
      const files = await prisma.file.findMany({
        where: { pageId }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    }

    if (!content.trim()) {
      const response: APIResponse = {
        success: false,
        error: 'No content found to generate flashcards from'
      }
      return res.status(400).json(response)
    }

    // Generate flashcards using AI
    const flashcards = await AIService.generateFlashcards(
      req.user!.id,
      content,
      {
        provider: { name: provider, apiKey: '' },
        difficulty,
        count,
        focusAreas
      }
    )

    // Save flashcards to database
    const savedFlashcards = await prisma.$transaction(
      flashcards.map(flashcard =>
        prisma.flashcard.create({
          data: {
            pageId,
            front: flashcard.front,
            back: flashcard.back,
            difficulty: flashcard.difficulty,
            tags: flashcard.tags || [],
            isAIGenerated: true
          }
        })
      )
    )

    logger.info(`Generated ${savedFlashcards.length} flashcards for page ${pageId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: savedFlashcards,
      message: `Generated ${savedFlashcards.length} flashcards successfully`
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('Flashcard generation failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate flashcards'
    }
    res.status(500).json(response)
  }
}))

// Generate study guide from page content
router.post('/generate/study-guide/:pageId', authenticate, authorize('page'), [
  body('provider').isIn(['openai', 'anthropic', 'google']),
  body('fileIds').optional().isArray(),
  body('title').optional().isString(),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('focusAreas').optional().isArray()
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: APIResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    }
    return res.status(400).json(response)
  }

  const pageId = req.params.pageId
  const { provider, fileIds, title, difficulty = 'medium', focusAreas = [] } = req.body

  try {
    // Get page content
    let content = ''
    
    if (fileIds && fileIds.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          id: { in: fileIds },
          pageId: pageId
        }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    } else {
      const files = await prisma.file.findMany({
        where: { pageId }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    }

    if (!content.trim()) {
      const response: APIResponse = {
        success: false,
        error: 'No content found to generate study guide from'
      }
      return res.status(400).json(response)
    }

    // Generate study guide using AI
    const studyGuide = await AIService.generateStudyGuide(
      req.user!.id,
      content,
      {
        provider: { name: provider, apiKey: '' },
        difficulty,
        focusAreas
      }
    )

    // Save study guide to database
    const savedStudyGuide = await prisma.studyGuide.create({
      data: {
        pageId,
        title: title || studyGuide.title,
        content: studyGuide.content,
        isAIGenerated: true
      }
    })

    logger.info(`Generated study guide for page ${pageId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: savedStudyGuide,
      message: 'Study guide generated successfully'
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('Study guide generation failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate study guide'
    }
    res.status(500).json(response)
  }
}))

// Generate test from page content
router.post('/generate/test/:pageId', authenticate, authorize('page'), [
  body('provider').isIn(['openai', 'anthropic', 'google']),
  body('fileIds').optional().isArray(),
  body('title').optional().isString(),
  body('count').optional().isInt({ min: 1, max: 50 }),
  body('difficulty').optional().isIn(['easy', 'medium', 'hard']),
  body('focusAreas').optional().isArray(),
  body('timeLimit').optional().isInt({ min: 1 })
], asyncHandler(async (req: AuthenticatedRequest, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: APIResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    }
    return res.status(400).json(response)
  }

  const pageId = req.params.pageId
  const { provider, fileIds, title, count = 10, difficulty = 'medium', focusAreas = [], timeLimit } = req.body

  try {
    // Get page content
    let content = ''
    
    if (fileIds && fileIds.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          id: { in: fileIds },
          pageId: pageId
        }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    } else {
      const files = await prisma.file.findMany({
        where: { pageId }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        content += fileContent.text + '\n\n'
      }
    }

    if (!content.trim()) {
      const response: APIResponse = {
        success: false,
        error: 'No content found to generate test from'
      }
      return res.status(400).json(response)
    }

    // Generate test using AI
    const test = await AIService.generateTest(
      req.user!.id,
      content,
      {
        provider: { name: provider, apiKey: '' },
        difficulty,
        count,
        focusAreas
      }
    )

    // Save test to database
    const savedTest = await prisma.test.create({
      data: {
        pageId,
        title: title || test.title,
        timeLimit,
        isAIGenerated: true,
        questions: {
          create: test.questions.map((question, index) => ({
            type: question.type,
            prompt: question.prompt,
            options: question.options || [],
            correctAnswer: question.correctAnswer,
            points: question.points,
            order: index + 1
          }))
        }
      },
      include: {
        questions: {
          orderBy: { order: 'asc' }
        }
      }
    })

    logger.info(`Generated test with ${test.questions.length} questions for page ${pageId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: savedTest,
      message: `Test generated successfully with ${test.questions.length} questions`
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('Test generation failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate test'
    }
    res.status(500).json(response)
  }
}))

// Get all flashcards for a page
router.get('/flashcards/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId

  const flashcards = await prisma.flashcard.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' }
  })

  const response: APIResponse = {
    success: true,
    data: flashcards
  }

  res.json(response)
}))

// Get all study guides for a page
router.get('/study-guides/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId

  const studyGuides = await prisma.studyGuide.findMany({
    where: { pageId },
    orderBy: { createdAt: 'desc' }
  })

  const response: APIResponse = {
    success: true,
    data: studyGuides
  }

  res.json(response)
}))

// Get all tests for a page
router.get('/tests/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId

  const tests = await prisma.test.findMany({
    where: { pageId },
    include: {
      questions: {
        orderBy: { order: 'asc' }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const response: APIResponse = {
    success: true,
    data: tests
  }

  res.json(response)
}))

// Delete a flashcard
router.delete('/flashcard/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const flashcardId = req.params.id

  // Check if user owns the flashcard through page ownership
  const flashcard = await prisma.flashcard.findUnique({
    where: { id: flashcardId },
    include: { page: true }
  })

  if (!flashcard || flashcard.page.userId !== req.user!.id) {
    const response: APIResponse = {
      success: false,
      error: 'Flashcard not found or access denied'
    }
    return res.status(404).json(response)
  }

  await prisma.flashcard.delete({
    where: { id: flashcardId }
  })

  const response: APIResponse = {
    success: true,
    message: 'Flashcard deleted successfully'
  }

  res.json(response)
}))

// Delete a study guide
router.delete('/study-guide/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const studyGuideId = req.params.id

  const studyGuide = await prisma.studyGuide.findUnique({
    where: { id: studyGuideId },
    include: { page: true }
  })

  if (!studyGuide || studyGuide.page.userId !== req.user!.id) {
    const response: APIResponse = {
      success: false,
      error: 'Study guide not found or access denied'
    }
    return res.status(404).json(response)
  }

  await prisma.studyGuide.delete({
    where: { id: studyGuideId }
  })

  const response: APIResponse = {
    success: true,
    message: 'Study guide deleted successfully'
  }

  res.json(response)
}))

// Delete a test
router.delete('/test/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const testId = req.params.id

  const test = await prisma.test.findUnique({
    where: { id: testId },
    include: { page: true }
  })

  if (!test || test.page.userId !== req.user!.id) {
    const response: APIResponse = {
      success: false,
      error: 'Test not found or access denied'
    }
    return res.status(404).json(response)
  }

  await prisma.test.delete({
    where: { id: testId }
  })

  const response: APIResponse = {
    success: true,
    message: 'Test deleted successfully'
  }

  res.json(response)
}))

export default router 