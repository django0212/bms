'use server'

import { prisma } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function getBookingById(bookingId: string) {
  return await prisma.booking.findUnique({
    where: {
      id: bookingId
    },
    include: {
      facility: true,
      user: {
        select: {
          name: true,
          email: true,
          studentId: true
        }
      },
      university: {
        select: {
          name: true,
          logoUrl: true,
          primaryColor: true
        }
      }
    }
  })
}
