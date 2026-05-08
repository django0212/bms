import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getBookingById } from '@/actions/tickets'
import TicketClient from './ticket-client'

export default async function TicketPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser()
  const { id } = await params

  if (!user) {
    redirect('/login')
  }

  const booking = await getBookingById(id)

  if (!booking) {
    redirect('/dashboard/my-bookings')
  }

  // Ensure the user owns the booking or is an admin
  if (booking.userId !== user.id && user.role === 'STUDENT') {
    redirect('/dashboard')
  }

  return (
    <TicketClient 
      booking={booking}
      universityName={booking.university.name}
      universityLogo={booking.university.logoUrl}
      primaryColor={booking.university.primaryColor}
    />
  )
}
