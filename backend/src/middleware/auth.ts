import { Request, Response, NextFunction } from 'express'
import { AuthService } from '@/utils/auth'
import { prisma } from '@/config/database'
import { logger } from '@/utils/logger'
import { APIResponse } from '@/types'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    email: string
    name: string
    googleId?: string
  }
}

/**
 * Middleware to authenticate JWT tokens
 */
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = AuthService.extractTokenFromHeader(authHeader)

    if (!token) {
      const response: APIResponse = {
        success: false,
        error: 'No token provided'
      }
      res.status(401).json(response)
      return
    }

    // Verify the token
    const decoded = AuthService.verifyAccessToken(token)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: {
        id: true,
        email: true,
        name: true,
        googleId: true,
      }
    })

    if (!user) {
      const response: APIResponse = {
        success: false,
        error: 'User not found'
      }
      res.status(401).json(response)
      return
    }

    // Attach user to request
    req.user = user
    next()
  } catch (error) {
    logger.error('Authentication error:', error)
    
    const response: APIResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Authentication failed'
    }
    res.status(401).json(response)
  }
}

/**
 * Middleware to check if user owns a resource
 */
export const authorize = (resourceType: 'page' | 'file' | 'chat' | 'apiKey') => {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        const response: APIResponse = {
          success: false,
          error: 'Authentication required'
        }
        res.status(401).json(response)
        return
      }

      const resourceId = req.params.id || req.params.pageId || req.params.chatId || req.params.keyId
      
      if (!resourceId) {
        const response: APIResponse = {
          success: false,
          error: 'Resource ID required'
        }
        res.status(400).json(response)
        return
      }

      let resource = null

      switch (resourceType) {
        case 'page':
          resource = await prisma.page.findUnique({
            where: { id: resourceId },
            select: { userId: true, isPublic: true }
          })
          break
        case 'file':
          resource = await prisma.file.findUnique({
            where: { id: resourceId },
            include: { page: { select: { userId: true, isPublic: true } } }
          })
          break
        case 'chat':
          resource = await prisma.chatSession.findUnique({
            where: { id: resourceId },
            include: { page: { select: { userId: true, isPublic: true } } }
          })
          break
        case 'apiKey':
          resource = await prisma.aPIKey.findUnique({
            where: { id: resourceId },
            select: { userId: true }
          })
          break
      }

      if (!resource) {
        const response: APIResponse = {
          success: false,
          error: 'Resource not found'
        }
        res.status(404).json(response)
        return
      }

      // Check ownership or public access
      const userId = resourceType === 'page' || resourceType === 'apiKey' 
        ? resource.userId 
        : (resource as any).page.userId

      const isPublic = resourceType === 'page' 
        ? resource.isPublic 
        : resourceType === 'apiKey' 
          ? false 
          : (resource as any).page.isPublic

      if (userId !== req.user.id && !isPublic) {
        const response: APIResponse = {
          success: false,
          error: 'Access denied'
        }
        res.status(403).json(response)
        return
      }

      next()
    } catch (error) {
      logger.error('Authorization error:', error)
      
      const response: APIResponse = {
        success: false,
        error: 'Authorization failed'
      }
      res.status(500).json(response)
    }
  }
}

/**
 * Optional authentication middleware for public resources
 */
export const optionalAuth = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization
    const token = AuthService.extractTokenFromHeader(authHeader)

    if (token) {
      try {
        const decoded = AuthService.verifyAccessToken(token)
        const user = await prisma.user.findUnique({
          where: { id: decoded.sub },
          select: {
            id: true,
            email: true,
            name: true,
            googleId: true,
          }
        })

        if (user) {
          req.user = user
        }
      } catch (error) {
        // Token is invalid but we don't fail the request
        logger.warn('Invalid token in optional auth:', error)
      }
    }

    next()
  } catch (error) {
    logger.error('Optional authentication error:', error)
    next()
  }
}

export default { authenticate, authorize, optionalAuth } 