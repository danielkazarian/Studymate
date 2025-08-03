import crypto from 'crypto'

const algorithm = 'aes-256-gcm'
const keyLength = 32
const ivLength = 16
const saltLength = 16
const tagLength = 16

export class EncryptionService {
  private secretKey: string

  constructor(secretKey: string) {
    if (!secretKey || secretKey.length < 32) {
      throw new Error('Encryption key must be at least 32 characters long')
    }
    this.secretKey = secretKey
  }

  /**
   * Encrypt a string value
   */
  encrypt(text: string): string {
    try {
      // Generate random salt and IV
      const salt = crypto.randomBytes(saltLength)
      const iv = crypto.randomBytes(ivLength)

      // Derive key from secret and salt
      const key = crypto.pbkdf2Sync(this.secretKey, salt, 100000, keyLength, 'sha256')

      // Create cipher
      const cipher = crypto.createCipherGCM(algorithm, key, iv)

      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex')
      encrypted += cipher.final('hex')

      // Get the authentication tag
      const tag = cipher.getAuthTag()

      // Combine salt, iv, tag, and encrypted data
      const result = Buffer.concat([salt, iv, tag, Buffer.from(encrypted, 'hex')])
      return result.toString('base64')
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Decrypt a string value
   */
  decrypt(encryptedData: string): string {
    try {
      const data = Buffer.from(encryptedData, 'base64')

      // Extract components
      const salt = data.subarray(0, saltLength)
      const iv = data.subarray(saltLength, saltLength + ivLength)
      const tag = data.subarray(saltLength + ivLength, saltLength + ivLength + tagLength)
      const encrypted = data.subarray(saltLength + ivLength + tagLength)

      // Derive key from secret and salt
      const key = crypto.pbkdf2Sync(this.secretKey, salt, 100000, keyLength, 'sha256')

      // Create decipher
      const decipher = crypto.createDecipherGCM(algorithm, key, iv)
      decipher.setAuthTag(tag)

      // Decrypt the data
      let decrypted = decipher.update(encrypted, undefined, 'utf8')
      decrypted += decipher.final('utf8')

      return decrypted
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Hash a password using bcrypt-like PBKDF2
   */
  hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const passwordSalt = salt || crypto.randomBytes(saltLength).toString('hex')
    const hash = crypto.pbkdf2Sync(password, passwordSalt, 100000, keyLength, 'sha256').toString('hex')
    return { hash, salt: passwordSalt }
  }

  /**
   * Verify a password against a hash
   */
  verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt)
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(computedHash, 'hex'))
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex')
  }

  /**
   * Generate a secure random API key
   */
  generateApiKey(): string {
    return 'sm_' + crypto.randomBytes(32).toString('hex')
  }
}

// Create a singleton instance
const encryptionKey = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-please'
export const encryption = new EncryptionService(encryptionKey)

export default encryption 