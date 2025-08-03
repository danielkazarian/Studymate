import { Request, Response, NextFunction } from 'express'
import { logger } from '@/utils/logger'
import { APIResponse } from '@/types'

export interface ErrorWithStatus extends Error {
  status?: number
  statusCode?: number
}

/**
 * Not Found middleware - handles 404 errors
 */
export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Not Found - ${req.originalUrl}`) as ErrorWithStatus
  error.status = 404
  next(error)
}

/**
 * Global error handler middleware
 */
export const errorHandler = (
  error: ErrorWithStatus,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const statusCode = error.status || error.statusCode || 500

  // Log error details
  logger.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    statusCode
  })

  // Prepare error response
  const response: APIResponse = {
    success: false,
    error: error.message || 'Internal Server Error'
  }

  // Add stack trace in development
  if (process.env.NODE_ENV === 'development') {
    (response as any).stack = error.stack
  }

  // Handle specific error types
  if (error.name === 'ValidationError') {
    response.error = 'Validation failed'
    res.status(400).json(response)
    return
  }

  if (error.name === 'UnauthorizedError') {
    response.error = 'Unauthorized access'
    res.status(401).json(response)
    return
  }

  if (error.name === 'CastError') {
    response.error = 'Invalid ID format'
    res.status(400).json(response)
    return
  }

  if (error.name === 'JsonWebTokenError') {
    response.error = 'Invalid token'
    res.status(401).json(response)
    return
  }

  if (error.name === 'TokenExpiredError') {
    response.error = 'Token expired'
    res.status(401).json(response)
    return
  }

  // Default error response
  res.status(statusCode).json(response)
}

/**
 * Async error wrapper - catches async errors and passes them to error handler
 */
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

export default { notFound, errorHandler, asyncHandler } 