import OpenAI from 'openai'
import { 
  AIProvider, 
  ContentGenerationOptions, 
  FlashcardGenerationResult, 
  StudyGuideGenerationResult, 
  TestGenerationResult,
  ChatCompletionOptions,
  ChatCompletionResult 
} from '@/types'
import { logger } from '@/utils/logger'
import { encryption } from '@/utils/encryption'
import { prisma } from '@/config/database'

export class AIService {
  /**
   * Get user's API key for a specific provider
   */
  private static async getUserApiKey(userId: string, provider: string): Promise<string | null> {
    const apiKey = await prisma.aPIKey.findFirst({
      where: {
        userId,
        provider
      }
    })

    if (!apiKey) return null

    try {
      return encryption.decrypt(apiKey.encryptedKey)
    } catch (error) {
      logger.error('Failed to decrypt API key:', error)
      return null
    }
  }

  /**
   * Create OpenAI client instance
   */
  private static createOpenAIClient(apiKey: string): OpenAI {
    return new OpenAI({
      apiKey: apiKey
    })
  }

  /**
   * Generate flashcards from content
   */
  static async generateFlashcards(
    userId: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<FlashcardGenerationResult[]> {
    const apiKey = await this.getUserApiKey(userId, options.provider.name)
    if (!apiKey) {
      throw new Error(`No API key found for ${options.provider.name}`)
    }

    try {
      switch (options.provider.name) {
        case 'openai':
          return await this.generateFlashcardsOpenAI(apiKey, content, options)
        case 'anthropic':
          return await this.generateFlashcardsAnthropic(apiKey, content, options)
        case 'google':
          return await this.generateFlashcardsGoogle(apiKey, content, options)
        default:
          throw new Error(`Unsupported provider: ${options.provider.name}`)
      }
    } catch (error) {
      logger.error('Flashcard generation failed:', error)
      throw new Error('Failed to generate flashcards')
    }
  }

  /**
   * Generate study guide from content
   */
  static async generateStudyGuide(
    userId: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<StudyGuideGenerationResult> {
    const apiKey = await this.getUserApiKey(userId, options.provider.name)
    if (!apiKey) {
      throw new Error(`No API key found for ${options.provider.name}`)
    }

    try {
      switch (options.provider.name) {
        case 'openai':
          return await this.generateStudyGuideOpenAI(apiKey, content, options)
        case 'anthropic':
          return await this.generateStudyGuideAnthropic(apiKey, content, options)
        case 'google':
          return await this.generateStudyGuideGoogle(apiKey, content, options)
        default:
          throw new Error(`Unsupported provider: ${options.provider.name}`)
      }
    } catch (error) {
      logger.error('Study guide generation failed:', error)
      throw new Error('Failed to generate study guide')
    }
  }

  /**
   * Generate test from content
   */
  static async generateTest(
    userId: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<TestGenerationResult> {
    const apiKey = await this.getUserApiKey(userId, options.provider.name)
    if (!apiKey) {
      throw new Error(`No API key found for ${options.provider.name}`)
    }

    try {
      switch (options.provider.name) {
        case 'openai':
          return await this.generateTestOpenAI(apiKey, content, options)
        case 'anthropic':
          return await this.generateTestAnthropic(apiKey, content, options)
        case 'google':
          return await this.generateTestGoogle(apiKey, content, options)
        default:
          throw new Error(`Unsupported provider: ${options.provider.name}`)
      }
    } catch (error) {
      logger.error('Test generation failed:', error)
      throw new Error('Failed to generate test')
    }
  }

  /**
   * Chat completion
   */
  static async chatCompletion(
    userId: string,
    messages: any[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    const apiKey = await this.getUserApiKey(userId, options.provider.name)
    if (!apiKey) {
      throw new Error(`No API key found for ${options.provider.name}`)
    }

    try {
      switch (options.provider.name) {
        case 'openai':
          return await this.chatCompletionOpenAI(apiKey, messages, options)
        case 'anthropic':
          return await this.chatCompletionAnthropic(apiKey, messages, options)
        case 'google':
          return await this.chatCompletionGoogle(apiKey, messages, options)
        default:
          throw new Error(`Unsupported provider: ${options.provider.name}`)
      }
    } catch (error) {
      logger.error('Chat completion failed:', error)
      throw new Error('Chat completion failed')
    }
  }

  // OpenAI Implementation Methods
  private static async generateFlashcardsOpenAI(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<FlashcardGenerationResult[]> {
    const client = this.createOpenAIClient(apiKey)
    
    const prompt = `Generate ${options.count || 10} flashcards from the following content. Each flashcard should have a front (question) and back (answer). Format as JSON array with objects containing "front", "back", "difficulty", and "tags" fields.

Content:
${content}

Difficulty level: ${options.difficulty || 'medium'}
Focus areas: ${options.focusAreas?.join(', ') || 'general'}

Return only the JSON array, no additional text.`

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    try {
      return JSON.parse(result)
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', result)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  private static async generateStudyGuideOpenAI(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<StudyGuideGenerationResult> {
    const client = this.createOpenAIClient(apiKey)
    
    const prompt = `Create a comprehensive study guide from the following content. Include a title, overview, and organized sections. Format as JSON with "title", "content", and "sections" fields.

Content:
${content}

Difficulty level: ${options.difficulty || 'medium'}
Focus areas: ${options.focusAreas?.join(', ') || 'general'}

Return only the JSON object, no additional text.`

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    try {
      return JSON.parse(result)
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', result)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  private static async generateTestOpenAI(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<TestGenerationResult> {
    const client = this.createOpenAIClient(apiKey)
    
    const prompt = `Generate a test with ${options.count || 10} questions from the following content. Include multiple choice, short answer, and essay questions. Format as JSON with "title" and "questions" array.

Content:
${content}

Difficulty level: ${options.difficulty || 'medium'}
Focus areas: ${options.focusAreas?.join(', ') || 'general'}

Each question should have: type, prompt, options (for multiple choice), correctAnswer, and points.

Return only the JSON object, no additional text.`

    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    try {
      return JSON.parse(result)
    } catch (error) {
      logger.error('Failed to parse OpenAI response:', result)
      throw new Error('Invalid response format from OpenAI')
    }
  }

  private static async chatCompletionOpenAI(
    apiKey: string,
    messages: any[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    const client = this.createOpenAIClient(apiKey)
    
    const response = await client.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000
    })

    const result = response.choices[0]?.message?.content
    if (!result) throw new Error('No response from OpenAI')

    return {
      content: result,
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      }
    }
  }

  // Placeholder methods for Anthropic and Google
  private static async generateFlashcardsAnthropic(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<FlashcardGenerationResult[]> {
    // TODO: Implement Anthropic Claude API
    throw new Error('Anthropic integration not implemented yet')
  }

  private static async generateStudyGuideAnthropic(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<StudyGuideGenerationResult> {
    // TODO: Implement Anthropic Claude API
    throw new Error('Anthropic integration not implemented yet')
  }

  private static async generateTestAnthropic(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<TestGenerationResult> {
    // TODO: Implement Anthropic Claude API
    throw new Error('Anthropic integration not implemented yet')
  }

  private static async chatCompletionAnthropic(
    apiKey: string,
    messages: any[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    // TODO: Implement Anthropic Claude API
    throw new Error('Anthropic integration not implemented yet')
  }

  private static async generateFlashcardsGoogle(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<FlashcardGenerationResult[]> {
    // TODO: Implement Google AI API
    throw new Error('Google AI integration not implemented yet')
  }

  private static async generateStudyGuideGoogle(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<StudyGuideGenerationResult> {
    // TODO: Implement Google AI API
    throw new Error('Google AI integration not implemented yet')
  }

  private static async generateTestGoogle(
    apiKey: string,
    content: string,
    options: ContentGenerationOptions
  ): Promise<TestGenerationResult> {
    // TODO: Implement Google AI API
    throw new Error('Google AI integration not implemented yet')
  }

  private static async chatCompletionGoogle(
    apiKey: string,
    messages: any[],
    options: ChatCompletionOptions
  ): Promise<ChatCompletionResult> {
    // TODO: Implement Google AI API
    throw new Error('Google AI integration not implemented yet')
  }
}

export default AIService 