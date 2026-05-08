'use client'

import { useState } from 'react'
import { Event, EventRegistration } from '@prisma/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, MapPin, Users, Clock, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import { registerForEvent, cancelRegistration, deleteEvent } from '@/actions/events'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { Trash2 } from 'lucide-react'

interface EventCardProps {
  event: Event & {
    organizer: { name: string | null; email: string }
    registrations: EventRegistration[]
    _count: { registrations: number }
  }
  userId: string
  userRole: string
}

export default function EventCard({ event, userId, userRole }: EventCardProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  
  const userRegistration = event.registrations.find(r => r.userId === userId)
  const isRegistered = !!userRegistration
  const isFull = event.capacity ? event._count.registrations >= event.capacity : false
  const isAdmin = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN'

  const handleRSVP = async () => {
    setIsLoading(true)
    try {
      if (isRegistered) {
        await cancelRegistration(event.id)
        toast({
          title: "Registration Cancelled",
          description: "You have been removed from the event.",
        })
      } else {
        await registerForEvent(event.id)
        toast({
          title: "Success!",
          description: "You are now registered for this event.",
        })
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

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return

    setIsLoading(true)
    try {
      await deleteEvent(event.id)
      toast({
        title: "Event Deleted",
        description: "The event has been successfully removed.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete event",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="flex flex-col h-full hover:shadow-md transition-shadow relative group">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <CardTitle className="line-clamp-2">{event.title}</CardTitle>
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-3 w-3" />
              {format(new Date(event.startTime), 'MMM d, yyyy')}
            </CardDescription>
            {isAdmin && (
              <p className="text-xs text-blue-600 font-medium">
                Organized by: {event.organizer.name || event.organizer.email}
              </p>
            )}
          </div>
          {isRegistered && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-100">
              <CheckCircle2 className="h-3 w-3 mr-1" /> Registered
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 space-y-4">
        <p className="text-sm text-muted-foreground line-clamp-3">
          {event.description}
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>
              {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span className="line-clamp-1">{event.location}</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {event._count.registrations} {event.capacity ? `/ ${event.capacity}` : ''} attendees
            </span>
          </div>
        </div>

        {event.allowedBatches.length > 0 && (
           <div className="flex flex-wrap gap-1 mt-2">
             {event.allowedBatches.map(batch => (
               <Badge key={batch} variant="outline" className="text-xs">
                 Batch {batch}
               </Badge>
             ))}
           </div>
        )}
      </CardContent>
      <CardFooter className="pt-4 border-t">
        {userRole === 'STUDENT' ? (
          <Button 
            className={cn("w-full", isRegistered && "bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border")}
            variant={isRegistered ? "ghost" : "default"}
            onClick={handleRSVP}
            disabled={isLoading || (!isRegistered && isFull)}
          >
            {isLoading ? "Processing..." : isRegistered ? "Cancel Registration" : isFull ? "Event Full" : "Register"}
          </Button>
        ) : (
          <Button 
            className="w-full bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 border-red-200 border" 
            variant="ghost"
            onClick={handleDelete}
            disabled={isLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {isLoading ? "Deleting..." : "Delete Event"}
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
