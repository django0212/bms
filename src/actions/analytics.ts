'use server'

import { prisma } from '@/lib/db'
import { startOfMonth, endOfMonth, subMonths } from 'date-fns'

export async function getDashboardStats(universityId: string) {
  const now = new Date()
  const startOfCurrentMonth = startOfMonth(now)
  const endOfCurrentMonth = endOfMonth(now)
  const startOfLastMonth = startOfMonth(subMonths(now, 1))
  const endOfLastMonth = endOfMonth(subMonths(now, 1))

  // 1. Total Bookings This Month
  const totalBookings = await prisma.booking.count({
    where: {
      universityId,
      createdAt: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
  })

  const lastMonthBookings = await prisma.booking.count({
    where: {
      universityId,
      createdAt: {
        gte: startOfLastMonth,
        lte: endOfLastMonth,
      },
    },
  })

  const growth = lastMonthBookings === 0 
    ? 100 
    : Math.round(((totalBookings - lastMonthBookings) / lastMonthBookings) * 100)

  // 2. Active Students (Unique users with bookings this month)
  const activeStudents = await prisma.booking.groupBy({
    by: ['userId'],
    where: {
      universityId,
      createdAt: {
        gte: startOfCurrentMonth,
        lte: endOfCurrentMonth,
      },
    },
  })
  const activeStudentsCount = activeStudents.length

  // 3. Pending Approvals
  const pendingBookingsCount = await prisma.booking.count({
    where: {
      universityId,
      status: 'PENDING',
    },
  })

  // 4. Most Popular Facilities (Top 5)
  const popularFacilities = await prisma.booking.groupBy({
    by: ['facilityId'],
    where: { universityId },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: 'desc',
      },
    },
    take: 5,
  })

  // Fetch facility names
  const facilityNames = await prisma.facility.findMany({
    where: {
      id: { in: popularFacilities.map(f => f.facilityId) },
    },
    select: { id: true, name: true },
  })

  const popularData = popularFacilities.map(item => ({
    name: facilityNames.find(f => f.id === item.facilityId)?.name || 'Unknown',
    bookings: item._count.id,
  }))

  // 5. Peak Usage Hours
  // We'll analyze start times of all bookings
  const allBookings = await prisma.booking.findMany({
    where: { universityId },
    select: { startTime: true },
  })

  const hoursMap = new Array(24).fill(0)
  allBookings.forEach(booking => {
    const hour = new Date(booking.startTime).getHours()
    hoursMap[hour]++
  })

  const peakHoursData = hoursMap.map((count, hour) => ({
    hour: `${hour}:00`,
    bookings: count,
  }))

  // 6. Recent Bookings
  const recentBookings = await prisma.booking.findMany({
    where: { universityId },
    orderBy: { createdAt: 'desc' },
    take: 5,
    include: {
      user: { select: { name: true, email: true } },
      facility: { select: { name: true, type: true } },
    },
  })

  return {
    totalBookings,
    growth,
    activeStudentsCount,
    pendingBookingsCount,
    popularData,
    peakHoursData,
    recentBookings,
  }
}
