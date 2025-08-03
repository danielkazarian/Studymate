import jwt from 'jsonwebtoken'
import { JWTPayload, AuthUser } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'default-refresh-secret'
const REFRESH_TOKEN_EXPIRES_IN = process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'

export class AuthService {
  /**
   * Generate an access token
   */
  static generateAccessToken(user: AuthUser): string {
    const payload: JWTPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
      issuer: 'studymate-backend',
      audience: 'studymate-frontend',
    })
  }

  /**
   * Generate a refresh token
   */
  static generateRefreshToken(userId: string): string {
    return jwt.sign(
      { sub: userId, type: 'refresh' },
      REFRESH_TOKEN_SECRET,
      {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'studymate-backend',
        audience: 'studymate-frontend',
      }
    )
  }

  /**
   * Verify an access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        issuer: 'studymate-backend',
        audience: 'studymate-frontend',
      }) as JWTPayload

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid token')
      }
      throw new Error('Token verification failed')
    }
  }

  /**
   * Verify a refresh token
   */
  static verifyRefreshToken(token: string): { sub: string; type: string } {
    try {
      const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET, {
        issuer: 'studymate-backend',
        audience: 'studymate-frontend',
      }) as { sub: string; type: string }

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type')
      }

      return decoded
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new Error('Refresh token expired')
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new Error('Invalid refresh token')
      }
      throw new Error('Refresh token verification failed')
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null

    const parts = authHeader.split(' ')
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null
    }

    return parts[1]
  }

  /**
   * Generate tokens for a user
   */
  static generateTokens(user: AuthUser): { accessToken: string; refreshToken: string } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user.id),
    }
  }

  /**
   * Calculate token expiration date
   */
  static getRefreshTokenExpirationDate(): Date {
    const expiresIn = REFRESH_TOKEN_EXPIRES_IN
    const match = expiresIn.match(/^(\d+)([dhms])$/)
    
    if (!match) {
      throw new Error('Invalid refresh token expiration format')
    }

    const value = parseInt(match[1])
    const unit = match[2]
    const now = new Date()

    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000)
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000)
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000)
      case 's':
        return new Date(now.getTime() + value * 1000)
      default:
        throw new Error('Invalid refresh token expiration unit')
    }
  }
}

export default AuthService 