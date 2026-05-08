import { cache } from 'react'
import { prisma } from './db'
import { Role } from '@prisma/client'

export type UserWithRole = {
  id: string
  email: string
  name: string | null
  studentId: string | null
  batch: string | null
  role: Role
  universityId: string | null
  university?: {
    name: string
    logoUrl?: string | null
  } | null
}

import { verifySession } from './session'

export const getCurrentUser = cache(async (): Promise<UserWithRole | null> => {
  const session = await verifySession()
  
  if (!session) {
    return null
  }

  // We can return the session payload directly if it has everything we need,
  // or fetch from DB if we need fresh data.
  // For now, let's fetch from DB to ensure we have the latest role/data
  // and to match the previous return type exactly.
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      university: {
        select: {
          name: true,
          logoUrl: true,
        }
      }
    }
  })

  if (!user) {
    return null
  }

  return user
})

export async function requireAuth() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('Unauthorized')
  }
  return user
}

export async function requireRole(roles: Role[]) {
  const user = await requireAuth()
  
  if (!roles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }
  
  return user
}

export async function requireSuperAdmin() {
  return requireRole([Role.SUPER_ADMIN])
}

export async function requireAdmin() {
  return requireRole([Role.ADMIN, Role.SUPER_ADMIN])
}

export async function requireStudent() {
  return requireRole([Role.STUDENT, Role.ADMIN, Role.SUPER_ADMIN])
}
