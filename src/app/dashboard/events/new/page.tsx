import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventForm from './event-form'

import { prisma } from '@/lib/db'

export default async function NewEventPage() {
  const user = await getCurrentUser()
  
  if (!user || user.role !== 'STUDENT') {
    redirect('/dashboard/events')
  }

  const facilities = await prisma.facility.findMany({
    where: {
      universityId: user.universityId!,
      type: 'PHYSICAL',
    },
    select: {
      id: true,
      name: true,
      capacity: true,
      location: true,
    }
  })

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Event</h1>
        <p className="text-muted-foreground">
          Organize an event for specific batches or the entire campus.
        </p>
      </div>
      <EventForm universityId={user.universityId!} facilities={facilities} />
    </div>
  )
}
