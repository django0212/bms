'use server'

import { prisma } from '@/lib/db'
import { requireSuperAdmin } from '@/lib/auth'

export async function getGlobalBookings() {
  await requireSuperAdmin()

  return await prisma.booking.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
      facility: {
        select: {
          name: true,
        },
      },
      university: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}
