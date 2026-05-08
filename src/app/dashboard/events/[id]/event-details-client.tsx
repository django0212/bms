'use client'

import { useState } from 'react'
import { Event, EventRegistration } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar, Clock, MapPin, Users, ArrowLeft, CheckCircle2, User } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import { registerForEvent, cancelRegistration } from '@/actions/events'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

interface EventDetailsClientProps {
  event: Event & {
    organizer: { name: string | null; email: string }
    registrations: EventRegistration[]
    _count: { registrations: number }
  }
  userId: string
}

export default function EventDetailsClient({ event, userId }: EventDetailsClientProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const userRegistration = event.registrations.find(r => r.userId === userId)
  const isRegistered = !!userRegistration
  const isFull = event.capacity ? event._count.registrations >= event.capacity : false

  const handleRSVP = async () => {
    setIsLoading(true)
    try {
      if (isRegistered) {
        await cancelRegistration(event.id)
        toast({
          title: "Registration Cancelled",
          description: "You have been removed from the event.",
        })
        router.refresh()
      } else {
        await registerForEvent(event.id)
        toast({
          title: "Success!",
          description: "You are now registered for this event.",
        })
        router.refresh()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" className="pl-0 hover:bg-transparent" onClick={() => router.back()}>
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Events
      </Button>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h1 className="text-4xl font-bold tracking-tight text-slate-900">{event.title}</h1>
              {isRegistered && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1">
                  <CheckCircle2 className="h-4 w-4 mr-2" /> Registered
                </Badge>
              )}
            </div>
            
            <div className="flex flex-wrap gap-2">
              {event.allowedBatches.length > 0 ? (
                event.allowedBatches.map(batch => (
                  <Badge key={batch} variant="outline">Batch {batch}</Badge>
                ))
              ) : (
                <Badge variant="secondary">Open to All</Badge>
              )}
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>About this Event</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {event.description}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Date</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startTime), 'EEEE, MMMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Time</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-muted-foreground">{event.location}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Attendees</p>
                    <p className="text-sm text-muted-foreground">
                      {event._count.registrations} {event.capacity ? `/ ${event.capacity}` : 'registered'}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-4 border-t">
                  <User className="h-5 w-5 text-slate-500 mt-0.5" />
                  <div>
                    <p className="font-medium">Organizer</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer.name || event.organizer.email}
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                className={cn("w-full", isRegistered && "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border")}
                size="lg"
                variant={isRegistered ? "ghost" : "default"}
                onClick={handleRSVP}
                disabled={isLoading || (!isRegistered && isFull)}
              >
                {isLoading ? "Processing..." : isRegistered ? "Cancel Registration" : isFull ? "Event Full" : "Register"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
