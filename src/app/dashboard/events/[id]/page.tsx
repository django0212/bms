import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { redirect, notFound } from 'next/navigation'
import EventDetailsClient from './event-details-client'

export default async function EventDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  if (!user) redirect('/login')

  const { id } = await params
  const event = await prisma.event.findUnique({
    where: { id },
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
  })

  if (!event) {
    notFound()
  }

  // Check batch restrictions for students
  if (
    user.role === 'STUDENT' &&
    user.batch &&
    event.allowedBatches.length > 0 &&
    !event.allowedBatches.includes(user.batch)
  ) {
    // Optionally redirect or show unauthorized
    // For now, let's just show it but maybe disable RSVP in client, 
    // or better, redirect to events list with a toast (but we can't toast from server easily)
    // Let's redirect.
    redirect('/dashboard/events')
  }

  return <EventDetailsClient event={event} userId={user.id} />
}
