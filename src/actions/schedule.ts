'use server'

import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, startOfDay, endOfDay } from 'date-fns'

export async function getMasterSchedule(universityId: string, start: Date, end: Date) {
  const bookings = await prisma.booking.findMany({
    where: {
      universityId,
      status: 'CONFIRMED',
      startTime: {
        gte: start,
      },
      endTime: {
        lte: end,
      },
    },
    include: {
      facility: {
        select: {
          name: true,
          type: true,
        },
      },
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  return bookings.map(booking => ({
    id: booking.id,
    title: `${booking.facility.name} - ${booking.user.name || booking.user.email}`,
    start: booking.startTime,
    end: booking.endTime,
    resource: booking.facility,
    allDay: false,
  }))
}
