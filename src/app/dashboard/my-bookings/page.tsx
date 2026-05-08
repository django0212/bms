import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import { getUserBookings } from '@/actions/student-bookings'
import MyBookingsClient from './my-bookings-client'

export default async function MyBookingsPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.role !== 'STUDENT') {
    redirect('/dashboard')
  }

  const bookings = await getUserBookings(user.id)

  return (
    <MyBookingsClient 
        bookings={bookings} 
        userId={user.id} 
        userEmail={user.email}
        userName={user.name}
        userStudentId={user.studentId}
    />
  )
}
