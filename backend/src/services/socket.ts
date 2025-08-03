import { Server } from 'socket.io'
import { AuthService } from '@/utils/auth'
import { logger } from '@/utils/logger'
import { prisma } from '@/config/database'

interface AuthenticatedSocket extends Socket {
  userId?: string
  user?: {
    id: string
    email: string
    name: string
  }
}

export function setupSocketIO(io: Server) {
  // Authentication middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '')
      
      if (!token) {
        return next(new Error('Authentication error: No token provided'))
      }

      // Verify JWT token
      const decoded = AuthService.verifyAccessToken(token)
      
      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: decoded.sub },
        select: {
          id: true,
          email: true,
          name: true
        }
      })

      if (!user) {
        return next(new Error('Authentication error: User not found'))
      }

      socket.userId = user.id
      socket.user = user
      next()
    } catch (error) {
      logger.error('Socket authentication error:', error)
      next(new Error('Authentication error: Invalid token'))
    }
  })

  io.on('connection', (socket: AuthenticatedSocket) => {
    logger.info(`User connected: ${socket.user?.email} (${socket.userId})`)

    // Join user to their personal room
    socket.join(`user:${socket.userId}`)

    // Handle joining chat room
    socket.on('join_chat', async (chatId: string) => {
      try {
        // Verify user has access to this chat
        const chatSession = await prisma.chatSession.findUnique({
          where: { id: chatId },
          include: {
            page: true
          }
        })

        if (!chatSession || chatSession.page.userId !== socket.userId) {
          socket.emit('error', { message: 'Access denied to chat session' })
          return
        }

        socket.join(`chat:${chatId}`)
        socket.emit('joined_chat', { chatId })
        logger.info(`User ${socket.userId} joined chat: ${chatId}`)
      } catch (error) {
        logger.error('Error joining chat:', error)
        socket.emit('error', { message: 'Failed to join chat' })
      }
    })

    // Handle leaving chat room
    socket.on('leave_chat', (chatId: string) => {
      socket.leave(`chat:${chatId}`)
      socket.emit('left_chat', { chatId })
      logger.info(`User ${socket.userId} left chat: ${chatId}`)
    })

    // Handle typing indicators
    socket.on('typing_start', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_typing', {
        userId: socket.userId,
        userName: socket.user?.name,
        chatId
      })
    })

    socket.on('typing_stop', (chatId: string) => {
      socket.to(`chat:${chatId}`).emit('user_stopped_typing', {
        userId: socket.userId,
        chatId
      })
    })

    // Handle real-time message updates
    socket.on('message_sent', (data: { chatId: string; messageId: string }) => {
      // Broadcast to other users in the same chat that a new message was sent
      socket.to(`chat:${data.chatId}`).emit('new_message', {
        chatId: data.chatId,
        messageId: data.messageId,
        fromUser: socket.user
      })
    })

    // Handle content generation status updates
    socket.on('join_page', async (pageId: string) => {
      try {
        // Verify user has access to this page
        const page = await prisma.page.findUnique({
          where: { id: pageId }
        })

        if (!page || page.userId !== socket.userId) {
          socket.emit('error', { message: 'Access denied to page' })
          return
        }

        socket.join(`page:${pageId}`)
        socket.emit('joined_page', { pageId })
        logger.info(`User ${socket.userId} joined page: ${pageId}`)
      } catch (error) {
        logger.error('Error joining page:', error)
        socket.emit('error', { message: 'Failed to join page' })
      }
    })

    socket.on('leave_page', (pageId: string) => {
      socket.leave(`page:${pageId}`)
      socket.emit('left_page', { pageId })
      logger.info(`User ${socket.userId} left page: ${pageId}`)
    })

    // Handle file upload progress
    socket.on('file_upload_progress', (data: { pageId: string; progress: number; fileName: string }) => {
      socket.to(`page:${data.pageId}`).emit('file_upload_update', {
        userId: socket.userId,
        progress: data.progress,
        fileName: data.fileName
      })
    })

    // Handle AI generation progress
    socket.on('ai_generation_progress', (data: { pageId: string; type: string; progress: number }) => {
      socket.to(`page:${data.pageId}`).emit('ai_generation_update', {
        userId: socket.userId,
        type: data.type,
        progress: data.progress
      })
    })

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user?.email} (${socket.userId}) - Reason: ${reason}`)
    })

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error)
    })
  })

  // Helper functions for emitting events from other parts of the application
  const socketHelpers = {
    // Emit to specific user
    emitToUser: (userId: string, event: string, data: any) => {
      io.to(`user:${userId}`).emit(event, data)
    },

    // Emit to all users in a chat
    emitToChat: (chatId: string, event: string, data: any) => {
      io.to(`chat:${chatId}`).emit(event, data)
    },

    // Emit to all users viewing a page
    emitToPage: (pageId: string, event: string, data: any) => {
      io.to(`page:${pageId}`).emit(event, data)
    },

    // Emit AI generation status updates
    emitAIGenerationStatus: (pageId: string, data: {
      type: 'flashcards' | 'study_guide' | 'test'
      status: 'started' | 'progress' | 'completed' | 'failed'
      progress?: number
      result?: any
      error?: string
    }) => {
      io.to(`page:${pageId}`).emit('ai_generation_status', data)
    },

    // Emit file processing status updates
    emitFileProcessingStatus: (pageId: string, data: {
      fileId: string
      fileName: string
      status: 'processing' | 'completed' | 'failed'
      progress?: number
      error?: string
    }) => {
      io.to(`page:${pageId}`).emit('file_processing_status', data)
    },

    // Emit real-time chat message
    emitChatMessage: (chatId: string, message: {
      id: string
      role: 'user' | 'assistant'
      content: string
      timestamp: Date
    }) => {
      io.to(`chat:${chatId}`).emit('chat_message', message)
    }
  }

  // Attach helpers to the io instance for use in other modules
  ;(io as any).helpers = socketHelpers

  return socketHelpers
}

// Export types for use in other modules
export interface SocketHelpers {
  emitToUser: (userId: string, event: string, data: any) => void
  emitToChat: (chatId: string, event: string, data: any) => void
  emitToPage: (pageId: string, event: string, data: any) => void
  emitAIGenerationStatus: (pageId: string, data: any) => void
  emitFileProcessingStatus: (pageId: string, data: any) => void
  emitChatMessage: (chatId: string, message: any) => void
}

export default setupSocketIO 