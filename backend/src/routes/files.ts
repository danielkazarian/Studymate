import { Router } from 'express'
import multer from 'multer'
import { S3 } from 'aws-sdk'
import { randomBytes } from 'crypto'
import path from 'path'

import { prisma } from '@/config/database'
import { authenticate, authorize, AuthenticatedRequest } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { APIResponse } from '@/types'
import { logger } from '@/utils/logger'
import { FileProcessingService } from '@/services/fileProcessing'

const router = Router()

// Configure AWS S3
const s3 = new S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
})

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB default
  },
  fileFilter: (req, file, cb) => {
    // Allowed file types
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain',
      'text/markdown',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Unsupported file type'), false)
    }
  }
})

// Upload files to a page
router.post('/upload/:pageId', authenticate, authorize('page'), upload.array('files', 10), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId
  const files = req.files as Express.Multer.File[]

  if (!files || files.length === 0) {
    const response: APIResponse = {
      success: false,
      error: 'No files provided'
    }
    return res.status(400).json(response)
  }

  // Check page file limit
  const existingFilesCount = await prisma.file.count({
    where: { pageId }
  })

  const maxFilesPerPage = parseInt(process.env.MAX_FILES_PER_PAGE || '50')
  if (existingFilesCount + files.length > maxFilesPerPage) {
    const response: APIResponse = {
      success: false,
      error: `Maximum ${maxFilesPerPage} files allowed per page`
    }
    return res.status(400).json(response)
  }

  const uploadedFiles = []

  try {
    for (const file of files) {
      // Generate unique filename
      const fileExtension = path.extname(file.originalname)
      const uniqueFilename = `${randomBytes(16).toString('hex')}${fileExtension}`
      const s3Key = `files/${req.user!.id}/${pageId}/${uniqueFilename}`

      // Upload to S3
      const uploadParams = {
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: s3Key,
        Body: file.buffer,
        ContentType: file.mimetype,
        Metadata: {
          originalName: file.originalname,
          userId: req.user!.id,
          pageId: pageId
        }
      }

      const s3Result = await s3.upload(uploadParams).promise()

      // Save file metadata to database
      const fileRecord = await prisma.file.create({
        data: {
          pageId,
          filename: uniqueFilename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          s3Key: s3Key
        }
      })

      uploadedFiles.push({
        id: fileRecord.id,
        filename: fileRecord.filename,
        originalName: fileRecord.originalName,
        mimeType: fileRecord.mimeType,
        size: fileRecord.size,
        url: s3Result.Location,
        uploadedAt: fileRecord.uploadedAt
      })

      // Queue file processing for text extraction
      await FileProcessingService.queueFileProcessing(fileRecord.id)
    }

    logger.info(`${files.length} files uploaded to page ${pageId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: uploadedFiles,
      message: `${files.length} file(s) uploaded successfully`
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('File upload error:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'File upload failed'
    }
    res.status(500).json(response)
  }
}))

// Get files for a page
router.get('/page/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId

  const files = await prisma.file.findMany({
    where: { pageId },
    orderBy: { uploadedAt: 'desc' }
  })

  // Generate signed URLs for file access
  const filesWithUrls = await Promise.all(files.map(async (file) => {
    const signedUrl = await s3.getSignedUrlPromise('getObject', {
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.s3Key,
      Expires: 3600 // 1 hour
    })

    return {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      url: signedUrl,
      uploadedAt: file.uploadedAt
    }
  }))

  const response: APIResponse = {
    success: true,
    data: filesWithUrls
  }

  res.json(response)
}))

// Get a specific file
router.get('/:id', authenticate, authorize('file'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const fileId = req.params.id

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    const response: APIResponse = {
      success: false,
      error: 'File not found'
    }
    return res.status(404).json(response)
  }

  // Generate signed URL
  const signedUrl = await s3.getSignedUrlPromise('getObject', {
    Bucket: process.env.AWS_S3_BUCKET!,
    Key: file.s3Key,
    Expires: 3600
  })

  const response: APIResponse = {
    success: true,
    data: {
      id: file.id,
      filename: file.filename,
      originalName: file.originalName,
      mimeType: file.mimeType,
      size: file.size,
      url: signedUrl,
      uploadedAt: file.uploadedAt
    }
  }

  res.json(response)
}))

// Download file content (for AI processing)
router.get('/:id/content', authenticate, authorize('file'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const fileId = req.params.id

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    const response: APIResponse = {
      success: false,
      error: 'File not found'
    }
    return res.status(404).json(response)
  }

  try {
    // Get file content from S3
    const s3Object = await s3.getObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.s3Key
    }).promise()

    // Process file content based on type
    const content = await FileProcessingService.extractText(file, s3Object.Body as Buffer)

    const response: APIResponse = {
      success: true,
      data: {
        id: file.id,
        originalName: file.originalName,
        mimeType: file.mimeType,
        content: content.text,
        metadata: content.metadata
      }
    }

    res.json(response)
  } catch (error) {
    logger.error('File content extraction error:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to extract file content'
    }
    res.status(500).json(response)
  }
}))

// Delete a file
router.delete('/:id', authenticate, authorize('file'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const fileId = req.params.id

  const file = await prisma.file.findUnique({
    where: { id: fileId }
  })

  if (!file) {
    const response: APIResponse = {
      success: false,
      error: 'File not found'
    }
    return res.status(404).json(response)
  }

  try {
    // Delete from S3
    await s3.deleteObject({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: file.s3Key
    }).promise()

    // Delete from database
    await prisma.file.delete({
      where: { id: fileId }
    })

    logger.info(`File deleted: ${fileId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      message: 'File deleted successfully'
    }

    res.json(response)
  } catch (error) {
    logger.error('File deletion error:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to delete file'
    }
    res.status(500).json(response)
  }
}))

// Bulk delete files
router.delete('/bulk/:pageId', authenticate, authorize('page'), asyncHandler(async (req: AuthenticatedRequest, res) => {
  const pageId = req.params.pageId
  const { fileIds } = req.body

  if (!Array.isArray(fileIds) || fileIds.length === 0) {
    const response: APIResponse = {
      success: false,
      error: 'File IDs array required'
    }
    return res.status(400).json(response)
  }

  const files = await prisma.file.findMany({
    where: {
      id: { in: fileIds },
      pageId: pageId
    }
  })

  if (files.length === 0) {
    const response: APIResponse = {
      success: false,
      error: 'No files found'
    }
    return res.status(404).json(response)
  }

  try {
    // Delete from S3
    const deleteParams = {
      Bucket: process.env.AWS_S3_BUCKET!,
      Delete: {
        Objects: files.map(file => ({ Key: file.s3Key }))
      }
    }

    await s3.deleteObjects(deleteParams).promise()

    // Delete from database
    await prisma.file.deleteMany({
      where: { id: { in: fileIds } }
    })

    logger.info(`${files.length} files deleted from page ${pageId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      message: `${files.length} file(s) deleted successfully`
    }

    res.json(response)
  } catch (error) {
    logger.error('Bulk file deletion error:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to delete files'
    }
    res.status(500).json(response)
  }
}))

export default router 