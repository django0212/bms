import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma_db: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma_db ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma_db = prisma

// Force reload after schema change
