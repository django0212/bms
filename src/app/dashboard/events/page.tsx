import { getEvents } from '@/actions/events'
import { getCurrentUser } from '@/lib/auth'
import { redirect } from 'next/navigation'
import EventsClient from './events-client'

export default async function EventsPage() {
  const user = await getCurrentUser()
  if (!user) redirect('/login')
  if (!user.universityId) redirect('/dashboard')

  const events = await getEvents(user.universityId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Campus Events</h1>
          {user.role === 'STUDENT' && (
            <p className="text-muted-foreground">
              Discover and join events happening around you.
            </p>
          )}
        </div>
      </div>
      <EventsClient events={events} userRole={user.role} userId={user.id} />
    </div>
  )
}
