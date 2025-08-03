import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { createServer } from 'http'
import { Server } from 'socket.io'
import dotenv from 'dotenv'

import { logger } from '@/utils/logger'
import { errorHandler, notFound } from '@/middleware/error'
import { setupSocketIO } from '@/services/socket'

// Import routes
import authRoutes from '@/routes/auth'
import userRoutes from '@/routes/user'
import pageRoutes from '@/routes/pages'
import fileRoutes from '@/routes/files'
import contentRoutes from '@/routes/content'
import chatRoutes from '@/routes/chat'
import apiKeyRoutes from '@/routes/apiKeys'

// Load environment variables
dotenv.config()

const app = express()
const server = createServer(app)
const port = process.env.PORT || 3001

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
})

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Allow for development
  crossOriginEmbedderPolicy: false
}))

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:3000",
  credentials: true,
  optionsSuccessStatus: 200
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'), // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
})

app.use(limiter)

// Body parsing middleware
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Request logging
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  })
  next()
})

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/users', userRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/files', fileRoutes)
app.use('/api/content', contentRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/api-keys', apiKeyRoutes)

// Setup Socket.IO handlers
setupSocketIO(io)

// Error handling middleware
app.use(notFound)
app.use(errorHandler)

// Graceful shutdown
const gracefulShutdown = (signal: string) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`)
  
  server.close(() => {
    logger.info('HTTP server closed.')
    
    // Close database connections, Redis, etc.
    process.exit(0)
  })

  // Force close after timeout
  setTimeout(() => {
    logger.error('Forcefully shutting down')
    process.exit(1)
  }, 10000)
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Start the server
server.listen(port, () => {
  logger.info(`Server running on port ${port} in ${process.env.NODE_ENV || 'development'} mode`)
})

export default app 