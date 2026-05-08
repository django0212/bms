'use client'

import { useState } from 'react'
import { BookingStatus } from '@prisma/client'
import { updateBookingStatus } from '@/actions/bookings'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckCircle2, XCircle, Clock, Calendar, User, AlertCircle } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { format } from 'date-fns'
import { useToast } from "@/hooks/use-toast"

// Define the type based on the include query in the server action
type BookingWithDetails = {
  id: string
  startTime: Date
  endTime: Date
  createdAt: Date
  status: BookingStatus
  user: {
    name: string | null
    email: string
    studentId: string | null
  }
  facility: {
    name: string
    type: string
  }
}

interface RequestsClientProps {
  pendingBookings: BookingWithDetails[]
  allBookings: BookingWithDetails[]
}

export default function RequestsClient({ pendingBookings, allBookings }: RequestsClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const defaultTab = searchParams.get('tab') === 'all' ? 'all' : 'pending'
  const [processingId, setProcessingId] = useState<string | null>(null)

  const handleAction = async (id: string, status: BookingStatus) => {
    setProcessingId(id)
    try {
      await updateBookingStatus(id, status)
      router.refresh()
      toast({
        title: "Success",
        description: "Booking status updated successfully.",
      })
    } catch (error) {
      console.error('Failed to update booking:', error)
      toast({
        title: "Error",
        description: "Failed to update booking status.",
        variant: "destructive",
      })
    } finally {
      setProcessingId(null)
    }
  }

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-700">Confirmed</span>
      case 'PENDING':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">Pending</span>
      case 'REJECTED':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-red-100 text-red-700">Rejected</span>
      case 'CANCELLED':
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">Cancelled</span>
      default:
        return <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-100 text-slate-700">{status}</span>
    }
  }

  const BookingCard = ({ booking, showActions = false }: { booking: BookingWithDetails, showActions?: boolean }) => (
    <Card key={booking.id}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              {booking.facility.name}
              <span className="text-xs font-normal px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                {booking.facility.type}
              </span>
              {!showActions && getStatusBadge(booking.status)}
            </CardTitle>
            <CardDescription>
              Requested on {format(new Date(booking.createdAt), 'PPP')}
            </CardDescription>
          </div>
          {showActions ? (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
                onClick={() => handleAction(booking.id, 'CONFIRMED')}
                disabled={processingId === booking.id}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Approve
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                onClick={() => handleAction(booking.id, 'REJECTED')}
                disabled={processingId === booking.id}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Reject
              </Button>
            </div>
          ) : (
            booking.status === 'CONFIRMED' && (
                <Button
                    size="sm"
                    variant="outline"
                    className="text-orange-600 hover:text-orange-700 hover:bg-orange-50 border-orange-200"
                    onClick={() => {
                        if (confirm('Are you sure you want to rescind approval for this booking?')) {
                            handleAction(booking.id, 'REJECTED')
                        }
                    }}
                    disabled={processingId === booking.id}
                >
                    <XCircle className="mr-2 h-4 w-4" />
                    Rescind Approval
                </Button>
            )
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <User className="h-4 w-4" />
              <span className="font-medium text-foreground">
                {booking.user.name || booking.user.email}
              </span>
              {booking.user.studentId && (
                <span className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
                  {booking.user.studentId}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground pl-6">
              {booking.user.email}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="text-foreground">
                {format(new Date(booking.startTime), 'PPP')}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {format(new Date(booking.startTime), 'p')} -{' '}
                {format(new Date(booking.endTime), 'p')}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Booking Management</h1>
        <p className="text-muted-foreground">
          Review pending requests and view booking history
        </p>
      </div>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" /> Pending Approvals
            {pendingBookings.length > 0 && (
                <span className="ml-1 bg-red-100 text-red-600 text-xs font-bold px-2 py-0.5 rounded-full">
                    {pendingBookings.length}
                </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" /> All Bookings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
            {pendingBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No pending requests found.
            </div>
            ) : (
            pendingBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={true} />
            ))
            )}
        </TabsContent>

        <TabsContent value="all" className="space-y-4">
            {allBookings.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                No bookings found.
            </div>
            ) : (
            allBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} showActions={false} />
            ))
            )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
