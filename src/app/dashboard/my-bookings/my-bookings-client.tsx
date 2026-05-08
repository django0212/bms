'use client'

import { useState } from 'react'
import { cancelBooking } from '@/actions/student-bookings'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Calendar, Clock, MapPin, XCircle, TicketIcon } from 'lucide-react'
import { format } from 'date-fns'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useUniversity } from '@/contexts/university-context'
import { useToast } from "@/hooks/use-toast"

type BookingWithDetails = {
  id: string
  startTime: Date
  endTime: Date
  status: string
  facility: {
    name: string
    type: string
    startLocation: string | null
    endLocation: string | null
  }
}

interface MyBookingsClientProps {
  bookings: BookingWithDetails[]
  userId: string
  userEmail?: string
  userName?: string | null
  userStudentId?: string | null
}

export default function MyBookingsClient({ bookings, userId, userEmail, userName, userStudentId }: MyBookingsClientProps) {
  const router = useRouter()
  const university = useUniversity()
  const { toast } = useToast()
  const [processingId, setProcessingId] = useState<string | null>(null)

  const [cancelId, setCancelId] = useState<string | null>(null)
  const [isCancelling, setIsCancelling] = useState(false)

  const handleCancel = async () => {
    if (!cancelId) return
    setIsCancelling(true)
    try {
      await cancelBooking(cancelId, userId)
      router.refresh()
      toast({
        title: "Success",
        description: "Booking cancelled successfully.",
      })
      setCancelId(null)
    } catch (error) {
      console.error('Failed to cancel booking:', error)
      toast({
        title: "Error",
        description: "Failed to cancel booking.",
        variant: "destructive",
      })
    } finally {
      setIsCancelling(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED': return 'text-green-600 bg-green-50 border-green-200'
      case 'PENDING': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'REJECTED': return 'text-red-600 bg-red-50 border-red-200'
      case 'CANCELLED': return 'text-slate-500 bg-slate-50 border-slate-200'
      default: return 'text-slate-600 bg-slate-50 border-slate-200'
    }
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground">
          View and manage your facility reservations
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {bookings.length === 0 ? (
          <div className="col-span-full text-center py-12 text-muted-foreground border rounded-lg border-dashed">
            No bookings found. Go to "Book a Facility" to make one.
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className={booking.status === 'CANCELLED' ? 'opacity-60' : ''}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{booking.facility.name}</CardTitle>
                    <CardDescription className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">
                        {booking.facility.type}
                      </span>
                    </CardDescription>
                  </div>
                  {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
                    <div className="flex gap-2">
                        {booking.status === 'CONFIRMED' && (
                            <Link href={`/dashboard/tickets/${booking.id}`}>
                                <Button variant="outline" size="sm" className="gap-2">
                                    <TicketIcon className="h-4 w-4" />
                                    View Ticket
                                </Button>
                            </Link>
                        )}
                        <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => setCancelId(booking.id)}
                        disabled={isCancelling && cancelId === booking.id}
                        >
                        <XCircle className="h-4 w-4" />
                        <span className="sr-only">Cancel</span>
                        </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span className="text-foreground font-medium">
                      {format(new Date(booking.startTime), 'PPP')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>
                      {format(new Date(booking.startTime), 'p')}
                      {booking.facility.type !== 'TRANSPORT' && ` - ${format(new Date(booking.endTime), 'p')}`}
                    </span>
                  </div>
                  {booking.facility.type === 'TRANSPORT' && booking.facility.startLocation && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {booking.facility.startLocation} → {booking.facility.endLocation}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
      <ConfirmDialog
        open={!!cancelId}
        onOpenChange={(open) => !open && setCancelId(null)}
        title="Cancel Booking"
        description="Are you sure you want to cancel this booking? This action cannot be undone."
        onConfirm={handleCancel}
        isLoading={isCancelling}
        confirmText="Cancel Booking"
        variant="destructive"
      />
    </div>
  )
}
