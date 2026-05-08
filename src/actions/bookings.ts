'use server'

import { prisma } from '@/lib/db'
import { BookingStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function getPendingBookings(universityId: string) {
  return await prisma.booking.findMany({
    where: {
      universityId,
      status: 'PENDING',
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          studentId: true,
        },
      },
      facility: {
        select: {
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  })
}

export async function getAllBookings(universityId: string) {
  return await prisma.booking.findMany({
    where: {
      universityId,
    },
    include: {
      user: {
        select: {
          name: true,
          email: true,
          studentId: true,
        },
      },
      facility: {
        select: {
          name: true,
          type: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function updateBookingStatus(bookingId: string, status: BookingStatus) {
  await prisma.booking.update({
    where: { id: bookingId },
    data: { status },
  })

  revalidatePath('/dashboard/requests')
}
