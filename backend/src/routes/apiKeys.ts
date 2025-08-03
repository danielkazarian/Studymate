import { Router } from 'express'
import { body, validationResult } from 'express-validator'

import { prisma } from '@/config/database'
import { authenticate, AuthenticatedRequest } from '@/middleware/auth'
import { asyncHandler } from '@/middleware/error'
import { APIResponse } from '@/types'
import { logger } from '@/utils/logger'
import { encryption } from '@/utils/encryption'

const router = Router()

// Get all API keys for the authenticated user
router.get('/', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const apiKeys = await prisma.aPIKey.findMany({
    where: { userId: req.user!.id },
    select: {
      id: true,
      provider: true,
      name: true,
      createdAt: true,
      lastUsed: true
      // Note: encryptedKey is not included for security
    },
    orderBy: { createdAt: 'desc' }
  })

  const response: APIResponse = {
    success: true,
    data: apiKeys
  }

  res.json(response)
}))

// Add a new API key
router.post('/', authenticate, [
  body('provider').isIn(['openai', 'anthropic', 'google']),
  body('apiKey').trim().notEmpty().isLength({ min: 10 }),
  body('name').trim().notEmpty().isLength({ max: 100 })
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

  const { provider, apiKey, name } = req.body

  try {
    // Check if user already has an API key for this provider
    const existingKey = await prisma.aPIKey.findFirst({
      where: {
        userId: req.user!.id,
        provider
      }
    })

    if (existingKey) {
      const response: APIResponse = {
        success: false,
        error: `API key for ${provider} already exists. Please update or delete the existing key first.`
      }
      return res.status(400).json(response)
    }

    // Validate API key format based on provider
    const validationResult = validateApiKeyFormat(provider, apiKey)
    if (!validationResult.valid) {
      const response: APIResponse = {
        success: false,
        error: validationResult.error
      }
      return res.status(400).json(response)
    }

    // Encrypt the API key
    const encryptedKey = encryption.encrypt(apiKey)

    // Save to database
    const savedApiKey = await prisma.aPIKey.create({
      data: {
        userId: req.user!.id,
        provider,
        encryptedKey,
        name
      },
      select: {
        id: true,
        provider: true,
        name: true,
        createdAt: true,
        lastUsed: true
      }
    })

    logger.info(`API key added for provider ${provider} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: savedApiKey,
      message: `${provider} API key added successfully`
    }

    res.status(201).json(response)
  } catch (error) {
    logger.error('API key creation failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to save API key'
    }
    res.status(500).json(response)
  }
}))

// Update an existing API key
router.put('/:id', authenticate, [
  body('apiKey').optional().trim().notEmpty().isLength({ min: 10 }),
  body('name').optional().trim().notEmpty().isLength({ max: 100 })
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

  const keyId = req.params.id
  const { apiKey, name } = req.body

  try {
    // Find the API key
    const existingKey = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId: req.user!.id
      }
    })

    if (!existingKey) {
      const response: APIResponse = {
        success: false,
        error: 'API key not found'
      }
      return res.status(404).json(response)
    }

    const updateData: any = {}

    // Update name if provided
    if (name) {
      updateData.name = name
    }

    // Update API key if provided
    if (apiKey) {
      // Validate API key format
      const validationResult = validateApiKeyFormat(existingKey.provider, apiKey)
      if (!validationResult.valid) {
        const response: APIResponse = {
          success: false,
          error: validationResult.error
        }
        return res.status(400).json(response)
      }

      updateData.encryptedKey = encryption.encrypt(apiKey)
    }

    // Update the API key
    const updatedApiKey = await prisma.aPIKey.update({
      where: { id: keyId },
      data: updateData,
      select: {
        id: true,
        provider: true,
        name: true,
        createdAt: true,
        lastUsed: true
      }
    })

    logger.info(`API key updated: ${keyId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      data: updatedApiKey,
      message: 'API key updated successfully'
    }

    res.json(response)
  } catch (error) {
    logger.error('API key update failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to update API key'
    }
    res.status(500).json(response)
  }
}))

// Delete an API key
router.delete('/:id', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const keyId = req.params.id

  try {
    // Check if the API key exists and belongs to the user
    const existingKey = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId: req.user!.id
      }
    })

    if (!existingKey) {
      const response: APIResponse = {
        success: false,
        error: 'API key not found'
      }
      return res.status(404).json(response)
    }

    // Delete the API key
    await prisma.aPIKey.delete({
      where: { id: keyId }
    })

    logger.info(`API key deleted: ${keyId} by user ${req.user!.id}`)

    const response: APIResponse = {
      success: true,
      message: 'API key deleted successfully'
    }

    res.json(response)
  } catch (error) {
    logger.error('API key deletion failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to delete API key'
    }
    res.status(500).json(response)
  }
}))

// Test an API key (verify it works with the provider)
router.post('/:id/test', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const keyId = req.params.id

  try {
    // Find the API key
    const apiKeyRecord = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId: req.user!.id
      }
    })

    if (!apiKeyRecord) {
      const response: APIResponse = {
        success: false,
        error: 'API key not found'
      }
      return res.status(404).json(response)
    }

    // Decrypt the API key
    const apiKey = encryption.decrypt(apiKeyRecord.encryptedKey)

    // Test the API key based on provider
    const testResult = await testApiKey(apiKeyRecord.provider, apiKey)

    // Update last used timestamp if test is successful
    if (testResult.valid) {
      await prisma.aPIKey.update({
        where: { id: keyId },
        data: { lastUsed: new Date() }
      })
    }

    const response: APIResponse = {
      success: testResult.valid,
      data: {
        provider: apiKeyRecord.provider,
        valid: testResult.valid,
        error: testResult.error
      },
      message: testResult.valid ? 'API key is valid' : 'API key test failed'
    }

    res.json(response)
  } catch (error) {
    logger.error('API key test failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to test API key'
    }
    res.status(500).json(response)
  }
}))

// Get masked API key (show only last 4 characters)
router.get('/:id/preview', authenticate, asyncHandler(async (req: AuthenticatedRequest, res) => {
  const keyId = req.params.id

  try {
    const apiKeyRecord = await prisma.aPIKey.findFirst({
      where: {
        id: keyId,
        userId: req.user!.id
      }
    })

    if (!apiKeyRecord) {
      const response: APIResponse = {
        success: false,
        error: 'API key not found'
      }
      return res.status(404).json(response)
    }

    // Decrypt and mask the API key
    const apiKey = encryption.decrypt(apiKeyRecord.encryptedKey)
    const maskedKey = maskApiKey(apiKey)

    const response: APIResponse = {
      success: true,
      data: {
        id: apiKeyRecord.id,
        provider: apiKeyRecord.provider,
        name: apiKeyRecord.name,
        maskedKey,
        createdAt: apiKeyRecord.createdAt,
        lastUsed: apiKeyRecord.lastUsed
      }
    }

    res.json(response)
  } catch (error) {
    logger.error('API key preview failed:', error)
    
    const response: APIResponse = {
      success: false,
      error: 'Failed to get API key preview'
    }
    res.status(500).json(response)
  }
}))

// Helper functions
function validateApiKeyFormat(provider: string, apiKey: string): { valid: boolean; error?: string } {
  switch (provider) {
    case 'openai':
      if (!apiKey.startsWith('sk-')) {
        return { valid: false, error: 'OpenAI API keys must start with "sk-"' }
      }
      if (apiKey.length < 20) {
        return { valid: false, error: 'OpenAI API key is too short' }
      }
      break
    
    case 'anthropic':
      if (!apiKey.startsWith('sk-ant-')) {
        return { valid: false, error: 'Anthropic API keys must start with "sk-ant-"' }
      }
      break
    
    case 'google':
      if (apiKey.length < 20) {
        return { valid: false, error: 'Google AI API key is too short' }
      }
      break
    
    default:
      return { valid: false, error: 'Unsupported provider' }
  }

  return { valid: true }
}

function maskApiKey(apiKey: string): string {
  if (apiKey.length <= 8) {
    return '*'.repeat(apiKey.length)
  }
  
  const visibleChars = 4
  const maskedLength = apiKey.length - visibleChars
  return '*'.repeat(maskedLength) + apiKey.slice(-visibleChars)
}

async function testApiKey(provider: string, apiKey: string): Promise<{ valid: boolean; error?: string }> {
  // TODO: Implement actual API testing for each provider
  // For now, just validate format
  const formatResult = validateApiKeyFormat(provider, apiKey)
  
  if (!formatResult.valid) {
    return formatResult
  }

  // In a real implementation, make a simple API call to test the key
  return { valid: true }
}

export default router 