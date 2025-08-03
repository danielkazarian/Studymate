import { PrismaClient } from '@prisma/client'
import { logger } from '@/utils/logger'

declare global {
  var __prisma: PrismaClient | undefined
}

// Prevent multiple instances of Prisma Client in development
const prisma = globalThis.__prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
})

if (process.env.NODE_ENV === 'development') {
  globalThis.__prisma = prisma
}

// Log database queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e) => {
    logger.debug('Database Query:', {
      query: e.query,
      params: e.params,
      duration: `${e.duration}ms`,
    })
  })
}

// Graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect()
})

export { prisma }
export default prisma 