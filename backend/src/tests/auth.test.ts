import request from 'supertest'
import { describe, test, expect, beforeAll, afterAll, beforeEach } from '@jest/globals'
import app from '../index'
import { prisma } from '../config/database'

describe('Authentication Endpoints', () => {
  beforeAll(async () => {
    // Setup test database
    await prisma.$connect()
  })

  afterAll(async () => {
    // Cleanup test database
    await prisma.user.deleteMany()
    await prisma.$disconnect()
  })

  beforeEach(async () => {
    // Clean up users before each test
    await prisma.user.deleteMany()
  })

  describe('POST /api/auth/register', () => {
    test('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: userData.email,
            name: userData.name
          },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
          }
        }
      })

      expect(response.body.data.user.id).toBeDefined()
      expect(response.body.data.user.email).toBe(userData.email)
      expect(response.body.data.user.name).toBe(userData.name)
    })

    test('should return error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      }

      // Register first user
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201)

      // Try to register with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: 'User already exists with this email'
      })
    })

    test('should return validation error for invalid data', async () => {
      const invalidData = {
        email: 'invalid-email',
        password: '123', // too short
        name: ''
      }

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Validation failed'
      })
      expect(response.body.data).toBeDefined()
    })
  })

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })
    })

    test('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          user: {
            email: loginData.email
          },
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
          }
        }
      })
    })

    test('should return error for invalid credentials', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      })
    })

    test('should return error for non-existent user', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      }

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: 'Invalid credentials'
      })
    })
  })

  describe('POST /api/auth/refresh', () => {
    let refreshToken: string

    beforeEach(async () => {
      // Register and get refresh token
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })

      refreshToken = response.body.data.tokens.refreshToken
    })

    test('should refresh tokens successfully', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        data: {
          tokens: {
            accessToken: expect.any(String),
            refreshToken: expect.any(String)
          }
        }
      })
    })

    test('should return error for invalid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh')
        .send({ refreshToken: 'invalid-token' })
        .expect(401)

      expect(response.body).toMatchObject({
        success: false,
        error: expect.stringContaining('Invalid')
      })
    })
  })

  describe('POST /api/auth/logout', () => {
    test('should logout successfully', async () => {
      // Register and get refresh token
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        })

      const refreshToken = registerResponse.body.data.tokens.refreshToken

      const response = await request(app)
        .post('/api/auth/logout')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toMatchObject({
        success: true,
        message: 'Logged out successfully'
      })
    })
  })
}) 