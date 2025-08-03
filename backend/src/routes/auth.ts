import { Router } from 'express'
import { body, validationResult } from 'express-validator'
import bcrypt from 'bcryptjs'
import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt'

import { prisma } from '@/config/database'
import { AuthService } from '@/utils/auth'
import { logger } from '@/utils/logger'
import { asyncHandler } from '@/middleware/error'
import { APIResponse, AuthUser } from '@/types'

const router = Router()

// Passport configuration
// Only configure Google OAuth if credentials are provided
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback'
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      // Check if user exists with Google ID
      let user = await prisma.user.findUnique({
        where: { googleId: profile.id }
      })

      if (!user) {
        // Check if user exists with same email
        const existingUser = await prisma.user.findUnique({
          where: { email: profile.emails?.[0]?.value }
        })

        if (existingUser) {
          // Link Google account to existing user
          user = await prisma.user.update({
            where: { id: existingUser.id },
            data: { googleId: profile.id }
          })
        } else {
          // Create new user
          user = await prisma.user.create({
            data: {
              email: profile.emails?.[0]?.value || '',
              name: profile.displayName || '',
              googleId: profile.id
            }
          })
        }
      }

      return done(null, user)
    } catch (error) {
      return done(error, null)
    }
  }))
} else {
  logger.warn('Google OAuth not configured - GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET not provided')
}

passport.use(new JwtStrategy({
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET!
}, async (payload, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.sub }
    })
    return done(null, user)
  } catch (error) {
    return done(error, null)
  }
}))

// Register endpoint
router.post('/register', [
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('name').trim().notEmpty()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: APIResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    }
    return res.status(400).json(response)
  }

  const { email, password, name } = req.body

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  })

  if (existingUser) {
    const response: APIResponse = {
      success: false,
      error: 'User already exists with this email'
    }
    return res.status(400).json(response)
  }

  // Hash password
  const saltRounds = 12
  const passwordHash = await bcrypt.hash(password, saltRounds)

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      name
    }
  })

  // Generate tokens
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    googleId: user.googleId || undefined
  }

  const tokens = AuthService.generateTokens(authUser)

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: AuthService.getRefreshTokenExpirationDate()
    }
  })

  logger.info(`User registered: ${user.email}`)

  const response: APIResponse = {
    success: true,
    data: {
      user: authUser,
      tokens
    }
  }

  res.status(201).json(response)
}))

// Login endpoint
router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const response: APIResponse = {
      success: false,
      error: 'Validation failed',
      data: errors.array()
    }
    return res.status(400).json(response)
  }

  const { email, password } = req.body

  // Find user
  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || !user.passwordHash) {
    const response: APIResponse = {
      success: false,
      error: 'Invalid credentials'
    }
    return res.status(401).json(response)
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
    const response: APIResponse = {
      success: false,
      error: 'Invalid credentials'
    }
    return res.status(401).json(response)
  }

  // Generate tokens
  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    googleId: user.googleId || undefined
  }

  const tokens = AuthService.generateTokens(authUser)

  // Store refresh token
  await prisma.refreshToken.create({
    data: {
      token: tokens.refreshToken,
      userId: user.id,
      expiresAt: AuthService.getRefreshTokenExpirationDate()
    }
  })

  logger.info(`User logged in: ${user.email}`)

  const response: APIResponse = {
    success: true,
    data: {
      user: authUser,
      tokens
    }
  }

  res.json(response)
}))

// Refresh token endpoint
router.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (!refreshToken) {
    const response: APIResponse = {
      success: false,
      error: 'Refresh token required'
    }
    return res.status(400).json(response)
  }

  // Verify refresh token
  const decoded = AuthService.verifyRefreshToken(refreshToken)

  // Check if token exists in database
  const storedToken = await prisma.refreshToken.findUnique({
    where: { token: refreshToken },
    include: { user: true }
  })

  if (!storedToken || storedToken.expiresAt < new Date()) {
    const response: APIResponse = {
      success: false,
      error: 'Invalid or expired refresh token'
    }
    return res.status(401).json(response)
  }

  // Generate new tokens
  const authUser: AuthUser = {
    id: storedToken.user.id,
    email: storedToken.user.email,
    name: storedToken.user.name,
    googleId: storedToken.user.googleId || undefined
  }

  const tokens = AuthService.generateTokens(authUser)

  // Update refresh token
  await prisma.refreshToken.update({
    where: { id: storedToken.id },
    data: {
      token: tokens.refreshToken,
      expiresAt: AuthService.getRefreshTokenExpirationDate()
    }
  })

  const response: APIResponse = {
    success: true,
    data: { tokens }
  }

  res.json(response)
}))

// Logout endpoint
router.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body

  if (refreshToken) {
    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken }
    })
  }

  const response: APIResponse = {
    success: true,
    message: 'Logged out successfully'
  }

  res.json(response)
}))

// Google OAuth routes (only if configured)
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
  }))

  router.get('/google/callback', passport.authenticate('google', {
    session: false
  }), asyncHandler(async (req, res) => {
    const user = req.user as any

    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      googleId: user.googleId
    }

    const tokens = AuthService.generateTokens(authUser)

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: user.id,
        expiresAt: AuthService.getRefreshTokenExpirationDate()
      }
    })

    // Redirect to frontend with tokens
    const frontendUrl = process.env.CORS_ORIGIN || 'http://localhost:3000'
    res.redirect(`${frontendUrl}/auth/callback?token=${tokens.accessToken}&refresh=${tokens.refreshToken}`)
  }))
} else {
  // Return error if Google OAuth is accessed but not configured
  router.get('/google', (req, res) => {
    res.status(501).json({ error: 'Google OAuth not configured' })
  })
  router.get('/google/callback', (req, res) => {
    res.status(501).json({ error: 'Google OAuth not configured' })
  })
}

export default router 