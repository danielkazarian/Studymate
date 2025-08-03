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

// Get all chat sessions for a page
router.get('/page/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId

  const chatSessions = await prisma.chatSession.findMany({
    where: { pageId },
    include: {
      messages: {
        orderBy: { timestamp: 'desc' },
        take: 1 // Get only the last message for preview
      }
    },
    orderBy: { updatedAt: 'desc' }
  })

  const response: APIResponse = {
    success: true,
    data: chatSessions.map(session => ({
      id: session.id,
      title: session.title,
      apiProvider: session.apiProvider,
      contextFiles: session.contextFiles,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      lastMessage: session.messages[0] || null,
      messageCount: session.messages.length
    }))
  }

  res.json(response)
}))

// Get a specific chat session with all messages
router.get('/:id', authenticate, authorize('chat'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const chatId = req.params.id

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  })

  if (!chatSession) {
    const response: APIResponse = {
      success: false,
      error: 'Chat session not found'
    }
    return res.status(404).json(response)
  }

  const response: APIResponse = {
    success: true,
    data: chatSession
  }

  res.json(response)
}))

// Create a new chat session
router.post('/', authenticate, [
  body('pageId').isUUID(),
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('apiProvider').isIn(['openai', 'anthropic', 'google']),
  body('contextFiles').optional().isArray()
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

  const { pageId, title, apiProvider, contextFiles = [] } = req.body

  // Verify user owns the page
  const page = await prisma.page.findUnique({
    where: { id: pageId }
  })

  if (!page || page.userId !== req.user!.id) {
    const response: APIResponse = {
      success: false,
      error: 'Page not found or access denied'
    }
    return res.status(404).json(response)
  }

  // Verify context files belong to the page
  if (contextFiles.length > 0) {
    const files = await prisma.file.findMany({
      where: {
        id: { in: contextFiles },
        pageId: pageId
      }
    })

    if (files.length !== contextFiles.length) {
      const response: APIResponse = {
        success: false,
        error: 'Some context files do not belong to this page'
      }
      return res.status(400).json(response)
    }
  }

  const chatSession = await prisma.chatSession.create({
    data: {
      pageId,
      title,
      apiProvider,
      contextFiles
    }
  })

  logger.info(`Chat session created: ${chatSession.id} for page ${pageId} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    data: chatSession,
    message: 'Chat session created successfully'
  }

  res.status(201).json(response)
}))

// Send a message in a chat session
router.post('/:id/message', authenticate, authorize('chat'), [
  body('content').trim().notEmpty().isLength({ max: 10000 }),
  body('contextFiles').optional().isArray()
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

  const chatId = req.params.id
  const { content, contextFiles } = req.body

  const chatSession = await prisma.chatSession.findUnique({
    where: { id: chatId },
    include: {
      messages: {
        orderBy: { timestamp: 'asc' }
      }
    }
  })

  if (!chatSession) {
    const response: APIResponse = {
      success: false,
      error: 'Chat session not found'
    }
    return res.status(404).json(response)
  }

  try {
    // Save user message
    const userMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: 'user',
        content
      }
    })

    // Update context files if provided
    if (contextFiles && Array.isArray(contextFiles)) {
      await prisma.chatSession.update({
        where: { id: chatId },
        data: { contextFiles }
      })
    }

    // Prepare context from files
    let fileContext = ''
    const filesToUse = contextFiles || chatSession.contextFiles

    if (filesToUse.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          id: { in: filesToUse },
          pageId: chatSession.pageId
        }
      })

      for (const file of files) {
        const fileContent = await FileProcessingService.extractText(file, Buffer.from(''))
        fileContext += `\n\nFile: ${file.originalName}\n${fileContent.text}`
      }
    }

    // Prepare conversation history
    const messages = [
      ...chatSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content }
    ]

    // Add file context to the first message if available
    if (fileContext && messages.length === 1) {
      messages[0].content = `Context from uploaded files:${fileContext}\n\nUser question: ${content}`
    }

    // Get AI response
    const aiResponse = await AIService.chatCompletion(
      req.user!.id,
      messages,
      {
        provider: { name: chatSession.apiProvider as any, apiKey: '' },
        maxTokens: 2000,
        temperature: 0.7
      }
    )

    // Save AI response
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        chatSessionId: chatId,
        role: 'assistant',
        content: aiResponse.content
      }
    })

    // Update chat session timestamp
    await prisma.chatSession.update({
      where: { id: chatId },
      data: { updatedAt: new Date() }
    })

    logger.info(`Message sent in chat ${chatId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: {
        userMessage,
        assistantMessage,
        usage: aiResponse.usage
      }
    }

    res.json(response)
  } catch (error) {
    logger.error('Chat message failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send message'
    }
    res.status(500).json(response)
  }
}))

// Update chat session
router.put('/:id', authenticate, authorize('chat'), [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('apiProvider').optional().isIn(['openai', 'anthropic', 'google']),
  body('contextFiles').optional().isArray()
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

  const chatId = req.params.id
  const updates = req.body

  // Verify context files if provided
  if (updates.contextFiles) {
    const chatSession = await prisma.chatSession.findUnique({
      where: { id: chatId }
    })

    if (chatSession && updates.contextFiles.length > 0) {
      const files = await prisma.file.findMany({
        where: {
          id: { in: updates.contextFiles },
          pageId: chatSession.pageId
        }
      })

      if (files.length !== updates.contextFiles.length) {
        const response: APIResponse = {
          success: false,
          error: 'Some context files do not belong to this page'
        }
        return res.status(400).json(response)
      }
    }
  }

  const updatedChatSession = await prisma.chatSession.update({
    where: { id: chatId },
    data: updates
  })

  logger.info(`Chat session updated: ${chatId} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    data: updatedChatSession,
    message: 'Chat session updated successfully'
  }

  res.json(response)
}))

// Delete a chat session
router.delete('/:id', authenticate, authorize('chat'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const chatId = req.params.id

  await prisma.chatSession.delete({
    where: { id: chatId }
  })

  logger.info(`Chat session deleted: ${chatId} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    message: 'Chat session deleted successfully'
  }

  res.json(response)
}))

// Delete a specific message
router.delete('/message/:messageId', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const messageId = req.params.messageId

  // Check if user owns the message through chat session and page ownership
  const message = await prisma.chatMessage.findUnique({
    where: { id: messageId },
    include: {
      chatSession: {
        include: { page: true }
      }
    }
  })

  if (!message || message.chatSession.page.userId !== req.user!.id) {
    const response: APIResponse = {
      success: false,
      error: 'Message not found or access denied'
    }
    return res.status(404).json(response)
  }

  await prisma.chatMessage.delete({
    where: { id: messageId }
  })

  const response: APIResponse = {
    success: true,
    message: 'Message deleted successfully'
  }

  res.json(response)
}))

// Get chat session statistics
router.get('/:id/stats', authenticate, authorize('chat'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const chatId = req.params.id

  const stats = await prisma.chatMessage.groupBy({
    by: ['role'],
    where: { chatSessionId: chatId },
    _count: { role: true }
  })

  const totalMessages = await prisma.chatMessage.count({
    where: { chatSessionId: chatId }
  })

  const response: APIResponse = {
    success: true,
    data: {
      totalMessages,
      messagesByRole: stats.reduce((acc, stat) => {
        acc[stat.role] = stat._count.role
        return acc
      }, {} as Record<string, number>)
    }
  }

  res.json(response)
}))

export default router 