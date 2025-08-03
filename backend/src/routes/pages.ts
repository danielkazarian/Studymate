import { Router } from 'express'
import { body, query, validationResult } from 'express-validator'
import { randomBytes } from 'crypto'

import { prisma } from '@/config/database'
import { authenticate, authorize, optionalAuth, AuthenticatedRequest } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { APIResponse, PaginatedResponse } from '@/types'
import { logger } from '@/utils/logger'

const router = Router()

// Get all pages for authenticated user
router.get('/', authenticate, [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString(),
  query('status').optional().isIn(['all', 'active', 'completed', 'draft'])
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

  const page = parseInt(req.query.page as string) || 1
  const limit = parseInt(req.query.limit as string) || 10
  const search = req.query.search as string
  const status = req.query.status as string

  const skip = (page - 1) * limit

  // Build where clause
  const where: any = {
    userId: req.user!.id
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } }
    ]
  }

  // Get pages with counts
  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take: limit,
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: {
            files: true,
            flashcards: true,
            studyGuides: true,
            tests: true,
            chatSessions: true
          }
        }
      }
    }),
    prisma.page.count({ where })
  ])

  const response: PaginatedResponse<any> = {
    success: true,
    data: pages.map(page => ({
      id: page.id,
      title: page.title,
      description: page.description,
      isPublic: page.isPublic,
      shareUrl: page.shareUrl,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      counts: {
        files: page._count.files,
        flashcards: page._count.flashcards,
        studyGuides: page._count.studyGuides,
        tests: page._count.tests,
        chatSessions: page._count.chatSessions
      }
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  }

  res.json(response)
}))

// Get a specific page
router.get('/:id', optionalAuth, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.id

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      files: {
        orderBy: { uploadedAt: 'desc' }
      },
      flashcards: {
        orderBy: { createdAt: 'desc' },
        take: 10 // Limit for performance
      },
      studyGuides: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      tests: {
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          questions: {
            orderBy: { order: 'asc' }
          }
        }
      },
      chatSessions: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          messages: {
            orderBy: { timestamp: 'desc' },
            take: 1
          }
        }
      },
      _count: {
        select: {
          files: true,
          flashcards: true,
          studyGuides: true,
          tests: true,
          chatSessions: true
        }
      }
    }
  })

  if (!page) {
    const response: APIResponse = {
      success: false,
      error: 'Page not found'
    }
    return res.status(404).json(response)
  }

  const response: APIResponse = {
    success: true,
    data: {
      ...page,
      isOwner: req.user?.id === page.userId
    }
  }

  res.json(response)
}))

// Create a new page
router.post('/', authenticate, [
  body('title').trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean()
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

  const { title, description, isPublic = false } = req.body

  // Generate share URL if public
  let shareUrl = null
  if (isPublic) {
    shareUrl = randomBytes(16).toString('hex')
  }

  const page = await prisma.page.create({
    data: {
      title,
      description,
      isPublic,
      shareUrl,
      userId: req.user!.id
    },
    include: {
      _count: {
        select: {
          files: true,
          flashcards: true,
          studyGuides: true,
          tests: true,
          chatSessions: true
        }
      }
    }
  })

  logger.info(`Page created: ${page.id} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    data: page,
    message: 'Page created successfully'
  }

  res.status(201).json(response)
}))

// Update a page
router.put('/:id', authenticate, authorize('page'), [
  body('title').optional().trim().notEmpty().isLength({ max: 255 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('isPublic').optional().isBoolean()
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

  const pageId = req.params.id
  const updates = req.body

  // Generate or remove share URL based on isPublic
  if (updates.isPublic !== undefined) {
    if (updates.isPublic) {
      updates.shareUrl = randomBytes(16).toString('hex')
    } else {
      updates.shareUrl = null
    }
  }

  const page = await prisma.page.update({
    where: { id: pageId },
    data: updates,
    include: {
      _count: {
        select: {
          files: true,
          flashcards: true,
          studyGuides: true,
          tests: true,
          chatSessions: true
        }
      }
    }
  })

  logger.info(`Page updated: ${page.id} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    data: page,
    message: 'Page updated successfully'
  }

  res.json(response)
}))

// Delete a page
router.delete('/:id', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.id

  // Delete page and all related data (cascade)
  await prisma.page.delete({
    where: { id: pageId }
  })

  logger.info(`Page deleted: ${pageId} by user ${req.user!.id}`)

  const response: APIResponse = {
    success: true,
    message: 'Page deleted successfully'
  }

  res.json(response)
}))

// Get page by share URL (public access)
router.get('/shared/:shareUrl', asyncHandler(async (req, res) => {
  const shareUrl = req.params.shareUrl

  const page = await prisma.page.findUnique({
    where: { 
      shareUrl,
      isPublic: true 
    },
    include: {
      files: {
        orderBy: { uploadedAt: 'desc' }
      },
      flashcards: {
        orderBy: { createdAt: 'desc' }
      },
      studyGuides: {
        orderBy: { createdAt: 'desc' }
      },
      tests: {
        orderBy: { createdAt: 'desc' },
        include: {
          questions: {
            orderBy: { order: 'asc' }
          }
        }
      }
    }
  })

  if (!page) {
    const response: APIResponse = {
      success: false,
      error: 'Shared page not found'
    }
    return res.status(404).json(response)
  }

  const response: APIResponse = {
    success: true,
    data: {
      ...page,
      isOwner: false
    }
  }

  res.json(response)
}))

export default router 