'use server'

import { prisma } from '@/lib/db'

import { Prisma, BookingStatus } from '@prisma/client'
import { revalidatePath } from 'next/cache'

export async function createBooking(data: {
  userId: string
  facilityId: string
  universityId: string
  startTime: Date
  endTime: Date
  status?: BookingStatus
  seatNumber?: number
  pickupStop?: string
  dropoffStop?: string
  guestCount?: number
  specialRequests?: string
  recurrenceRule?: string // Simple format: "WEEKLY:5" (Weekly for 5 weeks)
}) {
  // Overlap check for PHYSICAL and EVENT types
  // Note: For TRANSPORT, we check capacity instead (handled in UI or separate logic, but here we can add basic check)
  
  try {
    // Fetch facility type to decide validation logic
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId },
    })

    if (!facility) return { success: false, error: 'Facility not found' }

    // Check if user is active
    const user = await prisma.user.findUnique({
        where: { id: data.userId },
        select: { isActive: true }
    })

    if (!user) return { success: false, error: 'User not found' }
    if (!user.isActive) return { success: false, error: 'Your account is deactivated. You cannot make new bookings.' }

    // Check for Blackout Dates
    // We check if the booking date (start or end) overlaps with any blackout date.
    // Since blackout dates are "whole days", we check if the booking falls on that day.
    const bookingStart = new Date(data.startTime)
    const bookingEnd = new Date(data.endTime)
    
    // Normalize to YYYY-MM-DD for comparison
    const startDay = new Date(bookingStart)
    startDay.setHours(0, 0, 0, 0)
    
    const endDay = new Date(bookingEnd)
    endDay.setHours(0, 0, 0, 0)

    const blackoutDate = await prisma.blackoutDate.findFirst({
      where: {
        universityId: data.universityId,
        date: {
          gte: startDay,
          lte: endDay
        }
      }
    })

    if (blackoutDate) {
        return { success: false, error: `Selected date is a blackout day: ${blackoutDate.reason || 'University Holiday'}` }
    }

    // Event Specific Validation
    if (facility.type === 'EVENT') {
        if (facility.registrationDeadline && new Date() > facility.registrationDeadline) {
            return { success: false, error: 'Registration deadline has passed' }
        }
        
        // For events, we sum the guest counts
        const bookings = await prisma.booking.findMany({
            where: {
                facilityId: data.facilityId,
                status: { in: ['CONFIRMED', 'PENDING'] }
            },
            select: {
                guestCount: true
            }
        })

        const totalGuests = bookings.reduce((sum, booking) => sum + (booking.guestCount || 0), 0)
        
        // Check if new booking fits
        if (facility.capacity && (totalGuests + (data.guestCount || 0)) > facility.capacity) {
            return { success: false, error: `Event is fully booked. Remaining capacity: ${Math.max(0, facility.capacity - totalGuests)}` }
        }
    }

    // General Validation
    if (data.endTime <= data.startTime) {
        return { success: false, error: 'End time must be after start time' }
    }

    if (data.startTime < new Date()) {
        return { success: false, error: 'Cannot book in the past' }
    }

    if (facility.capacity && data.guestCount && data.guestCount > facility.capacity) {
        return { success: false, error: `Guest count exceeds facility capacity of ${facility.capacity}` }
    }

    // Generate booking dates
    const bookingsToCreate: { start: Date; end: Date }[] = []
    
    if (data.recurrenceRule && data.recurrenceRule.startsWith('WEEKLY:')) {
        const count = parseInt(data.recurrenceRule.split(':')[1]) || 1
        // Limit recursion to avoid abuse
        const safeCount = Math.min(count, 10) 
        
        for (let i = 0; i < safeCount; i++) {
            const start = new Date(data.startTime)
            start.setDate(start.getDate() + (i * 7))
            
            const end = new Date(data.endTime)
            end.setDate(end.getDate() + (i * 7))
            
            bookingsToCreate.push({ start, end })
        }
    } else {
        bookingsToCreate.push({ start: data.startTime, end: data.endTime })
    }

    // Wrap in Serializable transaction to prevent race conditions
    await prisma.$transaction(async (tx) => {
        // Helper to check availability for a single slot within transaction
        const checkAvailability = async (start: Date, end: Date) => {
          if (facility.type === 'TRANSPORT') {
              const overlappingBookingsCount = await tx.booking.count({
              where: {
                  facilityId: data.facilityId,
                  status: 'CONFIRMED',
                  OR: [
                  {
                      startTime: { lt: end },
                      endTime: { gt: start },
                  },
                  ],
              },
              })
              if (facility.capacity && overlappingBookingsCount >= facility.capacity) {
                  throw new Error(`Bus is full for slot ${start.toLocaleString()}`)
              }
          } else if (facility.type === 'PHYSICAL') {
              const maxCapacity = facility.capacity && facility.capacity > 0 ? facility.capacity : 1
              const overlappingBookingsCount = await tx.booking.count({
              where: {
                  facilityId: data.facilityId,
                  status: { notIn: ['REJECTED', 'CANCELLED'] },
                  OR: [
                  {
                      startTime: { lt: end },
                      endTime: { gt: start },
                  },
                  ],
              },
              })
              if (overlappingBookingsCount >= maxCapacity) {
                  throw new Error(`Slot ${start.toLocaleString()} is fully booked`)
              }
          }
           // EVENT type availability is checked outside/differently or assumed infinite if capacity not hit
        }

        // Check availability for ALL slots before creating ANY
        if (facility.type !== 'EVENT') {
            for (const slot of bookingsToCreate) {
                await checkAvailability(slot.start, slot.end)
            }
        }

        // Create bookings
        const parentId = bookingsToCreate.length > 1 ? crypto.randomUUID() : undefined

        for (const slot of bookingsToCreate) {
            // Generate a simple ticket code
            const ticketCode = Math.random().toString(36).substring(2, 10).toUpperCase()
            
            await tx.booking.create({
              data: {
                ...data,
                startTime: slot.start,
                endTime: slot.end,
                recurrenceRule: data.recurrenceRule,
                parentBookingId: parentId,
                ticketCode,
                status: data.status || (facility.requiresApproval ? 'PENDING' : 'CONFIRMED'),
              },
            })
        }
    }, {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        maxWait: 5000, // 5s max wait for lock
        timeout: 10000 // 10s max execution
    })

    revalidatePath('/dashboard/my-bookings')
    revalidatePath('/dashboard/requests') // For admins
    return { success: true }
  } catch (error: any) {
    console.error('Booking error:', error)
    return { success: false, error: error.message || 'Failed to create booking' }
  }
}

export async function getUserBookings(userId: string) {
  return await prisma.booking.findMany({
    where: { userId },
    include: {
      facility: {
        select: {
          name: true,
          type: true,
          startLocation: true,
          endLocation: true,
          location: true,
          amenities: true,
          eventDate: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

export async function cancelBooking(bookingId: string, userId: string) {
  // Ensure user owns the booking
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
  })

  if (!booking || booking.userId !== userId) {
    throw new Error('Unauthorized')
  }

  await prisma.booking.update({
    where: { id: bookingId },
    data: { status: 'CANCELLED' },
  })

  revalidatePath('/dashboard/my-bookings')
}

export async function getOccupiedSeats(facilityId: string, startTime: Date, endTime?: Date) {
  if (endTime) {
      // Check for overlaps
      const bookings = await prisma.booking.findMany({
        where: {
          facilityId,
          status: { in: ['CONFIRMED', 'PENDING'] },
          OR: [
            {
              startTime: { lt: endTime },
              endTime: { gt: startTime },
            },
          ],
        },
        select: {
          seatNumber: true,
        },
      })
      return bookings.map(b => b.seatNumber).filter((seat): seat is number => seat !== null)
  } else {
      // Exact match (legacy behavior or for simple slots)
      const bookings = await prisma.booking.findMany({
        where: {
          facilityId,
          startTime,
          status: { in: ['CONFIRMED', 'PENDING'] },
        },
        select: {
          seatNumber: true,
        },
      })
      return bookings.map(b => b.seatNumber).filter((seat): seat is number => seat !== null)
  }
}
