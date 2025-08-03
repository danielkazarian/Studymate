import pdf from 'pdf-parse'
import sharp from 'sharp'
import { File } from '@prisma/client'
import { logger } from '@/utils/logger'
import { FileProcessingResult } from '@/types'

export class FileProcessingService {
  /**
   * Extract text content from a file buffer
   */
  static async extractText(file: File, buffer: Buffer): Promise<FileProcessingResult> {
    try {
      switch (file.mimeType) {
        case 'application/pdf':
          return await this.extractFromPDF(buffer)
        
        case 'image/jpeg':
        case 'image/png':
        case 'image/gif':
          return await this.extractFromImage(buffer)
        
        case 'text/plain':
        case 'text/markdown':
          return await this.extractFromText(buffer)
        
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractFromDocument(buffer)
        
        default:
          throw new Error(`Unsupported file type: ${file.mimeType}`)
      }
    } catch (error) {
      logger.error('Text extraction failed:', error)
      throw new Error(`Failed to extract text from ${file.originalName}`)
    }
  }

  /**
   * Extract text from PDF files
   */
  private static async extractFromPDF(buffer: Buffer): Promise<FileProcessingResult> {
    const data = await pdf(buffer)
    
    return {
      text: data.text,
      metadata: {
        title: data.info?.Title,
        author: data.info?.Author,
        subject: data.info?.Subject,
        pages: data.numpages
      }
    }
  }

  /**
   * Extract text from images using OCR
   * Note: This is a placeholder. In production, you'd integrate with AWS Textract or Google Vision API
   */
  private static async extractFromImage(buffer: Buffer): Promise<FileProcessingResult> {
    // For now, return empty text - in production, implement OCR
    logger.warn('OCR not implemented yet - returning empty text for image')
    
    const image = sharp(buffer)
    const metadata = await image.metadata()
    
    return {
      text: '', // TODO: Implement OCR with AWS Textract or Google Vision
      metadata: {
        width: metadata.width,
        height: metadata.height,
        format: metadata.format
      }
    }
  }

  /**
   * Extract text from plain text files
   */
  private static async extractFromText(buffer: Buffer): Promise<FileProcessingResult> {
    const text = buffer.toString('utf-8')
    
    return {
      text,
      metadata: {
        length: text.length,
        lines: text.split('\n').length
      }
    }
  }

  /**
   * Extract text from Word documents
   * Note: This is a placeholder. In production, you'd use a library like mammoth.js
   */
  private static async extractFromDocument(buffer: Buffer): Promise<FileProcessingResult> {
    // TODO: Implement document text extraction with mammoth.js or similar
    logger.warn('Document text extraction not implemented yet')
    
    return {
      text: '',
      metadata: {
        size: buffer.length
      }
    }
  }

  /**
   * Queue file processing job
   */
  static async queueFileProcessing(fileId: string): Promise<void> {
    // TODO: Implement with Bull Queue
    logger.info(`Queued file processing for file: ${fileId}`)
  }

  /**
   * Process file and store extracted text
   */
  static async processFile(fileId: string): Promise<void> {
    // TODO: Implement file processing job
    logger.info(`Processing file: ${fileId}`)
  }

  /**
   * Validate file type and size
   */
  static validateFile(file: Express.Multer.File): { valid: boolean; error?: string } {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE || '10485760') // 10MB
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

    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`
      }
    }

    if (!allowedTypes.includes(file.mimetype)) {
      return {
        valid: false,
        error: `File type ${file.mimetype} is not supported`
      }
    }

    return { valid: true }
  }

  /**
   * Get file content summary
   */
  static generateContentSummary(text: string): string {
    const maxLength = 200
    if (text.length <= maxLength) return text
    
    return text.substring(0, maxLength) + '...'
  }

  /**
   * Extract keywords from text content
   */
  static extractKeywords(text: string): string[] {
    // Simple keyword extraction - in production, use NLP libraries
    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    // Count word frequency
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    
    // Return top 10 most frequent words
    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word)
  }
}

export default FileProcessingService 