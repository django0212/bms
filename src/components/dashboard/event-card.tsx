import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar, Clock, Users } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

interface EventCardProps {
  event: {
    id: string
    name: string
    description: string | null
    eventDate: Date | null
    registrationDeadline: Date | null
    capacity: number | null
    location: string | null
  }
}

export function EventCard({ event }: EventCardProps) {
  const isRegistrationOpen = event.registrationDeadline ? new Date() < new Date(event.registrationDeadline) : true

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold line-clamp-1">{event.name}</CardTitle>
        <div className="text-sm text-muted-foreground flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          {event.eventDate ? format(new Date(event.eventDate), 'MMM d, yyyy') : 'Date TBD'}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-zinc-600 line-clamp-2">{event.description}</p>
        
        <div className="space-y-2 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{event.eventDate ? format(new Date(event.eventDate), 'h:mm a') : 'Time TBD'}</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Capacity: {event.capacity || 'Unlimited'}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/dashboard/book?facilityId=${event.id}`} className="w-full">
            <Button className="w-full" disabled={!isRegistrationOpen}>
            {isRegistrationOpen ? 'Register Now' : 'Registration Closed'}
            </Button>
        </Link>
      </CardFooter>
    </Card>
  )
}
