import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'

import { prisma } from '@/config/database'
import { authenticate, AuthenticatedRequest } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { APIResponse } from '@/types'
import { logger } from '@/utils/logger'

const router = Router()

// Get current user profile
router.get('/profile', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          pages: true,
          apiKeys: true
        }
      }
    }
  })

  if (!user) {
    const response: APIResponse = {
      success: false,
      error: 'User not found'
    }
    return res.status(404).json(response)
  }

  const response: APIResponse = {
    success: true,
    data: {
      ...user,
      hasPassword: !!await prisma.user.findUnique({
        where: { id: req.user!.id },
        select: { passwordHash: true }
      })?.passwordHash
    }
  }

  res.json(response)
}))

// Update user profile
router.put('/profile', authenticate, [
  body('name').optional().trim().notEmpty().isLength({ max: 255 }),
  body('email').optional().isEmail().normalizeEmail()
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

  const { name, email } = req.body
  const updateData: any = {}

  if (name) updateData.name = name
  if (email) {
    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email,
        NOT: { id: req.user!.id }
      }
    })

    if (existingUser) {
      const response: APIResponse = {
        success: false,
        error: 'Email already taken by another user'
      }
      return res.status(400).json(response)
    }

    updateData.email = email
  }

  const updatedUser = await prisma.user.update({
    where: { id: req.user!.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      googleId: true,
      createdAt: true,
      updatedAt: true
    }
  })

  logger.info(`User profile updated: ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    data: updatedUser,
    message: 'Profile updated successfully'
  }

  res.json(response)
}))

// Change password
router.put('/password', authenticate, [
  body('currentPassword').optional().notEmpty(),
  body('newPassword').isLength({ min: 6 }),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error('Password confirmation does not match')
    }
    return true
  })
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

  const { currentPassword, newPassword } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { passwordHash: true, googleId: true }
  })

  if (!user) {
    const response: APIResponse = {
      success: false,
      error: 'User not found'
    }
    return res.status(404).json(response)
  }

  // If user has a password, verify current password
  if (user.passwordHash) {
    if (!currentPassword) {
      const response: APIResponse = {
        success: false,
        error: 'Current password is required'
      }
      return res.status(400).json(response)
    }

    const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      const response: APIResponse = {
        success: false,
        error: 'Current password is incorrect'
      }
      return res.status(400).json(response)
    }
  }

  // Hash new password
  const saltRounds = 12
  const newPasswordHash = await bcrypt.hash(newPassword, saltRounds)

  // Update password
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { passwordHash: newPasswordHash }
  })

  logger.info(`Password changed for user: ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    message: 'Password updated successfully'
  }

  res.json(response)
}))

// Link Google account
router.post('/link-google', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  // This would typically be handled through OAuth flow
  // For now, just return a placeholder response
  const response: APIResponse = {
    success: false,
    error: 'Google account linking must be done through OAuth flow'
  }

  res.status(400).json(response)
}))

// Unlink Google account
router.delete('/unlink-google', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { passwordHash: true, googleId: true }
  })

  if (!user?.googleId) {
    const response: APIResponse = {
      success: false,
      error: 'No Google account linked'
    }
    return res.status(400).json(response)
  }

  // Don't allow unlinking if user has no password
  if (!user.passwordHash) {
    const response: APIResponse = {
      success: false,
      error: 'Cannot unlink Google account without setting a password first'
    }
    return res.status(400).json(response)
  }

  // Unlink Google account
  await prisma.user.update({
    where: { id: req.user!.id },
    data: { googleId: null }
  })

  logger.info(`Google account unlinked for user: ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    message: 'Google account unlinked successfully'
  }

  res.json(response)
}))

// Delete user account
router.delete('/account', authenticate, [
  body('password').optional().notEmpty(),
  body('confirmDeletion').equals('DELETE').withMessage('Must confirm deletion by typing "DELETE"')
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

  const { password } = req.body

  const user = await prisma.user.findUnique({
    where: { id: req.user!.id },
    select: { passwordHash: true }
  })

  if (!user) {
    const response: APIResponse = {
      success: false,
      error: 'User not found'
    }
    return res.status(404).json(response)
  }

  // Verify password if user has one
  if (user.passwordHash) {
    if (!password) {
      const response: APIResponse = {
        success: false,
        error: 'Password is required to delete account'
      }
      return res.status(400).json(response)
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash)
    if (!isValidPassword) {
      const response: APIResponse = {
        success: false,
        error: 'Password is incorrect'
      }
      return res.status(400).json(response)
    }
  }

  // Delete user account (this will cascade delete all related data)
  await prisma.user.delete({
    where: { id: req.user!.id }
  })

  logger.info(`User account deleted: ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    message: 'Account deleted successfully'
  }

  res.json(response)
}))

// Get user statistics
router.get('/stats', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.id

  const [
    pageCount,
    fileCount,
    flashcardCount,
    studyGuideCount,
    testCount,
    chatSessionCount,
    apiKeyCount
  ] = await Promise.all([
    prisma.page.count({ where: { userId } }),
    prisma.file.count({
      where: { page: { userId } }
    }),
    prisma.flashcard.count({
      where: { page: { userId } }
    }),
    prisma.studyGuide.count({
      where: { page: { userId } }
    }),
    prisma.test.count({
      where: { page: { userId } }
    }),
    prisma.chatSession.count({
      where: { page: { userId } }
    }),
    prisma.aPIKey.count({ where: { userId } })
  ])

  // Get recent activity
  const recentPages = await prisma.page.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    take: 5,
    select: {
      id: true,
      title: true,
      updatedAt: true
    }
  })

  const response: APIResponse = {
    success: true,
    data: {
      counts: {
        pages: pageCount,
        files: fileCount,
        flashcards: flashcardCount,
        studyGuides: studyGuideCount,
        tests: testCount,
        chatSessions: chatSessionCount,
        apiKeys: apiKeyCount
      },
      recentActivity: recentPages
    }
  }

  res.json(response)
}))

export default router 