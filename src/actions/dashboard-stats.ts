'use server'

import { prisma } from '@/lib/db'
import { Role, BookingStatus } from '@prisma/client'

export async function getSuperAdminStats() {
  const [universityCount, adminCount] = await Promise.all([
    prisma.university.count(),
    prisma.user.count({ where: { role: Role.ADMIN } }),
  ])
  return { universityCount, adminCount }
}

export async function getAdminStats(universityId: string) {
  const [
    facilitiesCount,
    studentsCount,
    pendingBookingsCount,
    activeBookingsCount,
    recentBookings
  ] = await Promise.all([
    prisma.facility.count({ where: { universityId } }),
    prisma.user.count({ where: { universityId, role: Role.STUDENT } }),
    prisma.booking.count({ where: { universityId, status: BookingStatus.PENDING } }),
    prisma.booking.count({ 
      where: { 
        universityId, 
        status: BookingStatus.CONFIRMED,
        endTime: { gte: new Date() }
      } 
    }),
    prisma.booking.findMany({
      where: { universityId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        user: { select: { name: true, email: true } },
        facility: { select: { name: true } }
      }
    })
  ])

  return {
    facilitiesCount,
    studentsCount,
    pendingBookingsCount,
    activeBookingsCount,
    recentBookings
  }
}

export async function getStudentStats(userId: string, universityId: string) {
  const [upcomingBookings, pendingRequests, waitlist, events, facilities] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId,
        status: BookingStatus.CONFIRMED,
        endTime: { gte: new Date() }
      },
      orderBy: { startTime: 'asc' },
      take: 5,
      include: { 
        facility: { select: { name: true, type: true, startLocation: true, endLocation: true, amenities: true, eventDate: true } },
        user: { select: { name: true, email: true, studentId: true } }
      }
    }),
    prisma.booking.count({
      where: {
        userId,
        status: BookingStatus.PENDING
      }
    }),
    prisma.waitlist.findMany({
      where: { userId },
      include: {
        facility: { select: { name: true, type: true, location: true } }
      },
      orderBy: { startTime: 'asc' }
    }),
    prisma.facility.findMany({
      where: { universityId, type: 'EVENT', eventDate: { gte: new Date() } },
      orderBy: { eventDate: 'asc' },
      take: 5
    }),
    prisma.facility.findMany({
      where: { universityId, type: 'PHYSICAL' },
      take: 6
    })
  ])

  return { upcomingBookings, pendingRequests, waitlist, events, facilities }
}
