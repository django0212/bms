'use server'

import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { RegistrationStatus } from '@prisma/client'

import { z } from 'zod'

const createEventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
  location: z.string().min(1, 'Location is required'),
  facilityId: z.string().optional(),
  allowedBatches: z.array(z.string()),
  capacity: z.number().optional(),
  speakers: z.array(z.object({
    name: z.string(),
    role: z.string(),
    bio: z.string().optional()
  })).optional(),
  resources: z.array(z.object({
    name: z.string(),
    url: z.string().url()
  })).optional()
})

export async function createEvent(data: z.infer<typeof createEventSchema>) {
  console.log('🚀 createEvent called with:', JSON.stringify(data, null, 2))
  
  const result = createEventSchema.safeParse(data)
  if (!result.success) {
    console.error('❌ Validation failed:', result.error)
    throw new Error(`Validation failed: ${result.error.message}`)
  }

  const user = await getCurrentUser()
  console.log('👤 Current user:', user ? `${user.email} (${user.role})` : 'null')

  if (!user || user.role !== 'STUDENT') {
    throw new Error('Unauthorized: Only students can create events')
  }

  if (!user.universityId) {
    throw new Error('User not associated with a university')
  }

  // Validate facility and capacity
  if (data.facilityId) {
    const facility = await prisma.facility.findUnique({
      where: { id: data.facilityId }
    })

    if (!facility) {
      throw new Error('Selected facility not found')
    }

    if (facility.type !== 'PHYSICAL') {
       throw new Error('Events must use a physical facility')
    }

    if (facility.capacity && data.capacity && data.capacity > facility.capacity) {
      throw new Error(`Event capacity (${data.capacity}) exceeds facility capacity (${facility.capacity})`)
    }
  } else {
      throw new Error('A physical facility is required for all events')
  }

  const event = await prisma.event.create({
    data: {
      ...data,
      universityId: user.universityId,
      organizerId: user.id,
    },
  })

  revalidatePath('/dashboard/events')
  return event
}

export async function getEvents(universityId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  const events = await prisma.event.findMany({
    where: {
      universityId,
      // Filter by batch if user is a student and allowedBatches is not empty
      ...(user.role === 'STUDENT'
        ? {
            OR: [
              { organizerId: user.id }, // Always show events organized by the user
              {
                AND: [
                  user.batch
                    ? {
                        OR: [
                          { allowedBatches: { isEmpty: true } }, // Open to all
                          { allowedBatches: { has: user.batch } }, // Specific to user's batch
                        ],
                      }
                    : { allowedBatches: { isEmpty: true } }, // If no batch, only show open events
                ],
              },
            ],
          }
        : {}),
    },
    include: {
      organizer: {
        select: {
          name: true,
          email: true,
        },
      },
      registrations: {
        where: {
          userId: user.id,
        },
      },
      _count: {
        select: { registrations: true },
      },
    },
    orderBy: {
      startTime: 'asc',
    },
  })

  return events
}

export async function registerForEvent(eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // Use a transaction to ensure atomic capacity check and registration
  const registration = await prisma.$transaction(async (tx) => {
    const event = await tx.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
    })

    if (!event) throw new Error('Event not found')

    // Check batch restrictions
    if (
      user.role === 'STUDENT' &&
      user.batch &&
      event.allowedBatches.length > 0 &&
      !event.allowedBatches.includes(user.batch)
    ) {
      throw new Error('This event is not open to your batch')
    }

    // Check capacity
    if (event.capacity !== null && event._count.registrations >= event.capacity) {
      throw new Error('Event is full')
    }

    return await tx.eventRegistration.create({
      data: {
        eventId,
        userId: user.id,
        status: RegistrationStatus.REGISTERED,
      },
    })
  })

  revalidatePath('/dashboard/events')
  revalidatePath(`/dashboard/events/${eventId}`)
  return registration
}

export async function cancelRegistration(eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  await prisma.eventRegistration.deleteMany({
    where: {
      eventId,
      userId: user.id,
    },
  })

  revalidatePath('/dashboard/events')
  revalidatePath(`/dashboard/events/${eventId}`)
}

export async function deleteEvent(eventId: string) {
  const user = await getCurrentUser()
  if (!user) throw new Error('Unauthorized')

  // Only Admins or the Organizer can delete (but requirement emphasizes Admin)
  // We'll allow Admins and the Organizer.
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { organizerId: true }
  })

  if (!event) throw new Error('Event not found')

  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN' && event.organizerId !== user.id) {
    throw new Error('Unauthorized: You do not have permission to delete this event')
  }

  // Delete registrations first (cascade usually handles this but good to be explicit or rely on schema)
  // Schema doesn't specify onDelete: Cascade for registrations relation, so we should delete them.
  // Actually, let's check schema. If not cascade, we must delete manually.
  // Assuming we need to delete manually for safety.
  
  await prisma.eventRegistration.deleteMany({
    where: { eventId }
  })

  await prisma.event.delete({
    where: { id: eventId }
  })

  revalidatePath('/dashboard/events')
  return { success: true }
}
